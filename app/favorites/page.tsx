"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoginPrompt from "../components/LoginPrompt";
import RecipeList from "../components/RecipeCard";
import RecipeCardSkeleton from "../components/RecipeCardSkeleton";
import SearchBar from "../components/Search_bar";
import Nav from "../components/nav";
import { useAuth } from "../contexts/AuthContext";
import { useFavorites } from "../contexts/FavContext";
import RecipeCard from "../components/RecipeCard";

interface Props {
  className?: string;
  showHeader?: boolean;
}


const FavoritesPage: React.FC<Props> = ({ className, showHeader = true }) => {
  const { user } = useAuth();
  const { favorites, isLoading, error, deleteFavorite } = useFavorites()
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);

  // NEW: controls visibility of the login prompt
  const [loginOpen, setLoginOpen] = useState(true);

  const router = useRouter();

  const searchResult = favorites.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const showSearch = searchQuery.trim() !== "";

  // Show the prompt only if the user is NOT logged in AND the prompt is still open.
  const shouldShowLoginPrompt = !user && loginOpen;

  if (shouldShowLoginPrompt) {
    return (
      <LoginPrompt
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onNeverMind={() => setLoginOpen(false)}
        main_text="view your favorites"
      // Optional customizations:
      // title="Heads up!"
      // message={<>Create an account to keep your favorites in sync.</>}
      // signUpHref="/sign_up"
      // loginHref="/login"
      />
    );
  }

  if (error) return <div className="p-4 text-red-500">{error}</div>;

  // ---------- Loading state ----------
  if (isLoading) {
    return (
      <div className="pb-6">
        {showHeader ? (
          <div className="hidden md:block">
            <Nav />
            <div className="mx-auto w-full max-w-[1550px] px-4 mt-24">
              <h1 className="font-inter text-2xl text-center font-bold">Favorites</h1>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex mx-auto w-full max-w-[1550px] px-4">
            <div className={`flex justify-between items-center mb-6 ${className ?? ""}`}>
              <h2 className="text-3xl font-inter font-bold">Favorites</h2>
              <Link
                href="/shop"
                className="px-4 py-2 rounded-md font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
              >
                Add to cart
              </Link>
            </div>
            <hr />
          </div>
        )}
        {/*
        Mobile search header (kept inside container) */}
        {showHeader && (
          <div className="block md:hidden">
            <div className="mx-auto w-full max-w-[1550px] px-4">
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                showSearchBar={showSearchBar}
                PageTitle="Favorites"
                setShowSearchBar={setShowSearchBar}
              />
            </div>
          </div>
        )}

        {/* Skeletons inside the same container to prevent edge hugging */}
        <div className="mx-auto w-full max-w-[1550px] px-4">
          <div className="flex flex-wrap justify-center gap-6 mt-8 animate-in fade-in">
            {Array.from({ length: 6 }).map((_, i) => (
              <RecipeCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---------- Empty state ----------
  if (favorites.length === 0) {
    return (

      <div>
        {/* Mobile search header (kept inside container)  */}
        {showHeader && (
          <div className="block md:hidden">
            <div className="mx-auto w-full max-w-[1550px] px-4">
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                showSearchBar={showSearchBar}
                PageTitle="Favorites"
                setShowSearchBar={setShowSearchBar}
              />
            </div>
          </div>
        )}
        <div className="mx-auto w-full max-w-[1550px] px-4 py-6 h-full flex justify-center items-center flex-col">

          <div className="font-medium font-inter text-center">
            No meal option saved to favorites. <br />Head over to the shop to add to favorites        </div>
          <div className="mt-6 flex items-center justify-center gap-3">

            <Link href="/shop" className="w-36 text-center px-4 py-2 rounded-md font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors">Go to Shop</Link>
          </div>

        </div>
     </div>
    );
  }

  // ---------- Ready state ----------
  return (
    <div className="pb-6">
      {/* Desktop header */}
      {showHeader ? (
        <div className="hidden md:block">
          <Nav />
          <div className="mx-auto w-full max-w-[1550px] px-4 mt-24">
            <h1 className="font-inter text-2xl text-center font-bold">Favorites</h1>
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[1550px] px-4 hidden md:block ">
          <div className={`flex justify-between items-center mb-6 ${className ?? ""}`}>
            <h2 className="text-3xl font-inter font-bold">Favorites</h2>
            <Link
              href="/shop"
              className="px-4 py-2 rounded-md font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
            >
              Add to cart
            </Link>
          </div>
          <hr />
        </div>
      )}

      {/* Mobile search header (inside the same container) */}
      {showHeader && (
        <div className="block md:hidden">
          <div className="mx-auto w-full max-w-[1550px]">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              showSearchBar={showSearchBar}
              PageTitle="Favorites"
              setShowSearchBar={setShowSearchBar}
            />
          </div>
        </div>
      )}

      {/* Cards in a persistent container so they never touch the edges */}
      <div className="mx-auto w-full max-w-[1550px] px-4">
        <div className="flex flex-wrap justify-center gap-6 mt-8 animate-in fade-in">
          {(showSearch ? searchResult : favorites).map((recipe) => (
            <RecipeCard recipe={recipe} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;
