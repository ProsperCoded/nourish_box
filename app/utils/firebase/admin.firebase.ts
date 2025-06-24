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
  startAfter,
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

// Helper function to chunk arrays for Firebase 'in' operator (max 10 items)
const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// Helper function to batch fetch documents using 'in' operator
const batchFetchDocuments = async <T>(
  collectionName: string,
  ids: string[],
  mapKey: keyof T | "id" = "id"
): Promise<Map<string, T>> => {
  if (ids.length === 0) {
    return new Map<string, T>();
  }

  const results = await Promise.all(
    chunkArray(ids, 10).map(async (chunk) => {
      if (chunk.length === 0) return [];
      const queryRef = query(
        collection(db, collectionName),
        where("__name__", "in", chunk)
      );
      const snapshot = await getDocs(queryRef);
      return snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as T)
      );
    })
  );

  const documentsMap = new Map<string, T>();
  results.flat().forEach((doc) => {
    const key = mapKey === "id" ? (doc as any).id : (doc as any)[mapKey];
    documentsMap.set(key, doc);
  });

  return documentsMap;
};

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
 * Get all orders with user, recipe, and delivery information for admin (optimized)
 */
export async function getAllOrdersWithDetails(): Promise<
  (Order & {
    user?: User;
    recipe?: Recipe;
    delivery?: Delivery;
  })[]
> {
  try {
    // 1. Fetch all orders
    const ordersQuery = query(
      collection(db, COLLECTION.orders),
      orderBy("createdAt", "desc")
    );

    const ordersSnapshot = await getDocs(ordersQuery);
    const orders: Order[] = ordersSnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Order)
    );

    if (orders.length === 0) {
      return [];
    }

    // Extract unique IDs for batch fetching
    const userIds = [
      ...new Set(orders.map((order) => order.userId).filter(Boolean)),
    ];
    const recipeIds = [
      ...new Set(orders.map((order) => order.recipeId).filter(Boolean)),
    ];
    const deliveryIds = [
      ...new Set(orders.map((order) => order.deliveryId).filter(Boolean)),
    ];

    // Helper function to chunk arrays for Firebase 'in' operator (max 10 items)
    const chunkArray = <T>(array: T[], size: number): T[][] => {
      const chunks: T[][] = [];
      for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
      }
      return chunks;
    };

    // 2. Batch fetch users, recipes, and deliveries
    const [usersMap, recipesMap, deliveriesMap] = await Promise.all([
      // Fetch users
      Promise.all(
        chunkArray(userIds, 10).map(async (chunk) => {
          if (chunk.length === 0) return [];
          const usersQuery = query(
            collection(db, COLLECTION.users),
            where("__name__", "in", chunk)
          );
          const snapshot = await getDocs(usersQuery);
          return snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as User)
          );
        })
      ).then((results) => {
        const usersMap = new Map<string, User>();
        results.flat().forEach((user) => usersMap.set(user.id, user));
        return usersMap;
      }),

      // Fetch recipes
      Promise.all(
        chunkArray(recipeIds, 10).map(async (chunk) => {
          if (chunk.length === 0) return [];
          const recipesQuery = query(
            collection(db, COLLECTION.recipes),
            where("__name__", "in", chunk)
          );
          const snapshot = await getDocs(recipesQuery);
          return snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as Recipe)
          );
        })
      ).then((results) => {
        const recipesMap = new Map<string, Recipe>();
        results.flat().forEach((recipe) => recipesMap.set(recipe.id, recipe));
        return recipesMap;
      }),

      // Fetch deliveries
      Promise.all(
        chunkArray(deliveryIds, 10).map(async (chunk) => {
          if (chunk.length === 0) return [];
          const deliveriesQuery = query(
            collection(db, COLLECTION.deliveries),
            where("__name__", "in", chunk)
          );
          const snapshot = await getDocs(deliveriesQuery);
          return snapshot.docs.map(
            (doc) => ({ deliveryId: doc.id, ...doc.data() } as Delivery)
          );
        })
      ).then((results) => {
        const deliveriesMap = new Map<string, Delivery>();
        results
          .flat()
          .forEach((delivery) =>
            deliveriesMap.set(delivery.deliveryId!, delivery)
          );
        return deliveriesMap;
      }),
    ]);

    // 3. Combine data
    const ordersWithDetails = orders.map((order) => ({
      ...order,
      user: order.userId ? usersMap.get(order.userId) : undefined,
      recipe: recipesMap.get(order.recipeId),
      delivery: deliveriesMap.get(order.deliveryId),
    }));

    return ordersWithDetails;
  } catch (error) {
    console.error("Error fetching orders with details:", error);
    throw new Error("Failed to fetch orders with details");
  }
}

/**
 * Get paginated orders with user, recipe, and delivery information for admin (optimized)
 */
export async function getPaginatedOrdersWithDetails(
  pageSize: number = 5,
  lastOrderId?: string
): Promise<{
  orders: (Order & {
    user?: User;
    recipe?: Recipe;
    delivery?: Delivery;
  })[];
  hasMore: boolean;
  lastOrderId?: string;
}> {
  try {
    // 1. Fetch paginated orders
    let ordersQuery = query(
      collection(db, COLLECTION.orders),
      orderBy("createdAt", "desc"),
      limit(pageSize + 1) // Fetch one extra to check if there are more
    );

    // If lastOrderId is provided, start after that document
    if (lastOrderId) {
      const lastOrderDoc = await getDoc(
        doc(db, COLLECTION.orders, lastOrderId)
      );
      if (lastOrderDoc.exists()) {
        ordersQuery = query(
          collection(db, COLLECTION.orders),
          orderBy("createdAt", "desc"),
          startAfter(lastOrderDoc),
          limit(pageSize + 1)
        );
      }
    }

    const ordersSnapshot = await getDocs(ordersQuery);
    const docs = ordersSnapshot.docs;

    // Check if there are more orders
    const hasMore = docs.length > pageSize;
    const ordersToProcess = hasMore ? docs.slice(0, pageSize) : docs;

    const orders: Order[] = ordersToProcess.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Order)
    );

    if (orders.length === 0) {
      return { orders: [], hasMore: false };
    }

    // Extract unique IDs for batch fetching
    const userIds = [
      ...new Set(orders.map((order) => order.userId).filter(Boolean)),
    ];
    const recipeIds = [
      ...new Set(orders.map((order) => order.recipeId).filter(Boolean)),
    ];
    const deliveryIds = [
      ...new Set(orders.map((order) => order.deliveryId).filter(Boolean)),
    ];

    // Helper function to chunk arrays for Firebase 'in' operator (max 10 items)
    const chunkArray = <T>(array: T[], size: number): T[][] => {
      const chunks: T[][] = [];
      for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
      }
      return chunks;
    };

    // 2. Batch fetch users, recipes, and deliveries
    const [usersMap, recipesMap, deliveriesMap] = await Promise.all([
      // Fetch users
      Promise.all(
        chunkArray(userIds, 10).map(async (chunk) => {
          if (chunk.length === 0) return [];
          const usersQuery = query(
            collection(db, COLLECTION.users),
            where("__name__", "in", chunk)
          );
          const snapshot = await getDocs(usersQuery);
          return snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as User)
          );
        })
      ).then((results) => {
        const usersMap = new Map<string, User>();
        results.flat().forEach((user) => usersMap.set(user.id, user));
        return usersMap;
      }),

      // Fetch recipes
      Promise.all(
        chunkArray(recipeIds, 10).map(async (chunk) => {
          if (chunk.length === 0) return [];
          const recipesQuery = query(
            collection(db, COLLECTION.recipes),
            where("__name__", "in", chunk)
          );
          const snapshot = await getDocs(recipesQuery);
          return snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as Recipe)
          );
        })
      ).then((results) => {
        const recipesMap = new Map<string, Recipe>();
        results.flat().forEach((recipe) => recipesMap.set(recipe.id, recipe));
        return recipesMap;
      }),

      // Fetch deliveries
      Promise.all(
        chunkArray(deliveryIds, 10).map(async (chunk) => {
          if (chunk.length === 0) return [];
          const deliveriesQuery = query(
            collection(db, COLLECTION.deliveries),
            where("__name__", "in", chunk)
          );
          const snapshot = await getDocs(deliveriesQuery);
          return snapshot.docs.map(
            (doc) => ({ deliveryId: doc.id, ...doc.data() } as Delivery)
          );
        })
      ).then((results) => {
        const deliveriesMap = new Map<string, Delivery>();
        results
          .flat()
          .forEach((delivery) =>
            deliveriesMap.set(delivery.deliveryId!, delivery)
          );
        return deliveriesMap;
      }),
    ]);

    // 3. Combine data
    const ordersWithDetails = orders.map((order) => ({
      ...order,
      user: order.userId ? usersMap.get(order.userId) : undefined,
      recipe: recipesMap.get(order.recipeId),
      delivery: deliveriesMap.get(order.deliveryId),
    }));

    return {
      orders: ordersWithDetails,
      hasMore,
      lastOrderId:
        ordersWithDetails.length > 0
          ? ordersWithDetails[ordersWithDetails.length - 1].id
          : undefined,
    };
  } catch (error) {
    console.error("Error fetching paginated orders with details:", error);
    throw new Error("Failed to fetch paginated orders with details");
  }
}

/**
 * Get total count of orders for pagination
 */
export async function getTotalOrdersCount(): Promise<number> {
  try {
    const ordersSnapshot = await getDocs(collection(db, COLLECTION.orders));
    return ordersSnapshot.size;
  } catch (error) {
    console.error("Error getting total orders count:", error);
    return 0;
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
 * Get recent orders for admin dashboard (last 5) - basic order info only (optimized)
 */
export async function getRecentOrders(): Promise<Order[]> {
  try {
    const recentOrdersQuery = query(
      collection(db, COLLECTION.orders),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const ordersSnapshot = await getDocs(recentOrdersQuery);
    const orders: Order[] = ordersSnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Order)
    );

    if (orders.length === 0) {
      return [];
    }

    return orders;
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    return [];
  }
}
