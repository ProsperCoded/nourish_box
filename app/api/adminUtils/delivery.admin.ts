import { adminDb } from '@/app/api/lib/firebase-admin';
import { COLLECTION } from '@/app/utils/schema/collection.enum';
import { Delivery } from '@/app/utils/types/delivery.type';
import { User } from '@/app/utils/types/user.type';

export function hasCompleteDeliveryInfo(user: User | null): boolean {
  if (!user) return false;

  // Check if user has at least one complete address
  return !!(
    user.email &&
    user.phone &&
    user.addresses &&
    user.addresses.length > 0 &&
    user.addresses.some(
      addr => addr.name && addr.street && addr.city && addr.state && addr.lga
    )
  );
}

export async function createDelivery(
  deliveryData: Partial<Delivery>
): Promise<{ id: string }> {
  try {
    const timestamp = new Date().toISOString();

    const delivery: Partial<Delivery> = {
      ...deliveryData,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const deliveryRef = await adminDb
      .collection(COLLECTION.deliveries)
      .add(delivery);

    return { id: deliveryRef.id };
  } catch (error) {
    console.error('Error creating delivery:', error);
    throw new Error('Failed to create delivery document');
  }
}

export async function getDeliveryByTransactionId(
  transactionId: string
): Promise<Delivery | null> {
  try {
    const deliveryQuery = await adminDb
      .collection(COLLECTION.deliveries)
      .where('transactionId', '==', transactionId)
      .limit(1)
      .get();

    if (deliveryQuery.empty) {
      return null;
    }

    const deliveryDoc = deliveryQuery.docs[0];
    return {
      deliveryId: deliveryDoc.id,
      ...deliveryDoc.data(),
    } as Delivery;
  } catch (error) {
    console.error('Error getting delivery by transaction ID:', error);
    throw new Error('Failed to get delivery document');
  }
}

/**
 * Update delivery document
 */
export async function updateDelivery(
  deliveryId: string,
  updateData: Partial<Delivery>
): Promise<void> {
  try {
    const timestamp = new Date().toISOString();

    await adminDb
      .collection(COLLECTION.deliveries)
      .doc(deliveryId)
      .update({
        ...updateData,
        updatedAt: timestamp,
      });
  } catch (error) {
    console.error('Error updating delivery:', error);
    throw new Error('Failed to update delivery document');
  }
}

/**
 * Get delivery by ID
 */
export async function getDeliveryById(
  deliveryId: string
): Promise<Delivery | null> {
  try {
    const deliveryDoc = await adminDb
      .collection(COLLECTION.deliveries)
      .doc(deliveryId)
      .get();

    if (!deliveryDoc.exists) {
      return null;
    }

    return {
      deliveryId: deliveryDoc.id,
      ...deliveryDoc.data(),
    } as Delivery;
  } catch (error) {
    console.error('Error getting delivery by ID:', error);
    throw new Error('Failed to get delivery document');
  }
}
