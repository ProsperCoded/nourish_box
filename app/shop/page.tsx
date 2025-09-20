'use client';

import { useEffect, useMemo, useState } from 'react';
import Nav from '../components/nav';
import RecipeCard from '../components/RecipeCard';
import RecipeCardSkeleton from '../components/RecipeCardSkeleton';
import Search_bar from '../components/Search_bar';
import { useCategories } from '../contexts/CategoryContext';
import { fetchRecipes } from '../utils/firebase/recipes.firebase';
import { Recipe } from '../utils/types/recipe.type';
import Footer from '../components/Footer_main';

const Page = () => {
  const [searchQuery, setSearchQuery] = useState('');
  // ❌ was: const [showSearchBar, setSearchBar] = useState('');
  // Remove or make it a real boolean if you actually toggle it.
  // const [showSearchBar, setShowSearchBar] = useState<boolean>(true);

  const [activeCategoryId, setActiveCategoryId] = useState<string>('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { categoriesArray: categories, isLoading: categoriesLoading } = useCategories();

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
    const byCategory = (r: Recipe) => !activeCategoryId || r.categoryId === activeCategoryId;
    const bySearch = (r: Recipe) =>
      normalized(r.name).includes(normalized(searchQuery)) ||
      normalized(r.description).includes(normalized(searchQuery));

    return recipes.filter(r => byCategory(r) && bySearch(r));
  }, [recipes, activeCategoryId, searchQuery]);

  return (
    <main className='min-h-screen'>
      {/* Desktop: Nav controls search */}
      <div className="hidden md:block">
        <Nav showSearch={true} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </div>

      {/* Mobile: make Search_bar controlled too */}
      <div className="block md:hidden">
        {/* Ensure your Search_bar component accepts value + onChange OR these exact props */}
        <Search_bar
          PageTitle="Shop"
          showSearchBar={true}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        // If your Search_bar expects value/onChange instead, use:
        // value={searchQuery}
        // onChange={(v: string) => setSearchQuery(v)}
        />
      </div>
      <div className='md:pt-32 md:px-8'>
        {/* Title / Subtitle */}
        <section className='text-left max-w-3xl md:mx-auto'>
          <h1 className='text-2xl px-4 lg:text-3xl font-inter font-medium  text-center my-4 mb-4 md:my-4 md:mb-0'>
            Check out our recipes for the week
          </h1>

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
                    'pb-2 font-medium transition-colors font-inter whitespace-nowrap',
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
                        'pb-2 transition-colors whitespace-nowrap font-medium font-inter',
                        isActive
                          ? 'text-green-900 border-b-2 border-green-900 font-semibold'
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
      <div className='hidden md:block'>
        <Footer />
      </div>
    </main>
  );
};

export default Page;
