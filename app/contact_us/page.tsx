'use client'

import Image from 'next/image'
import React, { useState } from 'react'
import Logo from "../assets/nourish_box_folder/Logo files/icon.svg"
import Cancel from "../assets/icons8-cancel-64.png"
import Link from 'next/link'

interface Props {
    className?: string
    formClassName?: string
    textClassName?: string
    showIcons?: boolean
}

const ContactUs: React.FC<Props> = ({ className, formClassName, textClassName, showIcons = true }) => {
    const [isActive, setIsActive] = useState<number[]>([])
    const formWidth = showIcons ? 'md:w-1/2 md:p-10' : 'w-full bg-gray-50 p-16'

    const toggleFAQ = (index: number) => {
        setIsActive(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        )
    }

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
    ]

    return (
        <div className="w-full bg-white">
            {/* Contact Section */}
            <div className="flex flex-col-reverse md:flex-row justify-between items-center min-h-screen px-6  py-10 gap-10">

                {showIcons && (
                    <div className="w-full md:w-1/2 hidden md:flex justify-center">
                        <Link href="/">
                            <Image src={Logo} alt="logo" width={500} height={500} />
                        </Link>
                    </div>
                )}

                {/* Right Side (Form) */}
                <div className={`w-full  ${formWidth} ${formClassName ?? ''} ${formClassName ?? ''}`}>
                    {showIcons && (
                        <div className="flex justify-end mb-4">
                            <Link href="/">
                                <Image src={Cancel} alt="cancel" width={35} height={35} />
                            </Link>
                        </div>
                    )}

                    <h1 className={`text-3xl md:text-4xl font-semibold mb-6 font-custom ${textClassName ?? ''}`}>
                        Contact Us
                    </h1>

                    <form className="font-inter space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="w-full sm:w-1/2">
                                <label htmlFor="first-name" className="text-lg font-light">First Name</label>
                                <input
                                    type="text"
                                    id="first-name"
                                    name="first-name"
                                    required
                                    className="w-full border border-gray-400 rounded-md p-3 mt-1"
                                />
                            </div>

                            <div className="w-full sm:w-1/2">
                                <label htmlFor="last-name" className="text-lg font-light">Last Name</label>
                                <input
                                    type="text"
                                    id="last-name"
                                    name="last-name"
                                    required
                                    className="w-full border border-gray-400 rounded-md p-3 mt-1"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="text-lg font-light">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                placeholder="example@email.com"
                                className="w-full border border-gray-400 rounded-md p-3 mt-1"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="text-lg font-light">Phone Number</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                placeholder="08012345678"
                                required
                                className="w-full border border-gray-400 rounded-md p-3 mt-1"
                            />
                        </div>

                        <div>
                            <label htmlFor="message" className="text-lg font-light">Message</label>
                            <textarea
                                id="message"
                                name="message"
                                rows={4}
                                required
                                className="w-full border border-gray-400 rounded-md p-3 mt-1"
                            ></textarea>
                        </div>

                        <div className="flex justify-center">
                            <button type="submit" className="bg-orange-500 text-white py-3 px-8 rounded-lg mt-2 hover:bg-orange-600 transition">
                                Submit
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="w-full flex flex-col items-center px-4 md:px-10 py-10">
                <h2 className="text-3xl md:text-4xl font-custom mb-6">FAQs</h2>
                <div className="w-full md:w-10/12">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border border-gray-300 rounded-lg p-4 mb-4 shadow-sm">
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full text-left font-medium flex justify-between items-center"
                            >
                                <span>{faq.question}</span>
                                <span className="text-xl">{isActive.includes(index) ? '−' : '+'}</span>
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
