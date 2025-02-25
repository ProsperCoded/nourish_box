import React from 'react'
import Image from "next/image";
import Iphone from "../assets/iPhone.png";
const banner = () => {
    return (
        <div className='flex items-center  w-11/12 '>
            <div  className='w-3/4 '>
                <h3 className='text-white text-4xl leading-snug w-[90%] mb-8 '>Embrace the joy of cooking with get it on your iPhone or Android Your kitchen adventure begins now!</h3>
                <div className='my-4' >
                    <button className='bg-brand-btn_orange text-white text-xs px-3 py-2 mr-4 rounded'>Download from <br/>Apple Store</button><button className='bg-brand-btn_orange text-white text-xs  px-3 py-2 rounded'>Download from <br/>Play Store</button>
                </div>
            </div>
            <div>
                <Image src={Iphone} alt='iphone'/>
            </div>
        </div>
    )
}

export default banner