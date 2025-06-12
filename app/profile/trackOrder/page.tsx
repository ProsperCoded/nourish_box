'use client'
import React from 'react'
import ReturnButton from '@/app/components/return_button';
import phone_icon from '../../assets/icons8-phone-60.png';
import Image from 'next/image';

const page = () => {
   
  return (
      <div className='p-4'>
          <ReturnButton/>
          <div className='flex flex-col'>
              <div className="map h-[70vh] border-2 border-red-400">
                map
              </div>
              <div className="info border-2 border-red-400">
                  <div className="flex my-5 justify-between items-center status">
                      <div>
                          <p>In process</p>
                          <p>Recipe name</p>
                      </div>
                      <div className="flex items-center mx-3 ">
                          <button className="bg-orange-500 rounded-2xl text-white py-2 px-3 mx-4">Order details</button>
                          <button className="bg-orange-50 rounded-full text-white py-3 px-4"><Image src={phone_icon} alt='phone' width={ 30} height={30} /></button>
                      </div>
                  </div>
                  <div>
                      address
                      
                      delivery time
                  </div>
              </div>
          </div>,</div>
  )
}

export default page