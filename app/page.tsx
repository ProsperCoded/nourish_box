"use client";

import Nav from "./components/nav";
import Image from "next/image";
import hero from "./assets/hero.png";
import hover_img_one from "./assets/Frame 464.png";
import hover_img_two from "./assets/Frame 466.png";
import broccoli from "./assets/Broccoli.png";
import tomato from "./assets/Tomato.png";
import RecipeCard from "./components/RecipeCard";
import RecipeCardSkeleton from "./components/RecipeCardSkeleton";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Recipe } from "./utils/types/recipe.type";
import { fetchRecipes } from "./utils/firebase/recipes.firebase";
import { SiteContent } from "./utils/types/site-content.type";
import { getSiteContent } from "./utils/firebase/site-content.firebase";
import { DEFAULT_SITE_CONTENT } from "./utils/types/site-content.type";
import Logo from "./assets/nourish_box_folder/Logo files/Logomark.svg";
import AboutUs from "./components/about_us";
import CommunityList from "./components/community";
import Banner from "./components/banner";
import Footer from "./components/footer";
import Link from "next/link";
import search from "./assets/icons8-search-48.png";
import CartComponent from "./components/Cart";
import { seedSiteContent } from "@/app/utils/seed/site-content.seed";

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
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
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
            src={displayContent.heroImage?.url || hero}
            alt="hero dish"
            width={400}
            height={400}
            className="animate-fade-in-up"
          />

          <h1 className="text-5xl font-custom font-medium">
            {displayContent.heroHeading || DEFAULT_SITE_CONTENT.heroHeading}
          </h1>
          <p className="text-lg text-brand-sub_gray font-inter max-w-md">
            {displayContent.heroDescription ||
              DEFAULT_SITE_CONTENT.heroDescription}
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
              {displayContent.heroHeading || DEFAULT_SITE_CONTENT.heroHeading}
              {(
                displayContent.heroHeading || DEFAULT_SITE_CONTENT.heroHeading
              ).includes("Easy") && ": Unleash Your Inner Chef"}
            </h1>
            <p className="mt-6 text-lg text-brand-sub_gray font-inter">
              {displayContent.heroDescription ||
                DEFAULT_SITE_CONTENT.heroDescription}
            </p>
            <Link href="/recipes">
              <button className="bg-brand-btn_orange mt-8 text-white text-xl font-medium px-8 py-4 rounded-xl shadow hover:scale-105 transition-transform">
                Order Now
              </button>
            </Link>
          </div>

          <div className="w-1/2 relative flex justify-center items-center">
            <Image
              src={displayContent.heroImage?.url || hero}
              alt="hero dish"
              width={600}
              height={600}
              className="z-10"
            />
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
            {loading
              ? "Loading recipes..."
              : "Check out our recipes for the week"}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {loading
            ? // Show skeleton cards while loading
              Array.from({ length: 6 }).map((_, index) => (
                <RecipeCardSkeleton key={index} />
              ))
            : // Show actual recipe cards when loaded
              recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
        </div>

        <div className="flex justify-center mt-6">
          <button
            className="bg-brand-btn_orange px-6 py-3 rounded-xl font-inter text-white text-lg"
            onClick={() => router.push("/recipes")}
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
