"use client";
import React from "react";
import clock from "../assets/icons8-clock-24.png";
import cook from "../assets/icons8-chef-hat-24.png";
import { Recipe } from "../utils/types/recipe.type";
import Image from "next/image";

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeMain: React.FC<RecipeCardProps> = ({ recipe }) => {
  // Normalize ingredients into a clean string[]
  const ingredientsList: string[] = Array.isArray(recipe.ingredients)
    ? recipe.ingredients.map((x) => String(x).trim()).filter(Boolean)
    : typeof recipe.ingredients === "string"
      ? recipe.ingredients
        // split by commas, new lines, semicolons, or " and "
        .split(/[,\n;]| and /i)
        .map((x) => x.trim())
        .filter(Boolean)
      : [];

  return (
    <div className="relative w-full">
      {/* Main image */}
      <div className="w-full h-1/2">
        <img
          src={recipe.displayMedia.url}
          alt={recipe.name}
          className="w-full object-cover"
        />
      </div>

      <div className="pt-12 rounded-t-[42px] absolute -bottom-32 bg-white w-full px-6 py-11 h-1/2 font-inter">
        <div>
          <h2 className="font-bold text-lg">{recipe.name}</h2>

          {/* Info row */}
          <div className="flex justify-between py-4">
            <div className="flex items-center">
              <Image src={clock} alt="green clock icon" className="mr-2" />
              <p>10 mins</p>
            </div>
            <p className="flex items-center">
              <Image src={cook} alt="green chef hat icon" className="mr-2" />
              {recipe.servings} {Number(recipe.servings) === 1 ? "portion" : "portions"}
            </p>
            <p>{recipe.numberOfIngredients ?? ingredientsList.length} ingredients</p>
          </div>
        </div>

        <hr />

        {/* Description */}
        <div className="pt-2 pb-4">
          <h3 className="font-bold text-lg py-2">Description</h3>
          <p>{recipe.description}</p>
        </div>

        <hr />

        {/* Ingredients (bulleted from normalized list) */}
        <div className="pt-2 pb-4">
          <h3 className="font-bold text-lg py-2">Ingredients</h3>
          <ul className="list-disc list-inside space-y-2">
            {ingredientsList.length > 0 ? (
              ingredientsList.map((item, index) => (
                <li key={index}>{item}</li>
              ))
            ) : (
              <li>No ingredients listed</li>
            )}
          </ul>
        </div>

        <hr />

        {/* Steps (placeholder) */}
        <div>
          <h3 className="font-bold text-lg py-2">Steps</h3>
          <div className="mb-5">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex">
                <p className="mx-2">{step}.</p>
                <p>
                  Contrary to popular belief, Lorem Ipsum is not simply random
                  text. It has roots in a piece of classical Latin literature
                  from 45 BC, making it over 2000 years old.
                </p>
              </div>
            ))}

            <div className="my-2 mt-4 flex justify-center">
              <button
                className="bg-orange-400 rounded-lg text-white px-5 py-2"
                onClick={() => {
                  console.log("Add to bag clicked");
                }}
              >
                Add to bag
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeMain;
