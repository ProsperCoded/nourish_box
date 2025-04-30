'use client'
import React, {useState} from "react";
import Image from "next/image";
import user from "../assets/icons8-user-48.png";
import Logo from "../assets/nourish_box_folder/Logo files/Logomark.svg";

import Link from "next/link";
import {Drawer, IconButton,  List, ListItemButton, ListItemText} from "@mui/material"
import MenuIcon from '@mui/icons-material/Menu';
const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
const mobileMenu =[
{ id:1, label: 'Home', link: '/'},
{ id:2,label: 'About us', link: '/about_us'},
{ id:3,label: 'Recipes', link: '/recipes'},
{ id:4,label: 'Contact', link: '/contact_us'},
]
  const toggleDrawer = (open:boolean) => () => {
    setIsOpen(open);
  };
  return (
    <div>
      <div className="lg:hidden flex justify-between items-center p-6">
        <Link href="/"><Image src={Logo} alt="Logo" className="w-[150px]" /></Link>
        <IconButton onClick={toggleDrawer(true)} edge="start" color="inherit" aria-label="menu">
        <MenuIcon />
      </IconButton>
      <Drawer anchor="left" open={isOpen} onClose={toggleDrawer(false)}>
        <List sx={{ width: 250 }}>
         {mobileMenu.map((i)=>(
           <Link href={i.link} key={i.id} passHref ><ListItemButton component="a" onClick={toggleDrawer(false)} >
           <ListItemText primary={i.label} />
         </ListItemButton></Link>
         ))}
        </List>
      </Drawer>
      </div>
      <div className="flex justify-center">
      <div className=' hidden lg:w-11/12 lg:flex justify-between items-center p-10 pb-0 md:w-100 text-black font-sans'>
        <Image src={Logo} alt='Logo' className='w-[150px]' />
        <ul className='flex py-0 w-1/2 font-inter'>
          <Link href="/"  className='px-4  font-medium text-xl'>Home</Link>
          <Link href="/receipes" className='px-4 font-medium text-xl'>Recipe </Link>
          <Link href="/about_us" className='px-4 font-medium text-xl'>About us</Link>
          <Link href="/" className='px-4 font-medium text-xl'>Community</Link>

        </ul>
        <div className='flex items-center justify-end w-1/12'>
          <Link href='/login'><Image src={user} alt='user icon' width={30} height={30.11} /></Link>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Nav;
