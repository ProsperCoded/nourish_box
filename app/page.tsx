'use client';

import Nav from './components/nav';
import Image from 'next/image';
import hero from './assets/hero.png';
import hover_img_one from './assets/Frame 464.png';
import hover_img_two from './assets/Frame 466.png';
import broccoli from './assets/Broccoli.png';
import tomato from './assets/Tomato.png';
import RecipeCard from './components/RecipeCard';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Recipe } from './utils/types/recipe.type';
import { fetchRecipes } from './utils/firebase/recipes.firebase';
import Logo from './assets/nourish_box_folder/Logo files/Logomark.svg';
import AboutUs from './components/about_us';
import CommunityList from './components/community';
import Banner from './components/banner';
import Footer from './components/footer';
import Link from 'next/link';
import search from './assets/icons8-search-48.png';
import CartComponent from './components/Cart';

export default function Home({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const fetchedRecipes = await fetchRecipes();
        setRecipes(fetchedRecipes);
      } catch (error) {
        console.error('Error loading recipes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Desktop Nav */}
      <div className="hidden md:block">
        <Nav />
      </div>

      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between gap-4 px-4 py-5">
        <Image src={Logo} alt="logo" width={120} />
        <div className="flex items-center gap-2 flex-grow border border-gray-300 rounded-full px-3 py-2 shadow-sm transition-all focus-within:ring-2 ring-brand-btn_orange">
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent outline-none text-sm"
          />
          <Image src={search} alt="search" width={20} height={20} />
        </div>
        <CartComponent />
      </div>


      {/* Hero Section */}
      
      <section className="px-4 lg:px-20 md:pt-20 pb-10">
        {/* Mobile & Tablet Layout */}
        <div className="flex flex-col lg:hidden items-center text-center gap-4">
          <Image
            src={hero}
            alt="hero dish"
            width={400}
            height={400}
            className="  animate-fade-in-up"
          />

          <h1 className="text-5xl font-custom font-medium ">
            Cooking Made Fun and Easy
          </h1>
          <p className="text-lg text-brand-sub_gray font-inter max-w-md">
            Nourish Box removes the hassle of meal prep by delivering pre-measured,
            pre-cut ingredients along with guided recipes.
          </p>
          <Link href="/recipes">
            <button className="bg-brand-btn_orange text-white text-lg font-medium px-6 py-3 rounded-full shadow hover:scale-105 transition-transform">
              Order Now
            </button>
          </Link>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex justify-between items-center gap-10">
          <div className="w-1/2 flex flex-col items-start text-left">
            <h1 className="text-5xl font-custom font-medium leading-tight">
              Cooking Made Fun and Easy: <br /> Unleash Your Inner Chef
            </h1>
            <p className="mt-6 text-lg text-brand-sub_gray font-inter">
              Nourish Box removes the hassle of meal prep by delivering pre-measured,
              pre-cut ingredients along with guided recipes. We ensure every meal is
              made with carefully sourced ingredients, delivering farm-to-table
              goodness in every box.
            </p>
            <Link href="/recipes">
              <button className="bg-brand-btn_orange mt-8 text-white text-xl font-medium px-8 py-4 rounded-xl shadow hover:scale-105 transition-transform">
                Order Now
              </button>
            </Link>
          </div>

          <div className="w-1/2 relative flex justify-center items-center">
            <Image src={hero} alt="hero dish" width={600} height={600} className="z-10" />
            <Image
              src={hover_img_one}
              height={180}
              width={180}
              alt="float left"
              className="absolute bottom-0 left-0 z-0"
            />
            <Image
              src={hover_img_two}
              height={180}
              width={180}
              alt="float right"
              className="absolute top-0 right-0 z-0"
            />
            <Image
              src={broccoli}
              alt="broccoli"
              className="absolute bottom-4 right-4 animate-spinSlow z-0"
            />
            <Image
              src={tomato}
              alt="tomato"
              className="absolute top-4 left-4 animate-float z-0"
            />
          </div>
        </div>
      </section>


      {/* Recipes Section */}
      <section className="px-4 lg:px-20">
        <div className="text-center mb-8">
          <h2 className="font-custom font-medium text-4xl sm:text-4xl lg:text-5xl mb-2">
            Discover, Create, Share
          </h2>
          <p className="text-brand-sub_gray text-lg">
            {loading ? 'Loading recipes...' : 'Check out our recipes for the week'}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>

        <div className="flex justify-center mt-6">
          <button
            className="bg-brand-btn_orange px-6 py-3 rounded-xl font-inter text-white text-lg"
            onClick={() => router.push('/recipes')}
          >
            See All
          </button>
        </div>
      </section>

      <AboutUs />

      {/* Community Section */}
      <section className="text-center my-16 px-4">
        <h1 className="font-custom font-medium text-3xl sm:text-5xl">
          From Our Community
        </h1>
      </section>
      <CommunityList />

      {/* Banner */}
      <div className="flex justify-center items-center bg-brand-logo_green mx-4 lg:mx-16 my-7 p-6 lg:p-10 rounded-2xl lg:rounded-3xl">
        <Banner />
      </div>

      <Footer />
    </div>
  );
}
