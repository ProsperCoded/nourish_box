import React from "react";
import Image from "next/image";
import user from "../assets/icons8-user-48.png";
import Logo from "../assets/nourish_box_folder/Logo files/Logomark.svg";
import Link from "next/link";
const nav = () => {
  return (
    <div>
      <div className="lg:hidden flex justify-between items-center p-6">
        <Image src={Logo} alt="Logo" className="w-[150px]" />
        <button>=</button>
      </div>
      <div className="flex justify-center">
        <div className="hidden lg:flex justify-between items-center p-10 pb-0 md:w-100 lg:w-11/12 font-inter text-black">
          <Image src={Logo} alt="Logo" className="w-[150px]" />
          <ul className="flex py-0 w-1/2 font-inter">
            <Link href="/" className="px-4 font-medium text-xl">
              Home
            </Link>
            <Link href="/recipes" className="px-4 font-medium text-xl">
              Recipe{" "}
            </Link>
            <Link href="/about_us" className="px-4 font-medium text-xl">
              About us
            </Link>
            <Link href="/" className="px-4 font-medium text-xl">
              Community
            </Link>
          </ul>
          <div className="flex justify-end items-center w-1/12">
            <Image src={user} alt="user icon" width={30} height={30.11} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default nav;
