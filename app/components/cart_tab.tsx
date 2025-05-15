'use client '
import React, { useState } from 'react'
import dustbin from "../assets/icons8-trash-can-26.png";
import pottage from "../assets/chicken.png";
import Image from 'next/image';
import Link from 'next/link';

interface Item {
    id: number;
    food_recipe: string;
    price: number;
}
interface CartProps {
    cart: Item[];
    setCart: React.Dispatch<React.SetStateAction<Item[]>>;
}
const Cart_tab = ({ cart, setCart }: CartProps) => {
    const [count, setCount] = useState(0);


    const delete_item = (id: number) => {
        const update_cart = cart.filter((item) => item.id !== id);
        setCart(update_cart)
        console.log('hi')
    }
    return (
        <div className='h-full flex flex-col justify-between'>
            <div className="flex  flex-col items-center  justify-center">
                {cart.length === 0 ? (
                    <div className='flex flex-col justify-end items-center h-96 '>
                        <h2 className='my-6 text-xl font-inter font-semibold'>Cart is empty</h2>
                        <Link href="/recipes" className='bg-orange-500 py-2 px-4 text-white rounded-lg font-inter'>Add recipes to cart</Link>
                    </div>
                ) : (
                    cart.map((item) => (
                        <div className='border-[1px] border-solid rounded-lg py-2 relative my-2 border-gray-300 text-gray-600 w-11/12' key={item.id}>
                            <div className="flex items-center justify-between px-3 py-2" >
                                <div className=' w-3/5 flex items-center'>
                                    <div><Image src={pottage} alt='pottage' width={40} height={60} /> </div>
                                    <div className='mx-3'>
                                        <h3>{item.food_recipe}</h3>
                                        <p>Price: {item.price}</p>
                                    </div>
                                </div>
                                <div className='flex  items-center '>
                                    <div className="  rounded-xl border-[1px] border-gray-400 flex p-1 w-[100px] my-2 text-gray-500 justify-center mr-2">
                                        <button className="mr-4" onClick={() => setCount(count - 1)}>-</button>
                                        <p className="font-inter text-center">{count}</p>
                                        <button className="ml-4" onClick={() => setCount(count + 1)}>+</button>
                                    </div>
                                    <button onClick={() => delete_item(item.id)} > <Image src={dustbin} alt="trash can" width={15} height={15} /></button>
                                </div>
                            </div>
                        </div>
                    ))


                )
                }

            </div>
            {cart.length > 0 && (
                <div className='flex items-center justify-end h-96'>
                    <div className='w-full flex justify-between px-5'>
                        <button className='w-[200px] px-5 py-2 rounded-md bg-gray-400 text-white' onClick={() => setCart([])
                        }>Clear cart</button>
                        <button className='w-[200px] px-5 py-2 rounded-md bg-orange-400 text-white'>Checkout</button>
                    </div>
                </div>
          )}
        </div>
    )
}

export default Cart_tab