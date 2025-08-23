// Address management utilities for Firebase
import { db } from '@/app/lib/firebase';
import { COLLECTION } from '@/app/utils/schema/collection.enum';
import {
  Address,
  CreateAddressInput,
  UpdateAddressInput,
} from '@/app/utils/types/address.type';
import { User } from '@/app/utils/types/user.type';
import { arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';

/**
 * Generates a unique ID for an address
 */
const generateAddressId = (): string => {
  return `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Adds a new address to user's address list
 * @param userId - The user's ID
 * @param addressInput - Address data to add
 * @returns Promise<Address> - The created address with ID
 */
export const addUserAddress = async (
  userId: string,
  addressInput: CreateAddressInput
): Promise<Address> => {
  try {
    const userDocRef = doc(db, COLLECTION.users, userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data() as User;
    const currentAddresses = userData.addresses || [];

    // If this is the first address or isPrimary is true, ensure only one primary
    if (addressInput.isPrimary || currentAddresses.length === 0) {
      // Set all existing addresses to non-primary
      const updatedAddresses = currentAddresses.map(addr => ({
        ...addr,
        isPrimary: false,
        updatedAt: new Date().toISOString(),
      }));

      await updateDoc(userDocRef, {
        addresses: updatedAddresses,
        updatedAt: new Date().toISOString(),
      });
    }

    const newAddress: Address = {
      ...addressInput,
      id: generateAddressId(),
      isPrimary: addressInput.isPrimary || currentAddresses.length === 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add the new address
    await updateDoc(userDocRef, {
      addresses: arrayUnion(newAddress),
      updatedAt: new Date().toISOString(),
    });

    return newAddress;
  } catch (error) {
    console.error('Error adding address:', error);
    throw new Error('Failed to add address');
  }
};

/**
 * Updates an existing address
 * @param userId - The user's ID
 * @param addressUpdate - Address data to update
 * @returns Promise<void>
 */
export const updateUserAddress = async (
  userId: string,
  addressUpdate: UpdateAddressInput
): Promise<void> => {
  try {
    const userDocRef = doc(db, COLLECTION.users, userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data() as User;
    const addresses = userData.addresses || [];

    const addressIndex = addresses.findIndex(
      addr => addr.id === addressUpdate.id
    );
    if (addressIndex === -1) {
      throw new Error('Address not found');
    }

    let updatedAddresses = [...addresses];

    // If setting as primary, unset all others
    if (addressUpdate.isPrimary) {
      updatedAddresses = updatedAddresses.map(addr => ({
        ...addr,
        isPrimary: addr.id === addressUpdate.id,
        updatedAt: new Date().toISOString(),
      }));
    }

    // Update the specific address
    updatedAddresses[addressIndex] = {
      ...updatedAddresses[addressIndex],
      ...addressUpdate,
      updatedAt: new Date().toISOString(),
    };

    await updateDoc(userDocRef, {
      addresses: updatedAddresses,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating address:', error);
    throw new Error('Failed to update address');
  }
};

/**
 * Removes an address from user's address list
 * @param userId - The user's ID
 * @param addressId - ID of the address to remove
 * @returns Promise<void>
 */
export const removeUserAddress = async (
  userId: string,
  addressId: string
): Promise<void> => {
  try {
    const userDocRef = doc(db, COLLECTION.users, userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data() as User;
    const addresses = userData.addresses || [];

    const addressToRemove = addresses.find(addr => addr.id === addressId);
    if (!addressToRemove) {
      throw new Error('Address not found');
    }

    const remainingAddresses = addresses.filter(addr => addr.id !== addressId);

    // If we're removing the primary address and there are others, set the first one as primary
    if (addressToRemove.isPrimary && remainingAddresses.length > 0) {
      remainingAddresses[0] = {
        ...remainingAddresses[0],
        isPrimary: true,
        updatedAt: new Date().toISOString(),
      };
    }

    await updateDoc(userDocRef, {
      addresses: remainingAddresses,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error removing address:', error);
    throw new Error('Failed to remove address');
  }
};

/**
 * Sets an address as primary
 * @param userId - The user's ID
 * @param addressId - ID of the address to set as primary
 * @returns Promise<void>
 */
export const setPrimaryAddress = async (
  userId: string,
  addressId: string
): Promise<void> => {
  try {
    const userDocRef = doc(db, COLLECTION.users, userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data() as User;
    const addresses = userData.addresses || [];

    const addressExists = addresses.some(addr => addr.id === addressId);
    if (!addressExists) {
      throw new Error('Address not found');
    }

    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isPrimary: addr.id === addressId,
      updatedAt: new Date().toISOString(),
    }));

    await updateDoc(userDocRef, {
      addresses: updatedAddresses,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error setting primary address:', error);
    throw new Error('Failed to set primary address');
  }
};

/**
 * Gets user's primary address
 * @param user - User object
 * @returns Address | null - Primary address or null if none
 */
export const getPrimaryAddress = (user: User): Address | null => {
  if (!user.addresses || user.addresses.length === 0) {
    return null;
  }

  return user.addresses.find(addr => addr.isPrimary) || user.addresses[0];
};

/**
 * Migrates legacy address fields to new addresses array format
 * @param userId - The user's ID
 * @returns Promise<void>
 */
export const migrateLegacyAddress = async (userId: string): Promise<void> => {
  try {
    const userDocRef = doc(db, COLLECTION.users, userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data() as User;

    // Check if legacy address exists and no new addresses
    if (
      userData.address &&
      (!userData.addresses || userData.addresses.length === 0)
    ) {
      const legacyAddress: Address = {
        id: generateAddressId(),
        name: `${userData.firstName} ${userData.lastName}`,
        street: userData.address,
        city: userData.city || '',
        state: userData.state || '',
        lga: userData.lga || '',
        isPrimary: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(userDocRef, {
        addresses: [legacyAddress],
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error migrating legacy address:', error);
    // Don't throw error for migration failures as it's not critical
  }
};
