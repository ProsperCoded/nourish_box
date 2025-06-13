'use client'
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Recipe } from "../utils/types/recipe.type";
import { useAuth } from "./AuthContext";
import { addToFavorites, removeFromFavorites, getUserFavorites, isRecipeFavorited } from "../utils/firebase/favorite.firebase";

interface FavoritesContextType {
    favorites: Recipe[];
    isLoading: boolean;
    error: string | null;
    addFavorite: (recipe: Recipe) => Promise<void>;
    deleteFavorite: (recipeId: string) => Promise<void>;
    isFavorite: (recipeId: string) => Promise<boolean>;
    refreshFavorites: () => Promise<void>;
}

const FavContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshFavorites = async () => {
        if (!user) return;
        
        try {
            setIsLoading(true);
            setError(null);
            const userFavorites = await getUserFavorites(user.id);
            setFavorites(userFavorites);
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
            setIsLoading(false);
        }
    }, [user]);

    const addFavorite = async (recipe: Recipe) => {
        if (!user) throw new Error("User must be logged in to add favorites");
        
        try {
            await addToFavorites(user.id, recipe.id.toString());
            await refreshFavorites();
        } catch (err) {
            console.error("Error adding favorite:", err);
            throw err;
        }
    };

    const deleteFavorite = async (recipeId: string) => {
        if (!user) throw new Error("User must be logged in to remove favorites");
        
        try {
            await removeFromFavorites(user.id, recipeId);
            await refreshFavorites();
        } catch (err) {
            console.error("Error removing favorite:", err);
            throw err;
        }
    };

    const isFavorite = async (recipeId: string) => {
        if (!user) return false;
        return await isRecipeFavorited(user.id, recipeId);
    };

    return (
        <FavContext.Provider value={{ 
            favorites, 
            isLoading, 
            error, 
            addFavorite, 
            deleteFavorite, 
            isFavorite,
            refreshFavorites 
        }}>
            {children}
        </FavContext.Provider>
    );
};

export function useFavorites() {
    const context = useContext(FavContext);
    if (!context) throw new Error('useFavorites must be used within FavProvider');
    return context;
}

export default FavProvider;