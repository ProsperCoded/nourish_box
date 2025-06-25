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
import {
  getLocalStorageCart,
  addToLocalStorageCart,
  updateLocalStorageCartItem,
  removeFromLocalStorageCart,
  clearLocalStorageCart,
  convertLocalStorageCartToFirebase,
  getLocalStorageCartItemsCount,
  getLocalStorageCartTotalPrice,
} from "@/app/utils/localStorage/cart.localStorage";
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
    try {
      setLoading(true);

      if (user) {
        // Authenticated user - fetch from Firebase
        const userCart = await getCart(user.id);
        setCart(userCart);
      } else {
        // Guest user - fetch from localStorage
        const localCart = getLocalStorageCart();
        if (localCart) {
          setCart(localCart);
        } else {
          setCart(null);
        }
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  // Function to merge localStorage cart with Firebase cart when user logs in
  const mergeGuestCartWithUserCart = async () => {
    if (!user) return;

    const localCart = getLocalStorageCart();
    if (!localCart || localCart.items.length === 0) return;

    try {
      // Add all guest cart items to Firebase cart
      for (const item of localCart.items) {
        if (item.recipe) {
          await addToCartFirebase(user.id, item.recipe, item.quantity);
        }
      }

      // Clear localStorage cart after successful merge
      clearLocalStorageCart();
    } catch (error) {
      console.error("Error merging guest cart with user cart:", error);
    }
  };

  useEffect(() => {
    const handleCartOnUserChange = async () => {
      if (user) {
        // User just logged in - merge guest cart if exists
        await mergeGuestCartWithUserCart();
      }
      // Fetch cart for both authenticated and guest users
      await fetchCart();
    };

    handleCartOnUserChange();
  }, [user]);

  const addToCart = async (
    recipe: Recipe,
    quantity: number = 1,
    packagingOption?: string
  ): Promise<void> => {
    const tempItemId = `temp_${recipe.id}`;

    try {
      setItemLoading(tempItemId, true);

      if (user) {
        // Authenticated user - save to Firebase
        await addToCartFirebase(user.id, recipe, quantity, packagingOption);
      } else {
        // Guest user - save to localStorage
        addToLocalStorageCart(recipe, quantity, packagingOption);
      }

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
    try {
      setItemLoading(itemId, true);

      if (user) {
        // Authenticated user - update in Firebase
        await updateCartItem(user.id, itemId, quantity);
      } else {
        // Guest user - update in localStorage
        updateLocalStorageCartItem(itemId, quantity);
      }

      await fetchCart(); // Refresh cart after updating
    } catch (error) {
      console.error("Error updating cart item:", error);
      throw error;
    } finally {
      setItemLoading(itemId, false);
    }
  };

  const removeFromCart = async (itemId: string): Promise<void> => {
    try {
      setItemLoading(itemId, true);

      if (user) {
        // Authenticated user - remove from Firebase
        await removeFromCartFirebase(user.id, itemId);
      } else {
        // Guest user - remove from localStorage
        removeFromLocalStorageCart(itemId);
      }

      await fetchCart(); // Refresh cart after removing
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    } finally {
      setItemLoading(itemId, false);
    }
  };

  const clearCart = async (): Promise<void> => {
    try {
      // Set all items as loading when clearing
      const allItemIds = cart?.items.map((item) => item.id) || [];
      allItemIds.forEach((id) => setItemLoading(id, true));

      if (user) {
        // Authenticated user - clear Firebase cart
        await clearCartFirebase(user.id);
      } else {
        // Guest user - clear localStorage cart
        clearLocalStorageCart();
      }

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
    if (cart) {
      return cart.items.reduce((total, item) => total + item.quantity, 0);
    }

    // Fallback to localStorage for immediate access (useful for initial renders)
    if (!user) {
      return getLocalStorageCartItemsCount();
    }

    return 0;
  };

  const getTotalPrice = (): number => {
    if (cart) {
      return cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    }

    // Fallback to localStorage for immediate access (useful for initial renders)
    if (!user) {
      return getLocalStorageCartTotalPrice();
    }

    return 0;
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
