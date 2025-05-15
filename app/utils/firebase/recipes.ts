import { collection, getDocs, addDoc, query, where, deleteDoc, doc as docRef, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { COLLECTION } from "../schema/collection.enum";
import { Recipe } from "../types/recipe.type";
import { Favorite } from "../types/favorite.type";

export const seedRecipesToFirebase = async (recipes: Recipe[]) => {
  try {
    const recipesCollection = collection(db, COLLECTION.recipes);

    for (const recipe of recipes) {
      await addDoc(recipesCollection, recipe);
    }
    console.log("Recipes seeded successfully");
  } catch (error) {
    console.error("Error seeding recipes:", error);
  }
};

export const fetchRecipes = async (): Promise<Recipe[]> => {
  try {
    const recipesCollection = collection(db, COLLECTION.recipes);
    const q = query(recipesCollection);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as unknown as Recipe[];
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return [];
  }
};

export const addToFavorites = async (userId: string, recipeId: string): Promise<void> => {
  try {
    const favoritesCollection = collection(db, COLLECTION.favorites);
    await addDoc(favoritesCollection, {
      userId,
      recipeId,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error adding to favorites:", error);
    throw error;
  }
};

export const removeFromFavorites = async (userId: string, recipeId: string): Promise<void> => {
  try {
    const favoritesCollection = collection(db, COLLECTION.favorites);
    const q = query(
      favoritesCollection,
      where("userId", "==", userId),
      where("recipeId", "==", recipeId)
    );
    const querySnapshot = await getDocs(q);
    
    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
  } catch (error) {
    console.error("Error removing from favorites:", error);
    throw error;
  }
};

export const getUserFavorites = async (userId: string): Promise<Recipe[]> => {
  try {
    const favoritesCollection = collection(db, COLLECTION.favorites);
    const q = query(favoritesCollection, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    const favoriteRecipes: Recipe[] = [];
    
    for (const doc of querySnapshot.docs) {
      const favoriteData = doc.data() as Favorite;
      const recipeDoc = await getDoc(docRef(db, COLLECTION.recipes, favoriteData.recipeId));
      
      if (recipeDoc.exists()) {
        favoriteRecipes.push({
          ...recipeDoc.data(),
          id: recipeDoc.id,
        } as unknown as Recipe);
      }
    }
    
    return favoriteRecipes;
  } catch (error) {
    console.error("Error fetching user favorites:", error);
    throw error;
  }
};

export const isRecipeFavorited = async (userId: string, recipeId: string): Promise<boolean> => {
  try {
    const favoritesCollection = collection(db, COLLECTION.favorites);
    const q = query(
      favoritesCollection,
      where("userId", "==", userId),
      where("recipeId", "==", recipeId)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking favorite status:", error);
    throw error;
  }
};
