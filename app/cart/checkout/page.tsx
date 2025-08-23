'use client';

import Link from 'next/link';
import React from 'react';

export default function CheckoutPage() {
  return (
    <div className=" flex font-inter flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-7xl my-4 space-y-4">
        <div className="flex justify-between">
          <h3 className='text-4xl font-custom'>Check out</h3>
          <ul className='text-gray-500 flex justify-between w-1/5 font-medium font-inter'>
            <Link href="/cart">Cart</Link>
            <li className='text-orange-500 font-custom text-center font-semibold'>Checkout</li>
            <li>Payment</li>
          </ul>
        </div>
        <div className="flex flex-col md:flex-row gap-6 font-inter">
          {/* Delivery Info */}
          <div className="flex-1 border border-grey-600 p-4 ">
            <h2 className="font-bold my-4">Delivery Information</h2>
            <label className='my-4'>Your name</label>
            <input type="text" placeholder="Recipent's name" className="w-full p-2 border my-2 border-grey-600 rounded-lg" required />
            <label className='my-4'>Your phone number</label>
            <input type="text" placeholder="A reachable phone number" className="w-full p-2 my-2 border border-grey-600 rounded-lg" required />
            <label className='my-4'>Delivery address</label>
            <input type="text" placeholder="Delivery address" className="w-full mt-2 mb-4 p-2 border border-grey-600 rounded-lg" required />

            <p className='my-4 text-orange-500 font-medium
                         text-sm'>To skip the hassle of filling in your delivery details on every checkout</p>
            <div className="flex justify-center text-center ">
              <Link href="/sign_up" className="rounded-lg w-1/3 border border-grey-600 bg-[#004C30] text-white px-4 py-2 " >
                Sign up
              </Link>
            </div>
          </div>

          {/* Order Details */}
          <div className="flex-1 border border-grey-600 p-4 space-y-4">
            <h2 className="font-bold">Order Details</h2>
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center justify-between border border-grey-600 p-2">
                <div className="w-10 h-10 bg-[#004C30]" />
                <span>Fried reice</span>
                <span>2,000</span>
              </div>
            ))}
            <div className="flex justify-between font-bold mt-4">
              <span>Total:</span>
              <span>....</span>
            </div>
          </div>
        </div>

        <div className='flex justify-center items-center'>
          <button className="w-1/3 py-3  my-8 rounded-lg bg-orange-500 text-white">
            Pay now
          </button>
        </div>
      </div>
    </div>
  );
}
