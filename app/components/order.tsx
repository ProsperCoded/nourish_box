import Link from 'next/link'
import React from 'react'

const order = () => {
   
  return (
      <div>
          <h2 className='text-2xl font-custom'>Order History</h2>
          <div className='flex flex-col justify-center items-center h-[600px]'>
              <p className='font-normal font-inter'>Place an order to get your history here</p>
              <Link href="/recipes" className='my-5 bg-orange-400 py-1 text-white px-10 rounded-md'>+</Link>
        </div>
       
    </div>
  )
}

export default order