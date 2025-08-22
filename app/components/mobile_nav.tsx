// MobileNav.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaHome, FaUtensils, FaUser, FaHeart, FaShoppingCart } from "react-icons/fa";
import CartComponent from "../components/Cart"; // ⬅️ your cart component

const NAV_HEIGHT = 64; // px

const navItems = [
  { name: "Home", href: "/", icon: FaHome },
  { name: "Shop", href: "/shop", icon: FaUtensils },
  { name: "Profile", href: "/profile", icon: FaUser },
  { name: "Cart", href: null, icon: FaShoppingCart },          // we'll render CartComponent below
  { name: "Favorite", href: "/favorites", icon: FaHeart },
];

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();

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
          const baseColor = isActive ? "text-[#F15A28]" : "text-[#004C30]";

          if (name === "Cart") {
            // Use a button so clicking anywhere on CartComponent navigates to /cart,
            // even if CartComponent has its own inner clickable DOM.
            return (
              <li key={name}>
                <motion.button
                  type="button"
                  onClick={() => router.push(href)}
                  whileTap={{ scale: 0.94 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex flex-col items-center text-xs px-3 py-2"
                  aria-label="Cart"
                >
                  {/* If your CartComponent accepts size/className, pass them.
                     Otherwise wrap it to control sizing consistently. */}
                  <span className="mb-1">
                    <CartComponent className={baseColor} size={24} />
                  </span>
                  <span className={baseColor}>Cart</span>
                </motion.button>
              </li>
            );
          }

          // Default items use Link + the provided icon
          return (
            <li key={name}>
              <Link href={href} aria-current={isActive ? "page" : undefined} aria-label={name}>
                <motion.div
                  whileTap={{ scale: 0.94 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex flex-col items-center text-xs px-3 py-2"
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
