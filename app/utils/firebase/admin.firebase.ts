import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  getCountFromServer,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { COLLECTION } from "@/app/utils/schema/collection.enum";
import { Recipe } from "@/app/utils/types/recipe.type";
import { User } from "@/app/utils/types/user.type";
import {
  Transaction,
  TransactionStatus,
} from "@/app/utils/types/transaction.type";
import { Order, DeliveryStatus } from "@/app/utils/types/order.type";
import { Delivery } from "@/app/utils/types/delivery.type";

export interface DashboardStats {
  totalRecipes: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalFavorites: number;
}

/**
 * Get comprehensive dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Get counts using getCountFromServer for better performance
    const [recipesCount, usersCount, ordersCount, favoritesCount] =
      await Promise.all([
        getCountFromServer(collection(db, COLLECTION.recipes)),
        getCountFromServer(collection(db, COLLECTION.users)),
        getCountFromServer(collection(db, COLLECTION.orders)),
        getCountFromServer(collection(db, COLLECTION.favorites)),
      ]);

    // Get all transactions to calculate total revenue
    const transactionsSnapshot = await getDocs(
      collection(db, COLLECTION.transactions)
    );
    const totalRevenue = transactionsSnapshot.docs.reduce((sum, doc) => {
      const transaction = doc.data() as Transaction;
      if (transaction.status === TransactionStatus.SUCCESS) {
        return sum + (transaction.amount || 0);
      }
      return sum;
    }, 0);

    return {
      totalRecipes: recipesCount.data().count,
      totalUsers: usersCount.data().count,
      totalOrders: ordersCount.data().count,
      totalRevenue,
      totalFavorites: favoritesCount.data().count,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw new Error("Failed to fetch dashboard statistics");
  }
}

/**
 * Get recent recipes (last 5)
 */
export async function getRecentRecipes(): Promise<Recipe[]> {
  try {
    const recentRecipesQuery = query(
      collection(db, COLLECTION.recipes),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const snapshot = await getDocs(recentRecipesQuery);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Recipe)
    );
  } catch (error) {
    console.error("Error fetching recent recipes:", error);
    return [];
  }
}

/**
 * Get recent users (last 5)
 */
export async function getRecentUsers(): Promise<User[]> {
  try {
    const recentUsersQuery = query(
      collection(db, COLLECTION.users),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const snapshot = await getDocs(recentUsersQuery);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as User)
    );
  } catch (error) {
    console.error("Error fetching recent users:", error);
    return [];
  }
}

/**
 * Get recent transactions (last 5)
 */
export async function getRecentTransactions(): Promise<Transaction[]> {
  try {
    const recentTransactionsQuery = query(
      collection(db, COLLECTION.transactions),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const snapshot = await getDocs(recentTransactionsQuery);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Transaction)
    );
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    return [];
  }
}

/**
 * Get top performing recipes (by clicks)
 */
export async function getTopRecipes(): Promise<Recipe[]> {
  try {
    const topRecipesQuery = query(
      collection(db, COLLECTION.recipes),
      orderBy("clicks", "desc"),
      limit(5)
    );

    const snapshot = await getDocs(topRecipesQuery);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Recipe)
    );
  } catch (error) {
    console.error("Error fetching top recipes:", error);
    return [];
  }
}

/**
 * Get all orders with user, recipe, and delivery information for admin
 */
export async function getAllOrdersWithDetails(): Promise<
  (Order & {
    user?: User;
    recipe?: Recipe;
    delivery?: Delivery;
  })[]
> {
  try {
    const ordersQuery = query(
      collection(db, COLLECTION.orders),
      orderBy("createdAt", "desc")
    );

    const ordersSnapshot = await getDocs(ordersQuery);
    const ordersWithDetails = [];

    for (const orderDoc of ordersSnapshot.docs) {
      const orderData = { id: orderDoc.id, ...orderDoc.data() } as Order;

      // Fetch user data
      let userData: User | undefined;
      if (orderData.userId) {
        const userDoc = await getDoc(
          doc(db, COLLECTION.users, orderData.userId)
        );
        if (userDoc.exists()) {
          userData = { id: userDoc.id, ...userDoc.data() } as User;
        }
      }

      // Fetch recipe data
      let recipeData: Recipe | undefined;
      if (orderData.recipeId) {
        const recipeDoc = await getDoc(
          doc(db, COLLECTION.recipes, orderData.recipeId)
        );
        if (recipeDoc.exists()) {
          recipeData = { id: recipeDoc.id, ...recipeDoc.data() } as Recipe;
        }
      }

      // Fetch delivery data
      let deliveryData: Delivery | undefined;
      if (orderData.deliveryId) {
        const deliveryDoc = await getDoc(
          doc(db, COLLECTION.deliveries, orderData.deliveryId)
        );
        if (deliveryDoc.exists()) {
          deliveryData = {
            deliveryId: deliveryDoc.id,
            ...deliveryDoc.data(),
          } as Delivery;
        }
      }

      ordersWithDetails.push({
        ...orderData,
        user: userData,
        recipe: recipeData,
        delivery: deliveryData,
      });
    }

    return ordersWithDetails;
  } catch (error) {
    console.error("Error fetching orders with details:", error);
    throw new Error("Failed to fetch orders with details");
  }
}

/**
 * Update order delivery status
 */
export async function updateOrderDeliveryStatus(
  orderId: string,
  deliveryStatus: DeliveryStatus
): Promise<void> {
  try {
    const orderRef = doc(db, COLLECTION.orders, orderId);
    await updateDoc(orderRef, {
      deliveryStatus,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating order delivery status:", error);
    throw new Error("Failed to update order delivery status");
  }
}

/**
 * Get recent orders for admin dashboard (last 10)
 */
export async function getRecentOrdersWithDetails(): Promise<
  (Order & {
    user?: User;
    recipe?: Recipe;
    delivery?: Delivery;
  })[]
> {
  try {
    const recentOrdersQuery = query(
      collection(db, COLLECTION.orders),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const ordersSnapshot = await getDocs(recentOrdersQuery);
    const ordersWithDetails = [];

    for (const orderDoc of ordersSnapshot.docs) {
      const orderData = { id: orderDoc.id, ...orderDoc.data() } as Order;

      // Fetch user data
      let userData: User | undefined;
      if (orderData.userId) {
        const userDoc = await getDoc(
          doc(db, COLLECTION.users, orderData.userId)
        );
        if (userDoc.exists()) {
          userData = { id: userDoc.id, ...userDoc.data() } as User;
        }
      }

      // Fetch recipe data
      let recipeData: Recipe | undefined;
      if (orderData.recipeId) {
        const recipeDoc = await getDoc(
          doc(db, COLLECTION.recipes, orderData.recipeId)
        );
        if (recipeDoc.exists()) {
          recipeData = { id: recipeDoc.id, ...recipeDoc.data() } as Recipe;
        }
      }

      // Fetch delivery data
      let deliveryData: Delivery | undefined;
      if (orderData.deliveryId) {
        const deliveryDoc = await getDoc(
          doc(db, COLLECTION.deliveries, orderData.deliveryId)
        );
        if (deliveryDoc.exists()) {
          deliveryData = {
            deliveryId: deliveryDoc.id,
            ...deliveryDoc.data(),
          } as Delivery;
        }
      }

      ordersWithDetails.push({
        ...orderData,
        user: userData,
        recipe: recipeData,
        delivery: deliveryData,
      });
    }

    return ordersWithDetails;
  } catch (error) {
    console.error("Error fetching recent orders with details:", error);
    return [];
  }
}
