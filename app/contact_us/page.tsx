'use client'
import Image from 'next/image'
import React, { useState } from 'react'
import Logo from "../assets/nourish_box_folder/Logo files/icon.svg";
import Cancel from "../assets/icons8-cancel-64.png";
import Link from 'next/link';
interface Props {
    className?: string;
    formClassName?: string;
    textClassName?: string
}
const ContactUs: React.FC<Props> = ({  className, formClassName,textClassName}) => {
    const [isActive, setIsActive] = useState<number[]>([]);
    const toggleFAQ = (index: number) => {
        setIsActive((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };
   

    const faqs = [
        {
            question: 'What is your return policy?',
            answer: 'We accept returns within 14 days of purchase, provided the item is unused and in original packaging.',
        },
        {
            question: 'Do you offer international shipping?',
            answer: 'Yes, we ship to many countries worldwide. Shipping fees and times vary by destination.',
        },
        {
            question: 'How can I track my order?',
            answer: 'Once your order ships, you’ll receive a tracking link via email.',
        },
        {
            question: 'What payment methods do you accept?',
            answer: 'We accept Visa, MasterCard, PayPal, and Apple Pay.',
        },
        {
            question: 'Can I change or cancel my order?',
            answer: 'Please contact us within 24 hours to change or cancel your order.',
        },
    ];

  return (
      <div>

       
          <div>
                  <div className='flex md:flex-row justify-between items-center h-[90vh] w-full'>
                      <div className={`w-1/2 hidden  md:flex justify-center ${className ?? ""}`}>
                      <Link href="/">   <Image src={Logo} alt='logo' width={500} height={500} /></Link>
                      </div>
                  <div className={`flex  flex-col w-full md:w-1/2 ${formClassName ?? ""}`}>
                          <div className='flex justify-end mx-6'>
                          <Link href="/"> <Image src={Cancel} alt='cancel' width={35} height={35} className={`${className ?? ""}`} />
                              </Link>
                          </div>
                          <h1 className={`text-3xl font-custom my-3 px-6 {${textClassName ?? ""}`}>
                              Contact us
                          </h1>
                          <form action="" className='flex font-inter flex-col p-6 w-full flex-wrap'>
                              <div className="flex w-full">
                                  <div className='flex flex-col w-1/2 mr-2'>
                                      <label htmlFor="name" className='text-lg font-light'>First Name:</label>
                                      <input type="text" id="name" name="name" required className='border-[1px] border-gray-500 rounded-md p-4 my-2 mb-4' />
                                  </div>
                                  <div className='flex flex-col w-1/2'>
                                      <label htmlFor="name" className='text-lg font-light'>Last name:</label>

                                      <input type="text" id="name" name="name" required className='border-[1px] border-gray-500 rounded-md p-4 my-2 mb-4' />
                                  </div>

                              </div>


                              <label htmlFor="email" className='text-lg font-light'>Email:</label>
                              <input type="email" id="email" name="email" placeholder='example@email.com' required className='border-[1px] border-gray-500 rounded-md p-4 my-2 mb-4' />

                              <label htmlFor="number" className='text-lg font-light'>Phone number:</label>
                              <input type="tel" placeholder=
                                  "08012345678" id="number" name="number" required className='border-[1px] border-gray-500 rounded-md p-4 my-2 mb-4' />
                              <label htmlFor="message" className='text-lg font-light'>Message:</label>
                              <textarea id="message" className='border-[1px] border-gray-500 rounded-md my-2 mb-4' name="message" rows={4} required></textarea >
                              <div className='flex justify-center'>

                                  <button type="submit" className='my-2 bg-orange-500 rounded-lg py-3 w-4/12 text-white'>Submit</button>
                              </div>
                          </form>
                      </div>
                  </div>
                  
              </div>
          <div className='flex flex-col items-center w-full my-5'>
              <h2 className='my-4 font-custom text-4xl'>FAQs</h2>
              <div className="flex flex-col w-full md:w-10/12 justify-center mx-4 ">
                  {faqs.map((faq, index) => (
                      <div
                          key={index}
                          className="border border-gray-300 rounded p-4 m-2 shadow-sm font-inter"
                      >
                          <button
                              onClick={() => toggleFAQ(index)}
                              className="w-full text-left font-medium flex justify-between items-center"
                          >
                              {faq.question}
                              <span className="text-xl">
                                  {isActive.includes(index) ? '−' : '+'}
                              </span>
                          </button>
                          {isActive.includes(index) && (
                              <div className="mt-2 text-gray-700">{faq.answer}</div>
                          )}
                      </div>
                  ))}
              </div>
          </div>

     </div>
  )
}

export default ContactUs