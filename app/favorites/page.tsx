"use client";
// import { useFavorites } from "../contexts/FavContext";
import RecipeList from "../components/RecipeCard";
import Header from "../components/header";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function FavoritesPage() {
    const { user } = useAuth();
    const { favorites, isLoading, error } = useFavorites();
    const [searchQuery, setSearchQuery] = useState("");

    const searchResult = favorites.filter((recipe) =>
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const showSearch = searchQuery.trim() !== "";

    if (!user) {
        return <div className="p-4">Please log in to view your favorites.</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (favorites.length === 0) {
        return <div className="p-4">No favorites yet.</div>;
    }

    return (
        <div className="p-6">
            <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <h1 className="text-2xl font-semibold mb-4">Your Favorite Recipes</h1>
            <div className="flex flex-wrap w-full justify-center gap-6 p-6">
                {(showSearch ? searchResult : favorites).map((recipe) => (
                    <RecipeList key={recipe.id} recipe={recipe} />
                ))}
            </div>
        </div>
    );
}
