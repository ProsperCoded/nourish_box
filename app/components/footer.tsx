import React from 'react'
import Image from "next/image";
import Eggplant from '../assets/Eggplant.png'
import Salad from '../assets/Salad.png';
import FriedEggs from '../assets/Fried Eggs.png';

import Link from 'next/link';
import logo from '../assets/nourish_box_folder/Logo files/logomark_white.svg';
const footer = () => {
    return (
        <div className='flex flex-col lg:flex-row items-center justify-between  lg:px-16 lg:pt-16 lg:pb-32 px-3  text-white bg-[#004c30] '>
            <Image src={logo} alt='logo' width={150} className='my-5 mb-12' />
            <div className='flex flex-col justify-between items-center lg:flex-row lg:justify-between text-center lg:text-start w-10/12 '>
                <ul className='font-inter mb-5 lg:mb-0'>
                    <li className='text-xl font-semibold mb-4'>Menu</li>
                    <li className='text-base font-light'><Link href="/">Home</Link></li>
                    <li className='text-base font-light'>
                        <Link href="/recipes" >Recipes </Link>
                        </li>
                    <li className='text-base font-light'><Link href="/about_us">About us</Link></li>
                </ul>
               
                <ul className='font-inter mb-5 lg:mb-0'>
                    <li className='text-xl font-semibold mb-4'>Socials</li>
                    <li className='text-base font-light'><Link href="https://www.instagram.com/nourishbox.co/">Instagram</Link></li>
                    <li className='text-base font-light'><Link href="https://x.com/">Twitter</Link></li>
                    <li className='text-base font-light'> <Link href="https://paystack.shop/nourish-box">PayStack</Link></li>
                   
                </ul>
                <div className='hidden lg:block relative w-[12%]'>
                    <Image src={Eggplant} alt='egg plant' className='absolute top-0 left-0 animate-pulse' width={35} height={35} />

                    <Image src={Salad} alt='salad' className='absolute bottom-0 right-0 animate-bounce' width={60} height={60} />
                </div>
                <div className='flex flex-col justify-end font-inter'>
                    <div className='lg:flex lg:my-7 items-center'>
                        <h3 className='font-inter font-semibold text-xl my-3 text-center'>Sign up to our Newsletter</h3>
                        <Image src={FriedEggs} width={35} height={35} className='mx-4 hidden lg:block animate-bounce ' alt="" />
                    </div>
                    <div className="flex flex-col lg:flex-row items-center">
                        <input type="email" placeholder="Enter your email" className=' border-black mr-2 p-2 rounded-lg border-[0.5px]' />
                        <button className='bg-brand-btn_orange rounded-lg  px-4  text-white py-2'>Subscribe</button></div>
                </div>
            </div>
        </div>
    )
}

export default footer