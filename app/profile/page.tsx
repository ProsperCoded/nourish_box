'use client'
import Image, { StaticImageData } from 'next/image';
import React, { useState } from 'react';
import user_icon from "../assets/icons8-user-48.png";
import bookmark from '../assets/icons8-bookmark-48.png';
import clock from "../assets/icons8-clock-48.png";
import User_profile from '../components/user_profile';
import Order from '../components/order';
import { useRouter } from 'next/navigation';
import return_btn from '../assets/icons8-left-arrow-50.png';
import { motion, AnimatePresence } from 'framer-motion';

type SidebarItem = {
    id: string;
    title: string;
    content: React.ReactNode;
    img: StaticImageData
};
const SidebarLink: SidebarItem[] = [
    { id: '1', title: 'Personal Info', content: <User_profile />, img: user_icon },
    { id: '2', title: 'Order History', content: <Order/>, img: clock },
    { id: '3', title: 'Saved Recipes', content: <div>📘 Let’s study Environmental Law together!</div>, img: bookmark },
];
const Profile = () => {
    const router = useRouter();
    const [activeElement, setActiveElement] = useState<string>(SidebarLink[0].id);
    const sideBarElement = SidebarLink.find(item => item.id === activeElement);
    return (
        <div>
            <div className='py-10 px-5'>
                <button onClick={() => router.back()}><Image src={return_btn} alt="return" width={25} height={25}/></button>
            </div>
            <div className='flex justify-between'>

                <div className='w-1/4 h-screen flex border-r-[1px] border-solid border-gray-200  upload ml-6'>
                    <div className='flex flex-col font-inter text-gray-700 '>
                        <div>
                            <div className='my-3'>
                                <Image src={user_icon} alt='user icon' width={40} height={40} className='border-[1px] border-gray-700 border-soldi rounded-full p-2 ' />
                            </div>
                            <h2 className='text-xl font-inter font-light mb-5'>Hi, Username! </h2>
                        </div>
                        {
                            SidebarLink.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveElement(item.id)}
                                    className={`my-4 text-lg flex  items-center font-medium ${activeElement === item.id ? 'text-blue-500' : 'text-gray-700'
                                        }`}
                                >
                                    <Image src={item.img} alt='icon8 img' width={20} height={20}  />  <p className='ml-3'>{item.title}</p>
                                </button>
                            ))
                        }

                    </div>



                </div>
                <div className='w-3/4 flex flex-col mx-5'>
                 

                   
                    <div>

                        <div>{sideBarElement?.content}</div>
                    </div>


                </div>
                <div className='w-3/4 relative overflow-hidden'>
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={activeElement}
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className='absolute w-full'
                        >
                            {sideBarElement?.content}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>

    )
}

export default Profile