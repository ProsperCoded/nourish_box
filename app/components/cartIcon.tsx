// app/components/CartBadgeIcon.tsx
"use client";

import Image from "next/image";
import { useCart } from "../contexts/CartContext";
import cart from "../assets/icons8-shopping-cart-100.png";

type Props = {
  className?: string;   // optional wrapper classes (spacing, etc.)
  size?: number;        // icon size in px
};

export default function CartBadgeIcon({ className = "", size = 22 }: Props) {
  const { getItemsCount } = useCart();
  const count = getItemsCount?.() ?? 0;

  return (
    <span
      className={`relative inline-flex items-center justify-center align-middle ${className}`}
      style={{ width: size, height: size }}
    >
      <Image src={cart} alt="Cart" width={size} height={size} />
      {count > 0 && (
        <span
          className="
            absolute -top-2 -right-2 min-w-[16px] h-[16px]
            rounded-full bg-red-500 text-white
            text-[10px] leading-[16px] text-center px-1
          "
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </span>
  );
}
