"use client";

import Image from "next/image";
import logo from "../assets/nourish_box_folder/Logo files/Logomark.svg";
import icon from "../assets/nourish_box_folder/Logo files/icon.svg";
import search from "../assets/icons8-search-48.png";
import Link from "next/link";
import Heart from "../assets/icons8-heart-32.png";

const Header = ({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <div className="md:flex md:justify-center w-full">
      <div className="flex flex-row items-center justify-between w-11/12">
        <Link href="/" className="flex flex-row items-center">
          <Image src={icon} alt="icon" className="md:hidden block w-[70px]" />{" "}
          <Image
            src={logo}
            alt="nourish box logo"
            className="hidden lg:block w-[75px] md:w-[150px]"
          />
        </Link>
        <div className="flex  justify-between items-center w-1/5 ">
          <div className="flex justify-end items-center px-2 border-[1px] border-gray-400 rounded-md w-3/4 lg:w-3/4">
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mr-3 p-1 w-full"
            />

            <Image src={search} alt="search icon" width={20} height={10} />
          </div>
          <div className="flex justify-center items-center">
            <Link href="/favorites" className="text-orange-400 hover:underline">
              <Image src={Heart} alt="heart icon" width={20} height={20} />
            </Link>
          </div>
        </div>
      </div>
      <div className="flex justify-center md:hidden ">
        <div className="flex flex-row items-center justify-between w-11/12">
          <Link href="/">
            <Image src={icon} alt="icon" className="lg:hidden block w-[70px]" />
            <Image
              src={logo}
              alt="logo"
              className="hidden lg:block w-[150px]"
            />
          </Link>
          <div className="flex justify-between items-center w-1/3 md:w-1/6">
            <div className=" px-2  border-y-0 border-x-0 border-b-[1px] border-b-gray-400  hidden md:flex items-center sm:w-8/12 lg:w-3/5">
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className=" mr-3 p-1 w-full"
              />
              <Image src={search} alt="search" width={20} height={10} />
            </div>
            <div>
              <Link href="/favorites" className="py-2">
                <Image src={Heart} alt="heart" width={20} height={10} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
