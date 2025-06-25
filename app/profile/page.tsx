"use client";
import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import return_btn from "../assets/icons8-left-arrow-50.png";
import AlternateHeader from "../components/alternate_header";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

// Page Components
import User_profile from "../components/user_profile";
// import Order from "../components/order";
import FavoritesPage from "../favorites/page";
import ContactUs from "../contact_us/page";
import ManageAddress from "../profile/manageAddress/page";

// Icons
import userIcon from "../assets/icons8-user-48.png";
import clockIcon from "../assets/icons8-clock-48.png";
import bookmarkIcon from "../assets/icons8-love-circled-50.png";
import phoneIcon from "../assets/icons8-phone-60.png";
import locationIcon from "../assets/icons8-location-50.png";
import deliveryIcon from "../assets/icons8-delivery-time-48.png";
import backIcon from "../assets/icons8-left-arrow-50.png";
import OrderHistory from "./orderHistory/page";

const tabs = [
  { id: "1", title: "Edit profile", icon: userIcon, content: <User_profile /> },
  { id: "2", title: "Order History", icon: clockIcon, content: <OrderHistory /> },
  { id: "3", title: "Saved Recipes", icon: bookmarkIcon, content: <FavoritesPage showHeader={false} /> },
  { id: "4", title: "Contact us", icon: phoneIcon, content: <ContactUs showIcons={false} /> },
  {
    id: "5",
    title: "Track delivery",
    icon: deliveryIcon,
    content: <div className="p-4">Track delivery page</div>,
  },
  {
    id: "6",
    title: "Manage address",
    icon: locationIcon,
    content: <ManageAddress onBack={() => { }} />,
  },
];

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobile && isSidebarOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobile, isSidebarOpen]);

  const activeTab = tabs.find((tab) => tab.id === activeTabId);


  return (
    <div className="min-h-screen bg-white">
      <div className="hidden md:block py-5">
        <AlternateHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </div>

      {/* Mobile Header */}
      {isMobile && (
        <motion.div
          className="sticky top-0 z-50 bg-white border-b px-4"
          initial={false}
          animate={{ paddingBottom: isSidebarOpen ? "0.75rem" : "0" }}
        >
          <div className="flex items-center h-16">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center text-sm text-gray-600"
              >
                <Image src={return_btn} alt="Back" width={24} height={24} className="mr-2" />
                Back
              </button>
            )}
            {!isSidebarOpen && activeTab && (
              <h2 className="ml-4 text-lg font-medium truncate">{activeTab.title}</h2>
            )}
          </div>
        </motion.div>
      )}

      {/* Mobile Slide View */}
      {isMobile ? (
        <div className="relative w-full overflow-hidden">
          <motion.div
            className="flex w-[200%] transition-transform duration-100"
            animate={{ x: isSidebarOpen ? "0%" : "-50%" }}
          >
            {/* Sidebar Tabs */}
            <div className="w-full p-4">
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-20 h-20">
                  <Image
                    src={user?.profilePicture || userIcon}
                    alt="User"
                    fill
                    className="rounded-full object-cover border-2 border-orange-200 shadow"
                  />
                </div>
                <h2 className="text-lg font-semibold mt-2">{user?.firstName + " " + user?.lastName || "User"}</h2>
                {user?.email && <p className="text-sm text-gray-500">{user.email}</p>}
              </div>
              <div className="space-y-3">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTabId(tab.id)
                      setIsSidebarOpen(false)
                    }}
                    className="w-full flex items-center gap-3 p-3 bg-gray-100 rounded-lg text-sm font-medium hover:bg-orange-100"
                  >
                    <Image src={tab.icon} alt={tab.title} width={20} height={20} />
                    {tab.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="w-full p-4">
              {activeTab ? activeTab.content : <div>Select a tab</div>}
            </div>
          </motion.div>
        </div>
      ) : (
        // Desktop & iPad
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/4 border-r border-gray-200 p-4">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="relative w-24 h-24">
                <Image
                  src={user?.profilePicture || userIcon}
                  alt="User"
                  fill
                  className="rounded-full object-cover border-2 border-orange-200 shadow-md"
                />
              </div>
              <h2 className="text-xl font-semibold mt-2">{user?.firstName + " " + user?.lastName || "User"}</h2>
              {user?.email && <p className="text-sm text-gray-500">{user.email}</p>}
            </div>
            <div className="space-y-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg shadow-sm text-left hover:bg-gray-100 transition ${activeTabId === tab.id ? "bg-orange-100 text-orange-600" : ""
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Image src={tab.icon} alt={tab.title} width={24} height={24} />
                    <span className="text-gray-800 font-medium text-sm">{tab.title}</span>
                  </div>
                  <span className="text-gray-400">{">"}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 p-4 md:p-8">
            <AnimatePresence mode="wait">
              {activeTab ? (
                <motion.div
                  key={activeTab.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.03 }}
                >
                  {activeTab.content}
                </motion.div>
              ) : (
                <div className="text-gray-500">Select a tab to view content</div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  )

}

function ProfileLoading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>
  );
}

export default function Profile() {
  return (
    <Suspense fallback={<ProfileLoading />}>
      <ProfileContent />
    </Suspense>
  );
}
