import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "../../lib/firebase";
import { v4 as uuidv4 } from "uuid";

export interface UploadResult {
  url: string;
  publicId: string;
  type: "image" | "video";
}

/**
 * Uploads a file to Firebase Storage
 * @param file - File to upload
 * @param folder - Storage folder path
 * @returns Promise with upload result
 */
export const uploadFile = async (
  file: File,
  folder: string = "nourish_box"
): Promise<UploadResult> => {
  try {
    // Generate unique file name
    const fileExtension = file.name.split(".").pop() || "";
    const uniqueFileName = `${
      file.name.split(".")[0]
    }_${uuidv4()}.${fileExtension}`;

    // Determine resource type
    const isVideo = /\.(mp4|webm|mov|avi|mkv)$/i.test(file.name);
    const resourceType: "image" | "video" = isVideo ? "video" : "image";

    // Create storage reference
    const storagePath = `${folder}/${resourceType}s/${uniqueFileName}`;
    const storageRef = ref(storage, storagePath);

    // Set metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    };

    // Upload file
    const snapshot = await uploadBytes(storageRef, file, metadata);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      url: downloadURL,
      publicId: storagePath,
      type: resourceType,
    };
  } catch (error) {
    console.error("Firebase Storage Upload Error:", error);
    throw new Error(
      `Failed to upload ${file.name}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Deletes a file from Firebase Storage
 * @param publicId - The storage path
 */
export const deleteFile = async (publicId: string): Promise<void> => {
  try {
    const storageRef = ref(storage, publicId);
    await deleteObject(storageRef);
    console.log(`✅ Successfully deleted ${publicId} from Firebase Storage`);
  } catch (error) {
    console.error("Firebase Storage Delete Error:", error);
    throw new Error(
      `Failed to delete ${publicId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Uploads multiple files concurrently
 * @param files - Array of files to upload
 * @param folder - Storage folder path
 * @returns Promise with array of upload results
 */
export const uploadMultipleFiles = async (
  files: File[],
  folder: string = "nourish_box"
): Promise<UploadResult[]> => {
  try {
    const uploadPromises = files.map((file) => uploadFile(file, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Firebase Storage Multiple Upload Error:", error);
    throw error;
  }
};

/**
 * Creates a preview URL for a file (useful for forms)
 * @param file - File to create preview for
 * @returns Promise with preview URL
 */
export const createFilePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error("Failed to create file preview"));
      }
    };
    reader.onerror = () => reject(new Error("FileReader error"));
    reader.readAsDataURL(file);
  });
};
