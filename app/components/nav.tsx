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
import { UserAvatar } from "@/app/components/UserAvatar";

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);

  const mobileMenu = [
    { id: 1, label: "Home", link: "/" },
    { id: 2, label: "About us", link: "/about_us" },
    { id: 3, label: "Recipes", link: "/recipes" },
    { id: 4, label: "Contact", link: "/contact_us" },
  ];
  const toggleDrawer = (open: boolean) => () => {
    setIsOpen(open);
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
    ? "bg-white shadow-lg text-black"
    : "bg-brand-logo_green/90 backdrop-blur-sm text-white";

  const linkColorClass = scrolled ? "text-black" : "text-white";
  const mobileIconColor = scrolled ? "black" : "white";

  return (
    <div className={`${navBaseClasses} ${navVisibilityClass} ${navStyleClass}`}>
      {/* Mobile Nav */}
      <div className="lg:hidden flex justify-between items-center p-4 sm:p-6">
        <Link href="/">
          <Image src={Logo} alt="Logo" className="w-[120px] sm:w-[150px]" />
        </Link>
        <IconButton
          onClick={toggleDrawer(true)}
          edge="start"
          aria-label="menu"
          sx={{ color: mobileIconColor }}
        >
          <MenuIcon />
        </IconButton>
        <Drawer anchor="left" open={isOpen} onClose={toggleDrawer(false)}>
          <List sx={{ width: 250, pt: "env(safe-area-inset-top)" }}>
            {/* Added safe-area padding */}
            {mobileMenu.map((i) => (
              <Link href={i.link} key={i.id} passHref legacyBehavior>
                <ListItemButton component="a" onClick={toggleDrawer(false)}>
                  <ListItemText primary={i.label} />
                </ListItemButton>
              </Link>
            ))}
          </List>
        </Drawer>
      </div>
      {/* Desktop Nav */}
      <div className="hidden lg:flex justify-center">
        <div className="w-full max-w-screen-xl mx-auto flex justify-between items-center p-4 font-sans">
          <Link href="/">
            <Image src={Logo} alt="Logo" className="w-[150px]" />
          </Link>
          <ul className={`flex py-0 font-inter justify-center items-center`}>
            <Link
              href="/recipes"
              className={`px-4 font-medium text-xl ${linkColorClass}`}
            >
              Recipe{" "}
            </Link>
            <Link
              href="/about_us"
              className={`px-4 font-medium text-xl ${linkColorClass}`}
            >
              About us
            </Link>
            <Link
              href="/"
              className={`px-4 font-medium text-xl ${linkColorClass}`}
            >
              Community
            </Link>
          </ul>
          <div className="flex items-center justify-end">
            <UserAvatar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nav;
