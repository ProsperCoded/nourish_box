'use client'
import Image, { StaticImageData } from 'next/image';
import React, { useState } from 'react';
import user_icon from "../assets/icons8-user-48.png";
import bookmark from '../assets/icons8-bookmark-48.png';
import clock from "../assets/icons8-clock-48.png";
import User_profile from '../components/user_profile';
import Order from '../components/order';
import { useRouter} from 'next/navigation';
import return_btn from '../assets/icons8-left-arrow-50.png';
import FavoritesPage from '../favorites/page';
import ContactUs from '../contact_us/page';
import AlternateHeader from '../components/alternate_header';
import Link from 'next/link';
 
type SidebarItem = {
    id: string;
    title: string;
    content: React.ReactNode;
    img: StaticImageData
};

const Profile = () => {
    const router = useRouter();
    const SidebarLink: SidebarItem[] = [
        { id: '1', title: 'Edit profile', content: <User_profile />, img: user_icon },
        { id: '2', title: 'Order History', content: <Order />, img: clock },
        { id: '3', title: 'Saved Recipes', content: <div><FavoritesPage className='md:hidden border-2 border-red-500'/></div>, img: bookmark },
        { id: '4', title: 'Contact us', content: <ContactUs className="md:hidden " formClassName='md:w-full' textClassName='text-2xl font-inter text-gray-700 mt-0' />, img: clock },
        { id: '4', title: 'Track delivery', content: '', img: clock },
        { id: '4', title: 'Manage address', content: '', img: clock },
    ];
    const [activeElement, setActiveElement] = useState<string>(SidebarLink[0].id);
    const sideBarElement = SidebarLink.find(item => item.id === activeElement);
    return (
        <div>
            <div className='hidden md:block py-5'>
                <AlternateHeader searchQuery='' setSearchQuery={null} />
            </div>
            <div className='block md:hidden my-5 md:py-10 px-5'>
                
                <button onClick={() => router.back()}><Image src={return_btn} alt="return" width={25} height={25}/></button>
            </div>
            <div className='flex justify-between'>

                <div className='w-full md:w-1/5 h-screen md:flex border-r-[1px] border-solid border-gray-200  upload md:ml-6'>
                    <div className='flex flex-col w-full font-inter text-gray-700 '>
                        <div className='my-5 md:mt-10 mb-5 '>
                            
                            <h2 className='text-xl text-center md:text-left w-full font-inter font-medium md:mt-2 '>Hi, Username! </h2>
                         
                        </div>
                        <div>
                            <div className='hidden md:block'>
                                {
                                    SidebarLink.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveElement(item.id)}
                                            className={`my-7 md:my-4 text-lg flex   items-center ${activeElement === item.id ? 'text-orange-500' : 'text-gray-700'
                                                }`}
                                        >
                                            <Image src={item.img} alt='icon8 img' width={20} height={20} />  <p className='ml-3'>{item.title}</p>
                                        </button>
                                    ))
                                }
                            </div>
                            <div className='block md:hidden'>
                                {
                                    SidebarLink.map((item) => (
                                        <div key={item.id} className='flex justify-between px-4 items-center'>
                                            <button
                                                className={`my-7 md:my-4 text-lg flex   items-center ${activeElement === item.id ? 'text-orange-500' : 'text-gray-700'
                                                    }`}
                                            >
                                                <Image src={item.img} alt='icon8 img' width={20} height={20} />  <p className='ml-3'>{item.title}</p>
                                            </button>
                                            >
                                       </div>
                                    ))
                                }
                          </div>
                        </div>

                    </div>



                </div>
                <div className='hidden md:w-3/4 md:flex flex-col'>
                 
                    <div className='my-4'>
                       
                    </div>
                   
                    <div className='  m-5'>

                        <div>{sideBarElement?.content}</div>
                    </div>


                </div>
            </div>
        </div>

    )
}

export default Profile