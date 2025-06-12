"use client";
import user_icon from "../assets/icons8-user-48.png";
import bookmark from "../assets/icons8-bookmark-48.png";
import clock from "../assets/icons8-clock-48.png";
import return_btn from "../assets/icons8-left-arrow-50.png";
// import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import { useState, useEffect } from "react";
import User_profile from "../components/user_profile";
import Order from "../components/order";
import FavoritesPage from "../favorites/page";
import ContactUs from "../contact_us/page";
import AlternateHeader from "../components/alternate_header";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

type SidebarItem = {
  id: string;
  title: string;
  content: React.ReactNode;
  img: StaticImageData;
  path?: string;
};

const Profile = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const SidebarLink: SidebarItem[] = [
    { id: "1", title: "Edit profile", content: <User_profile />, img: user_icon },
    { id: "2", title: "Order History", content: <Order />, img: clock },
    {
      id: "3",
      title: "Saved Recipes",
      content: <FavoritesPage className="md:hidden" />,
      img: bookmark,
    },
    {
      id: "4",
      title: "Contact us",
      content: <ContactUs className="md:hidden" />,
      img: clock,
    },
    {
      id: "5",
      title: "Track delivery",
      content: <div className="p-4">Track delivery page</div>,
      img: clock,
    },
    {
      id: "6",
      title: "Manage address",
      content: <div className="p-4">Manage address page</div>,
      img: clock,
    },
  ];

  const [activeElement, setActiveElement] = useState<string>(SidebarLink[0].id);
  const sideBarElement = SidebarLink.find((item) => item.id === activeElement);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  const handleSidebarItemClick = (id: string) => {
    setActiveElement(id);
    if (isMobile) setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Desktop Header */}
      <div className="hidden md:block py-5">
        <AlternateHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </div>

      {/* Mobile Header */}
      {isMobile && (
        <motion.div
          className="sticky top-0 z-50 bg-white border-b"
          animate={{ marginBottom: isSidebarOpen ? "1.25rem" : "0" }}
        >
          <div className="flex items-center h-16 px-4">
            {!isSidebarOpen && (
              <>
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Image src={return_btn} alt="Back" width={25} height={25} />
                  <span className="ml-2 text-sm text-gray-600">Back</span>
                </button>
                <h2 className="ml-4 text-lg font-medium truncate">{sideBarElement?.title}</h2>
              </>
            )}
          </div>
        </motion.div>
      )}

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-1/5 flex-col border-r border-gray-200 px-4 pt-6">
          <div className="flex flex-col items-center text-gray-800 mb-8">
            <div className="relative w-20 h-20 mb-3">
              <Image
                src={user?.profilePicture || user_icon}
                alt="Profile Picture"
                fill
                className="rounded-full object-cover border-2 border-orange-200 shadow-sm"
              />
            </div>
            <h2 className="text-lg font-semibold">{user?.firstName + " " + user?.lastName || "User"}</h2>
            {user?.email && <p className="text-sm text-gray-500">{user.email}</p>}
          </div>

          {SidebarLink.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSidebarItemClick(item.id)}
              className={`my-2 flex items-center text-left px-3 py-2 rounded-md ${activeElement === item.id ? "bg-orange-50 text-orange-500" : "text-gray-700 hover:bg-gray-50"
                }`}
            >
              <Image src={item.img} alt="icon" width={20} height={20} />
              <span className="ml-3">{item.title}</span>
            </button>
          ))}
        </div>

        {/* Mobile Sidebar */}
        {isMobile && (
          <motion.div
            className="fixed inset-0 z-40 bg-white"
            initial={{ x: "-100%" }}
            animate={{ x: isSidebarOpen ? 0 : "-100%" }}
            transition={{ duration: 0.3 }}
          >
            <div className="mt-16 flex flex-col h-full px-4 py-2 overflow-y-auto">
              {SidebarLink.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSidebarItemClick(item.id)}
                  className="flex items-center py-3 text-lg text-gray-700 border-b"
                >
                  <Image src={item.img} alt="icon" width={20} height={20} />
                  <span className="ml-3">{item.title}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-md shadow-md p-4 md:p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{sideBarElement?.title}</h2>
            {sideBarElement?.content}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
