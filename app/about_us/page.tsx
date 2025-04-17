import React from 'react'
import Nav from "../components/nav";
// import Link from 'next/link';
import target from "../assets/icons8-target-100.png";
// import chef from "../assets/icons8-chef-hat-100.png";
import vision from '../assets/icons8-vision-100.png'
import banner from "../assets/nourish_box_folder/DPs and Banners/Twitter header - 1.png";
import Image from 'next/image';
import icon from "../assets/nourish_box_folder/Logo files/icon.svg";
const page = () => {
    return (
        <div>
            <Nav />
            <div className='flex items-center  my-20'>
                <div className='w-2/4 flex justify-center '> <Image src={icon} alt='nourish box icon' width={300} height={300} /></div>
                <div className="flex w-3/4 flex-col  mr-10">
                    <h1 className="text-5xl font-bold font-custom  mt-10">About Us</h1>
                    <p className=" pt-[37px] font-sans font-extralight text-lg text-brand-sub_gray mb-4">
                        Welcome to Nourish Box, your go-to destination for delicious and nutritious meal kits! We are passionate about making healthy eating easy and enjoyable for everyone. Our meal kits are carefully curated with fresh ingredients and simple recipes, allowing you to create wholesome meals in no time.
                    </p>
                    <p className="pt-[10px] font-sans font-extralight text-lg text-brand-sub_gray mb-4">
                        At Nourish Box, we believe that cooking should be a fun and rewarding experience. That`&rbrace;`s why we`&rbrace;`ve designed our meal kits to be user-friendly, with step-by-step instructions that guide you through the cooking process. Whether you`&rbrace;`re a seasoned chef or a beginner in the kitchen, our meal kits are perfect for all skill levels.
                    </p>


                </div>
            </div>
            <div className="relative w-full  h-[100px] overflow-hidden my-16">
                {/* Background Image */}
                <Image
                    src={banner}
                    alt="Background"
                    fill
                    className="object-cover bg-repeat-x object-left" // Ensures it aligns horizontally
                    quality={100}
                />

            </div>
            <div className='flex justify-center w-full '>
                <div className=' text-center w-1/2 flex flex-col items-center justify-center '>
                    <Image src={target} alt='target icon' width={50} height={50} />
                    <h1 className="text-3xl text-[#004C30] font-bold font-custom  mt-10">Our Mission</h1>
                    <p className='font-sans font-extralight text-lg text-brand-sub_gray mb-4 '>To make home cooking effort less by
                        delivering quality ingredients and step-
                        by-step guidance, ensuring that every
                        meal is fresh, delicious, and stress-free.</p>
                </div>
                <div className='text-center w-1/3 flex flex-col items-center justify-center'>
                    <Image src={vision} alt=' vison icon'  width={50} height={50} />
                    <h1 className="text-3xl font-bold font-custom text-[#004C30]  mt-10">Our Vision</h1>
                    <p className='font-sans font-extralight text-lg text-brand-sub_gray mb-4'>To be the go-to meal kit brand for busy people
                        worldwide, providing a seamless, enjoyable
                        cooking experience through fresh ingredients,
                        easy recipes, and unmatched convenience.</p>
                </div>
            </div>
        </div>
    )
}

export default page