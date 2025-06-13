import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { COLLECTION } from "@/app/utils/schema/collection.enum";
import { Cart, CartItem } from "@/app/utils/types/cart.tyes";
import { Recipe } from "@/app/utils/types/recipe.type";

export const getCart = async (userId: string): Promise<Cart | null> => {
  try {
    const cartDoc = await getDoc(doc(db, COLLECTION.carts, userId));
    if (cartDoc.exists()) {
      return { ...cartDoc.data(), id: cartDoc.id } as Cart;
    }
    return null;
  } catch (error) {
    console.error("Error getting cart:", error);
    throw error;
  }
};

export const createCart = async (userId: string): Promise<Cart> => {
  try {
    const newCart: Cart = {
      id: userId,
      userId,
      items: [],
    };

    await setDoc(doc(db, COLLECTION.carts, userId), {
      userId,
      items: [],
    });

    return newCart;
  } catch (error) {
    console.error("Error creating cart:", error);
    throw error;
  }
};

export const addToCart = async (
  userId: string,
  recipe: Recipe,
  quantity: number = 1,
  packagingOption?: string
): Promise<void> => {
  try {
    let cart = await getCart(userId);

    if (!cart) {
      cart = await createCart(userId);
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.recipeId === recipe.id.toString()
    );

    const cartItem: CartItem = {
      id: `${recipe.id}_${Date.now()}`,
      recipeId: recipe.id.toString(),
      name: recipe.name,
      price: recipe.price || 0,
      quantity,
      displayMedia: recipe.displayMedia,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      recipe,
    };

    if (existingItemIndex > -1) {
      // Update existing item quantity
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].updatedAt = new Date().toISOString();
    } else {
      // Add new item
      cart.items.push(cartItem);
    }

    await updateDoc(doc(db, COLLECTION.carts, userId), {
      items: cart.items,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

export const updateCartItem = async (
  userId: string,
  itemId: string,
  quantity: number
): Promise<void> => {
  try {
    const cart = await getCart(userId);
    if (!cart) throw new Error("Cart not found");

    const itemIndex = cart.items.findIndex((item) => item.id === itemId);
    if (itemIndex === -1) throw new Error("Item not found in cart");

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].updatedAt = new Date().toISOString();
    }

    await updateDoc(doc(db, COLLECTION.carts, userId), {
      items: cart.items,
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw error;
  }
};

export const removeFromCart = async (
  userId: string,
  itemId: string
): Promise<void> => {
  try {
    const cart = await getCart(userId);
    if (!cart) throw new Error("Cart not found");

    const updatedItems = cart.items.filter((item) => item.id !== itemId);

    await updateDoc(doc(db, COLLECTION.carts, userId), {
      items: updatedItems,
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw error;
  }
};

export const clearCart = async (userId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, COLLECTION.carts, userId), {
      items: [],
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
};

export const getCartItemsCount = async (userId: string): Promise<number> => {
  try {
    const cart = await getCart(userId);
    if (!cart) return 0;

    return cart.items.reduce((total, item) => total + item.quantity, 0);
  } catch (error) {
    console.error("Error getting cart items count:", error);
    return 0;
  }
};
