'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

import logo from '../assets/nourish_box_folder/Logo files/Logomark.svg';
import icon from '../assets/nourish_box_folder/Logo files/icon.svg';
import search from '../assets/icons8-search-48.png';
import Heart from '../assets/icons8-heart-32.png';
import return_btn from '../assets/icons8-left-arrow-50.png';

type HeaderProps = {
  showSearch?: boolean;
  searchQuery?: string;
  setSearchQuery?: React.Dispatch<React.SetStateAction<string>>;
};

const Header = ({ showSearch = true, searchQuery, setSearchQuery }: HeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();

  // Only for files inside /profile folder (e.g., /profile/manageAddress)
  const showReturn = !!pathname && pathname.startsWith('/profile/');

  // Controlled/uncontrolled search
  const [localQuery, setLocalQuery] = useState('');
  const isControlled = searchQuery !== undefined && setSearchQuery !== undefined;
  const value = isControlled ? searchQuery : localQuery;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (isControlled) setSearchQuery!(v);
    else setLocalQuery(v);
  };

  const handleReturn = () => router.push('/profile');

  return (
    <header className="flex flex-col justify-center w-full items-center px-4 md:px-0">
      <div className="w-full md:max-w-[1550px] px-0 pt-3">
        <div className="flex justify-between items-center w-full mx-auto">
          {/* Left area: either Return arrow (profile subpages) OR Logo */}
          <div className="flex my-4 items-center gap-3 w-full max-w-md">
            {showReturn ? (
              <button
                onClick={handleReturn}
                aria-label="Go back to Profile"
                className="rounded-full border border-gray-300 p-2 hover:bg-gray-100 active:scale-95 transition"
              >
                <Image src={return_btn} alt="Back" width={22} height={22} />
              </button>
            ) : (
              <Link href="/" className="flex items-center">
                {/* Icon on mobile */}
                <Image src={icon} alt="nourish icon" className="block md:hidden w-[50px]" />
                {/* Full logo on desktop */}
                <Image src={logo} alt="nourish logo" className="hidden md:block w-[130px] lg:w-[160px]" />
              </Link>
            )}
          </div>

          {/* Desktop: optional search + heart */}
          <div className="hidden md:flex items-center gap-3 w-1/3 justify-end">
            {showSearch && (
              <div className="flex items-center border border-gray-500 rounded-full px-3 py-2 w-full">
                <input
                  type="text"
                  placeholder="Search recipes..."
                  value={value}
                  onChange={handleChange}
                  className="text-sm bg-transparent w-full outline-none"
                />
                <Image src={search} alt="search icon" width={20} height={20} />
              </div>
            )}
            <Link href="/favorites" className="shrink-0">
              <Image src={Heart} alt="favorites" width={24} height={24} />
            </Link>
          </div>

          {/* Mobile: heart */}
          <Link href="/favorites" className="shrink-0 md:hidden">
            <Image src={Heart} alt="favorites" width={24} height={24} />
          </Link>
        </div>
      </div>

      {/* Mobile: optional search */}
      {showSearch && (
        <div className="block w-full md:hidden">
          <div className="flex flex-col w-full">
            <div className="flex items-center border border-gray-500 rounded-full px-3 py-2 w-full">
              <input
                type="text"
                placeholder="Search recipes..."
                value={value}
                onChange={handleChange}
                className="text-sm bg-transparent w-full outline-none"
              />
              <Image src={search} alt="search icon" width={20} height={20} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
