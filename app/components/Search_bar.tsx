'use client';

import Image from 'next/image';
import React from 'react';
import search from '../assets/icons8-search-48.png';
import back from '../assets/icons8-left-arrow-50.png';
import { usePathname, useRouter } from 'next/navigation';

type Props = {
  PageTitle?: string;
  /** show the search input? controlled from parent */
  showSearchBar?: boolean;
  setShowSearchBar: React.Dispatch<React.SetStateAction<boolean>>;
  /** controlled search text */
  searchQuery?: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  /** make the search icon appear or not */
  showSearchIcon?: boolean;
  onBack?: () => void;
  fallbackHref?: string;
};

const Search_bar: React.FC<Props> = ({
  PageTitle,
  showSearchBar,
  setShowSearchBar,
  searchQuery,
  setSearchQuery,
  showSearchIcon = true,
  onBack,
  fallbackHref = '/',
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const goBack = () => {
    if (onBack) return onBack();
    const inProfile = pathname?.startsWith('/profile');
    if (inProfile) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('profile:openSidebar'));
      }
      router.push('/profile', { scroll: false });
      return;
    }
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <div className="md:hidden px-4 mb-4">
      {/* Header row */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={goBack}
          className="p-2 rounded hover:bg-gray-100"
          aria-label="Go back"
        >
          <Image src={back} alt="Back" width={20} height={20} />
        </button>

        <h1 className="text-3xl font-custom my-4 tracking-wider">
          {PageTitle}
        </h1>

        {showSearchIcon && !showSearchBar ? (
          <button
            type="button"
            onClick={() => setShowSearchBar(true)}
            className="p-2 rounded hover:bg-gray-100"
            aria-label="Open search"
          >
            <Image src={search} alt="Search" width={20} height={20} />
          </button>
        ) : (
          <span className="w-10" />
        )}
      </div>

      {/* Search field */}
      {showSearchBar && (
        <form
          role="search"
          onSubmit={(e) => e.preventDefault()}
          className="relative mt-2"
        >
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Image src={search} alt="" width={18} height={18} />
          </span>

          <input
            type="search"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
              w-full rounded-xl border border-gray-300 bg-white
              text-gray-900 placeholder:text-gray-500
              px-10 py-2.5 shadow-sm
              focus:outline-none focus:ring-2 focus:ring-orange-300
            "
          />
        </form>
      )}
    </div>
  );
};

export default Search_bar;
