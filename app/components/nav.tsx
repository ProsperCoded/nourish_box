'use client'
import React, {useState} from "react";
import Image from "next/image";
import user from "../assets/icons8-user-48.png";
import Logo from "../assets/nourish_box_folder/Logo files/Logomark.svg";
import Cart from '../assets/icons8-cart-48.png';
import cancel_icon from "../assets/icons8-cancel-48.png";
import Link from "next/link";
import {Drawer, IconButton,  List, ListItemButton, ListItemText} from "@mui/material"
import MenuIcon from '@mui/icons-material/Menu';
import Cart_tab from "./cart_tab";
import design from "../assets/nourish_box_folder/Logo files/icon.svg";

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
const mobileMenu =[
{ id:1, label: 'Home', link: '/'},
{ id:2,label: 'About us', link: '/about_us'},
{ id:3,label: 'Recipes', link: '/recipes'},
{ id:4,label: 'Contact', link: '/contact_us'},
]
  const toggleDrawer = (open: "cart" | "menu") => () => {
    setIsOpen(open);
} 
  const closeDrawer = () => {
    setIsOpen(null);
  } 
  return (
    <div>
      <div className="lg:hidden flex justify-between items-center p-6">
        <Link href="/"><Image src={Logo} alt="Logo" className="w-[150px]" /></Link>
        <IconButton onClick={toggleDrawer("menu")} edge="start" color="inherit" aria-label="menu">
        <MenuIcon />
        </IconButton>
        {/* mobile menu */}
      <Drawer anchor="left" open={isOpen=== "menu"} onClose={closeDrawer}>
        <List sx={{ width: 250 }}>
         {mobileMenu.map((i)=>(
           <Link href={i.link} key={i.id} passHref ><ListItemButton component="a" onClick={toggleDrawer("menu")} >
           <ListItemText primary={i.label} />
         </ListItemButton></Link>
         ))}
        </List>
        </Drawer>

        <Drawer anchor="right" open={isOpen === "cart"} onClose={closeDrawer}>
          <List sx={{ width: 500 }}>
            <div className="flex justify-between items-center">
              <Image src={design} alt="Logo" className=" m-4" width={50} height={50} />
              <Image src={cancel_icon} alt="cart" className=" m-4 rotate-[270]" width={30} height={30} onClick={closeDrawer} />
            </div>
            <Cart_tab cart={cart}  setCart={setCart}/>
            
          </List>
        </Drawer>
        
      </div>
      <div className="flex justify-center">
      <div className=' hidden lg:w-11/12 lg:flex justify-between items-center p-10 pb-0 md:w-100 text-black font-sans'>
        <Image src={Logo} alt='Logo' className='w-[150px]' />
        <ul className='flex py-0 w-1/2 font-inter'>
          <Link href="/"  className='px-4  font-medium text-xl'>Home</Link>
          <Link href="/recipes" className='px-4 font-medium text-xl'>Recipe </Link>
          <Link href="/about_us" className='px-4 font-medium text-xl'>About us</Link>
          

        </ul>
        <div className='flex items-center justify-end w-1/12'>
            <Link href='/profile' className="mx-4"><Image src={user} alt='user icon' width={30} height={30.11} /></Link>
            <IconButton onClick={toggleDrawer("cart")} edge="start" color="inherit" aria-label="cart">
              <Image src={Cart} alt="cart" width={30} height={30.11} />
            </IconButton>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Nav;
