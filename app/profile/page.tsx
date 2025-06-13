"use client";
import user_icon from "../assets/icons8-user-48.png";
import bookmark from "../assets/icons8-bookmark-48.png";
import clock from "../assets/icons8-clock-48.png";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import { useState, useEffect } from "react";
import User_profile from "../components/user_profile";
import Order from "../components/order";
import { useRouter } from "next/navigation";
import return_btn from "../assets/icons8-left-arrow-50.png";
import FavoritesPage from "../favorites/page";
import ContactUs from "../contact_us/page";
import AlternateHeader from "../components/alternate_header";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

type SidebarItem = {
  id: string;
  title: string;
  content: React.ReactNode;
  img: StaticImageData;
  path?: string;
};

const Profile = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

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

  const [activeElement, setActiveElement] = useState<string>(SidebarLink[0].id);
  const sideBarElement = SidebarLink.find((item) => item.id === activeElement);

  const handleSidebarItemClick = (id: string) => {
    setActiveElement(id);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

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

        {/* Mobile Sidebar */}
        {isMobile && (
          <motion.div
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
          </motion.div>
        )}

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

export default Profile;
