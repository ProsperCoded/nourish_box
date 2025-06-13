// used for user profile related utilities
import { doc, updateDoc, getDoc } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "@/app/lib/firebase";
import { COLLECTION } from "@/app/utils/schema/collection.enum";
import { User } from "@/app/utils/types/user.type";

/**
 * Uploads a profile picture to Firebase Storage
 * @param userId - The user's ID
 * @param file - The image file to upload
 * @returns Promise<string> - The download URL of the uploaded image
 */
export const uploadProfilePicture = async (
  userId: string,
  file: File
): Promise<string> => {
  try {
    // Create a reference to the profile pictures folder
    const profilePicRef = ref(
      storage,
      `profile-pictures/${userId}/${file.name}`
    );

    // Upload the file
    const snapshot = await uploadBytes(profilePicRef, file);

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw new Error("Failed to upload profile picture");
  }
};

/**
 * Deletes a profile picture from Firebase Storage
 * @param profilePictureUrl - The URL of the profile picture to delete
 */
export const deleteProfilePicture = async (
  profilePictureUrl: string
): Promise<void> => {
  try {
    const profilePicRef = ref(storage, profilePictureUrl);
    await deleteObject(profilePicRef);
  } catch (error) {
    console.error("Error deleting profile picture:", error);
    // Don't throw error for deletion failures as it's not critical
  }
};

/**
 * Updates a user's profile picture
 * @param userId - The user's ID
 * @param file - The new profile picture file
 * @param currentProfilePictureUrl - The current profile picture URL (to delete if exists)
 * @returns Promise<string> - The new profile picture URL
 */
export const updateUserProfilePicture = async (
  userId: string,
  file: File,
  currentProfilePictureUrl?: string
): Promise<string> => {
  try {
    // Upload the new profile picture
    const newProfilePictureUrl = await uploadProfilePicture(userId, file);

    // Update the user document with the new profile picture URL
    const userDocRef = doc(db, COLLECTION.users, userId);
    await updateDoc(userDocRef, {
      profilePicture: newProfilePictureUrl,
      updatedAt: new Date().toISOString(),
    });

    // Delete the old profile picture if it exists and is not a Google photo
    if (
      currentProfilePictureUrl &&
      !currentProfilePictureUrl.includes("googleusercontent.com")
    ) {
      await deleteProfilePicture(currentProfilePictureUrl);
    }

    return newProfilePictureUrl;
  } catch (error) {
    console.error("Error updating profile picture:", error);
  }
};

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
