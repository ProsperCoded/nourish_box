import { adminDb } from "@/app/api/lib/firebase-admin";
import { Recipe } from "@/app/utils/types/recipe.type";
import { COLLECTION } from "@/app/utils/schema/collection.enum";

export async function createRecipe(recipe: Partial<Recipe>) {
  try {
    // Validate recipe data
    if (!recipe.name || !recipe.description || !recipe.displayMedia) {
      throw new Error("Invalid recipe data: missing required fields");
    }

    const recipeDocRef = adminDb.collection(COLLECTION.recipes).doc();

    // Create recipe with timestamp
    const recipeWithTimestamp = {
      ...recipe,
      id: recipeDocRef.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await recipeDocRef.set(recipeWithTimestamp);

    return recipeWithTimestamp;
  } catch (error) {
    console.error("Error creating recipe:", error);
    throw error;
  }
}

export async function getRecipeById(recipeId: string) {
  try {
    const recipeDocRef = adminDb.collection(COLLECTION.recipes).doc(recipeId);
    const recipeDoc = await recipeDocRef.get();

    if (!recipeDoc.exists) {
      return null;
    }

    return recipeDoc.data() as Recipe;
  } catch (error) {
    console.error(`Error getting recipe with ID '${recipeId}':`, error);
    throw error;
  }
}
