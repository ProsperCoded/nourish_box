"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

import Logo from "../assets/nourish_box_folder/Logo files/Logomark.svg";
import Cart from '../assets/icons8-cart-48.png';
import cancel_icon from "../assets/icons8-cancel-48.png";
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
import Cart_tab from "./cart_tab";

const Nav = () => {
  const [isOpen, setIsOpen] = useState<null | 'cart' | 'menu'>(null);
  interface Item {
    id: number;
    food_recipe: string;
    price: number;
  }
  const cart_items:Item[] = [
    {
      id: 1,
      food_recipe: 'Food name',
      price: 10,
    },
    {
      id: 2,
      food_recipe: 'Food name',
      price: 20,
    },
    {
      id: 3,
      food_recipe: 'Food name',
      price: 30,
    }

  ]
const [cart, setCart] = useState<Item[]>(cart_items);
  const [navVisible, setNavVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);

  const mobileMenu = [
    { id: 1, label: "Home", link: "/" },
    { id: 2, label: "About us", link: "/about_us" },
    { id: 3, label: "Recipes", link: "/recipes" },
    { id: 4, label: "Contact", link: "/contact_us" },
  ];
  const toggleDrawer = (open:  "cart" | "menu") => () => {
    setIsOpen(open);
} 
  const closeDrawer = () => {
    setIsOpen(null);
  } 

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
          onClick={toggleDrawer("menu")}
          edge="start"
          aria-label="menu"
          sx={{ color: mobileIconColor }}
        >
          <MenuIcon />
          </IconButton>
          {/* mobile menu */}
      <Drawer anchor="left" open={isOpen=== "menu"} onClose={closeDrawer}>
          <List sx={{ width: 250, pt: "env(safe-area-inset-top)" }}>
            {/* Added safe-area padding */}
            {mobileMenu.map((i) => (
              <Link href={i.link} key={i.id} passHref legacyBehavior>
                <ListItemButton component="a" onClick={toggleDrawer("menu")}>
                  <ListItemText primary={i.label} />
                </ListItemButton>
              </Link>
            ))}
          </List>
          </Drawer>

        <Drawer anchor="right" open={isOpen === "cart"} onClose={closeDrawer}>
          <List sx={{ width: 500 }}>
            <div className="flex justify-between items-center">
              <Image src={Logo} alt="Logo" className=" m-4" width={50} height={50} />
              <Image src={cancel_icon} alt="cart" className=" m-4 rotate-[270]" width={30} height={30} onClick={closeDrawer} />
            </div>
            <Cart_tab cart={cart}  setCart={setCart}/>
            
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
          <div className="flex items-center justify-end gap-4">
            <UserAvatar />
            <div className="flex items-center justify-end">
            <IconButton onClick={toggleDrawer("cart")} edge="start" color="inherit" aria-label="cart">
              <Image src={Cart} alt="cart" width={30} height={30.11} />
            </IconButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nav;
