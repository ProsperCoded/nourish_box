"use client";

import React, { useState, useEffect, useMemo } from "react";
import RecipeCard from "../components/RecipeCard";
import RecipeCardSkeleton from "../components/RecipeCardSkeleton";
import { fetchRecipes } from "../utils/firebase/recipes.firebase";
import { Recipe } from "../utils/types/recipe.type";
import Header from "../components/header";

const CATEGORIES = ["Proteins", "Meal kits", "Special combos", ] as const;
type Category = typeof CATEGORIES[number];

const Page = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("Proteins");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        setIsLoading(true);
        const fetchedRecipes = await fetchRecipes();
        setRecipes(fetchedRecipes);
      } catch (err) {
        console.error("Error loading recipes:", err);
        setError("Failed to load recipes. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    loadRecipes();
  }, []);

  const normalized = (v?: string) => (v || "").toLowerCase().trim();

  const visibleRecipes = useMemo(() => {
    const byCategory = (r: Recipe) =>
      activeCategory === "Proteins" // 
        ? true
        : normalized(r.category) === normalized(activeCategory);

    const bySearch = (r: Recipe) =>
      normalized(r.name).includes(normalized(searchQuery));

    return recipes.filter((r) => byCategory(r) && bySearch(r));
  }, [recipes, activeCategory, searchQuery]);

  return (
    <main className="min-h-screen ">
      {/* Top area like the mock: green header + search */}
      <div className="px-4 md:px-8 lg:px-16 pt-6 pb-4">
        {/* Header (kept) */}
        <div className="flex justify-center mb-4">
          <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </div>

        {/* Title / Subtitle */}
        <section className="text-left max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-custom font-medium text-center mb-1">
           Fresh meal kit crafted for you 
          </h2>
          <p className="text-brand-sub_gray text-center text-base sm:text-lg font-inter">
            Check out our recipes for the week
          </p>
        </section>

        {/* Category Tabs */}
        <nav
          aria-label="recipe categories"
          className="mt-6 max-w-3xl  mx-auto"
        >
          <ul className="flex gap-6  justify-center overflow-x-auto no-scrollbar text-sm sm:text-base">
            {CATEGORIES.map((cat) => {
              const isActive = cat === activeCategory;
              return (
                <li key={cat}>
                  <button
                    onClick={() => setActiveCategory(cat)}
                    className={[
                      "pb-2 transition-colors whitespace-nowrap",
                      isActive
                        ? "text-green-600 border-b-2 border-green-500 font-semibold"
                        : "text-gray-400 hover:text-gray-600 border-b-2 border-transparent",
                    ].join(" ")}
                  >
                    {cat}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Recipes */}
      <div className="px-4 md:px-8 lg:px-16 pb-10">
        {error ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <p className="text-red-600 text-center text-lg">{error}</p>
          </div>
        ) : isLoading ? (
          <section className="flex flex-wrap justify-center gap-6 lg:gap-8">
            {Array.from({ length: 8 }).map((_, index) => (
              <RecipeCardSkeleton key={index} />
            ))}
          </section>
        ) : visibleRecipes.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center py-20">
            <p className="text-gray-500">
              No recipes match your filters. Try a different category or search.
            </p>
          </div>
        ) : (
          <section className="flex flex-wrap justify-center gap-6 lg:gap-8">
            {visibleRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </section>
        )}
      </div>
    </main>
  );
};

export default Page;
