"use client";
import { useFavorites } from "../contexts/FavContext";
import RecipeList from "../components/RecipeCard";
import Header from "../components/header";
import { useState } from "react";
import { Recipe } from "@/app/utils/types/recipe.type";

export default function FavoritesPage({recipeItem}: {recipeItem: Recipe []}) {
    const { favorites } = useFavorites();
    const [searchQuery, setSearchQuery] = useState("");

    const searchResult = recipeItem.filter((i) =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const showSearch = searchQuery.trim() !== "";

    if (favorites.length === 0) {
        return <div className="p-4">No favorites yet.</div>;
    }
    if (favorites.length === 0) {
        return <div className="p-4">No favorites yet.</div>;
    }

    return (
        <div className="p-6">
            <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <h1 className="text-2xl font-semibold mb-4">Your Favorite Recipes</h1>
            {(showSearch ? searchResult : recipeItem).map((recipe) => (
                <RecipeList key={recipe.id} recipe={recipe} product={recipe} />
            ))}
        </div>
    );
}
