import { db } from '@/app/lib/firebase';
import { COLLECTION } from '@/app/utils/schema/collection.enum';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export interface DeliveryCosts {
  costs: Record<string, Record<string, number>>;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryCostLocation {
  state: string;
  lga: string;
  cost: number;
}

/**
 * Gets delivery costs from Firebase
 */
export const getDeliveryCosts = async (): Promise<DeliveryCosts | null> => {
  try {
    const docRef = doc(db, COLLECTION.site_content, 'delivery_costs');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as DeliveryCosts;
    }

    return null;
  } catch (error) {
    console.error('Error fetching delivery costs:', error);
    throw new Error('Failed to fetch delivery costs');
  }
};

/**
 * Gets delivery cost for a specific location
 */
export const getDeliveryCostForLocation = async (
  state: string,
  lga: string
): Promise<number | null> => {
  try {
    const deliveryCosts = await getDeliveryCosts();

    if (!deliveryCosts) {
      return null;
    }

    const stateCosts = deliveryCosts.costs[state];
    if (!stateCosts) {
      return null;
    }

    return stateCosts[lga] || null;
  } catch (error) {
    console.error('Error fetching delivery cost for location:', error);
    throw new Error('Failed to fetch delivery cost for location');
  }
};

/**
 * Gets all available states from delivery costs
 */
export const getAvailableStates = async (): Promise<string[]> => {
  try {
    const deliveryCosts = await getDeliveryCosts();

    if (!deliveryCosts) {
      return [];
    }

    return Object.keys(deliveryCosts.costs);
  } catch (error) {
    console.error('Error fetching available states:', error);
    throw new Error('Failed to fetch available states');
  }
};

/**
 * Gets all available LGAs for a specific state
 */
export const getAvailableLGAs = async (state: string): Promise<string[]> => {
  try {
    const deliveryCosts = await getDeliveryCosts();

    if (!deliveryCosts) {
      return [];
    }

    const stateCosts = deliveryCosts.costs[state];
    if (!stateCosts) {
      return [];
    }

    return Object.keys(stateCosts);
  } catch (error) {
    console.error('Error fetching available LGAs:', error);
    throw new Error('Failed to fetch available LGAs');
  }
};

/**
 * Updates delivery cost for a specific location (Admin function)
 */
export const updateDeliveryCost = async (
  state: string,
  lga: string,
  cost: number
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION.site_content, 'delivery_costs');
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Delivery costs document not found');
    }

    const currentData = docSnap.data() as DeliveryCosts;

    // Update the specific location cost
    if (!currentData.costs[state]) {
      currentData.costs[state] = {};
    }

    currentData.costs[state][lga] = cost;

    await updateDoc(docRef, {
      costs: currentData.costs,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating delivery cost:', error);
    throw new Error('Failed to update delivery cost');
  }
};

/**
 * Adds a new location with delivery cost (Admin function)
 */
export const addDeliveryLocation = async (
  state: string,
  lga: string,
  cost: number
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION.site_content, 'delivery_costs');

    let currentData: DeliveryCosts;
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      currentData = docSnap.data() as DeliveryCosts;
    } else {
      // Create new document if it doesn't exist
      currentData = {
        costs: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    // Add the new location
    if (!currentData.costs[state]) {
      currentData.costs[state] = {};
    }

    currentData.costs[state][lga] = cost;

    if (docSnap.exists()) {
      await updateDoc(docRef, {
        costs: currentData.costs,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await setDoc(docRef, currentData);
    }
  } catch (error) {
    console.error('Error adding delivery location:', error);
    throw new Error('Failed to add delivery location');
  }
};

/**
 * Removes a delivery location (Admin function)
 */
export const removeDeliveryLocation = async (
  state: string,
  lga: string
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION.site_content, 'delivery_costs');
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Delivery costs document not found');
    }

    const currentData = docSnap.data() as DeliveryCosts;

    // Remove the specific location
    if (currentData.costs[state] && currentData.costs[state][lga]) {
      delete currentData.costs[state][lga];

      // Remove state if no LGAs left
      if (Object.keys(currentData.costs[state]).length === 0) {
        delete currentData.costs[state];
      }
    }

    await updateDoc(docRef, {
      costs: currentData.costs,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error removing delivery location:', error);
    throw new Error('Failed to remove delivery location');
  }
};

/**
 * Gets all delivery locations in a flattened format (useful for admin)
 */
export const getAllDeliveryLocations = async (): Promise<
  DeliveryCostLocation[]
> => {
  try {
    const deliveryCosts = await getDeliveryCosts();

    if (!deliveryCosts) {
      return [];
    }

    const locations: DeliveryCostLocation[] = [];

    Object.entries(deliveryCosts.costs).forEach(([state, lgas]) => {
      Object.entries(lgas).forEach(([lga, cost]) => {
        locations.push({ state, lga, cost });
      });
    });

    return locations.sort((a, b) => {
      if (a.state !== b.state) {
        return a.state.localeCompare(b.state);
      }
      return a.lga.localeCompare(b.lga);
    });
  } catch (error) {
    console.error('Error fetching all delivery locations:', error);
    throw new Error('Failed to fetch all delivery locations');
  }
};
