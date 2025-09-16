import { adminDb } from '@/app/api/lib/firebase-admin';
import { COLLECTION } from '@/app/utils/schema/collection.enum';
import { Delivery } from '@/app/utils/types/delivery.type';
import { DeliveryStatus, Order } from '@/app/utils/types/order.type';
import { Recipe } from '@/app/utils/types/recipe.type';
import { User } from '@/app/utils/types/user.type';

/**
 * Create a new order/Orders document
 */
export async function createOrder(
  orderData: Partial<Order>
): Promise<{ id: string }> {
  try {
    const timestamp = new Date().toISOString();

    const order: Partial<Order> = {
      ...orderData,
      deliveryStatus: orderData.deliveryStatus || DeliveryStatus.PENDING,
      deliveryDurationRange: orderData.deliveryDurationRange || '2-3 days',
      deliveryDate: orderData.deliveryDate || '', // Will be set when delivered
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const orderRef = await adminDb.collection(COLLECTION.orders).add(order);

    return { id: orderRef.id };
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Failed to create order document');
  }
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const orderDoc = await adminDb
      .collection(COLLECTION.orders)
      .doc(orderId)
      .get();

    if (!orderDoc.exists) {
      return null;
    }

    return {
      id: orderDoc.id,
      ...orderDoc.data(),
    } as Order;
  } catch (error) {
    console.error('Error getting order by ID:', error);
    throw new Error('Failed to get order document');
  }
}

/**
 * Update order document
 */
export async function updateOrder(
  orderId: string,
  updateData: Partial<Order>
): Promise<void> {
  try {
    const timestamp = new Date().toISOString();

    await adminDb
      .collection(COLLECTION.orders)
      .doc(orderId)
      .update({
        ...updateData,
        updatedAt: timestamp,
      });
  } catch (error) {
    console.error('Error updating order:', error);
    throw new Error('Failed to update order document');
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
    const timestamp = new Date().toISOString();
    const updateData: Partial<Order> = {
      deliveryStatus,
      updatedAt: timestamp,
    };

    // Set delivery date if status is delivered
    if (deliveryStatus === DeliveryStatus.DELIVERED) {
      updateData.deliveryDate = timestamp;
    }

    await adminDb.collection(COLLECTION.orders).doc(orderId).update(updateData);
  } catch (error) {
    console.error('Error updating order delivery status:', error);
    throw new Error('Failed to update order delivery status');
  }
}

/**
 * Get orders by transaction ID
 */
export async function getOrdersByTransactionId(
  transactionId: string
): Promise<Order[]> {
  try {
    const ordersQuery = await adminDb
      .collection(COLLECTION.orders)
      .where('transactionId', '==', transactionId)
      .get();

    return ordersQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];
  } catch (error) {
    console.error('Error getting orders by transaction ID:', error);
    throw new Error('Failed to get orders by transaction ID');
  }
}

/**
 * Get orders by user ID
 */
export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  try {
    const ordersQuery = await adminDb
      .collection(COLLECTION.orders)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    return ordersQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];
  } catch (error) {
    console.error('Error getting orders by user ID:', error);
    throw new Error('Failed to get orders by user ID');
  }
}

/**
 * Get all orders with user, recipe, and delivery details (Admin SDK)
 */
export async function getAllOrdersWithDetails(): Promise<
  (Order & {
    user?: User;
    recipes?: Recipe[];
    delivery?: Delivery;
  })[]
> {
  try {
    // 1. Fetch all orders
    const ordersSnapshot = await adminDb
      .collection(COLLECTION.orders)
      .orderBy('createdAt', 'desc')
      .get();

    const orders: Order[] = ordersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];

    if (orders.length === 0) {
      return [];
    }

    // Extract unique IDs for batch fetching
    const userIds = [
      ...new Set(orders.map(order => order.userId).filter(Boolean)),
    ];
    const allRecipeIds = orders.flatMap(order => order.recipeIds || []);
    const recipeIds = [...new Set(allRecipeIds)];
    const deliveryIds = [
      ...new Set(orders.map(order => order.deliveryId).filter(Boolean)),
    ];

    // 2. Batch fetch users, recipes, and deliveries
    const [usersMap, recipesMap, deliveriesMap] = await Promise.all([
      // Fetch users
      Promise.resolve().then(async () => {
        const usersMap = new Map<string, User>();
        if (userIds.length > 0) {
          const usersSnapshot = await adminDb
            .collection(COLLECTION.users)
            .get();
          usersSnapshot.docs.forEach(doc => {
            const user = { id: doc.id, ...doc.data() } as User;
            if (userIds.includes(user.id)) {
              usersMap.set(user.id, user);
            }
          });
        }
        return usersMap;
      }),

      // Fetch recipes
      Promise.resolve().then(async () => {
        const recipesMap = new Map<string, Recipe>();
        if (recipeIds.length > 0) {
          const recipesSnapshot = await adminDb
            .collection(COLLECTION.recipes)
            .get();
          recipesSnapshot.docs.forEach(doc => {
            const recipe = { id: doc.id, ...doc.data() } as Recipe;
            if (recipeIds.includes(recipe.id)) {
              recipesMap.set(recipe.id, recipe);
            }
          });
        }
        return recipesMap;
      }),

      // Fetch deliveries
      Promise.resolve().then(async () => {
        const deliveriesMap = new Map<string, Delivery>();
        if (deliveryIds.length > 0) {
          const deliveriesSnapshot = await adminDb
            .collection(COLLECTION.deliveries)
            .get();
          deliveriesSnapshot.docs.forEach(doc => {
            const delivery = { deliveryId: doc.id, ...doc.data() } as Delivery;
            if (deliveryIds.includes(delivery.deliveryId!)) {
              deliveriesMap.set(delivery.deliveryId!, delivery);
            }
          });
        }
        return deliveriesMap;
      }),
    ]);

    // 3. Combine data
    const ordersWithDetails = orders.map(order => ({
      ...order,
      user: order.userId ? usersMap.get(order.userId) : undefined,
      recipes:
        order.recipeIds
          ?.map(id => recipesMap.get(id))
          .filter((recipe): recipe is Recipe => recipe !== undefined) || [],
      delivery: deliveriesMap.get(order.deliveryId),
    }));

    return ordersWithDetails;
  } catch (error) {
    console.error('Error fetching orders with details:', error);
    throw new Error('Failed to fetch orders with details');
  }
}

/**
 * Get order with details by ID (Admin SDK)
 */
export async function getOrderWithDetailsById(orderId: string): Promise<
  | (Order & {
      user?: User;
      recipes?: Recipe[];
      delivery?: Delivery;
    })
  | null
> {
  try {
    // 1. Fetch the order
    const orderDoc = await adminDb
      .collection(COLLECTION.orders)
      .doc(orderId)
      .get();

    if (!orderDoc.exists) {
      return null;
    }

    const order: Order = {
      id: orderDoc.id,
      ...orderDoc.data(),
    } as Order;

    // 2. Fetch related data
    const [user, recipes, delivery] = await Promise.all([
      // Fetch user
      order.userId
        ? adminDb
            .collection(COLLECTION.users)
            .doc(order.userId)
            .get()
            .then(doc =>
              doc.exists ? ({ id: doc.id, ...doc.data() } as User) : undefined
            )
        : Promise.resolve(undefined),

      // Fetch recipes
      Promise.all(
        (order.recipeIds || []).map(async recipeId => {
          const recipeDoc = await adminDb
            .collection(COLLECTION.recipes)
            .doc(recipeId)
            .get();
          return recipeDoc.exists
            ? ({ id: recipeDoc.id, ...recipeDoc.data() } as Recipe)
            : null;
        })
      ).then(results =>
        results.filter((recipe): recipe is Recipe => recipe !== null)
      ),

      // Fetch delivery
      adminDb
        .collection(COLLECTION.deliveries)
        .doc(order.deliveryId)
        .get()
        .then(doc =>
          doc.exists
            ? ({ deliveryId: doc.id, ...doc.data() } as Delivery)
            : undefined
        ),
    ]);

    return {
      ...order,
      user,
      recipes,
      delivery,
    };
  } catch (error) {
    console.error('Error fetching order with details by ID:', error);
    throw new Error('Failed to fetch order with details');
  }
}
