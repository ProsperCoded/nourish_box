"use client";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../contexts/AuthContext";
import userIcon from "../assets/icons8-user-48.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { User } from "@/app/utils/types/user.type";
interface menuProps {
  className?: string;
}

export function UserAvatar({ className = "" }: menuProps) {
  const { user: authUser, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  let compolsory_properties = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "address",
    "city",
    "state",
    "lga",
  ];
  // Check if profile is incomplete (no address)
  const isProfileIncomplete =
    authUser &&
    !compolsory_properties.every(
      (property) => authUser[property as keyof User]
    );

  if (!authUser) {
    return (
      <div className={`flex gap-4 ${className}`}>
        <Link href="/login">
          <button className="text-brand-btn_orange hover:text-gray-600 transition-colors duration-300 px-4 py-2 font-medium text-lg">
            Login
          </button>
        </Link>
        <Link href="/sign_up">
          <button className="bg-brand-btn_orange text-white hover:bg-opacity-90 transition-colors duration-300 px-5 py-2 rounded-lg font-medium text-lg shadow-md hover:shadow-lg">
            Sign Up
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 hover:opacity-80 focus:outline-none">
            <div className="relative">
              <div className="bg-brand-btn_orange/20 p-1.5 rounded-full">
                <Image
                  src={userIcon}
                  alt="user icon"
                  width={30}
                  height={30.11}
                  className="rounded-full"
                />
              </div>
              {isProfileIncomplete && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  !
                </div>
              )}
            </div>
            <span className="hidden md:inline text-sm font-medium">
              {authUser.firstName}
            </span>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56 bg-white rounded-md shadow-lg py-1 border border-gray-100">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-sm font-medium">{authUser.firstName}</p>
            <p className="text-xs text-gray-500 truncate">{authUser.email}</p>
          </div>

          <DropdownMenuItem className="hover:bg-gray-50 cursor-pointer">
            <Link
              href="/profile"
              className="flex items-center gap-2 w-full text-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-500"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Profile</span>
              {isProfileIncomplete && (
                <span className="ml-auto text-yellow-500 text-xs font-medium">
                  Incomplete
                </span>
              )}
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem className="hover:bg-gray-50 cursor-pointer">
            <Link
              href="/orders"
              className="flex items-center gap-2 w-full text-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-500"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                <path d="M3 6h18"></path>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span>My Orders</span>
            </Link>
          </DropdownMenuItem>

          {authUser.role === "admin" && (
            <DropdownMenuItem className="hover:bg-gray-50 cursor-pointer">
              <Link
                href="/admin"
                className="flex items-center gap-2 w-full text-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-500"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
                <span>Admin Dashboard</span>
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleLogout}
            className="hover:bg-gray-50 cursor-pointer text-red-600"
          >
            <div className="flex items-center gap-2 w-full text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-red-500"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Logout</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
