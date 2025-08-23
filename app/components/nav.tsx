"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";

import { UserAvatar } from "@/app/components/UserAvatar";
import FavoriteIcon from "@mui/icons-material/Favorite";
import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
import return_btn from "../assets/icons8-left-arrow-50.png";
import search from "../assets/icons8-search-48.png";
import Logo from "../assets/nourish_box_folder/Logo files/Logomark.svg";
import icon from "../assets/nourish_box_folder/Logo files/icon.svg";
import { useAuth } from "../contexts/AuthContext";
import { useFavorites } from "../contexts/FavContext";
import CartComponent from "./Cart";

type NavProps = {
  showSearch?: boolean;
  searchQuery?: string;
  setSearchQuery?: React.Dispatch<React.SetStateAction<string>>;
  noLinks?: boolean;
};

const Nav = ({ showSearch = false, searchQuery, setSearchQuery, noLinks = false }: NavProps) => {
  if (showSearch) {
    noLinks = true;
  }
  const router = useRouter();
  const pathname = usePathname();
  const [navVisible, setNavVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const { user: authUser } = useAuth();
  const { favorites } = useFavorites();

  // Only for files inside /profile folder (e.g., /profile/manageAddress)
  const showReturn = !!pathname && pathname.startsWith('/profile/');

  // Controlled/uncontrolled search - fix focus bug by ensuring consistent state
  const [localQuery, setLocalQuery] = useState('');
  const isControlled = searchQuery !== undefined && setSearchQuery !== undefined;
  const value = isControlled ? searchQuery : localQuery;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (isControlled && setSearchQuery) {
      setSearchQuery(v);
    } else {
      setLocalQuery(v);
    }
  };

  const handleReturn = () => router.push('/profile');

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      setScrolled(scrollTop > 50); // Change style after 50px scroll

      if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scrolling down and past 100px
        setNavVisible(false);
      } else {
        // Scrolling up or at the top (or less than 100px scroll down)
        setNavVisible(true);
      }
      setLastScrollTop(scrollTop <= 0 ? 0 : scrollTop); // For Mobile or negative scrolling
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollTop]);

  const navBaseClasses =
    "fixed w-full top-0 left-0 z-50 transition-all duration-300 ease-in-out";
  const navVisibilityClass = navVisible ? "translate-y-0" : "-translate-y-full";
  const navStyleClass = scrolled
    ? "bg-white shadow-md text-black"
    : " backdrop-blur-sm";

  const linkColorClass = scrolled ? "text-black" : "text-black";

  // Favorites component for both mobile and desktop
  const FavoritesButton = ({ isMobile = false }: { isMobile?: boolean }) => (
    <Link href="/favorites" className="relative">
      <div className="flex items-center hover:scale-105 transition-transform cursor-pointer">
        <FavoriteIcon
          sx={{
            fontSize: isMobile ? 24 : 28,
            stroke: "#222",
            strokeWidth: 2,
            fill: "none",
          }}
        />
        {favorites.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium">
            {favorites.length > 99 ? "99+" : favorites.length}
          </span>
        )}
      </div>
    </Link>
  );

  // Search component for both mobile and desktop with improved styling
  const SearchBar = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`flex items-center border-2 border-gray-300 rounded-full px-4 py-3 bg-white shadow-sm hover:shadow-md transition-all duration-200 focus-within:border-brand-btn_orange focus-within:ring-2 focus-within:ring-brand-btn_orange focus-within:ring-opacity-20 ${isMobile ? 'w-full min-h-[48px]' : 'w-full max-w-lg min-h-[48px] mx-auto'}`}>
      <input
        type="text"
        placeholder="Search recipes..."
        value={value}
        onChange={handleChange}
        className={`bg-transparent w-full outline-none placeholder-gray-500 text-gray-700 ${isMobile ? 'text-base' : 'text-lg'}`}
      />
      <div className="ml-3 flex-shrink-0">
        <Image src={search} alt="search icon" width={isMobile ? 24 : 26} height={isMobile ? 24 : 26} className="opacity-60" />
      </div>
    </div>
  );

  return (
    <div className={`${navBaseClasses} ${navVisibilityClass} ${navStyleClass}`}>
      {/* Mobile Nav */}
      <div className="lg:hidden p-4 font-sans">
        <div className="flex justify-between items-center">
          {/* Left area: either Return arrow (profile subpages) OR Logo */}
          <div className="flex items-center gap-3">
            {showReturn ? (
              <button
                onClick={handleReturn}
                aria-label="Go back to Profile"
                className="rounded-full border border-gray-300 p-2 hover:bg-gray-100 active:scale-95 transition"
              >
                <Image src={return_btn} alt="Back" width={22} height={22} />
              </button>
            ) : (
              <Link href="/">
                <Image src={icon} alt="nourish icon" className="w-[50px]" />
              </Link>
            )}
          </div>

          <div className="flex gap-2 items-center">
            {/* Admin Badge for Mobile */}
            {!noLinks && authUser?.role === "admin" && (
              <Link href="/admin">
                <div className="flex items-center bg-gradient-to-r from-red-600 to-orange-600 text-white px-3 py-1.5 rounded-full shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1.5"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <span className="text-xs font-semibold">Admin</span>
                </div>
              </Link>
            )}
            <div>
              <UserAvatar className="flex-row " />
            </div>
            {authUser && <FavoritesButton isMobile={true} />}
            <CartComponent />
          </div>
        </div>

        {/* Mobile: optional search */}
        {showSearch && (
          <div className="block w-full mt-4 px-2">
            <SearchBar isMobile={true} />
          </div>
        )}
      </div>

      {/* Desktop Nav */}
      <div className="hidden lg:flex justify-center w-full ">
        <div className="w-5/6 max-w-[1550px] flex justify-between items-center py-4 font-sans ">
          <Link href="/">
            <Image src={Logo} alt="Logo" className="w-[150px]" />
          </Link>

          {/* Center area: either search bar or navigation links */}
          <div className="flex items-center font-inter justify-center gap-4 flex-1 max-w-2xl mx-4">
            {showSearch ? (
              <div className="w-full flex justify-center">
                <SearchBar />
              </div>
            ) : !noLinks ? (
              <div className="flex items-center justify-around gap-6 w-full max-w-md">
                <Link
                  href="/shop"
                  className={`px-4 font-medium text-md ${linkColorClass} hover:text-gray-600 transition-colors`}
                >
                  Shop
                </Link>
                <Link
                  href="/about_us"
                  className={`px-4 font-medium text-md ${linkColorClass} hover:text-gray-600 transition-colors`}
                >
                  About us
                </Link>
                <Link
                  href="/contact_us"
                  className={`px-4 font-medium text-md ${linkColorClass} hover:text-gray-600 transition-colors`}
                >
                  Contact us
                </Link>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            {/* Admin Badge for Desktop */}
            {!noLinks && authUser?.role === "admin" && (
              <Link href="/admin">
                <div className="flex items-center bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2 rounded-full shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <span className="text-sm font-semibold">Admin</span>
                </div>
              </Link>
            )}
            <div className="mx-4">
              <UserAvatar className="flex-row " />
            </div>
            {authUser && <FavoritesButton />}
            <CartComponent />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nav;
