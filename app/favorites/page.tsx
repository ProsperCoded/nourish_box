"use client";

import { useFavorites } from "../contexts/FavContext";
import { useRouter } from "next/navigation";
import RecipeList from "../components/RecipeCard";
import icon from "../assets/nourish_box_folder/Logo files/icon.svg";
import search from "../assets/icons8-search-48.png";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "../components/Search_bar";

// Disable static generation for this page
export const dynamic = "force-dynamic";

interface Props {
  className?: string;
  showHeader?: boolean;
}

const FavoritesPage: React.FC<Props> = ({ className, showHeader = true }) => {
  const { user, loading: authLoading } = useAuth();
  const { favorites, isLoading, error } = useFavorites();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted on client
  if (!mounted) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const searchResult = favorites.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showSearch = searchQuery.trim() !== "";

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <h2 className="text-xl font-semibold mb-4">
          Please log in to view your favorites
        </h2>
        <button
          onClick={() => router.push("/login")}
          className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <div className="text-red-500 text-center">
          <h2 className="text-xl font-semibold mb-2">
            Error Loading Favorites
          </h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <h2 className="text-xl font-semibold mb-4">No favorites yet</h2>
        <p className="text-gray-600 mb-4">
          Start exploring recipes and add them to your favorites!
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          Browse Recipes
        </button>
      </div>
    );
  }

  const goBack = () => {
    if (
      typeof window !== "undefined" &&
      window.history.length > 1 &&
      window.innerWidth > 768
    ) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Desktop Header */}
      {showHeader && (
        <div
          className={`hidden md:flex justify-between items-center w-full max-w-7xl mx-auto ${
            className ?? ""
          }`}
        >
          <Link href="/">
            <Image src={icon} alt="logo" className="w-[70px]" />
          </Link>
          <h3 className="text-2xl font-semibold">Favorites</h3>
          <div className="flex items-center border border-gray-400 rounded-md px-2 w-full max-w-sm">
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 w-full outline-none"
            />
            <Image src={search} alt="search" width={20} height={20} />
          </div>
        </div>
      )}

      {/* Mobile Search Header */}
      {showHeader && (
        <div className="block md:hidden">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            showSearchBar={showSearchBar}
            setShowSearchBar={setShowSearchBar}
            goBack={goBack}
          />
        </div>
      )}

      {/* Recipe List */}
      <div className="flex flex-wrap justify-center gap-6 mt-8 animate-in fade-in">
        {(showSearch ? searchResult : favorites).map((recipe) => (
          <RecipeList key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
};

export default FavoritesPage;
