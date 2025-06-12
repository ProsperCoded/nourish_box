'use client'
import React from 'react'
import Order from '../../components/order';
import ReturnButton from '@/app/components/return_button';

const page = () => {
   
  return (
      <div className='p-4'>
          <ReturnButton/>
          <Order />
      </div>
  )
}
export default page