import {
  collection,
  getDocs,
  addDoc,
  query,
  doc,
  getDoc,
  where,
  limit,
  orderBy,
  startAfter,
} from "firebase/firestore"; // Added getDoc
import { db } from "../../lib/firebase";
import { COLLECTION } from "../schema/collection.enum";
import { Recipe } from "../types/recipe.type";

// Helper function to chunk arrays for Firebase 'in' operator (max 10 items)
const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

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

/**
 * Get paginated recipes with optimized fetching
 */
export const getPaginatedRecipes = async (
  pageSize: number = 10,
  lastRecipeId?: string,
  orderByField: string = "createdAt",
  orderDirection: "asc" | "desc" = "desc"
): Promise<{
  recipes: Recipe[];
  hasMore: boolean;
  lastRecipeId?: string;
}> => {
  try {
    let recipesQuery = query(
      collection(db, COLLECTION.recipes),
      orderBy(orderByField, orderDirection),
      limit(pageSize + 1) // Fetch one extra to check if there are more
    );

    // If lastRecipeId is provided, start after that document
    if (lastRecipeId) {
      const lastRecipeDoc = await getDoc(
        doc(db, COLLECTION.recipes, lastRecipeId)
      );
      if (lastRecipeDoc.exists()) {
        recipesQuery = query(
          collection(db, COLLECTION.recipes),
          orderBy(orderByField, orderDirection),
          startAfter(lastRecipeDoc),
          limit(pageSize + 1)
        );
      }
    }

    const querySnapshot = await getDocs(recipesQuery);
    const docs = querySnapshot.docs;

    // Check if there are more recipes
    const hasMore = docs.length > pageSize;
    const recipesToProcess = hasMore ? docs.slice(0, pageSize) : docs;

    const recipes: Recipe[] = recipesToProcess.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Recipe)
    );

    return {
      recipes,
      hasMore,
      lastRecipeId:
        recipes.length > 0 ? recipes[recipes.length - 1].id : undefined,
    };
  } catch (error) {
    console.error("Error fetching paginated recipes:", error);
    throw new Error("Failed to fetch paginated recipes");
  }
};

/**
 * Batch fetch recipes by IDs (optimized)
 */
export const getRecipesByIds = async (
  recipeIds: string[]
): Promise<Map<string, Recipe>> => {
  if (recipeIds.length === 0) {
    return new Map<string, Recipe>();
  }

  try {
    const results = await Promise.all(
      chunkArray(recipeIds, 10).map(async (chunk) => {
        if (chunk.length === 0) return [];
        const recipesQuery = query(
          collection(db, COLLECTION.recipes),
          where("__name__", "in", chunk)
        );
        const snapshot = await getDocs(recipesQuery);
        return snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Recipe)
        );
      })
    );

    const recipesMap = new Map<string, Recipe>();
    results.flat().forEach((recipe) => recipesMap.set(recipe.id, recipe));

    return recipesMap;
  } catch (error) {
    console.error("Error batch fetching recipes:", error);
    throw new Error("Failed to batch fetch recipes");
  }
};

/**
 * Get multiple recipes by their IDs (returns array)
 */
export const getMultipleRecipes = async (
  recipeIds: string[]
): Promise<Recipe[]> => {
  try {
    const recipesMap = await getRecipesByIds(recipeIds);
    return recipeIds
      .map((id) => recipesMap.get(id))
      .filter((recipe): recipe is Recipe => recipe !== undefined);
  } catch (error) {
    console.error("Error fetching multiple recipes:", error);
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

/**
 * Search recipes with pagination
 */
export const searchRecipes = async (
  searchTerm: string,
  pageSize: number = 10,
  lastRecipeId?: string
): Promise<{
  recipes: Recipe[];
  hasMore: boolean;
  lastRecipeId?: string;
}> => {
  try {
    // For now, we'll fetch all recipes and filter on the client side
    // In a production app, you'd want to use Algolia or similar for full-text search
    const allRecipes = await fetchRecipes();

    const searchLower = searchTerm.toLowerCase();
    const filteredRecipes = allRecipes.filter(
      (recipe) =>
        recipe.name.toLowerCase().includes(searchLower) ||
        recipe.description.toLowerCase().includes(searchLower) ||
        recipe.ingredients.some((ingredient) =>
          ingredient.toLowerCase().includes(searchLower)
        )
    );

    // Apply pagination to filtered results
    const startIndex = lastRecipeId
      ? filteredRecipes.findIndex((recipe) => recipe.id === lastRecipeId) + 1
      : 0;

    const endIndex = startIndex + pageSize;
    const paginatedRecipes = filteredRecipes.slice(startIndex, endIndex);
    const hasMore = endIndex < filteredRecipes.length;

    return {
      recipes: paginatedRecipes,
      hasMore,
      lastRecipeId:
        paginatedRecipes.length > 0
          ? paginatedRecipes[paginatedRecipes.length - 1].id
          : undefined,
    };
  } catch (error) {
    console.error("Error searching recipes:", error);
    throw new Error("Failed to search recipes");
  }
};

/**
 * Get recipes by category with pagination
 */
export const getRecipesByCategory = async (
  category: string,
  pageSize: number = 10,
  lastRecipeId?: string
): Promise<{
  recipes: Recipe[];
  hasMore: boolean;
  lastRecipeId?: string;
}> => {
  try {
    let recipesQuery = query(
      collection(db, COLLECTION.recipes),
      where("category", "==", category),
      orderBy("createdAt", "desc"),
      limit(pageSize + 1)
    );

    if (lastRecipeId) {
      const lastRecipeDoc = await getDoc(
        doc(db, COLLECTION.recipes, lastRecipeId)
      );
      if (lastRecipeDoc.exists()) {
        recipesQuery = query(
          collection(db, COLLECTION.recipes),
          where("category", "==", category),
          orderBy("createdAt", "desc"),
          startAfter(lastRecipeDoc),
          limit(pageSize + 1)
        );
      }
    }

    const querySnapshot = await getDocs(recipesQuery);
    const docs = querySnapshot.docs;

    const hasMore = docs.length > pageSize;
    const recipesToProcess = hasMore ? docs.slice(0, pageSize) : docs;

    const recipes: Recipe[] = recipesToProcess.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Recipe)
    );

    return {
      recipes,
      hasMore,
      lastRecipeId:
        recipes.length > 0 ? recipes[recipes.length - 1].id : undefined,
    };
  } catch (error) {
    console.error("Error fetching recipes by category:", error);
    throw new Error("Failed to fetch recipes by category");
  }
};
