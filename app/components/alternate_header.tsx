"use client";
import React from 'react'
import Image from "next/image";
import icon from "../assets/nourish_box_folder/Logo files/icon.svg";
import search from "../assets/icons8-search-48.png";
import Link from "next/link";
import Heart from '../assets/icons8-heart-32.png';

const Header = ({ searchQuery, setSearchQuery }: { searchQuery: string, setSearchQuery: React.Dispatch<React.SetStateAction<string>> }) => {
    return (
        <div className="flex justify-center">
            <div className="flex flex-row items-center justify-between w-11/12">
                <Link href="/">
                    <Image src={icon} alt="icon" className=" block w-[70px]" />
                  
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
                        <Link href="/favorites" className="py-2"><Image src={Heart} alt="heart" width={20} height={10} /></Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
