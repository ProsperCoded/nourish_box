"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Cart, CartItem } from "@/app/utils/types/cart.tyes";
import { Recipe } from "@/app/utils/types/recipe.type";
import {
  getCart,
  addToCart as addToCartFirebase,
  updateCartItem,
  removeFromCart as removeFromCartFirebase,
  clearCart as clearCartFirebase,
  getCartItemsCount,
} from "@/app/utils/firebase/cart.firebase";
import { useAuth } from "./AuthContext";

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addToCart: (
    recipe: Recipe,
    quantity?: number,
    packagingOption?: string
  ) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getItemsCount: () => number;
  getTotalPrice: () => number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  cart: null,
  loading: true,
  addToCart: async () => {},
  updateQuantity: async () => {},
  removeFromCart: async () => {},
  clearCart: async () => {},
  getItemsCount: () => 0,
  getTotalPrice: () => 0,
  refreshCart: async () => {},
});

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCart = async () => {
    if (!user) {
      setCart(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userCart = await getCart(user.id);
      setCart(userCart);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (
    recipe: Recipe,
    quantity: number = 1,
    packagingOption?: string
  ): Promise<void> => {
    if (!user) throw new Error("User must be logged in to add to cart");

    try {
      await addToCartFirebase(user.id, recipe, quantity, packagingOption);
      await fetchCart(); // Refresh cart after adding
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  };

  const updateQuantity = async (
    itemId: string,
    quantity: number
  ): Promise<void> => {
    if (!user) throw new Error("User must be logged in");

    try {
      await updateCartItem(user.id, itemId, quantity);
      await fetchCart(); // Refresh cart after updating
    } catch (error) {
      console.error("Error updating cart item:", error);
      throw error;
    }
  };

  const removeFromCart = async (itemId: string): Promise<void> => {
    if (!user) throw new Error("User must be logged in");

    try {
      await removeFromCartFirebase(user.id, itemId);
      await fetchCart(); // Refresh cart after removing
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    }
  };

  const clearCart = async (): Promise<void> => {
    if (!user) throw new Error("User must be logged in");

    try {
      await clearCartFirebase(user.id);
      await fetchCart(); // Refresh cart after clearing
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    }
  };

  const getItemsCount = (): number => {
    if (!cart) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = (): number => {
    if (!cart) return 0;
    return cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const refreshCart = async (): Promise<void> => {
    await fetchCart();
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getItemsCount,
        getTotalPrice,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
