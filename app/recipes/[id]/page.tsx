// app/recipe/[id]/page.tsx
import { notFound } from 'next/navigation';
import RecipeMain from '@/app/components/RecipeMain';
import { Recipe } from "@/app/api/recipes/[recipeId]/route";

interface PageProps {
    recipe: Recipe;
    params: { id: string };
}

export default async function RecipePage({  recipe }: PageProps) {
    const recipes = await Recipe(recipe.id);

    if (!recipes) return notFound();

    return <RecipeMain recipe={recipes} />;
}
