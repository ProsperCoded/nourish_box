import React from 'react'
import Image from "next/image";
import Iphone from "../assets/iPhone.png";
const banner = () => {
    return (
        <div className='flex flex-col lg:flex-row items-center  lg:w-11/12 '>
            <div  className='lg:w-3/4  '>
                <h3 className='text-white font-inter font-medium text-xl lg:text-4xl leading-snug lg:w-[90%] text-center lg:text-start mb-8 '>Embrace the joy of cooking with  Nourish Box.<br /> Available on small and large screen sizes</h3>
                <div className='my-8 lg:my-4 flex lg:justify-start justify-center ' >
                   
                </div>
            </div>
            <div>
                <Image src={Iphone} alt='iphone' className='w-80'/>
            </div>
        </div>
    )
}

export default banner