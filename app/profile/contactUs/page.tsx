import React from 'react'
import ContactUs from '../../contact_us/page';
import ReturnButton from '@/app/components/return_button';
const page = () => {
  return (
      <div><ReturnButton/> <ContactUs className="md:hidden" formClassName='md:w-full' textClassName='text-2xl font-inter text-gray-700 mt-0' /></div>
  )
}

export default page