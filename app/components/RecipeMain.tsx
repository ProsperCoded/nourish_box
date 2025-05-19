"use client";
import React from "react";
import Image from 'next/image'
import { Recipe } from "../utils/types/recipe.type";
interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeMain: React.FC<RecipeCardProps> = ({ recipe }) => {

  return (
    <div>
      <div><img src={recipe.displayMedia.url} alt={recipe.name} /> Image </div>
      <div>
        <h2>{recipe.name}</h2>
        <div>
          <p>{recipe.duration}</p>
          <p>{recipe.servings}</p>
          <p>{recipe.numberOfIngredients}</p>
        </div>
        Time servings num of ingredients</div>
      <div>{recipe.ingredients}</div>
      <div>{recipe.description}</div>
    </div>
  )
}

export default RecipeMain