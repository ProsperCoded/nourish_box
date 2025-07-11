"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Recipe } from "../utils/types/recipe.type";
import { useAuth } from "./AuthContext";
import {
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
  isRecipeFavorited,
} from "../utils/firebase/favorite.firebase";

interface FavoritesContextType {
  favorites: Recipe[];
  optimisticFavorites: Set<string>; // For instant UI updates
  isLoading: boolean;
  error: string | null;
  addFavorite: (recipe: Recipe) => Promise<void>;
  deleteFavorite: (recipeId: string) => Promise<void>;
  isFavorite: (recipeId: string) => boolean; // Now synchronous for optimistic updates
  isFavoriteAsync: (recipeId: string) => Promise<boolean>; // Async version for initial checks
  refreshFavorites: () => Promise<void>;
}

const FavContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [optimisticFavorites, setOptimisticFavorites] = useState<Set<string>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshFavorites = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      const userFavorites = await getUserFavorites(user.id);
      setFavorites(userFavorites);
      // Update optimistic favorites based on actual data
      const favoriteIds = new Set(
        userFavorites.map((fav) => fav.id.toString())
      );
      setOptimisticFavorites(favoriteIds);
    } catch (err) {
      setError("Failed to load favorites");
      console.error("Error loading favorites:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshFavorites();
    } else {
      setFavorites([]);
      setOptimisticFavorites(new Set());
      setIsLoading(false);
    }
  }, [user]);

  const addFavorite = async (recipe: Recipe) => {
    if (!user) throw new Error("User must be logged in to add favorites");

    const recipeId = recipe.id.toString();

    // Optimistic update
    setOptimisticFavorites((prev) => new Set([...prev, recipeId]));

    try {
      await addToFavorites(user.id, recipeId);
      // Update the actual favorites list
      setFavorites((prev) => [...prev, recipe]);
    } catch (err) {
      // Revert optimistic update on error
      setOptimisticFavorites((prev) => {
        const newSet = new Set(prev);
        newSet.delete(recipeId);
        return newSet;
      });
      console.error("Error adding favorite:", err);
      throw err;
    }
  };

  const deleteFavorite = async (recipeId: string) => {
    if (!user) throw new Error("User must be logged in to remove favorites");

    // Optimistic update
    setOptimisticFavorites((prev) => {
      const newSet = new Set(prev);
      newSet.delete(recipeId);
      return newSet;
    });

    try {
      await removeFromFavorites(user.id, recipeId);
      // Update the actual favorites list
      setFavorites((prev) =>
        prev.filter((fav) => fav.id.toString() !== recipeId)
      );
    } catch (err) {
      // Revert optimistic update on error
      setOptimisticFavorites((prev) => new Set([...prev, recipeId]));
      console.error("Error removing favorite:", err);
      throw err;
    }
  };

  // Synchronous version using optimistic state
  const isFavorite = (recipeId: string): boolean => {
    return optimisticFavorites.has(recipeId);
  };

  // Async version for initial checks (kept for backward compatibility)
  const isFavoriteAsync = async (recipeId: string): Promise<boolean> => {
    if (!user) return false;
    return await isRecipeFavorited(user.id, recipeId);
  };

  return (
    <FavContext.Provider
      value={{
        favorites,
        optimisticFavorites,
        isLoading,
        error,
        addFavorite,
        deleteFavorite,
        isFavorite,
        isFavoriteAsync,
        refreshFavorites,
      }}
    >
      {children}
    </FavContext.Provider>
  );
};

export function useFavorites() {
  const context = useContext(FavContext);
  if (!context) throw new Error("useFavorites must be used within FavProvider");
  return context;
}

export default FavProvider;
