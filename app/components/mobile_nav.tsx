// MobileNav.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaUtensils, FaUser, FaHeart } from "react-icons/fa";
import CartBadgeIcon from "../components/cartIcon";


const NAV_HEIGHT = 72; // a bit taller so labels never clip

type NavItem = {
  name: string;
  href: string | null;
  icon?: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { name: "Home", href: "/", icon: FaHome },
  { name: "Shop", href: "/shop", icon: FaUtensils },
  { name: "Profile", href: "/profile", icon: FaUser },
  { name: "Cart", href: null }, // special case below
  { name: "Favorite", href: "/favorites", icon: FaHeart },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white
        border-t shadow-md
        w-screen
        pl-[env(safe-area-inset-left)]
        pr-[env(safe-area-inset-right)]
        pb-[env(safe-area-inset-bottom)]
      "
      style={{ height: NAV_HEIGHT }}
      role="navigation"
      aria-label="Primary"
    >
      {/* Full width, equal columns */}
      <ul className="grid grid-cols-5 h-full">
        {navItems.map(({ name, href, icon: Icon }) => {
          const isActive = href ? (pathname === href || pathname.startsWith(href + "/")) : false;
          const baseColor = isActive ? "text-[#F15A28]" : "text-[#004C30]";

          // Cart (uses PNG badge icon)
          if (name === "Cart") {
            const cartActive = pathname === "/cart" || pathname.startsWith("/cart/");
            const cartColor = cartActive ? "text-[#F15A28]" : "text-[#004C30]";
            return (
              <li key="Cart" className="w-full">
                <Link
                  href="/cart"
                  aria-current={cartActive ? "page" : undefined}
                  aria-label="Cart"
                  className="block h-full w-full"
                >
                  <motion.div
                    whileTap={{ scale: 0.94 }}
                    className="h-full w-full flex flex-col items-center justify-center text-xs"
                  >
                    <span className="mb-1">
                      <CartBadgeIcon size={22} />
                    </span>
                    <span className={cartColor}>Cart</span>
                  </motion.div>
                </Link>
              </li>
            );
          }

          // Default items
          return (
            <li key={name} className="w-full">
              <Link
                href={href!}
                aria-current={isActive ? "page" : undefined}
                aria-label={name}
                className="block h-full w-full"
              >
                <motion.div
                  whileTap={{ scale: 0.94 }}
                  className="h-full w-full flex flex-col items-center justify-center text-xs"
                >
                  {Icon && <Icon className={`text-2xl mb-1 ${baseColor}`} />}
                  <span className={baseColor}>{name}</span>
                </motion.div>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
