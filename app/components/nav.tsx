"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

import Logo from "../assets/nourish_box_folder/Logo files/Logomark.svg";
import Link from "next/link";
import {
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { UserAvatar } from "@/app/components/UserAvatar";
import CartComponent from "./Cart";
import { useAuth } from "../contexts/AuthContext";
import { useFavorites } from "../contexts/FavContext";

const Nav = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const { user: authUser } = useAuth();
  const { favorites } = useFavorites();

  const mobileMenu = [
    { id: 1, label: "Home", link: "/" },
    { id: 2, label: "About us", link: "/about_us" },
    { id: 3, label: "Recipes", link: "/recipes" },
    { id: 4, label: "Contact", link: "/contact_us" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

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
  const mobileIconColor = scrolled ? "black" : "black";

  // Favorites component for both mobile and desktop
  const FavoritesButton = ({ isMobile = false }: { isMobile?: boolean }) => (
    <Link href="/profile?tab=saved" className="relative">
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

  return (
    <div className={`${navBaseClasses} ${navVisibilityClass} ${navStyleClass}`}>
      {/* Mobile Nav */}
      <div className="lg:hidden p-4 font-sans">
        <div className="flex justify-between items-center">
          <Link href="/">
            <Image src={Logo} alt="Logo" className="w-[100px]" />
          </Link>
          <div className="flex gap-2 items-center">
            {/* Admin Badge for Mobile */}
            {authUser?.role === "admin" && (
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
            <IconButton
              onClick={toggleMobileMenu}
              edge="start"
              color="inherit"
              aria-label="menu"
            >
              <MenuIcon sx={{ color: mobileIconColor }} />
            </IconButton>
          </div>
        </div>

        <Drawer
          anchor="right"
          open={isMobileMenuOpen}
          onClose={closeMobileMenu}
        >
          <List sx={{ width: 250 }}>
            {mobileMenu.map((item) => (
              <ListItemButton
                key={item.id}
                component="a"
                href={item.link}
                onClick={closeMobileMenu}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Drawer>
      </div>

      {/* Desktop Nav */}
      <div className="hidden lg:flex justify-between ">
        <div className="w-full mx-10 flex justify-between items-center p-4 font-sans  ">
          <Link href="/">
            <Image src={Logo} alt="Logo" className="w-[150px]" />
          </Link>

          <div className="flex items-left  font-inter justify-around gap-4 w-1/3   ">
            <Link
              href="/recipes"
              className={`px-4 font-medium text-md ${linkColorClass}  hover:text-gray-600 `}
            >
              Recipes{" "}
            </Link>
            <Link
              href="/about_us"
              className={`px-4 font-medium text-md ${linkColorClass}  hover:text-gray-600 `}
            >
              About us
            </Link>
            <Link
              href="/contact_us"
              className={`px-4 font-medium text-md ${linkColorClass}  hover:text-gray-600 `}
            >
              Contact us
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {/* Admin Badge for Desktop */}
            {authUser?.role === "admin" && (
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
