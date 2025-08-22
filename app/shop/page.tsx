'use client';

import { useEffect, useMemo, useState } from 'react';
import Header from '../components/header';
import RecipeCard from '../components/RecipeCard';
import RecipeCardSkeleton from '../components/RecipeCardSkeleton';
import { useCategories } from '../contexts/CategoryContext';
import { fetchRecipes } from '../utils/firebase/recipes.firebase';
import { Recipe } from '../utils/types/recipe.type';

const Page = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<string>('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { categoriesArray: categories, isLoading: categoriesLoading } =
    useCategories();

  useEffect(() => {
    const loadData = async () => {
      try {
        const fetchedRecipes = await fetchRecipes();
        setRecipes(fetchedRecipes);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const normalized = (v?: string | null) => (v || '').toLowerCase().trim();

  const visibleRecipes = useMemo(() => {
    const byCategory = (r: Recipe) =>
      !activeCategoryId || r.categoryId === activeCategoryId;

    const bySearch = (r: Recipe) =>
      normalized(r.name).includes(normalized(searchQuery)) ||
      normalized(r.description).includes(normalized(searchQuery));

    return recipes.filter(r => byCategory(r) && bySearch(r));
  }, [recipes, activeCategoryId, searchQuery]);

  // No need for categoryMap - getCategoryName provides O(1) lookup

  return (
    <main className='min-h-screen '>
    <div className=' md:px-8  '>
        {/* Header (kept) */}
     <div className=' w-full md:flex items-center justify-center '>
          <div className='md:w-3/4 ' ><Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} /></div>
        </div>

        {/* Title / Subtitle */}
        <section className='text-left max-w-3xl md:mx-auto'>
          <h2 className='text-3xl sm:text-4xl px-4 lg:text-5xl font-inter font-medium text-center my-4'>
           Check out our recipes for the week
          </h2>

        </section>

        {/* Category Tabs */}
        <nav aria-label='recipe categories' className='my-4 max-w-3xl mx-auto'>
          {categoriesLoading ? (
            <div className='flex gap-6 justify-center  items-center'>
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className='h-6 w-20 bg-gray-200 rounded animate-pulse'
                />
              ))}
            </div>
          ) : (
            <ul className='flex gap-6 justify-center overflow-x-auto no-scrollbar text-sm sm:text-base'>
              {/* All Categories Tab */}
              <li>
                <button
                  onClick={() => setActiveCategoryId('')}
                  className={[
                    'pb-2 transition-colors whitespace-nowrap',
                    !activeCategoryId
                      ? 'text-green-600 border-b-2 border-green-500 font-semibold'
                      : 'text-gray-400 hover:text-gray-600 border-b-2 border-transparent',
                  ].join(' ')}
                >
                  All Categories
                </button>
              </li>

              {/* Dynamic Category Tabs */}
              {categories.map(category => {
                const isActive = category.id === activeCategoryId;
                return (
                  <li key={category.id}>
                    <button
                      onClick={() => setActiveCategoryId(category.id)}
                      className={[
                        'pb-2 transition-colors whitespace-nowrap',
                        isActive
                          ? 'text-green-600 border-b-2 border-green-500 font-semibold'
                          : 'text-gray-400 hover:text-gray-600 border-b-2 border-transparent',
                      ].join(' ')}
                    >
                      {category.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </nav>
      </div>

      {/* Recipes */}
      <div className='px-4 md:px-8 lg:px-16 pb-10'>
        {error ? (
          <div className='flex justify-center items-center min-h-[300px]'>
            <p className='text-red-600 text-center text-lg'>{error}</p>
          </div>
        ) : isLoading ? (

              <section className='flex justify-center items-center  w-full
                   '>
              <div className="  w-5/6  max-w-[1550px] flex justify-center items-center  flex-wrap gap-6 lg:gap-8 ">
                 {Array.from({ length: 8 }).map((_, index) => (
              <RecipeCardSkeleton key={index} />
            ))}
           </div>
          </section>

        ) : visibleRecipes.length === 0 ? (
          <div className='max-w-2xl mx-auto text-center py-20'>
            <p className='text-gray-500'>
              No recipes match your filters. Try a different category or search.
            </p>
          </div>
        ) : (
                <div className="flex justify-center w-full">
  <section className="md:mx-auto max-w-[1550px] md:px-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3  xl:grid-cols-3 gap-6 lg:gap-8">
      {visibleRecipes.map(r => (
        <RecipeCard key={r.id} recipe={r} />
      ))}
    </div>
  </section>
</div>
        )}
      </div>
    </main>
  );
};

export default Page;
