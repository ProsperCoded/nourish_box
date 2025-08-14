"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaUtensils,
  FaShoppingBag,
  FaUser,
  FaHeart,
} from "react-icons/fa";

const navItems = [
  { name: "Home", href: "/", icon: FaHome },
  { name: "Recipes", href: "/recipes", icon: FaUtensils },
  { name: "Profile", href: "/profile", icon: FaUser },
  { name: "Orders", href: "/profile/orderHistory", icon: FaShoppingBag },
  { name: "Favorite", href: "/favorites", icon: FaHeart },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-md md:hidden">
      <ul className="flex justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <li key={item.name}>
              <Link href={item.href}>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex flex-col items-center text-xs text-green-600"
                >
                  <Icon
                    className={`text-2xl mb-1 ${
                      isActive ? "text-[#F15A28]" : "text-[#004C30]"
                    }`}
                  />
                  <span
                    className={`${
                      isActive ? "text-[#F15A28]" : "text-[#004C30]"
                    }`}
                  >
                    {item.name}
                  </span>
                </motion.div>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
