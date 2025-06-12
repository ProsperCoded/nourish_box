"use client";
import React, { useState, useEffect } from "react";
// import Image from "next/image";
// import logo from "../assets/nourish_box_folder/Logo files/Logomark.svg";
// import icon from "../assets/nourish_box_folder/Logo files/icon.svg";

// import search from "../assets/icons8-search-48.png";
import RecipeCard from "../components/RecipeCard";
// import Link from "next/link";
import { fetchRecipes } from "../utils/firebase/recipes.firebase";
import { Recipe } from "../utils/types/recipe.type";
import Header from "../components/header";

const Page = () => {
  const [searchQuery, setSearchQuery] = useState("");
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
        setError("Failed to load recipes. Please try again later.");
        console.error("Error loading recipes:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecipes();
  }, []);

  const searchResult = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const showSearch = searchQuery.trim() !== "";

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap flex-col py-5 lg:px-8">
  
      <div className="flex justify-center ">
      
        <Header setSearchQuery={setSearchQuery} searchQuery={ searchQuery} />
      </div>

      <div className="flex justify-center ">
        <div className="flex flex-col lg:flex-col lg:justify-between items-center  lg:py-10  pt-16 pb-8 md:pt-4 ">
          <div className="">
            <h2 className="mb-[5px]font-custom font-medium text-3xl lg:text-5xl">
              Discover, Create, Share
            </h2>
            <p className="lg:pb-5 font-inter font-light text-brand-sub_gray text-lg lg:text-2xl text-center">
              Check out our recipes for the week
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <div className="flex flex-wrap w-full justify-center gap-y-8 md:gap-4 md:p-6 lg:0">
          {(showSearch ? searchResult : recipes).map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;
