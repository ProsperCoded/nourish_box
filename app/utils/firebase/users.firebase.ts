// used for user profile related utilities
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { COLLECTION } from "@/app/utils/schema/collection.enum";
import { User } from "@/app/utils/types/user.type";

/**
 * Updates a user's profile information in Firestore
 * @param userId - The user's ID
 * @param profileData - Partial user data to update
 * @returns Promise<void>
 */
export const updateUserProfile = async (
  userId: string,
  profileData: Partial<Omit<User, "id" | "createdAt">>
): Promise<void> => {
  try {
    const userDocRef = doc(db, COLLECTION.users, userId);
    const updateData = {
      ...profileData,
      updatedAt: new Date().toISOString(),
    };

    await updateDoc(userDocRef, updateData);
    console.log("User profile updated successfully");
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new Error("Failed to update user profile");
  }
};

/**
 * Gets a user's profile by ID
 * @param userId - The user's ID
 * @returns Promise<User | null>
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const userDocRef = doc(db, COLLECTION.users, userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as User;
    }

    return null;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("Failed to fetch user profile");
  }
};
