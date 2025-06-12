'use client'
import React from 'react'
import { useRouter } from 'next/navigation';
import Back from "../assets/icons8-left-arrow-50.png";
import Image from 'next/image';

const ReturnButton = () => {
    const router = useRouter();
    const goBack = () => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push('/'); // fallback if no previous page
        }
    };
    return (
        <div className='mt-4 m'>
            <div className='px-4'>
                <div className='mb-10'>
                    <button onClick={goBack} className=" transition-all">  <Image src={Back} alt="left black arrow" width={20} height={10} /></button>
                </div>
            </div></div>
    )
}

export default ReturnButton