"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "../assets/nourish_box_folder/Logo files/icon.svg";
import Nav from "../components/nav";
import MobileNav from "../components/mobile_nav";

const ForgotPassword = () => {
  ;
  const [email, setEmail] = useState("");


  return (
    <div className="font-inter">
      <div className="hidden md:block">
        <Nav />
      </div>
      <div className="block md:hidden">
        <MobileNav  />
      </div>

      <div className="flex w-100 justify-between">
        <div className="w-1/2  items-center justify-center hidden md:flex ">
          <Image src={logo} alt="jollof rice" width={400} />
        </div>
        <div className="w-full md:w-1/2">


          <div className="flex w-full items-center justify-center bg-brand-bg_white_clr h-full mt-20  md:h-screen">
            {/* <div className=' hidden md:block p-2 md:w-1/3 '>
                            <Image src={Sidebar} alt='side bar' />
                        </div> */}

            <div className="flex flex-col items-center justify-center w-100 w-10/12  ">
              <form
                className="flex flex-col modal h-1/2 w-full   "

              >
                <h1 className="my-4 font-bold text-3xl text-black text-center md:text-left ">
                  Forgot Password
                </h1>
                <p className=" text-gray-500 text-sm mb-3 md:text-left text-center">Fill in your account email address to send one time password</p>
                <label className=" text-sm ">Email</label>
                <input
                  width="w-full"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="my-4 mt-1 text-black border-[1px] border-gray-400 rounded-md p-3"
                  placeholder="example@gmail.com"
                />


                <div className="flex mt-8 justify-center">
                  <button
                    type="submit"
                    className="flex bg-[#004C30] text-white py-3 px-16 rounded-xl items-center"
                  >
                    Send email link
                  </button>
                </div>
              </form>

              <p className="mt-4 flex justify-center items-center text-brand-text_gray">
                You have an account?{" "}
                <Link
                  className="ml-1 text-brand-brand_black font-semibold"
                  href="/sign_up"
                >
                  Sign up
                </Link>
              </p>

            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ForgotPassword;
