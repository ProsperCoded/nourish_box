"use client";

import Image from "next/image";
import logo from "../assets/nourish_box_folder/Logo files/Logomark.svg";
import icon from "../assets/nourish_box_folder/Logo files/icon.svg";
import search from "../assets/icons8-search-48.png";
import Link from "next/link";

const Header = ({ searchQuery, setSearchQuery }: { searchQuery: string, setSearchQuery: React.Dispatch<React.SetStateAction<string>> }) => {
    return (
        <div className="flex justify-center">
            <div className="flex flex-row items-center justify-between w-11/12">
                <Link href="/">
                    <Image src={icon} alt="icon" className="lg:hidden block w-[70px]" />
                    <Image src={logo} alt="logo" className="hidden lg:block w-[150px]" />
                </Link>
                <div className="flex justify-between items-center w-1/3">
                    <div className="flex px-2 border-[1px] border-gray-400 rounded-md sm:w-8/12 lg:w-3/5">
                        <input
                            type="text"
                            placeholder="Search recipes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="mr-3 p-1 w-full"
                        />
                        <Image src={search} alt="search" width={20} height={10} />
                    </div>
                    <div>
                        <Link href="/favorites" className="text-orange-400 hover:underline">View liked recipes</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
