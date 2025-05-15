import React from 'react'

const user_profile = () => {
    return (
        <form action="">
            <div >
                <h2 className='text-2xl font-custom font-light text-gray-700 '>Personal Information</h2>
                <div className='flex items-center my-4 border-t-[1px] border-gray'>
                    
                    <div className='flex flex-col w-1/2 m-2' >
                        <label className='my-2 text-gray-700 mb-2 font-inter font-medium'>First name</label>
                        <input type="text"  className='rounded-full p-4  border-[1px] border-solid border-gray-500'/>
                    </div>
                    <div className='flex flex-col w-1/2 m-2'>
                        <label className='mb-2 font-inter font-medium my-2 capitalize text-gray-700'>Last name</label>
                        <input type="text" className='rounded-full p-4 border-[1px] border-solid border-gray-500 ' />
                    </div>
                </div>
                <div className='flex items-center my-4 '>
                    <div className='flex flex-col w-1/2 m-2 '>
                        <label className='mb-2 font-inter font-medium my-2 text-gray-700'>Email</label>
                        <input type="email" className=' w-full  rounded-full p-4 border-[1px] border-solid border-gray-500' />
                    </div>
                    <div className='flex flex-col w-1/2 m-2'>
                        <label className='mb-2 first-line:font-inter font-medium my-2 capitalize text-gray-700'>Phone number</label>
                        <input type="number" className='rounded-full p-4 border-[1px] border-solid border-gray-500' />
                    </div>
                </div>
                <div className='flex items-center my-4 '>
                    <div className='flex flex-col w-full m-2'>
                        <label className='mb-2 font-inter font-medium  text-gray-700 '   >Address</label>
                        <input type="text" className='w-full rounded-full p-4 border-[1px] border-solid border-gray-500 ' />
                    </div>
                    
                </div>
                <div className='flex flex-col'>

                    <input type="submit" />
                </div>
               
               </div>
        </form>
    )
}

export default user_profile