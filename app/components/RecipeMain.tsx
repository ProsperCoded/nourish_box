"use client";
import React from "react";
import clock from "../assets/icons8-clock-24.png";
import cook from "../assets/icons8-chef-hat-24.png";
import { Recipe } from "../utils/types/recipe.type";
import Image from "next/image";
import Search_bar from "./Search_bar";

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeMain: React.FC<RecipeCardProps> = ({ recipe }) => {
  // Normalize ingredients into a clean string[]
  const ingredientsList: string[] = Array.isArray(recipe.ingredients)
    ? recipe.ingredients.map((x) => String(x).trim()).filter(Boolean)
    : typeof recipe.ingredients === "string"
      ? recipe.ingredients
        .split(/[,\n;]| and /i)
        .map((x) => x.trim())
        .filter(Boolean)
      : [];

  // ✅ Fix: add parentheses to avoid mixing ?? and || without grouping
  const ingredientsCount =
    (recipe.numberOfIngredients ?? ingredientsList.length) || 0;

  // Height of your bottom tab bar (override globally if needed)
  // e.g., set :root { --app-tabbar-h: 72px; } in your globals.css if it differs
  const tabbarVar = "var(--app-tabbar-h, 72px)";

  return (
    <>
      {/* Desktop notice */}
      <div className="hidden md:h-screen md:flex justify-center items-center">
        <h1>This page is for mobile view only</h1>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden min-h-screen bg-white flex flex-col">
        {/* Sticky search header */}
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="px-4 pt-3 pb-2">
            <Search_bar PageTitle={recipe.name} />
          </div>
        </div>

        {/* Hero image */}
        <div className="w-full relative">
          <div className="relative w-full aspect-[4/3] sm:aspect-video overflow-hidden">
            <img
              src={recipe.displayMedia.url}
              alt={recipe.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Content */}
        <main
          className="-mt-6 rounded-t-[28px] bg-white relative z-10 px-6 pt-6
                     /* pad for CTA + tabbar + safe area so last items are reachable */
                     pb-[calc(env(safe-area-inset-bottom)+10px)]
                    "
        >
          <section>
            <h2 className="font-bold text-xl">{recipe.name}</h2>

            <div className="flex items-center justify-between py-4 text-sm text-gray-700">
              <div className="flex items-center">
                <Image src={clock} alt="Time" className="mr-2" width={20} height={20} />
                <p>10 mins</p>
              </div>

              <div className="flex items-center">
                <Image src={cook} alt="Servings" className="mr-2" width={20} height={20} />
                <p>
                  {recipe.servings} {Number(recipe.servings) === 1 ? "portion" : "portions"}
                </p>
              </div>

              <p>
                {ingredientsCount} {ingredientsCount === 1 ? "ingredient" : "ingredients"}
              </p>
            </div>
          </section>

          <hr />

          <section className="pt-3 pb-4">
            <h3 className="font-bold text-lg pb-2">Description</h3>
            <p className="text-gray-800 leading-relaxed">{recipe.description}</p>
          </section>

          <hr />

          <section className="pt-3 pb-4">
            <h3 className="font-bold text-lg pb-2">Ingredients</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-800">
              {ingredientsList.length > 0 ? (
                ingredientsList.map((item, index) => <li key={index}>{item}</li>)
              ) : (
                <li>No ingredients listed</li>
              )}
            </ul>
          </section>

          <hr />

          <section className="pt-3">
            <h3 className="font-bold text-lg pb-2">Steps</h3>

            {/* Scrollable steps */}
            <div
              className="max-h-[40vh] overflow-y-auto pr-2"
              role="region"
              aria-label="Recipe steps"
            >
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex pb-3">
                  <p className="mx-2 font-semibold text-gray-700">{step}.</p>
                  <p className="text-gray-800">
                    Contrary to popular belief, Lorem Ipsum is not simply random text.
                    It has roots in a piece of classical Latin literature from 45 BC,
                    making it over 2000 years old.
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Spacer so content never hides behind CTA even if calculations differ */}
          <div className="h-1" />
        </main>

        {/* Sticky CTA ABOVE the bottom nav */}
        <div
          className="fixed inset-x-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60"
          style={{ bottom: `calc(${tabbarVar})` }} // sit above your footer nav
        >
          <div className="px-5 py-3">
            <button
              className="w-full bg-orange-500 active:scale-[0.99] transition rounded-xl text-white font-medium py-3"
              onClick={() => console.log("Add to bag clicked")}
            >
              Add to bag
            </button>
          </div>
        </div>

        {/* Optional: invisible spacer matching tab bar height for very short pages */}
        <div style={{ height: `calc(${tabbarVar})` }} aria-hidden />
      </div>
    </>
  );
};

export default RecipeMain;
