import {
  collection,
  getDocs,
  addDoc,
  query,
  doc,
  getDoc,
} from "firebase/firestore"; // Added getDoc
import { db } from "../../lib/firebase";
import { COLLECTION } from "../schema/collection.enum";
import { Recipe } from "../types/recipe.type";

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

export const getRecipeById = async (
  recipeId: string
): Promise<Recipe | null> => {
  try {
    const recipeDocRef = doc(db, COLLECTION.recipes, recipeId);
    const recipeDocSnap = await getDoc(recipeDocRef); // Changed getDocs to getDoc

    if (recipeDocSnap.exists()) {
      return { ...recipeDocSnap.data(), id: recipeDocSnap.id } as Recipe;
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching recipe by ID:", error);
    return null;
  }
};
