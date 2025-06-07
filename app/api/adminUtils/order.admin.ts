import { adminDb } from "@/app/api/lib/firebase-admin";
import { Order, DeliveryStatus } from "@/app/utils/types/order.type";
import { COLLECTION } from "@/app/utils/schema/collection.enum";

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
      deliveryDurationRange: orderData.deliveryDurationRange || "2-3 days",
      deliveryDate: orderData.deliveryDate || "", // Will be set when delivered
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const orderRef = await adminDb.collection(COLLECTION.orders).add(order);

    return { id: orderRef.id };
  } catch (error) {
    console.error("Error creating order:", error);
    throw new Error("Failed to create order document");
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
    console.error("Error getting order by ID:", error);
    throw new Error("Failed to get order document");
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
    console.error("Error updating order:", error);
    throw new Error("Failed to update order document");
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
      .where("transactionId", "==", transactionId)
      .get();

    return ordersQuery.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];
  } catch (error) {
    console.error("Error getting orders by transaction ID:", error);
    throw new Error("Failed to get orders by transaction ID");
  }
}

/**
 * Get orders by user ID
 */
export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  try {
    const ordersQuery = await adminDb
      .collection(COLLECTION.orders)
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    return ordersQuery.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];
  } catch (error) {
    console.error("Error getting orders by user ID:", error);
    throw new Error("Failed to get orders by user ID");
  }
}
