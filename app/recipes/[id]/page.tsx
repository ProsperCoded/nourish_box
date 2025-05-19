'use client'
import { notFound } from 'next/navigation';
import RecipeMain from '@/app/components/RecipeMain';
import {getRecipeById} from '@/app/utils/firebase/recipes.firebase';

interface PageProps {
    params: { id: string };
}

export default  function RecipePage({  params }: PageProps) {
    const recipes = await getRecipeById(params.id);

    if (!recipes) return notFound();

    return <RecipeMain recipe={recipes} />;
}
