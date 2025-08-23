'use client'
import React from 'react'
import Image from "next/image";
import search from "../assets/icons8-search-48.png";
import back from "../assets/icons8-left-arrow-50.png";

const Search_bar = ({ goBack, PageTitle, showSearchBar, setShowSearchBar, searchQuery, setSearchQuery }: {
  goBack: () => void,
  PageTitle: string,
  showSearchBar?: boolean,
  setShowSearchBar?: React.Dispatch<React.SetStateAction<boolean>>,
  searchQuery?: string, setSearchQuery?: React.Dispatch<React.SetStateAction<string>>
}) => {
  return (
    <div>
      <div className="flex flex-col md:hidden px-4 mb-4">
        <div className="flex justify-between w-100 items-center">
          <div>
            <button onClick={goBack} className=" transition-all">  <Image src={back} alt="left black arrow" width={20} height={10} /></button>
          </div>
          <h1 className="text-2xl font-semibold my-4 trasnition ease-linear duration-200">{PageTitle}</h1>
          {!showSearchBar && (
            <button className=" transition ease-out duration-300" onClick={() => setShowSearchBar(true)}>
              <Image src={search} alt="search" width={20} height={10} /></button>
          )}
        </div>

        {showSearchBar && (

          <div className=" search bar px-2 border-[1px] border-gray-400 rounded-md flex items-center sm:w-8/12 lg:w-3/5 animate-in fade-in">

            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className=" mr-3 p-1 w-full"
            />
            <Image src={search} alt="search" width={20} height={10} />
          </div>
        )}
      </div>
    </div>
  )
}

export default Search_bar
