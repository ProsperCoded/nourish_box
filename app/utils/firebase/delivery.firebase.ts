import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { COLLECTION } from "@/app/utils/schema/collection.enum";
import { Delivery } from "@/app/utils/types/delivery.type";

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
 * Get delivery information by transaction ID
 */
export async function getDeliveryByTransactionId(
  transactionId: string
): Promise<Delivery | null> {
  try {
    const deliveriesRef = collection(db, COLLECTION.deliveries);
    const q = query(deliveriesRef, where("transactionId", "==", transactionId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const deliveryDoc = querySnapshot.docs[0];
    return { deliveryId: deliveryDoc.id, ...deliveryDoc.data() } as Delivery;
  } catch (error) {
    console.error("Error fetching delivery by transaction ID:", error);
    return null;
  }
}

/**
 * Get multiple deliveries by their IDs
 */
export async function getDeliveriesByIds(
  deliveryIds: string[]
): Promise<Delivery[]> {
  try {
    const deliveries: Delivery[] = [];

    for (const deliveryId of deliveryIds) {
      const delivery = await getDeliveryById(deliveryId);
      if (delivery) {
        deliveries.push(delivery);
      }
    }

    return deliveries;
  } catch (error) {
    console.error("Error fetching deliveries by IDs:", error);
    return [];
  }
}
