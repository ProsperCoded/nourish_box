'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Product {
    id: number;
    name: string;
    image: string;
}
interface FavoritesContextType {
    favorites: Product[];
    addFavorite: (product: Product) => void
    deleteFavorite: (id: number) => void
    isFavorite: (id: number) => boolean
}
const IsFavContext = createContext<FavoritesContextType | undefined>(undefined)
const FavContext = ({ children }: { children: ReactNode }) => {
    
    const [favorites, setFavorites] = useState<Product[]>([]);
    const addFavorite = (product: Product) => {
        setFavorites((prev) =>
            prev.find((p) => p.id === product.id) ? prev : [...prev, product]
        );
    };
    const deleteFavorite = (id: number) => {
        setFavorites((prev) => prev.filter((p) => p.id !== id));
    };

    const isFavorite = (id: number) => {
        return favorites.some((p) => p.id === id);
    };
    return (
        <IsFavContext.Provider value={{ favorites, addFavorite, deleteFavorite, isFavorite }}>
            {children}
        </IsFavContext.Provider>
    )
}
export function useFavorites() {
    const context = useContext(IsFavContext);
    if (!context) throw new Error('useFavorites must be used within FavoritesProvider');
    return context;
}
export default FavContext