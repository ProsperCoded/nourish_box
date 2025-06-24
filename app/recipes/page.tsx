'use client';

import React, { useState, useEffect } from 'react';
import RecipeCard from '../components/RecipeCard';
import { fetchRecipes } from '../utils/firebase/recipes.firebase';
import { Recipe } from '../utils/types/recipe.type';
import Header from '../components/header';

const Page = () => {
  const [searchQuery, setSearchQuery] = useState('');
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
        console.error('Error loading recipes:', err);
        setError('Failed to load recipes. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadRecipes();
  }, []);

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen py-6 px-4 md:px-8 lg:px-16">
      {/* Header */}
      <div className="flex justify-center mb-8">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </div>

      {/* Page Intro */}
      <section className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-custom font-medium mb-2">
          Discover, Create, Share
        </h2>
        <p className="text-brand-sub_gray text-base sm:text-lg font-inter">
          Check out our recipes for the week
        </p>
      </section>

      {/* Recipes */}
      {error ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <p className="text-red-600 text-center text-lg">{error}</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand-btn_orange" />
        </div>
      ) : (
        <section className="flex flex-wrap justify-center gap-6 lg:gap-8">
          {(searchQuery.trim() ? filteredRecipes : recipes).map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </section>
      )}
    </main>
  );
};

export default Page;
