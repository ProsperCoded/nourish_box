"use client";

import React from "react";
import { useCheckoutNavigation } from "../utils/checkout.utils";
import { useCart } from "../contexts/CartContext";

interface CheckoutButtonProps {
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  className = "",
  children,
  disabled = false,
  variant = "primary",
}) => {
  const { goToCheckout } = useCheckoutNavigation();
  const { cart } = useCart();

  const baseClasses =
    "px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClasses = {
    primary: "bg-orange-500 text-white hover:bg-orange-600",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  };

  const isDisabled = disabled || !cart || cart.items.length === 0;

  return (
    <button
      onClick={goToCheckout}
      disabled={isDisabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children || "Proceed to Checkout"}
    </button>
  );
};

export default CheckoutButton;
