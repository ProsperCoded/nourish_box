"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";
import logo from "../assets/nourish_box_folder/Logo files/Logomark.svg";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ShoppingCart,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/app/lib/utils/cn";
import { Separator } from "@/app/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { User } from "../utils/types/user.type";
import { motion } from "framer-motion";

const menuItems = [
  {
    title: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Recipes",
    path: "/admin/recipes",
    icon: BookOpen,
  },
  {
    title: "Users",
    path: "/admin/users",
    icon: Users,
  },
  {
    title: "Orders",
    path: "/admin/orders",
    icon: ShoppingCart,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const [graceExceeded, setGraceExceeded] = useState(false);
  useEffect(() => {
    if (graceExceeded) return;
    if (!user) {
      const timeout = setTimeout(() => {
        setGraceExceeded(true);
      }, 5000);
      return () => clearTimeout(timeout);
    } else if (user.role !== "admin") {
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    if (graceExceeded) {
      if (!user) {
        router.push("/login");
      }
    }
  }, [graceExceeded, router, user]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handler = () => setIsDesktop(mediaQuery.matches);
    handler(); // Check on mount
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  if (!user && !graceExceeded) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity lg:hidden ${
          sidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <motion.aside
        layout
        initial={false}
        animate={{
          width: sidebarCollapsed ? 72 : 256,
          x: isDesktop ? 0 : sidebarOpen ? 0 : -256,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`${
          isDesktop ? "relative" : "fixed left-0"
        } z-50 h-full bg-white shadow-lg flex flex-col overflow-hidden`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <Link href="/">
            <Image
              src={logo}
              alt="Logo"
              className={`transition-all duration-300 ${
                sidebarCollapsed && isDesktop ? "w-8" : "w-32"
              }`}
            />
          </Link>
          {/* Collapse/Expand button for desktop */}
          <button
            className="hidden lg:inline-flex items-center justify-center p-2 rounded hover:bg-gray-100 ml-2"
            onClick={() => setSidebarCollapsed((c) => !c)}
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            {sidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
          {/* Close button for mobile */}
          <button
            className="lg:hidden inline-flex items-center justify-center p-2 rounded hover:bg-gray-100 ml-2"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <Separator />

        <nav className="flex-1 p-2 sm:p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  `flex items-center gap-2 px-3 py-3 text-gray-700 hover:bg-gray-100 hover:text-brand-logo_green transition-colors rounded-lg mb-1 ${
                    sidebarCollapsed && isDesktop ? "justify-center" : ""
                  }`,
                  pathname === item.path && "bg-gray-100 text-brand-logo_green"
                )}
                onClick={() => {
                  if (!isDesktop) setSidebarOpen(false);
                }}
              >
                <Icon className="w-5 h-5" />
                {!(sidebarCollapsed && isDesktop) && (
                  <span className="truncate">{item.title}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <Separator />

        <div
          className={`p-2 sm:p-4 flex items-center gap-3 ${
            sidebarCollapsed && isDesktop ? "justify-center" : ""
          }`}
        >
          <Avatar>
            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          {!(sidebarCollapsed && isDesktop) && (
            <div>
              <p className="text-sm font-medium truncate max-w-[120px]">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate max-w-[120px]">
                {user.email}
              </p>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm sticky top-0 z-10 flex items-center px-2 sm:px-6 py-3 sm:py-4">
          {/* Hamburger for mobile */}
          <button
            className="lg:hidden mr-2 p-2 rounded hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
            Admin Dashboard
          </h1>
        </header>
        <main className="flex-1 overflow-auto p-2 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
