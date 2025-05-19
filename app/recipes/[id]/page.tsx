"use client"
import { notFound } from 'next/navigation';
import RecipeMain from '@/app/components/RecipeMain';
import {getRecipeById} from '@/app/utils/firebase/recipes.firebase';
import { useState } from 'react';
import { useEffect } from 'react';
import { Recipe } from '@/app/utils/types/recipe.type';
interface PageProps {
    params: { id: string };
}

export default  function RecipePage({  params }: PageProps) {
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    useEffect(() => {
        const fetchRecipe = async () => {
            const recipes = await getRecipeById(params.id);
            setRecipe(recipes);
        }
        fetchRecipe();
    }, [params.id]);    

    if (!recipe) return notFound();

    return <RecipeMain recipe={recipe} />;
}
