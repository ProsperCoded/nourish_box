import React from 'react'
import Image from "next/image";
import Eggplant from '../assets/Eggplant.png'
import Salad from '../assets/Salad.png';
import FriedEggs from '../assets/Fried Eggs.png';
const footer = () => {
  return (
      <div className='mx-16 mt-16 mb-32 px-3  '>
          <h1 className='py-7 text-brand-logo_green font-semibold'>Nourish box</h1>
          <div className='flex  justify-between '>
              <ul>
              <li className='text-xl font-semibold mb-4'>Menu</li>
              <li className='text-base font-light'>Home</li>
              <li className='text-base font-light'>Recipe</li>
              <li className='text-base font-light'>Community</li>
              <li className='text-base font-light'>About Us</li>
              </ul>
              <ul>
              <li className='text-xl font-semibold mb-4'>Categories</li>
              <li className='text-base font-light'>Breakfast</li>
              <li className='text-base font-light'>Lunch</li>
              <li className='text-base font-light'>Dessert</li>
              <li className='text-base font-light'>Dinner</li>
              </ul>
              <ul>
              <li className='text-xl font-semibold mb-4'>Socials</li>
              <li className='text-base font-light'>Instagram</li>
              <li className='text-base font-light'>Twitter</li>
              <li className='text-base font-light'>Youtube</li>
              <li className='text-base font-light'>Facebook</li>
              </ul>
              <div className='relative w-[12%]'>
                  <Image src={Eggplant} alt='egg plant' className='absolute top-0 left-0' width={35} height={35} />
                  
                  <Image src={Salad} alt='salad' className='absolute bottom-0 right-0' width={60} height={60} />
              </div>
              <div className='flex flex-col justify-end'>
                  <div className='flex my-7 items-center'>
                      <h3>Sign up for our Newletter</h3>
                      <Image src={FriedEggs } width={35} height={35} className='mx-4' alt=""/>
                  </div>
                  <div className="flex "><input type="email" placeholder="Enter your email" className='border-none border-b-black border-[0.5px]'/>
                      <button className='bg-brand-btn_orange rounded-lg py-2 px-3 text-white'>Subscribe</button></div>
              </div>
          </div>
    </div>
  )
}

export default footer