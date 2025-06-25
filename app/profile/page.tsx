"use client";
import user_icon from "../assets/icons8-user-48.png";
import bookmark from "../assets/icons8-bookmark-48.png";
import clock from "../assets/icons8-clock-48.png";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import { useState, useEffect, Suspense } from "react";
import User_profile from "../components/user_profile";
import Order from "../components/order";
import { useRouter, useSearchParams } from "next/navigation";
import return_btn from "../assets/icons8-left-arrow-50.png";
import FavoritesPage from "../favorites/page";
import ContactUs from "../contact_us/page";
import AlternateHeader from "../components/alternate_header";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';

// Page Components
import User_profile from '../components/user_profile';
import Order from '../components/order';
import FavoritesPage from '../favorites/page';
import ContactUs from '../contact_us/page';
import ManageAddress from '../profile/manageAddress/page';

// Icons
import userIcon from '../assets/icons8-user-48.png';
import clockIcon from '../assets/icons8-clock-48.png';
import bookmarkIcon from '../assets/icons8-love-circled-50.png';
import phoneIcon from '../assets/icons8-phone-60.png';
import locationIcon from '../assets/icons8-location-50.png';
import deliveryIcon from '../assets/icons8-delivery-time-48.png';
import backIcon from '../assets/icons8-left-arrow-50.png';

type TabItem = {
  id: string;
  title: string;
  icon: any;
  content: React.ReactNode;
};

const ProfileContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Map section query parameters to sidebar item IDs
  const sectionToIdMap: { [key: string]: string } = {
    "edit-profile": "1",
    orders: "2",
    "saved-recipes": "3",
    "contact-us": "4",
    "track-delivery": "5",
    "manage-address": "6",
  };

  // Get the section from URL query parameter
  const section = searchParams.get("section");
  const initialActiveId =
    section && sectionToIdMap[section] ? sectionToIdMap[section] : "1";

  const [activeElement, setActiveElement] = useState<string>(initialActiveId);

  // Update active element when section query parameter changes
  useEffect(() => {
    if (section && sectionToIdMap[section]) {
      setActiveElement(sectionToIdMap[section]);
    }
  }, [section]);

  // Handle mobile detection and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add resize listener
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle scroll lock on mobile
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobile, isSidebarOpen]);

  const SidebarLink: SidebarItem[] = [
    {
      id: "1",
      title: "Edit profile",
      content: <User_profile />,
      img: user_icon,
    },
    { id: "2", title: "Order History", content: <Order />, img: clock },
    {
      id: "3",
      title: "Saved Recipes",
      content: (
        <div>
          <FavoritesPage className="md:hidden border-2 border-red-500" />
        </div>
      ),
      img: bookmark,
    },
    {
      id: "4",
      title: "Contact us",
      content: (
        <ContactUs
          className="md:hidden"
          formClassName="md:w-full"
          textClassName="text-2xl font-inter text-gray-700 mt-0"
        />
      ),
      img: clock,
    },
    {
      id: "5",
      title: "Track delivery",
      content: <div>Track delivery content</div>,
      img: clock,
    },
    {
      id: "6",
      title: "Manage address",
      content: <div>Manage address content</div>,
      img: clock,
    },
  ];

  const sideBarElement = SidebarLink.find((item) => item.id === activeElement);

  const handleSidebarItemClick = (id: string) => {
    setActiveElement(id);
    // Find the section name from the ID
    const sectionName = Object.entries(sectionToIdMap).find(
      ([_, value]) => value === id
    )?.[0];
    if (sectionName) {
      router.push(`/profile?section=${sectionName}`);
    }
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };
const tabs: TabItem[] = [
  { id: '1', title: 'Edit profile', icon: userIcon, content: <User_profile /> },
  { id: '2', title: 'Order History', icon: clockIcon, content: <Order /> },
  { id: '3', title: 'Saved Recipes', icon: bookmarkIcon, content: <FavoritesPage /> },
  { id: '4', title: 'Contact us', icon: phoneIcon, content: <ContactUs /> },
  { id: '5', title: 'Track delivery', icon: deliveryIcon, content: <div className="p-4">Track delivery page</div> },
  {
    id: '6',
    title: 'Manage address',
    icon: locationIcon,
    content: <ManageAddress onBack={() => setActiveTabId(null)} />,
  },
];

export default function Profile() {
  const { user } = useAuth();
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  return (
    <div className="min-h-screen bg-white">
      {/* Desktop Header */}
      <div className="hidden md:block py-5">
        <AlternateHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </div>

      {/* Mobile Header */}
      {isMobile && (
        <motion.div
          className="sticky top-0 z-50 bg-white border-b"
          initial={false}
          animate={{
            paddingLeft: isSidebarOpen ? "1.25rem" : "1.25rem",
            marginBottom: isSidebarOpen ? "1.25rem" : "0",
          }}
        >
          <div className="flex items-center h-16">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Image
                  src={return_btn}
                  alt="Back to menu"
                  width={25}
                  height={25}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Back</span>
              </button>
            )}
            {!isSidebarOpen && (
              <h2 className="ml-4 text-xl font-medium truncate">
                {sideBarElement?.title}
              </h2>
            )}
          </div>
        </motion.div>
      )}

      <div className="flex justify-between relative">
        {/* Desktop Sidebar */}
        <div className="hidden md:block md:w-1/5 h-screen border-r-[1px] border-solid border-gray-200 md:ml-6 overflow-y-auto">
          <div className="flex flex-col w-full font-inter text-gray-700 p-4 md:p-0">
            {/* Desktop Profile Info */}
            <div className="flex flex-col items-center border-b border-gray-100 pb-6 mb-6">
              <div className="relative w-24 h-24 mb-4">
                <Image
                  src={user?.profilePicture || user_icon}
                  alt="Profile Picture"
                  fill
                  className="rounded-full object-cover border-2 border-orange-200 shadow-md"
                />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                {user?.firstName + " " + user?.lastName || "User"}
              </h2>
              {user?.email && (
                <p className="text-sm text-gray-500 mt-1">{user.email}</p>
              )}
            </div>
    <div className="bg-white min-h-screen p-4 relative">
      {/* Header */}
      {!activeTabId && (
        <>
          <div className="bg-green-50 rounded-xl p-4 mb-6">
            <h2 className="text-lg font-semibold text-green-800">
              {user?.firstName || 'Wonuola'} {user?.lastName || 'Alonge'}
            </h2>
            <p className="text-sm text-green-700 flex items-center gap-1">
              <span className="text-yellow-500 text-lg">⭐</span> 11
            </p>
          </div>

          {/* Tab List */}
          <div className="space-y-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg shadow-sm text-left hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  <Image src={tab.icon} alt={tab.title} width={24} height={24} />
                  <span className="text-gray-800 font-medium text-sm">{tab.title}</span>
                </div>
                <span className="text-gray-400">{'>'}</span>
              </button>
            ))}
          </div>
        </>
      )}
            {/* Desktop Navigation */}
            <div className="mt-2 px-2">
              {SidebarLink.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveElement(item.id)}
                  className={`w-full my-2 text-lg flex items-center p-3 rounded-lg transition-colors duration-200 ${
                    activeElement === item.id
                      ? "text-orange-500 bg-orange-50 shadow-sm"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Image
                    src={item.img}
                    alt="icon"
                    width={20}
                    height={20}
                    className="min-w-[20px]"
                  />
                  <p className="ml-3">{item.title}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

      {/* Slide-in Content Panel */}
      <AnimatePresence>
        {activeTab && (
          <motion.div
            key="tabContent"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="absolute top-0 left-0 w-full h-full bg-white z-50 p-4 overflow-y-auto"
          >
            {/* Back Header */}
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => setActiveTabId(null)} className="p-2">
                <Image src={backIcon} alt="Back" width={24} height={24} />
              </button>
              <h2 className="text-lg font-semibold text-gray-800">{activeTab.title}</h2>
            className="fixed inset-0 z-40 bg-white"
            initial={{ x: "-100%" }}
            animate={{
              x: isSidebarOpen ? 0 : "-100%",
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="mt-16 flex flex-col w-full h-full font-inter text-gray-700 p-4 overflow-y-auto">
              {/* Mobile Profile Info */}
              <div className="flex items-center px-2 py-4 border-b border-gray-100 mb-6">
                <div className="relative w-14 h-14 flex-shrink-0">
                  <Image
                    src={user?.profilePicture || user_icon}
                    alt="Profile Picture"
                    fill
                    className="rounded-full object-cover border-2 border-orange-200 shadow-sm"
                  />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {user?.firstName || "User"}
                  </h2>
                  {user?.email && (
                    <p className="text-sm text-gray-500">{user.email}</p>
                  )}
                </div>
              </div>

              {/* Mobile Navigation */}
              <div className="mt-2">
                {SidebarLink.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSidebarItemClick(item.id)}
                    className={`w-full my-2 text-lg flex items-center p-3 rounded-lg transition-colors duration-200 ${
                      activeElement === item.id
                        ? "text-orange-500 bg-orange-50 shadow-sm"
                        : "text-gray-700 active:bg-gray-100"
                    }`}
                  >
                    <Image
                      src={item.img}
                      alt="icon"
                      width={24}
                      height={24}
                      className="min-w-[24px]"
                    />
                    <p className="ml-4 text-lg">{item.title}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div>{activeTab.content}</div>
          </motion.div>
        )}
      </AnimatePresence>

        {/* Content Area */}
        <div className="flex-1 md:w-3/4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeElement}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-4 md:p-8"
            >
              {sideBarElement?.content}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// Loading component for Suspense fallback
const ProfileLoading = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
  </div>
);

const Profile = () => {
  return (
    <Suspense fallback={<ProfileLoading />}>
      <ProfileContent />
    </Suspense>
  );
};

export default Profile;
}
