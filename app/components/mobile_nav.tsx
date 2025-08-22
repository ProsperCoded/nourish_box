// MobileNav.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaUtensils, FaShoppingBag, FaUser, FaHeart } from "react-icons/fa";

const NAV_HEIGHT = 64; // px

const navItems = [
  { name: "Home", href: "/", icon: FaHome },
  { name: "Shop", href: "/shop", icon: FaUtensils },
  { name: "Profile", href: "/profile", icon: FaUser },
  { name: "Orders", href: "/profile/orderHistory", icon: FaShoppingBag },
  { name: "Favorite", href: "/favorites", icon: FaHeart },
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-50 md:hidden
        bg-white/95 border-t shadow-md
        supports-[backdrop-filter]:backdrop-blur
        pb-[env(safe-area-inset-bottom)]
      "
      style={{ height: NAV_HEIGHT }}
      role="navigation"
      aria-label="Primary"
    >
      <ul className="h-full flex items-center justify-around">
        {navItems.map(({ name, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={name}>
              <Link href={href} aria-current={isActive ? "page" : undefined}>
                <motion.div
                  whileTap={{ scale: 0.94 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex flex-col items-center text-xs px-3 py-2"
                >
                  <Icon className={`text-2xl mb-1 ${isActive ? "text-[#F15A28]" : "text-[#004C30]"}`} />
                  <span className={isActive ? "text-[#F15A28]" : "text-[#004C30]"}>{name}</span>
                </motion.div>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
