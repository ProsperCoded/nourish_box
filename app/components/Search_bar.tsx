'use client';

import Image from 'next/image';
import React from 'react';
import search from '../assets/icons8-search-48.png';
import back from '../assets/icons8-left-arrow-50.png';
import { usePathname, useRouter } from 'next/navigation';

type Props = {
  PageTitle?: string;
  showSearchBar?: boolean;
  setShowSearchBar?: React.Dispatch<React.SetStateAction<boolean>>;
  searchQuery?: string;
  setSearchQuery?: React.Dispatch<React.SetStateAction<string>>;
  onBack?: () => void;                 // optional override (rarely needed now)
  fallbackHref?: string;               // where to go if no history (default '/')
};

const Search_bar: React.FC<Props> = ({
  PageTitle,
  showSearchBar,
  setShowSearchBar,
  searchQuery,
  setSearchQuery,
  onBack,
  fallbackHref = '/',
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const goBack = () => {
    // 1) Explicit override still wins (if you ever need it somewhere special)
    if (onBack) return onBack();

    // 2) Profile-specific behavior: return to the hub and open the sidebar
    const inProfile = pathname?.startsWith('/profile');
    if (inProfile) {
      // Tell Profile to open the sidebar (hub)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('profile:openSidebar'));
      }
      // Go to /profile (no tab) so header/title resets correctly
      router.push('/profile', { scroll: false });
      return;
    }

    // 3) Everywhere else: normal back, with a safe fallback
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <div className="md:hidden px-4 mb-4 ">
      <div className="flex justify-between items-center">
        <button onClick={goBack} className="p-2 rounded hover:bg-gray-100" aria-label="Go back">
          <Image src={back} alt="Back" width={20} height={20} />
        </button>

        <h1 className="text-3xl font-custom  my-4 transition ease-linear duration-200 tracking-wider">
          {PageTitle}
        </h1>

        {!showSearchBar ? (
          <button
            className="p-2 rounded hover:bg-gray-100"
            onClick={() => setShowSearchBar?.(true)}
            aria-label="Open search"
          >
            <Image src={search} alt="Search" width={20} height={20} />
          </button>
        ) : (
          <span className="w-10" />
        )}
      </div>

      {showSearchBar && (
        <div className="w-64 h-40
            bg-white/10
            border border-white/20
            rounded-xl
            backdrop-blur-md
            shadow-lg
            p-4 text-white">
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery?.(e.target.value)}
            className="py-2 pr-3 w-full outline-none"
          />
          <Image src={search} alt="Search" width={20} height={20} />
        </div>
      )}
    </div>
  );
};

export default Search_bar;
