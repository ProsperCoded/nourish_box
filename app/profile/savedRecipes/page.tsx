// pages/profile/saved-recipes.tsx
'use client';

import ReturnButton from '@/app/components/return_button';
import FavoritesPage from '../../favorites/page';

const SavedRecipesPage = () => {
    return (
        <div className="p-4">
            <ReturnButton/>
            <h1 className="text-2xl font-semibold mb-4">Saved Recipes</h1>
            <div className="flex justify-between items-center mb-6">
            
            <button

            >
              Shop
            </button>
          </div>
            <FavoritesPage />
        </div>
    );
};

export default SavedRecipesPage;
