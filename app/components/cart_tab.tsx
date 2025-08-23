"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CircularProgress } from "@mui/material";

import dustbin from "../assets/icons8-trash-can-26.png";
import { useCart } from "../contexts/CartContext";
import { CartItem } from "../utils/types/cart.tyes";
import { useCheckoutNavigation } from "../utils/checkout.utils";

const Cart_tab = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    loading,
    isItemLoading,
  } = useCart();

  const { goToCheckout } = useCheckoutNavigation();

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center">
        <CircularProgress size={24} />
        <p className="text-gray-600 mt-2">Loading cart...</p>
      </div>
    );
  }

  const cartItems = cart?.items || [];
  const totalPrice = getTotalPrice();

  return (
    <div
      className="
        w-full min-h-screen flex flex-col
        pb-[140px] md:pb-8
        bg-white
      "
    >
      {/* CONTENT CONTAINER */}
      <div className="w-full max-w-[800px] font-inter mx-auto px-4 sm:px-6 pt-4 sm:pt-6 flex-1">
        {cartItems.length === 0 ? (
          <div className="flex flex-col justify-center items-center text-center py-24">
            <h2 className="my-2 text-xl sm:text-2xl font-inter font-semibold">Cart is empty</h2>
            <p className="text-gray-500 text-sm sm:text-base mb-4">
              Start adding your favourite recipes.
            </p>
            <Link
              href="/shop"
              className="bg-orange-500 hover:bg-orange-600 transition-colors px-4 py-2 rounded-lg text-white font-medium"
            >
              Add recipes to cart
            </Link>
          </div>
        ) : (
          <ul className="space-y-3 sm:space-y-4">
            {cartItems.map((item: CartItem) => {
              const itemLoading = isItemLoading(item.id);
              const isVideo = item.displayMedia?.type === "video";
              const mediaUrl = item.displayMedia?.url;

              return (
                <li
                  key={item.id}
                  className={`
                    rounded-xl border border-gray-200 bg-white shadow-sm
                    p-3 sm:p-4
                    ${itemLoading ? "opacity-70" : ""}
                  `}
                >
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                    {/* MEDIA */}
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-md overflow-hidden flex-shrink-0">
                      {mediaUrl ? (
                        <Image
                          src={mediaUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100" />
                      )}

                      {/* Play overlay for videos */}
                      {isVideo && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <div className="w-7 h-7 rounded-full bg-white/80 flex items-center justify-center">
                            <div className="w-0 h-0 border-l-[10px] border-l-[#004C30] border-y-[6px] border-y-transparent ml-[2px]" />
                          </div>
                        </div>
                      )}

                      {/* Per-item loading overlay */}
                      {itemLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                          <CircularProgress size={16} />
                        </div>
                      )}
                    </div>

                    {/* NAME + PRICE */}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sm sm:text-base truncate">{item.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        NGN {item.price.toLocaleString()}
                      </p>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Quantity stepper */}
                      <div className="relative flex items-center border border-gray-300 rounded-full">
                        {itemLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-full">
                            <CircularProgress size={14} />
                          </div>
                        )}
                        <button
                          aria-label="Decrease quantity"
                          className="h-8 w-8 sm:h-9 sm:w-9 text-gray-700 disabled:text-gray-300"
                          onClick={() =>
                            handleQuantityChange(item.id, Math.max(1, item.quantity - 1))
                          }
                          disabled={item.quantity <= 1 || itemLoading}
                        >
                          −
                        </button>
                        <span className="px-2 min-w-[24px] text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          aria-label="Increase quantity"
                          className="h-8 w-8 sm:h-9 sm:w-9 text-gray-700 disabled:text-gray-300"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={itemLoading}
                        >
                          +
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 rounded-md hover:bg-gray-50 transition-colors"
                        aria-label={`Remove ${item.name}`}
                        disabled={itemLoading}
                      >
                        {itemLoading ? (
                          <CircularProgress size={15} />
                        ) : (
                          <Image src={dustbin} alt="Remove" width={16} height={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* STICKY SUMMARY (mobile-first). Sits above your fixed MobileNav. */}
      {cartItems.length > 0 && (
        <div
          className="
            fixed bottom-[72px] left-0 right-0 z-40
            md:static md:bottom-auto
            bg-white/95 md:bg-transparent
            supports-[backdrop-filter]:backdrop-blur
            border-t md:border-t-0
            shadow-[0_-4px_12px_rgba(0,0,0,0.06)] md:shadow-none
          "
        >
          <div className="w-full font-inter max-w-[800px] mx-auto px-4 sm:px-6">
            {/* Total */}
            <div className="flex items-center justify-between py-3 md:py-4">
              <span className="text-base sm:text-lg font-semibold text-gray-700">Total</span>
              <span className="text-lg sm:text-xl font-bold text-gray-900">
                NGN {totalPrice.toLocaleString()}
              </span>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1  font-inter  sm:grid-cols-2 gap-3 pb-[env(safe-area-inset-bottom)] mb-3 md:mb-0 md:pb-0">
              <button
                onClick={handleClearCart}
                className="
                  w-full px-4 py-3 rounded-lg
                  bg-gray-200 text-gray-800 hover:bg-gray-300
                  transition-colors font-medium
                "
                disabled={cartItems.some((i) => isItemLoading(i.id))}
              >
                {cartItems.some((i) => isItemLoading(i.id)) ? (
                  <span className="inline-flex items-center gap-2">
                    <CircularProgress size={16} /> Clearing…
                  </span>
                ) : (
                  "Clear cart"
                )}
              </button>

              <button
                onClick={goToCheckout}
                className="
                  w-full px-4 py-3 rounded-lg
                  bg-orange-500 text-white hover:bg-orange-600
                  transition-colors font-medium
                "
                disabled={cartItems.some((i) => isItemLoading(i.id))}
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart_tab;
