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
  loadingItems: Set<string>; // Track which items are currently loading
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
  isItemLoading: (itemId: string) => boolean;
}

const CartContext = createContext<CartContextType>({
  cart: null,
  loading: true,
  loadingItems: new Set(),
  addToCart: async () => {},
  updateQuantity: async () => {},
  removeFromCart: async () => {},
  clearCart: async () => {},
  getItemsCount: () => 0,
  getTotalPrice: () => 0,
  refreshCart: async () => {},
  isItemLoading: () => false,
});

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  const setItemLoading = (itemId: string, isLoading: boolean) => {
    setLoadingItems((prev) => {
      const newSet = new Set(prev);
      if (isLoading) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  };

  const isItemLoading = (itemId: string): boolean => {
    return loadingItems.has(itemId);
  };

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

    const tempItemId = `temp_${recipe.id}`;
    try {
      setItemLoading(tempItemId, true);
      await addToCartFirebase(user.id, recipe, quantity, packagingOption);
      await fetchCart(); // Refresh cart after adding
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    } finally {
      setItemLoading(tempItemId, false);
    }
  };

  const updateQuantity = async (
    itemId: string,
    quantity: number
  ): Promise<void> => {
    if (!user) throw new Error("User must be logged in");

    try {
      setItemLoading(itemId, true);
      await updateCartItem(user.id, itemId, quantity);
      await fetchCart(); // Refresh cart after updating
    } catch (error) {
      console.error("Error updating cart item:", error);
      throw error;
    } finally {
      setItemLoading(itemId, false);
    }
  };

  const removeFromCart = async (itemId: string): Promise<void> => {
    if (!user) throw new Error("User must be logged in");

    try {
      setItemLoading(itemId, true);
      await removeFromCartFirebase(user.id, itemId);
      await fetchCart(); // Refresh cart after removing
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    } finally {
      setItemLoading(itemId, false);
    }
  };

  const clearCart = async (): Promise<void> => {
    if (!user) throw new Error("User must be logged in");

    try {
      // Set all items as loading when clearing
      const allItemIds = cart?.items.map((item) => item.id) || [];
      allItemIds.forEach((id) => setItemLoading(id, true));

      await clearCartFirebase(user.id);
      await fetchCart(); // Refresh cart after clearing
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    } finally {
      // Clear all loading states
      setLoadingItems(new Set());
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
        loadingItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getItemsCount,
        getTotalPrice,
        refreshCart,
        isItemLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
