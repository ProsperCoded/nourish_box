'use client';

import Image from 'next/image';
import logo from '../assets/nourish_box_folder/Logo files/Logomark.svg';
import icon from '../assets/nourish_box_folder/Logo files/icon.svg';
import search from '../assets/icons8-search-48.png';
import Heart from '../assets/icons8-heart-32.png';
import Link from 'next/link';

const Header = ({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <header className="w-full px-4 md:px-8 pt-3">
      <div className="flex md:hidden   flex-col justify-between items-center w-full max-w-7xl mx-auto">
        {/* Logo and favorites */}
        <div className="flex justify-between my-4 items-center  gap-2 w-full max-w-md">
          <Link href="/" className="flex items-center">
            {/* Show icon on mobile */}
            <Image
              src={icon}
              alt="nourish icon"
              className="block md:hidden w-[50px]"
            />
            {/* Show full logo on desktop */}
            <Image
              src={logo}
              alt="nourish logo"
              className="hidden md:block w-[130px] lg:w-[160px]"
            />
          </Link>
          <Link href="/favorites" className="shrink-0">
            <Image src={Heart} alt="favorites" width={24} height={24} />
          </Link>
      </div>
        {/* Search + Heart */}
        <div >



          {/* Favorites icon */}

        </div>
        {/* Search bar */}
        <div className="flex items-center border border-gray-300 rounded-full px-3 py-2 my-2 w-full">
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm bg-transparent outline-none"
          />
          <Image src={search} alt="search icon" width={20} height={20} />
        </div>
      </div>
      <div className='flex justify-between items-center '>
        <div className="hidden md:flex  justify-between items-center w-full max-w-7xl mx-auto ">
        {/* Logo and favorites */}
        <div className="flex justify-between  my-4 mb:2  items-center  gap-2 w-full max-w-md">
          <Link href="/" className="flex items-center">
            {/* Show icon on mobile */}
            <Image
              src={icon}
              alt="nourish icon"
              className="block md:hidden w-[50px]"
            />
            {/* Show full logo on desktop */}
            <Image
              src={logo}
              alt="nourish logo"
              className="hidden md:block w-[130px] lg:w-[160px]"
            />
          </Link>

        </div>
        {/* Search + Heart */}
        <div className=' flex justify-between w-1/3'>
           <div className="flex items-center border border-gray-500 rounded-full px-3 py-2 w-2/3">
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-sm bg-transparent  w-full outline-none"
          />
          <Image src={search} alt="search icon" width={20} height={20} />
        </div>
        <Link href="/favorites" className="shrink-0">
          <Image src={Heart} alt="favorites" width={24} height={24} />
        </Link>

       </div>
        <div >



          {/* Favorites icon */}

        </div>
        {/* Search bar */}

      </div>
      </div>
    </header>
  );
};

export default Header;
