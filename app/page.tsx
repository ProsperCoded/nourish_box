'use client';

import Image from 'next/image';
import hover_img_one from './assets/Frame 464.png';
import hover_img_two from './assets/Frame 466.png';
import Nav from './components/nav';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import search from './assets/icons8-search-48.png';
import hero_main from './assets/Nourish Box62470.jpg';
import Logo from './assets/nourish_box_folder/Logo files/Logomark.svg';
import AboutUs from './components/about_us';
import Footer from './components/Footer_main';
import RecipeCard from './components/RecipeCard';
import {Typewriter} from './components/typewriter';

import RecipeCardSkeleton from './components/RecipeCardSkeleton';
import { UserAvatar } from './components/UserAvatar';
import OneTap from './lib/OneTap/OneTap';
import { fetchRecipes } from './utils/firebase/recipes.firebase';
import { getSiteContent } from './utils/firebase/site-content.firebase';
import { Recipe } from './utils/types/recipe.type';
import {
  DEFAULT_SITE_CONTENT,
  SiteContent,
} from './utils/types/site-content.type';
import { FaHeart, FaUser } from 'react-icons/fa';

export default function Home({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Use default content or fetched content
  const displayContent = siteContent || DEFAULT_SITE_CONTENT;

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load recipes and site content in parallel
        const [fetchedRecipes, fetchedSiteContent] = await Promise.all([
          fetchRecipes(),
          getSiteContent(),
        ]);

        setRecipes(fetchedRecipes);
        setSiteContent(fetchedSiteContent);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className='min-h-screen'>
      {/* Desktop Nav */}
      <div className='hidden md:block'>
        <div className='max-w-7xl'>
          <Nav />
        </div>
      </div>

      {/* OneTap Authentication - only on homepage for new users */}
      <OneTap />

      {/* Mobile header */}
      <div className='md:hidden mt-5 flex flex-col items-center justify-between gap-4 px-4 pt-2 mb-10'>
        <div className='flex justify-between w-full'>
          {' '}
          <Image src={Logo} alt='logo' width={120} />
          <UserAvatar />
        </div>
        <div className='flex items-center border-2 border-gray-300 rounded-full px-4 py-3 bg-white shadow-sm hover:shadow-md transition-all duration-200 focus-within:border-brand-btn_orange focus-within:ring-2 focus-within:ring-brand-btn_orange focus-within:ring-opacity-20 w-full min-h-[48px] my-3'>
          <input
            type='text'
            placeholder='Search recipes...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='w-full bg-transparent outline-none text-base placeholder-gray-500 text-gray-700'
          />
          <div className="ml-3 flex-shrink-0">
            <Image src={search} alt='search' width={24} height={24} className="opacity-60" />
          </div>
        </div>
      </div>

      {/* Hero Section */}

      <div className='flex justify-center'>
        <section className='w-5/6 md:pt-20 pb-10  max-w-[1550px] lg:mt-24 '>
          {/* Mobile & Tablet Layout */}
          <div className='flex flex-col lg:hidden items-center text-center gap-4'>
            {/* <Image
              src={displayContent.heroImage?.url || hero}
              alt="hero dish"
              width={400}
              height={400}
              className="animate-fade-in-up"
            /> */}
            <h1 className='text-5xl font-medium font-custom'>
              <Typewriter text={ displayContent.heroHeading || DEFAULT_SITE_CONTENT.heroHeading } />
            </h1>
            <p className='xl:text-lg text-brand-sub_gray font-inter max-w-md'>
              {displayContent.heroDescription ||
                DEFAULT_SITE_CONTENT.heroDescription}
            </p>
            <Link href='/shop' className='mb-6'>
              <button className='bg-brand-btn_orange text-white text-lg font-medium px-6 py-3 rounded-full shadow hover:scale-105 transition-transform'>
                Order Now
              </button>
            </Link>
            <Image
              src={hero_main}
              width={400}
              height={400}
              alt='hero img'
              className='rounded-lg  '
            />
          </div>

          {/* Desktop Layout */}

          <div className='flex justify-center items-center'>
            <div className='hidden lg:flex justify-between items-center gap-10 '>
              <div className='w-1/2 flex flex-col items-start text-left'>
                <h1 className='text-5xl font-custom font-medium leading-tight'>
                  {displayContent.heroHeading ||
                    DEFAULT_SITE_CONTENT.heroHeading}
                  {(
                    displayContent.heroHeading ||
                    DEFAULT_SITE_CONTENT.heroHeading
                  ).includes('Easy') && ': Unleash Your Inner Chef'}
                </h1>
                <p className='mt-6 text-lg text-brand-sub_gray font-inter'>
                  {displayContent.heroDescription ||
                    DEFAULT_SITE_CONTENT.heroDescription}
                </p>
                <Link href='/shop'>
                  <button className='bg-brand-btn_orange mt-8 text-white text-xl font-medium px-8 py-4 rounded-xl shadow hover:scale-105 transition-transform'>
                    Order Now
                  </button>
                </Link>
              </div>

              <div className='w-1/2 relative flex justify-center items-center'>
                {/* <Image
              src={displayContent.heroImage?.url || hero}
              alt="hero dish"
              width={600}
              height={600}
              className="z-10"
            /> */}
                <Image
                  src={hero_main}
                  width={400}
                  height={400}
                  alt='hero img'
                  className='rounded-lg'
                />
                {/* <Image
                  src={hover_img_one}
                  height={180}
                  width={180}
                  alt='float left'
                  className='absolute bottom-0 left-0 z-0'
                /> */}
                <div className='font-inter absolute bottom-4 left-0 z-0 rounded-lg p-2 shadow-md bg-white flex flex-col w-56'>
                  <p className='bg-gray-100 text-sm rounded-lg p-2 m-1'>
                    The protein portions are well marinated, juicy and generous in size!
                  </p>
                  <div className='flex  justify-between border-black p-2 items-center'>
                    <div className='flex items-center'>
                      <FaUser  className='fa-thin fa-user fa-regular text-[#004c30]'/>
                      <p className='mx-2 text-sm'>Rere</p>
                    </div>
                    <FaHeart className='text-[#004c30]'/>
                  </div>
                </div>
                <Image
                  src={hover_img_two}
                  height={180}
                  width={180}
                  alt='float right'
                  className='absolute top-0 right-0 z-0'
                />
                {/* <Image
                    src={broccoli}
                    alt="broccoli"
                    className="absolute bottom-4 right-4 animate-spinSlow z-0"
                  />
                  <Image
                    src={tomato}
                    alt="tomato"
                    className="absolute top-4 left-4 animate-float z-0"
                  /> */}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Recipes Section */}
      <div className='flex justify-center' >
        <section className='px-4 mt-16   max-w-[1550px]'>
          <div className='text-center mb-8'>
            <h2 className='font-custom font-medium text-4xl sm:text-4xl lg:text-5xl mb-2'>
              Discover, Create, Share
            </h2>
            <p className='text-brand-sub_gray text-lg'>
              {loading
                ? 'Loading recipes...'
                : 'Check out our recipes for the week'}
            </p>
          </div>

          <div className='flex flex-wrap w-full  justify-center gap-10'>
            {loading
              ? // Show skeleton cards while loading
              Array.from({ length: 4 }).map((_, index) => (
                <RecipeCardSkeleton key={index} />
              ))
              : // Show actual recipe cards when loaded
              recipes
                .slice(0, 3)
                .map(recipe => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
          </div>

          <div className='flex justify-center mt-6'>
            <button
              className='bg-brand-btn_orange px-6 py-3 my-6 rounded-xl font-inter text-white text-lg'
              onClick={() => router.push('/shop')}
            >
              See All
            </button>
          </div>
        </section>
      </div>
      <AboutUs />

      <Footer />
    </div>
  );
}
