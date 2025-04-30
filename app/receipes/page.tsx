'use client'
import React, { useState } from 'react'
import Image, { StaticImageData } from 'next/image'
import logo from '../assets/nourish_box_folder/Logo files/Logomark.svg';
import icon from '../assets/nourish_box_folder/Logo files/icon.svg';
import search from '../assets/icons8-search-48.png'
import prawnfriedrice from '../assets/praw fried rice.webp'
import turkeyfriedrice from '../assets/realturkeyfriedrice.webp'
import plantainporridge from '../assets/shrimpand plantain porridge.webp'
import RecipeCard from '../components/recipe';
// import user from '../assets/icons8-user-48.png'
// import chickenteriyaki from './assets/chicken teriyaki.webp'
import gizdodo from '../assets/gizdodo.webp';
import Link from 'next/link';
type Recipe = {
    id: string;
    name: string;
    image: string | StaticImageData;
    link: string;
    time: string;
    servings: string;
    difficulty: string;
    description: string
}
const recipeCards: Recipe[] = [
    {
        id: '1',
        name: "Prawn fried rice",
        image: prawnfriedrice,
        time: "10 Mins",
        servings: "2 Serving",
        difficulty: "Easy",
        link: 'https://paystack.shop/nourish-box?product=prawn-fried-rice-meal-kit-qgplsu',
        description: 'null'
    },
    {
        id: '2',
        name: 'Turkey fried rice',
        image: turkeyfriedrice,
        time: "25 Mins",
        servings: "2 Serving",
        difficulty: "Medium",
        link: "https://paystack.shop/nourish-box?product=turkey-fried-rice-meal-kit-xtehel",
        description: 'null'
    },
    {
        id: '3',
        name: "Shrimp and plaintain pottage",
        image: plantainporridge,
        time: "10 Mins",
        servings: "2 Serving",
        difficulty: "Easy",
        link: "https://paystack.shop/nourish-box?product=shrimp-and-plantain-porridge-meal-kit-oirbiq",
        description: 'null'
    },
    {
        id: '4',
        name: 'Gizdodo',
        image: gizdodo,
        time: "25 Mins",
        servings: "2 Serving",
        difficulty: "Medium",
        link: "https://paystack.shop/nourish-box?product=gizdodo-xyoogt",
        description: 'null'
    },
    {
        id: '5',
        name: "Prawn fried rice",
        image: prawnfriedrice,
        time: "30 Mins",
        servings: "1 Serving",
        difficulty: "Easy",
        link: "https://paystack.shop/nourish-box?product=prawn-fried-rice-meal-kit-qgplsu",
        description: 'null'
    },
    {
        id: '6',
        name: 'Turkey fried rice',
        image: turkeyfriedrice,
        time: "25 Mins",
        servings: "2 Serving",
        difficulty: "Medium",
        link: "https://paystack.shop/nourish-box?product=turkey-fried-rice-meal-kit-xtehel",
        description: 'null'

    },
    {
        id: '7',
        name: "Shrimp and plaintain pottage",
        image: plantainporridge,
        time: "10 Mins",
        servings: "2 Serving",
        difficulty: "Easy",
        link: "https://paystack.shop/nourish-box?product=shrimp-and-plantain-porridge-meal-kit-oirbiq",
        description: 'null'
    },
    {
        id: '8',
        name: 'Gizdodo',
        image: gizdodo,
        time: "25 Mins",
        servings: "2 Serving",
        difficulty: "Medium",
        link: "https://paystack.shop/nourish-box?product=gizdodo-xyoogt",
        description: 'null'
    },
    {
        id: '9',
        name: "Prawn fried rice",
        image: prawnfriedrice,
        time: "30 Mins",
        servings: "1 Serving",
        difficulty: "Easy",
        link: "https://paystack.shop/nourish-box?product=prawn-fried-rice-meal-kit-qgplsu",
        description: 'null'
    },
    {
        id: '10',
        name: 'Turkey fried rice',
        image: turkeyfriedrice,
        time: "25 Mins",
        servings: "2 Serving",
        difficulty: "Medium",
        link: "https://paystack.shop/nourish-box?product=turkey-fried-rice-meal-kit-xtehel",
        description: 'null'
    }
];



const Page = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const searchResult = recipeCards.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
    const showSearch = searchQuery.trim() !== ''
    return (
        <div className='flex flex-col items-center'>
            <div className='flex  flex-row w-11/12  justify-between lg:px-8 py-5'>
                <Link href="/" >
                    <Image src={icon} alt='icon' className='block w-[70px]  lg:hidden' />   <Image src={logo} alt='nourish box logo' className='w-[150px] hidden lg:block' /></Link>
                <div className='flex items-center px-2 border-[1px] border-gray-400 rounded-xl justify-end sm:w-8/12 lg:w-1/4'>
                    <input type="text"
                        placeholder="Search recipes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)} className='w-full  p-1 mr-3' />

                    <Image src={search} alt='search icon' width={30} />
                </div>
            </div>

            <div className="flex justify-center">
                <div className="flex flex-col lg:flex-col items-center lg:justify-between py-4  lg:py-10  ">
                    <div className="">
                        <h2 className="font-medium font-custom text-3xl lg:text-5xl mb-[5px]">Discover, Create, Share</h2>
                        <p className="font-inter text-center text-lg lg:pb-5 font-light text-brand-sub_gray lg:text-2xl">Check out our recipes for the week</p>
                    </div>

                </div>
            </div>
            <div className="flex flex-wrap gap-6 justify-center p-6 lg:p-10 pt-0">

                {(showSearch ? searchResult : recipeCards).map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe.id} />
                ))}
            </div>

        </div>
    )
}

export default Page