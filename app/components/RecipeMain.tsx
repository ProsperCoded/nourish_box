"use client";
import React, { useEffect, useState } from "react";
import cook from "../assets/icons8-chef-hat-24.png";
import { Recipe } from "../utils/types/recipe.type";
import Image from "next/image";
import Search_bar from "./Search_bar";
import toast from "react-hot-toast";
import { useCart } from "../contexts/CartContext";
import { useRouter } from "next/navigation";
import DummyReviews from "./ReviewsList";
import { useCategories } from '../contexts/CategoryContext';
import { SelectChangeEvent } from '@mui/material/Select';
import { ChefHat, Clock, Tag } from "lucide-react";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

interface RecipeCardProps {
  recipe: Recipe;
  categoryName?: string;
}

const RecipeMain: React.FC<RecipeCardProps> = ({ recipe, categoryName }) => {
  // cart + local state
  const { addToCart, loading: cartLoading } = useCart();
  const [option, setOption] = useState<string>(""); // packaging choice
  const [count, setCount] = useState(1);

  // Normalise ingredients into a clean string[]
  const ingredientsList: string[] = Array.isArray(recipe.ingredients)
    ? recipe.ingredients.map((x) => String(x).trim()).filter(Boolean)
    : typeof recipe.ingredients === "string"
      ? recipe.ingredients
        .split(/[,\n;]| and /i)
        .map((x) => x.trim())
        .filter(Boolean)
      : [];

  const handleChange = (event: SelectChangeEvent) => setOption(event.target.value as string);
  const router = useRouter();
  const mustChoosePackaging = count > 1 && !option;
  const showPackaging = count > 1;

  // Reset state ONLY when the recipe changes (or remove if you want to persist across recipes)
  useEffect(() => {
    setOption("");
    setCount(1);
  }, [recipe?.id]);

  // Avoid mixing ?? and || without grouping (already handled)
  const ingredientsCount =
    (recipe.numberOfIngredients ?? ingredientsList.length) || 0;

  // Height of your bottom tab bar (override globally if needed)
  const tabbarVar = "var(--app-tabbar-h, 72px)";

  // Add-to-cart handler
  const handleAddToCartClick = async () => {
    try {
      await addToCart(recipe, count, option);
      toast.success(`${recipe.name} added to cart!`, {
        duration: 2500,
        position: "top-center",
      });
      // reset lightweight local state
      setCount(1);
      setOption("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add item to cart. Please try again.", {
        duration: 3500,
        position: "top-center",
      });
    }
  };

  const { getCategoryName } = useCategories();
  const displayCategoryName =
    categoryName ||
    (recipe.categoryId ? getCategoryName(recipe.categoryId) : undefined);

  const durationMinutes = recipe.duration
    ? recipe.duration >= 120
      ? Math.round(recipe.duration / 60)
      : recipe.duration
    : null;

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
            <Search_bar />
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
                     pb-[calc(env(safe-area-inset-bottom)+10px)] font-inter"
        >
          <section>
            <h2 className="font-bold text-xl">{recipe.name}</h2>

            <div className="flex items-center justify-between py-4 text-sm text-gray-700">
              {durationMinutes !== null && (
                <div className="flex items-center">
                  <span className='mt-0.5 inline-flex mr-2 h-6 w-6 items-center justify-center rounded-full bg-green-50 text-green-700 border border-green-200'>
                    <Clock className='h-3.5 w-3.5' />
                  </span>
                  <p>{durationMinutes}</p>
                </div>
              )}

              <p>
                <span className='mt-0.5 inline-flex h-6 w-6 mr-2 items-center justify-center rounded-full bg-green-50 text-green-700 border border-green-200'>
                  <ChefHat className=' h-3.5 w-3.5' />
                </span>
                {ingredientsCount} {ingredientsCount === 1 ? "ingredient" : "ingredients"}
              </p>

              {displayCategoryName && (
                <div className='mt-3 flex items-center gap-2 text-sm text-gray-600'>
                  <span className='px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-medium'>
                    {displayCategoryName}
                  </span>
                </div>
              )}
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
                ingredientsList.map((item, index) => (
                  <div key={index} className="flex">
                    <span className='mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-50 text-green-700 border border-green-200'>
                      <ChefHat className='h-3.5 w-3.5' />
                    </span>
                    <div className="ml-2">{item}</div>
                  </div>
                ))
              ) : (
                <li>No ingredients listed</li>
              )}
            </ul>
          </section>

          <hr />

          <section className="pt-3">
            <div>
              <DummyReviews />
            </div>
          </section>

          {/* Quantity */}
          <div className='mt-2 flex flex-col items-center gap-1'>
            <span className='text-xl font-semibold font-inter text-gray-600 mb-2'>Quantity</span>
            <div className='flex items-center border border-gray-300 rounded-lg overflow-hidden'>
              <button
                type="button"  // prevent form submit
                className='px-3 py-2 hover:bg-gray-100'
                onClick={() => setCount(c => Math.max(1, c - 1))}
              >
                -
              </button>
              <span
                aria-live='polite'
                className='px-4 py-2 border-x border-gray-300'
              >
                {count}
              </span>
              <button
                type="button"  // prevent form submit
                className='px-3 py-2 hover:bg-gray-100'
                onClick={() => setCount(c => c + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* Packaging choice (only if more than one pack) */}
          {showPackaging && (
            <div className='mt-6'>
              <p className='font-medium text-gray-800 mb-2'>
                Packaging choice (if more than one pack)
              </p>

              <FormControl fullWidth>
                <InputLabel id='packaging-label'>Select packaging</InputLabel>
                <Select
                  labelId='packaging-label'
                  value={option}
                  label='Select packaging'
                  onChange={handleChange}
                  className="text-black"
                >
                  <MenuItem value='separate'>Packed separately</MenuItem>
                  <MenuItem value='together'>Packed as one</MenuItem>
                </Select>
              </FormControl>

              {mustChoosePackaging && (
                <p className='text-sm text-orange-600 mt-1'>
                  Please choose a packaging option.
                </p>
              )}
            </div>
          )}

          {/* Spacer */}
          <div className="h-1" />
        </main>

        {/* Sticky CTA ABOVE the bottom nav */}
        <div
          className="fixed inset-x-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60"
          style={{ bottom: `calc(${tabbarVar})` }}
        >
          <div className="px-5 py-3 flex justify-center">
            <button
              type="button"
              onClick={handleAddToCartClick}
              disabled={cartLoading || (showPackaging && !option)}
              className="w-full bg-orange-500 active:scale-[0.99] transition rounded-xl text-white font-medium py-3 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {cartLoading ? "Adding..." : "Add to bag"}
            </button>
          </div>
        </div>

        {/* Optional spacer for very short pages */}
        <div style={{ height: `calc(${tabbarVar})` }} aria-hidden />
      </div>
    </>
  );
};

export default RecipeMain;
