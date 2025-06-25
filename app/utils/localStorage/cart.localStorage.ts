import { Cart, CartItem } from "@/app/utils/types/cart.tyes";
import { Recipe } from "@/app/utils/types/recipe.type";

const CART_STORAGE_KEY = "guest_cart";

// Get cart from localStorage
export const getLocalStorageCart = (): Cart | null => {
  if (typeof window === "undefined") return null;

  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    if (!cartData) return null;

    return JSON.parse(cartData);
  } catch (error) {
    console.error("Error parsing cart from localStorage:", error);
    return null;
  }
};

// Save cart to localStorage
export const saveLocalStorageCart = (cart: Cart): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
  }
};

// Add item to localStorage cart
export const addToLocalStorageCart = (
  recipe: Recipe,
  quantity: number = 1,
  packagingOption?: string
): Cart => {
  let currentCart = getLocalStorageCart();
  const now = new Date().toISOString();

  // Create cart if it doesn't exist
  if (!currentCart) {
    currentCart = {
      id: "guest_cart",
      userId: "guest",
      items: [],
    };
  }

  const existingItemIndex = currentCart.items.findIndex(
    (item) => item.recipeId === recipe.id.toString()
  );

  const cartItem: CartItem = {
    id: `${recipe.id}_${Date.now()}`,
    recipeId: recipe.id.toString(),
    name: recipe.name,
    price: recipe.price || 0,
    quantity,
    displayMedia: recipe.displayMedia,
    createdAt: now,
    updatedAt: now,
    recipe,
  };

  if (existingItemIndex > -1) {
    // Update existing item quantity
    currentCart.items[existingItemIndex].quantity += quantity;
    currentCart.items[existingItemIndex].updatedAt = now;
  } else {
    // Add new item
    currentCart.items.push(cartItem);
  }

  saveLocalStorageCart(currentCart);
  return currentCart;
};

// Update item quantity in localStorage cart
export const updateLocalStorageCartItem = (
  itemId: string,
  quantity: number
): Cart | null => {
  const currentCart = getLocalStorageCart();
  if (!currentCart) return null;

  const itemIndex = currentCart.items.findIndex((item) => item.id === itemId);
  if (itemIndex === -1) return currentCart;

  if (quantity <= 0) {
    // Remove item if quantity is 0 or less
    currentCart.items.splice(itemIndex, 1);
  } else {
    // Update quantity
    currentCart.items[itemIndex].quantity = quantity;
    currentCart.items[itemIndex].updatedAt = new Date().toISOString();
  }

  saveLocalStorageCart(currentCart);
  return currentCart;
};

// Remove item from localStorage cart
export const removeFromLocalStorageCart = (itemId: string): Cart | null => {
  const currentCart = getLocalStorageCart();
  if (!currentCart) return null;

  const updatedItems = currentCart.items.filter((item) => item.id !== itemId);
  currentCart.items = updatedItems;

  if (updatedItems.length === 0) {
    // Clear cart if no items left
    clearLocalStorageCart();
    return null;
  }

  saveLocalStorageCart(currentCart);
  return currentCart;
};

// Clear localStorage cart
export const clearLocalStorageCart = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_STORAGE_KEY);
};

// Convert localStorage cart to Firebase cart format (no conversion needed now)
export const convertLocalStorageCartToFirebase = (localCart: Cart): Cart => {
  return localCart;
};

// Get cart items count from localStorage
export const getLocalStorageCartItemsCount = (): number => {
  const cart = getLocalStorageCart();
  if (!cart) return 0;
  return cart.items.reduce((total, item) => total + item.quantity, 0);
};

// Get total price from localStorage cart
export const getLocalStorageCartTotalPrice = (): number => {
  const cart = getLocalStorageCart();
  if (!cart) return 0;
  return cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
};
