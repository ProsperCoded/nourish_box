import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  DocumentSnapshot,
  QuerySnapshot,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { COLLECTION } from "@/app/utils/schema/collection.enum";
import { Order } from "@/app/utils/types/order.type";
import { Recipe } from "@/app/utils/types/recipe.type";
import { Delivery } from "@/app/utils/types/delivery.type";

/**
 * Get all orders for a specific user
 */
export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const ordersRef = collection(db, COLLECTION.orders);
    const q = query(
      ordersRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];

    for (const doc of querySnapshot.docs) {
      const orderData = { id: doc.id, ...doc.data() } as Order;

      // Fetch recipe data if recipeId exists
      if (orderData.recipeId) {
        const recipe = await getRecipeById(orderData.recipeId);
        if (recipe) {
          orderData.recipe = recipe;
        }
      }

      orders.push(orderData);
    }

    return orders;
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw new Error("Failed to fetch orders");
  }
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const orderRef = doc(db, COLLECTION.orders, orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return null;
    }

    const orderData = { id: orderSnap.id, ...orderSnap.data() } as Order;

    // Fetch recipe data if recipeId exists
    if (orderData.recipeId) {
      const recipe = await getRecipeById(orderData.recipeId);
      if (recipe) {
        orderData.recipe = recipe;
      }
    }

    return orderData;
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    throw new Error("Failed to fetch order");
  }
}

/**
 * Get recipe by ID
 */
async function getRecipeById(recipeId: string): Promise<Recipe | null> {
  try {
    const recipeRef = doc(db, COLLECTION.recipes, recipeId);
    const recipeSnap = await getDoc(recipeRef);

    if (!recipeSnap.exists()) {
      return null;
    }

    return { id: recipeSnap.id, ...recipeSnap.data() } as Recipe;
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return null;
  }
}

/**
 * Get delivery information by delivery ID
 */
export async function getDeliveryById(
  deliveryId: string
): Promise<Delivery | null> {
  try {
    const deliveryRef = doc(db, COLLECTION.deliveries, deliveryId);
    const deliverySnap = await getDoc(deliveryRef);

    if (!deliverySnap.exists()) {
      return null;
    }

    return { deliveryId: deliverySnap.id, ...deliverySnap.data() } as Delivery;
  } catch (error) {
    console.error("Error fetching delivery:", error);
    return null;
  }
}

/**
 * Get order with delivery information
 */
export async function getOrderWithDelivery(
  orderId: string
): Promise<(Order & { delivery?: Delivery }) | null> {
  try {
    const order = await getOrderById(orderId);
    if (!order) return null;

    if (order.deliveryId) {
      const delivery = await getDeliveryById(order.deliveryId);
      return { ...order, delivery: delivery || undefined };
    }

    return order;
  } catch (error) {
    console.error("Error fetching order with delivery:", error);
    throw new Error("Failed to fetch order with delivery information");
  }
}

/**
 * Get all orders for a user with delivery information
 */
export async function getUserOrdersWithDelivery(
  userId: string
): Promise<(Order & { delivery?: Delivery })[]> {
  try {
    const orders = await getUserOrders(userId);
    const ordersWithDelivery: (Order & { delivery?: Delivery })[] = [];

    for (const order of orders) {
      if (order.deliveryId) {
        const delivery = await getDeliveryById(order.deliveryId);
        ordersWithDelivery.push({ ...order, delivery: delivery || undefined });
      } else {
        ordersWithDelivery.push(order);
      }
    }

    return ordersWithDelivery;
  } catch (error) {
    console.error("Error fetching user orders with delivery:", error);
    throw new Error("Failed to fetch orders with delivery information");
  }
}
