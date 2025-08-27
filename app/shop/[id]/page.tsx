"use client";
import RecipeMain from '@/app/components/RecipeMain';
import { getRecipeById } from '@/app/utils/firebase/recipes.firebase';
import { useState, useEffect } from 'react';
import { Recipe } from '@/app/utils/types/recipe.type';
import {  notFound } from 'next/navigation';

import { use } from 'react';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function RecipePage({ params }: PageProps) {
    const unwrappedParams = use(params);
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                setIsLoading(true);
                const recipe = await getRecipeById(unwrappedParams.id);
                if (!recipe) {
                    setError('Recipe not found');
                    return;
                }
                setRecipe(recipe);
            } catch (err) {
                setError('Failed to fetch recipe');
                console.error('Error fetching recipe:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRecipe();
    }, [unwrappedParams.id]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px] font-inter">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (error || !recipe) {
        return notFound();
    }

    return <RecipeMain recipe={recipe!} />;
}
