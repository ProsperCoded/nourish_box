"use client";
import RecipeMain from '@/app/components/RecipeMain';
import { getRecipeById } from '@/app/utils/firebase/recipes.firebase';
import { useState, useEffect } from 'react';
import { Recipe } from '@/app/utils/types/recipe.type';
import { useRouter } from 'next/navigation';

interface PageProps {
    params: { id: string };
}

export default function RecipePage({ params }: PageProps) {
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchRecipe = async () => {
            const data = await getRecipeById(params.id);
            if (!data) {
                router.push('/404'); // 👈 navigate to a 404 or custom page
                return;
            }
            setRecipe(data);
            setLoading(false);
        };
        fetchRecipe();
    }, [params.id, router]);

    if (loading) return <div>Loading...</div>;

    return <RecipeMain recipe={recipe!} />;
}
