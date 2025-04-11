import React from 'react'
import Image from "next/image";
import Iphone from "../assets/iPhone.png";
import google_store from '../assets/google_play.png';
import app_store from '../assets/app_store.png';
const banner = () => {
    return (
        <div className='flex flex-col lg:flex-row items-center  lg:w-11/12 '>
            <div  className='lg:w-3/4  '>
                <h3 className='text-white font-inter font-medium text-xl lg:text-4xl leading-snug lg:w-[90%] text-center mb-8 '>Embrace the joy of cooking with get it on your iPhone or Android Your kitchen adventure begins now!</h3>
                <div className='my-8 lg:my-4 flex justify-center' >
                    <button ><Image src={app_store} alt='app store button' width={100} className='mr-4' /></button><button ><Image src={google_store} alt='app store button' width={100} className='mr-4' /></button>
                </div>
            </div>
            <div>
                <Image src={Iphone} alt='iphone' className='w-80'/>
            </div>
        </div>
    )
}

export default banner