"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";
import logo from "../assets/nourish_box_folder/Logo files/Logomark.svg";
import { LayoutDashboard, BookOpen, Users, ShoppingCart } from "lucide-react";
import { cn } from "@/app/lib/utils/cn";
import { Separator } from "@/app/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { User } from "../utils/types/user.type";

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

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (user.role !== "admin") {
      router.push("/");
    }
  }, [user, router]);

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-4">
          <Link href="/admin">
            <Image src={logo} alt="Logo" className="w-32" />
          </Link>
        </div>
        <Separator />
        <nav className="flex-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-brand-logo_green transition-colors rounded-lg mb-2",
                  pathname === item.path && "bg-gray-100 text-brand-logo_green"
                )}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.title}
              </Link>
            );
          })}
        </nav>
        <Separator />
        <div className="p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h1>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
} 