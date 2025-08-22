"use client";

import { useEffect, useState } from "react";
import { useFavorites } from "../contexts/FavContext";
import { useRouter } from "next/navigation";
import RecipeList from "../components/RecipeCard";
import icon from "../assets/nourish_box_folder/Logo files/icon.svg";
import search from "../assets/icons8-search-48.png";
import { useAuth } from "../contexts/AuthContext";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "../components/Search_bar";
import { LoginPromptWrapper } from "../components/LoginPromptWrapper";
import LoginPrompt from "../components/LoginPrompt";
import RecipeCardSkeleton from "../components/RecipeCardSkeleton";

interface Props {
  className?: string;
  showHeader?: boolean;
}

const FavoritesPage: React.FC<Props> = ({ className, showHeader = true }) => {
  const { user } = useAuth();
  const { favorites, isLoading, error } = useFavorites();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const router = useRouter();

  const searchResult = favorites.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showSearch = searchQuery.trim() !== "";

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (!user) {
      timer = setTimeout(() => {
        setShowLoginPrompt(true);
      }, 1); // optional delay
    } else {
      setShowLoginPrompt(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [user]);

  if (showLoginPrompt) {
    return (
      <LoginPromptWrapper>
        <LoginPrompt main_text="Please login" />
      </LoginPromptWrapper>
    );
  }
  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6">
        {/* Desktop Header */}
        {showHeader ? (
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
        ) : (
         <div></div>
        )}

        {/* Mobile Search Header */}
        {showHeader ? (
          <div className="block md:hidden">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              showSearchBar={showSearchBar}
              setShowSearchBar={setShowSearchBar}
              goBack={() => router.back()}
            />
          </div>
        ) : (
          <div></div>
        )}

        {/* Skeleton Loading */}
        <div className="flex flex-wrap justify-center gap-6 mt-8 animate-in fade-in">
          {Array.from({ length: 6 }).map((_, index) => (
            <RecipeCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return <div className="p-4">No favorites yet.</div>;
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
      {showHeader ? (
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
      ) : (
          <div className="max-w-7xl">
              <div className="flex  justify-between items-center mb-6">
            <h2 className="text-3xl font-inter font-bold">
             Favorites
            </h2>
            <button
              type="button"

              className="px-4 py-2 rounded-md font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
            >
              Add to cart
            </button>

          </div>
          <hr/>
     </div>
      )}

      {/* Mobile Search Header */}
      {showHeader ? (
        <div className="block md:hidden">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            showSearchBar={showSearchBar}
            setShowSearchBar={setShowSearchBar}
            goBack={goBack}
          />
        </div>
      ) : (
        <div></div>
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
