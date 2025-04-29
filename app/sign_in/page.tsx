"use client";

import React, { useState } from 'react'
import passwordView from "../assets/icons8-eye-48.png";
import Image from 'next/image'
import google_logo from '../assets/icons8-google-48.png'
import Link from "next/link";
import logo from '../assets/nourish_box_folder/Logo files/icon.svg';
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, provider } from "../lib/firebase";
import { FirebaseError } from 'firebase/app';

const SignUp = () => {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false)
    const [view, setView] = useState(false)
    const router = useRouter()
    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("")

        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }

        console.log("Firebase Auth Instance:", auth);
        console.log("Email:", email);
        console.log("Password:", password);


        try {
            setLoading(true)
            await new Promise((resolve) => setTimeout(resolve, 2000))
            await createUserWithEmailAndPassword(auth, email, password)
            router.push('/Overview')
        }
        catch (err: unknown) {
            console.error('Login failed', error)
            setLoading(false)
            if (err instanceof FirebaseError) {
                switch (err.code) {
                    case "auth/email-already-in-use":
                        setError("This email is already registered. Please log in.");
                        break;
                    case "auth/invalid-email":
                        setError("Invalid email format. Please enter a valid email.");
                        break;
                    case "auth/weak-password":
                        setError("Password should be at least 6 characters.");
                        break;
                    default:
                        setError("An error occurred during sign-up. Please try again.");
                }
            }

        }

    }
    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, provider)
            router.push('/Overview')
            console.log("User Info:", result.user);
        }
        catch (error) {
            console.error("Error signing in:", error);
        }
    }


    return (
        <div>
            {loading ? (
                <p>Loading...</p>
            ) :
                (
                <div className='flex w-100 justify-between'>
                    <div className='w-1/2 flex items-center justify-center bg-[#004C30]'>
                        <Image src={logo} alt='jollof rice'  width={600}/>
                    </div>
                    <div className='w-1/2'>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <div className="block md:hidden">
                        <div className='bg-brand-brand_black text-white flex justify-center py-6 font-extrabold text-3xl rounded-b-xl '>
                            <h1>W-Finance</h1>
                        </div>
                    </div>
                    <div className='flex w-full items-center justify-center bg-brand-bg_white_clr h-screen md:h-screen'>
                        {/* <div className=' hidden md:block p-2 md:w-1/3 '>
                            <Image src={Sidebar} alt='side bar' />
                        </div> */}

                        <div className='flex flex-col items-center justify-center w-100 w-10/12  '>
                            <form className="flex flex-col modal h-1/2 w-full   " onSubmit={handleSignUp}>
                                <h1 className='my-4 font-bold text-3xl text-black '>Sign Up</h1>
                                <label className=' text-sm text-brand-text_gray'>Name</label>
                                <input width='w-full' value={name} type='text' className='my-4 mt-1 text-black border-[1px] border-gray-400 rounded-md p-3' onChange={(e) => setName(e.target.value)}  placeholder='John Doe'/>
                                <label className=' text-sm text-brand-text_gray'>Email</label>
                                <input width='w-full' type='email' value={email} onChange={(e) => setEmail(e.target.value)} className='my-4 mt-1 text-black border-[1px] border-gray-400 rounded-md p-3' placeholder='example@gmail.com' />
                                <label className=' text-sm text-brand-text_gray'>Create Password</label>
                                <div className='flex items-center mb-1 mt-1 justify-between border-gray-400 border-[1px] border-solid  rounded-lg pr-4 p-3'>
                                    <input width="w-full" className='  text-black' type={view ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder='************' />
                                    <Image src={passwordView} alt="icon to view password" onClick={() => setView(!view)} width={20} height={20} />
                                </div>
                                <p className="text-xs flex justify-end text-brand-text_gray"><i className="not-italic">Password must be at least 8 characters</i></p>
                               <div className='flex my-8 justify-center'>
                               <button type='submit' className='flex bg-[#004C30] text-white py-3 px-16 rounded-xl items-center' >Sign In</button>
                               </div>
                            </form>
                           <div className='flex w-full items-center'>
                           <p className='bg-gray-400 h-[1px] w-1/2 mr-2'></p>
                            <p className='text-gray-400'>OR</p>
                            <p className='bg-gray-400 h-[1px] w-1/2 ml-2'></p>
                           </div>
                            <button type='button' className='flex bg-gray-200 text-gray-500 py-3 px-8 rounded-xl items-center' onClick={handleGoogleSignIn} > 
                                <Image src={google_logo} alt='google logo' className='mx-2' width={20} height={20}/>
                                 <p>Sign in with Google</p></button>
                            <p className='mt-4 flex justify-center items-center text-brand-text_gray'>You have an account?  <Link className="ml-1 text-brand-brand_black font-semibold" href="/login"> Log In</Link></p>
                            {error && <p>{error}</p>}
                        </div>
                    </div>
                </div>

                </div>
                )}
        </div>
    )
}

export default SignUp