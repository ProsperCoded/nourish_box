"use client";
import { useFavorites } from "../contexts/FavContext";
import { useRouter } from 'next/navigation';
import RecipeList from "../components/RecipeCard";
import icon from "../assets/nourish_box_folder/Logo files/icon.svg";
import search from "../assets/icons8-search-48.png";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Image from "next/image";

import Link from "next/link";
import SearchBar from "../components/Search_bar";
interface Props {
    className?: string;
}

 const FavoritesPage: React.FC<Props>= ({className}) => {
    const { user } = useAuth();
    const { favorites, isLoading, error } = useFavorites();
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearchBar, setShowSearchBar] = useState(false);
    const router = useRouter();
    const searchResult = favorites.filter((recipe) =>
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const showSearch = searchQuery.trim() !== "";

    if (!user) {
        return <div className="p-4">Please log in to view your favorites.</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (favorites.length === 0) {
        return <div className="p-4">No favorites yet.</div>;
    }

    const goBack = () => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push('/'); // fallback if no previous page
        }
    };

    return (
        <div className="p-6">

            {/* For desktop */}
            <div className={`hidden md:flex justify-center  w-full ${className ?? ''}`}>
                <div className="sm:hidden md:flex w-full max-w-7xl justify-between items-center">
                    <Link href="/">
                        <Image src={icon} alt="icon" className=" block w-[70px]" />

                    </Link>
                    <h3 className="text-2xl font-semibold my-4 trasnition ease-linear duration-200">Favorites</h3>
                    <div className=" search bar px-2 border-[1px] border-gray-400 rounded-md flex items-center sm:w-8/12 lg:w-1/5 animate-in fade-in">

                        <input
                            type="text"
                            placeholder="Search recipes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className=" mr-3 p-1 w-full"
                        />
                        <Image src={search} alt="search" width={20} height={10} />
                    </div>
                </div>
            </div>
            {/* search bar header for mobile */}
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} showSearchBar={ showSearchBar} setShowSearchBar={setShowSearchBar} goBack={goBack}/>
            <div className="flex flex-wrap w-full justify-center gap-6 p-6 animate-in fade-in">
                {(showSearch ? searchResult : favorites).map((recipe) => (
                    <RecipeList key={recipe.id} recipe={recipe} />
                ))}
            </div>
        </div>
    );
}
export default FavoritesPage;
