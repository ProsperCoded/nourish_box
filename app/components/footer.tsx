import React from 'react'
import Image from "next/image";
import Eggplant from '../assets/Eggplant.png'
import Salad from '../assets/Salad.png';
import FriedEggs from '../assets/Fried Eggs.png';
import logo from '../assets/nourish_box_folder/Logo files/Logomark.svg';
const footer = () => {
    return (
        <div className='flex flex-col items-center  lg:mx-16 mt-16 mb-32 px-3  '>
            <Image src={logo} alt='logo' width={150} className='my-5 mb-12' />
            <div className='flex flex-col items-center lg:flex-row lg:justify-between text-center '>
                <ul className='font-inter mb-5 lg:mb-0'>
                    <li className='text-xl font-semibold mb-4'>Menu</li>
                    <li className='text-base font-light'>Home</li>
                    <li className='text-base font-light'>Recipe</li>
                    <li className='text-base font-light'>Community</li>
                    <li className='text-base font-light'>About Us</li>
                </ul>
                <ul className='font-inter mb-5 lg:mb-0'>
                    <li className='text-xl font-semibold mb-4'>Categories</li>
                    <li className='text-base font-light'>Breakfast</li>
                    <li className='text-base font-light'>Lunch</li>
                    <li className='text-base font-light'>Dessert</li>
                    <li className='text-base font-light'>Dinner</li>
                </ul>
                <ul className='font-inter mb-5 lg:mb-0'>
                    <li className='text-xl font-semibold mb-4'>Socials</li>
                    <li className='text-base font-light'>Instagram</li>
                    <li className='text-base font-light'>Twitter</li>
                    <li className='text-base font-light'>Youtube</li>
                    <li className='text-base font-light'>Facebook</li>
                </ul>
                <div className='hidden lg:block relative w-[12%]'>
                    <Image src={Eggplant} alt='egg plant' className='absolute top-0 left-0' width={35} height={35} />

                    <Image src={Salad} alt='salad' className='absolute bottom-0 right-0' width={60} height={60} />
                </div>
                <div className='flex flex-col justify-end font-inter'>
                    <div className='lg:flex lg:my-7 items-center'>
                        <h3 className='font-inter font-semibold text-xl my-3 text-center'>Sign up to our Newsletter</h3>
                        <Image src={FriedEggs} width={35} height={35} className='mx-4 hidden lg:block' alt="" />
                    </div>
                    <div className="flex flex-col items-center">
                        <input type="email" placeholder="Enter your email" className=' border-black m-2 p-2 rounded-lg border-[0.5px]' />
                        <button className='bg-brand-btn_orange rounded-lg mt-3  px-4  text-white py-2'>Subscribe</button></div>
                </div>
            </div>
        </div>
    )
}

export default footer