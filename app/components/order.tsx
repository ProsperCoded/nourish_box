// import Link from 'next/link'
import Link from 'next/link'
import React from 'react'

const order = () => {
   
  return (
      <div>
          {/* <h2 className='text-2xl font-custom'>Order History</h2>
          <div className='flex flex-col justify-center items-center h-[600px]'>
              <p className='font-normal font-inter'>Place an order to get your history here</p>
              <Link href="/recipes" className='my-5 bg-orange-400 py-1 text-white px-10 rounded-md'>+</Link>
      </div> */}
      <div className='w-full hidden md:block'>
        <table className='w-full border-[1px] rounded border-slate-300  '>
          <tr className='border-[1px] '>
            <th className='text-left p-4'>Order ID</th>
            <th className='text-left'>Meal</th>
            <th className='text-left'>Delivery status</th>
            <th className='text-left'>Time of order</th>
            <th className='text-left'>Order status</th>
          </tr>
       
          <tr className='px-4 py-4'>
            <td className=' p-4'>#001</td>
            <td>Shrimp fried rice</td>
            <td>Delivered</td>
            <td>2023-10-01 12:30</td>
            <td>Completed</td>
          </tr>
          <tr>
            <td className='p-4'>#002</td>
            <td>Chicken curry</td>
            <td>Pending</td>
            <td>2023-10-02 14:20</td>
            <td>In Progress</td>
          </tr>
        </table>
      </div>
      <div className='block md:hidden'>
        <h2 className='text-2xl font-inter my-4'>Order History</h2>
        <Link href="#" className='flex justify-between border-y-[1px] border-gray-300 my-4 items-center p-4'>
          <div>
            <h3 className="font-inter text-xl font-semibold ">Turkey fried rice</h3>
            <div className="flex flex-col">
              <p className='text-lg font-medium my-1'>31-03-2025</p>
              <ul className="flex"><li className="">Rice </li>
                <li className="ml-2">Turkey</li>
                <li className="ml-2">Oil</li>
                <li className="ml-2">Seasoning cubes</li></ul>
            </div>
          </div>
          <p>#001</p>
        </Link>
        <Link href="#" className='flex justify-between border-y-[1px] border-gray-300 my-4 items-center p-4'>
          <div>
            <h3 className="font-inter text-xl font-semibold ">Turkey fried rice</h3>
            <div className="flex flex-col">
              <p className='text-lg font-medium my-1'>31-03-2025</p>
              <ul className="flex"><li className="">Rice </li>
                <li className="ml-2">Turkey</li>
                <li className="ml-2">Oil</li>
                <li className="ml-2">Seasoning cubes</li></ul>
            </div>
          </div>
          <p>#001</p>
        </Link>
       </div>
    </div>
  )
}

export default order