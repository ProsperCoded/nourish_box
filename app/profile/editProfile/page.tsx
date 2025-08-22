'use client'

import React from 'react'
import User_profile from "../../components/user_profile";
import ReturnButton from '@/app/components/return_button';

const page = () => {

  return (
      <div className=' mt-4'>
          <ReturnButton/>
          <User_profile />
    </div>
  )
}

export default page
