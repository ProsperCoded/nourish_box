import { collection, getDocs, addDoc, query } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { COLLECTION } from "../schema/collection.enum";
import "dotenv";
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
    })) as Recipe[];
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return [];
  }
};
