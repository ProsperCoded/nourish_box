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
  limit,
  startAfter,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { COLLECTION } from '@/app/utils/schema/collection.enum';
import { Order } from '@/app/utils/types/order.type';
import { Recipe } from '@/app/utils/types/recipe.type';
import { Delivery } from '@/app/utils/types/delivery.type';

// Helper function to chunk arrays for Firebase 'in' operator (max 10 items)
const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Get all orders for a specific user (DEPRECATED - use getPaginatedUserOrdersWithDetails instead)
 */
export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const ordersRef = collection(db, COLLECTION.orders);
    const q = query(
      ordersRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];

    for (const doc of querySnapshot.docs) {
      const orderData = { id: doc.id, ...doc.data() } as Order;

      // Fetch recipes data if recipeIds exist
      if (orderData.recipeIds && orderData.recipeIds.length > 0) {
        const recipes = await getRecipesByIds(orderData.recipeIds);
        orderData.recipes = recipes;
      }

      orders.push(orderData);
    }

    return orders;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw new Error('Failed to fetch orders');
  }
}

/**
 * Get paginated orders with recipe and delivery information for a specific user (optimized)
 */
export async function getPaginatedUserOrdersWithDetails(
  userId: string,
  pageSize: number = 5,
  lastOrderId?: string
): Promise<{
  orders: (Order & {
    recipes?: Recipe[];
    delivery?: Delivery;
  })[];
  hasMore: boolean;
  lastOrderId?: string;
}> {
  try {
    // 1. Fetch paginated orders for the user
    let ordersQuery = query(
      collection(db, COLLECTION.orders),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
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
          where('userId', '==', userId),
          orderBy('createdAt', 'desc'),
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
      doc => ({ id: doc.id, ...doc.data() }) as Order
    );

    if (orders.length === 0) {
      return { orders: [], hasMore: false };
    }

    // Extract unique IDs for batch fetching
    const allRecipeIds = orders.flatMap(order => order.recipeIds || []);
    const recipeIds = [...new Set(allRecipeIds)];
    const deliveryIds = [
      ...new Set(orders.map(order => order.deliveryId).filter(Boolean)),
    ];

    // 2. Batch fetch recipes and deliveries
    const [recipesMap, deliveriesMap] = await Promise.all([
      // Fetch recipes
      Promise.all(
        chunkArray(recipeIds, 10).map(async chunk => {
          if (chunk.length === 0) return [];
          const recipesQuery = query(
            collection(db, COLLECTION.recipes),
            where('__name__', 'in', chunk)
          );
          const snapshot = await getDocs(recipesQuery);
          return snapshot.docs.map(
            doc => ({ id: doc.id, ...doc.data() }) as Recipe
          );
        })
      ).then(results => {
        const recipesMap = new Map<string, Recipe>();
        results.flat().forEach(recipe => recipesMap.set(recipe.id, recipe));
        return recipesMap;
      }),

      // Fetch deliveries
      Promise.all(
        chunkArray(deliveryIds, 10).map(async chunk => {
          if (chunk.length === 0) return [];
          const deliveriesQuery = query(
            collection(db, COLLECTION.deliveries),
            where('__name__', 'in', chunk)
          );
          const snapshot = await getDocs(deliveriesQuery);
          return snapshot.docs.map(
            doc => ({ deliveryId: doc.id, ...doc.data() }) as Delivery
          );
        })
      ).then(results => {
        const deliveriesMap = new Map<string, Delivery>();
        results
          .flat()
          .forEach(delivery =>
            deliveriesMap.set(delivery.deliveryId!, delivery)
          );
        return deliveriesMap;
      }),
    ]);

    // 3. Combine data
    const ordersWithDetails = orders.map(order => ({
      ...order,
      recipes:
        order.recipeIds
          ?.map(id => recipesMap.get(id))
          .filter((recipe): recipe is Recipe => recipe !== undefined) || [],
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
    console.error('Error fetching paginated user orders with details:', error);
    throw new Error('Failed to fetch paginated user orders with details');
  }
}

/**
 * Get all orders for a specific user with details (optimized batch fetching)
 */
export async function getUserOrdersWithDetails(userId: string): Promise<
  (Order & {
    recipes?: Recipe[];
    delivery?: Delivery;
  })[]
> {
  try {
    // 1. Fetch all orders for the user
    const ordersQuery = query(
      collection(db, COLLECTION.orders),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const ordersSnapshot = await getDocs(ordersQuery);
    const orders: Order[] = ordersSnapshot.docs.map(
      doc => ({ id: doc.id, ...doc.data() }) as Order
    );

    if (orders.length === 0) {
      return [];
    }

    // Extract unique IDs for batch fetching
    const allRecipeIds = orders.flatMap(order => order.recipeIds || []);
    const recipeIds = [...new Set(allRecipeIds)];
    const deliveryIds = [
      ...new Set(orders.map(order => order.deliveryId).filter(Boolean)),
    ];

    // 2. Batch fetch recipes and deliveries
    const [recipesMap, deliveriesMap] = await Promise.all([
      // Fetch recipes
      Promise.all(
        chunkArray(recipeIds, 10).map(async chunk => {
          if (chunk.length === 0) return [];
          const recipesQuery = query(
            collection(db, COLLECTION.recipes),
            where('__name__', 'in', chunk)
          );
          const snapshot = await getDocs(recipesQuery);
          return snapshot.docs.map(
            doc => ({ id: doc.id, ...doc.data() }) as Recipe
          );
        })
      ).then(results => {
        const recipesMap = new Map<string, Recipe>();
        results.flat().forEach(recipe => recipesMap.set(recipe.id, recipe));
        return recipesMap;
      }),

      // Fetch deliveries
      Promise.all(
        chunkArray(deliveryIds, 10).map(async chunk => {
          if (chunk.length === 0) return [];
          const deliveriesQuery = query(
            collection(db, COLLECTION.deliveries),
            where('__name__', 'in', chunk)
          );
          const snapshot = await getDocs(deliveriesQuery);
          return snapshot.docs.map(
            doc => ({ deliveryId: doc.id, ...doc.data() }) as Delivery
          );
        })
      ).then(results => {
        const deliveriesMap = new Map<string, Delivery>();
        results
          .flat()
          .forEach(delivery =>
            deliveriesMap.set(delivery.deliveryId!, delivery)
          );
        return deliveriesMap;
      }),
    ]);

    // 3. Combine data
    const ordersWithDetails = orders.map(order => ({
      ...order,
      recipes:
        order.recipeIds
          ?.map(id => recipesMap.get(id))
          .filter((recipe): recipe is Recipe => recipe !== undefined) || [],
      delivery: deliveriesMap.get(order.deliveryId),
    }));

    return ordersWithDetails;
  } catch (error) {
    console.error('Error fetching user orders with details:', error);
    throw new Error('Failed to fetch user orders with details');
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

    // Fetch recipes data if recipeIds exist
    if (orderData.recipeIds && orderData.recipeIds.length > 0) {
      const recipes = await getRecipesByIds(orderData.recipeIds);
      orderData.recipes = recipes;
    }

    return orderData;
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    throw new Error('Failed to fetch order');
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
    console.error('Error fetching recipe:', error);
    return null;
  }
}

/**
 * Get multiple recipes by IDs
 */
async function getRecipesByIds(recipeIds: string[]): Promise<Recipe[]> {
  try {
    if (recipeIds.length === 0) return [];

    const recipes: Recipe[] = [];
    const chunks = chunkArray(recipeIds, 10);

    for (const chunk of chunks) {
      const recipesQuery = query(
        collection(db, COLLECTION.recipes),
        where('__name__', 'in', chunk)
      );
      const snapshot = await getDocs(recipesQuery);
      const chunkRecipes = snapshot.docs.map(
        doc => ({ id: doc.id, ...doc.data() }) as Recipe
      );
      recipes.push(...chunkRecipes);
    }

    return recipes;
  } catch (error) {
    console.error('Error fetching recipes by IDs:', error);
    return [];
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
    console.error('Error fetching delivery:', error);
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
    console.error('Error fetching order with delivery:', error);
    throw new Error('Failed to fetch order with delivery information');
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
    console.error('Error fetching user orders with delivery:', error);
    throw new Error('Failed to fetch orders with delivery information');
  }
}
