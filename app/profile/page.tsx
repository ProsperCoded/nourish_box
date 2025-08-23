"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

// Pages / components
import Nav from "../components/nav";
import User_profile from "../components/user_profile";
import ContactUs from "../contact_us/page";
import FavoritesPage from "../favorites/page";
import LogIn from "../login/page";
import ManageAddress from "./manageAddress/page";
import OrderHistory from "./orderHistory/page";
import OrderStatusPage from "./trackOrder/page";

// Icons (images)
import clockIcon from "../assets/icons8-clock-100.png";
import deliveryIcon from "../assets/icons8-delivery-100.png";
import locationIcon from "../assets/icons8-location-50.png";
import bookmarkIcon from "../assets/icons8-love-circled-50.png";
import phoneIcon from "../assets/icons8-phone-100.png";
import userIcon from "../assets/icons8-user-48.png";
import Search_bar from "../components/Search_bar";

type TabDef = {
  id: string;
  title: string;
  icon?: any;                // StaticImageData for <Image />
  content?: React.ReactNode; // render content when selected
  onClick?: () => void;      // for action tabs (e.g., Logout)
};

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth() as { user: any; logout?: () => Promise<void> | void };

  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1 && window.innerWidth > 768) {
      router.back();
    } else {
      // back to profile hub if present, else home
      router.push("/profile?tab=saved");
    }
  };
  // Build tabs (auth-aware)
  const baseTabs: TabDef[] = [
    { id: "profile", title: "Edit profile", icon: userIcon, content: <User_profile /> },
    { id: "orders", title: "Order History", icon: clockIcon, content: <OrderHistory /> },
    { id: "saved", title: "Favorite Recipes", icon: bookmarkIcon, content: <FavoritesPage showHeader={false} /> },
    { id: "contact", title: "Contact us", icon: phoneIcon, content: <ContactUs showIcons={false} /> },
    { id: "track", title: "Track delivery", icon: deliveryIcon, content: <OrderStatusPage /> },
    { id: "address", title: "Manage address", icon: locationIcon, content: <ManageAddress /> },
  ];

  const handleLogout = async () => {
    try {
      if (typeof logout === "function") await logout();
    } finally {
      router.replace("/");
    }
  };

  // Keep auth tab for the login screen inside content when logged out
  const authTab: TabDef = user
    ? { id: "auth", title: "Logout (moved below)", icon: userIcon, onClick: handleLogout }
    : { id: "login", title: "Login", icon: userIcon, content: <LogIn showHeader={ false} /> };

  const tabs: TabDef[] = [...baseTabs, authTab];

  // Responsive
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = isMobile && isSidebarOpen ? "hidden" : "unset";
    return () => void (document.body.style.overflow = "unset");
  }, [isMobile, isSidebarOpen]);

  // Sync with ?tab=
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && tabs.find((t) => t.id === tabParam)) {
      setActiveTabId(tabParam);
    } else if (!activeTabId) {
      setActiveTabId("profile");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, tabs.length, activeTabId]);

  const handleTabClick = (tab: TabDef) => {
    if (tab.onClick) {
      tab.onClick();
      return;
    }
    if (tab.content) {
      setActiveTabId(tab.id);
      if (isMobile) setIsSidebarOpen(false);
      router.push(`/profile?tab=${tab.id}`, { scroll: false });
    }
  };

  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div className="min-h-screen bg-white overflow-y-scroll">
      {/* Desktop nav */}
      <div className="hidden h-24 md:block">
        <Nav noLinks={true} />
      </div>

      {/* Mobile nav */}
      {isMobile && <Nav noLinks={true} />}
      {/* Mobile header */}
      {isMobile &&  <Search_bar PageTitle="Profile" showSearchBar={false} goBack={goBack}/>}

      {/* Mobile slide view */}
      {isMobile ? (
        <div className="relative w-full overflow-hidden pt-24">
          <motion.div
            className="flex w-[200%] transition-transform duration-100"
            animate={{ x: isSidebarOpen ? "0%" : "-50%" }}
          >
            {/* Sidebar */}
            <div className="w-full p-4 pt-2">
              <div className="flex flex-col items-center mb-2">
                <div className="relative w-10 h-10 md:w-12 md:h-12">
                  <Image
                    src={user?.profilePicture || userIcon}
                    alt="User"
                    fill
                    className="rounded-full object-cover border border-orange-200 shadow"
                  />
                </div>
                <h2 className="text-lg font-semibold mt-2">
                  {(user?.firstName ?? "User") + (user?.lastName ? ` ${user.lastName}` : "")}
                </h2>
                {user?.email && <p className="text-sm text-gray-500">{user.email}</p>}
              </div>

              <div className="space-y-3">
                {tabs
                  .filter(t => t.id !== "auth") // keep the separate logout button below
                  .map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab)}
                      className="w-full flex items-center gap-3 p-3 bg-gray-100 rounded-lg text-sm font-medium hover:bg-orange-100"
                    >
                      {tab.icon && <Image src={tab.icon} alt={tab.title} width={16} height={16} />}
                      {tab.title}
                    </button>
                  ))}
              </div>

              {/* NEW: Dedicated Logout button (mobile) */}
              {user && (
                <div className="mt-4 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-3 rounded-lg text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400"
                    aria-label="Log out"
                  >
                    <Image src={userIcon} alt="Logout" width={16} height={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="w-full p-4">
              {activeTab && activeTab.content ? activeTab.content : <div>Select a tab</div>}
            </div>
          </motion.div>
        </div>
      ) : (
        // Desktop / Tablet
        <div className="flex flex-col md:flex-row pt-24">
          {/* Sidebar */}
          <div className="md:w-1/4 border-r border-gray-200 p-4 flex flex-col">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="relative w-10 h-10 md:w-12 md:h-12">
                <Image
                  src={user?.profilePicture || userIcon}
                  alt="User"
                  fill
                  className="rounded-full object-cover border border-orange-200 shadow-md"
                />
              </div>
              <h2 className="text-xl font-semibold mt-2">
                {(user?.firstName ?? "User") + (user?.lastName ? ` ${user.lastName}` : "")}
              </h2>
              {user?.email && <p className="text-sm text-gray-500">{user.email}</p>}
            </div>

            <div className="space-y-3">
              {tabs
                .filter(t => t.id !== "auth") // hide inline auth tab text and use the button below
                .map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab)}
                    className={`w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg shadow-sm text-left hover:bg-gray-100 transition ${activeTabId === tab.id ? "bg-orange-100 text-orange-600" : ""
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      {tab.icon && <Image src={tab.icon} alt={tab.title} width={18} height={18} />}
                      <span className="text-gray-800 font-medium text-sm">{tab.title}</span>
                    </div>
                  </button>
                ))}
            </div>

            {/* NEW: Dedicated Logout button (desktop) */}
            {user && (
              <div className="mt-auto pt-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold bg-red-50 text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400"
                  aria-label="Log out"
                >
                  <Image src={userIcon} alt="Logout" width={18} height={18} />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-4 md:p-4">
            <AnimatePresence mode="wait">
              {activeTab && activeTab.content ? (
                <motion.div
                  key={activeTab.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.1 }}
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
  );
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
