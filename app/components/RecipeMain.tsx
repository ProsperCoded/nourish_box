"use client";
import React from "react";
import clock from "../assets/icons8-clock-24.png";
import cook from '../assets/icons8-chef-hat-24.png';
import ingredients from '../assets/icons8-ingredients-for-cooking-48.png';
import { Recipe } from "../utils/types/recipe.type";
import Image from "next/image";

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeMain: React.FC<RecipeCardProps> = ({ recipe }) => {

  return (
    <div className="relative w-full h-1/2">

      <div className="w-full"><img src={recipe.displayMedia.url} alt={recipe.name} className="w-full" />  </div>
      <div className="pt-12 rounded-t-[42px] absolute -bottom-32 bg-white w-full px-6 py-11 h-1/2">
        <div className="">
          <h2 className="font-bold text-lg">{recipe.name}</h2>
          <div className="flex justify-between  py-4">

            <div className="flex">
              <Image src={clock} alt="green clock icon" className="mr-2" />
              <p>10 mins</p>
            </div>
            <p className="flex"><Image src={cook} alt="green chef hat icon" className="mr-2" />{recipe.servings}2 portions</p>
            <p className="flex"> <Image src={ingredients} alt="green ingredients icon" width={24} height={24} className="mr-2" /><span>7</span>{recipe.numberOfIngredients}</p>

          </div>
        </div>
        <hr />
        <div className=" pt-2 pb-4">
          <h3 className="font-bold text-lg py-2">Description</h3>
          {recipe.description}</div>
        <hr />
        <div className=" pt-2 pb-4">
          <h3 className="font-bold text-lg py-2">Ingredients</h3>
          <ul>
            <li className="flex my-3"><Image src={ingredients} alt="green ingredients icon" width={24} height={24} className="mr-2" />Rice</li>
            <li className="flex my-3"><Image src={ingredients} alt="green ingredients icon" width={24} height={24} className="mr-2" />Oil</li>
            <li className="flex my-3"><Image src={ingredients} alt="green ingredients icon" width={24} height={24} className="mr-2" />Prawns</li>
            <li className="flex my-3"><Image src={ingredients} alt="green ingredients icon" width={24} height={24} className="mr-2" />Seasoning</li>
            <li className="flex my-3"><Image src={ingredients} alt="green ingredients icon" width={24} height={24} className="mr-2" />Spring onions</li>
            <li className="flex my-3"><Image src={ingredients} alt="green ingredients icon" width={24} height={24} className="mr-2" />{recipe.ingredients}</li></ul>
        </div>
        <hr />
        <div>
          <h3 className="font-bold text-lg py-2">Steps</h3>
          <div>
            <div className="flex">
              <p>1.</p>
              <p>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. </p>
            </div>
            <div className="flex">
              <p>2.</p>
              <p>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. </p>
            </div>
            <div className="flex">
              <p>3.</p>
              <p>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. </p>
            </div>
            <div className="flex">
              <p>4.</p>
              <p>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. </p>
            </div>
          </div>
        </div>
        {/* {recipe.ingredients}</div>
        <div>{recipe.description}</div> */}
      </div>
    </div>
  )
}

export default RecipeMain