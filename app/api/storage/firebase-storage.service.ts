import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "@/app/lib/firebase";
import { v4 as uuidv4 } from "uuid";

export class FirebaseStorageService {
  /**
   * Uploads media file to Firebase Storage
   * @param fileBuffer - The file buffer to upload
   * @param fileName - Original file name
   * @param folder - Storage folder path (default: "nourish_box")
   * @returns Promise with upload result containing URL and file path
   */
  async uploadMedia(
    fileBuffer: Buffer,
    fileName: string,
    folder: string = "nourish_box"
  ): Promise<{
    public_id: string;
    url: string;
    resource_type: "image" | "video";
  }> {
    try {
      // Log upload attempt details
      console.log(`🔄 Attempting to upload file: ${fileName}`);
      console.log(`📁 Target folder: ${folder}`);
      console.log(`📊 File size: ${fileBuffer.length} bytes`);

      // Validate file name and extract extension properly
      if (!fileName || fileName.trim() === "") {
        throw new Error("File name is required and cannot be empty");
      }

      const fileExtension = fileName.split(".").pop() || "";
      const baseFileName = fileName.replace(/\.[^/.]+$/, "") || "unnamed_file";

      if (!fileExtension) {
        throw new Error(`File ${fileName} has no extension`);
      }

      // Generate unique file name to prevent conflicts
      const uniqueFileName = `${baseFileName}_${uuidv4()}.${fileExtension}`;

      // Determine resource type based on file extension
      const isVideo = /\.(mp4|webm|mov|avi|mkv)$/i.test(fileName);
      const resourceType: "image" | "video" = isVideo ? "video" : "image";

      // Create storage reference
      const storagePath = `${folder}/${resourceType}s/${uniqueFileName}`;
      console.log(`📂 Storage path: ${storagePath}`);

      // Check if storage is properly initialized
      if (!storage) {
        throw new Error(
          "Firebase Storage is not initialized. Check your Firebase configuration."
        );
      }

      const storageRef = ref(storage, storagePath);

      // Convert buffer to Uint8Array for Firebase
      const uint8Array = new Uint8Array(fileBuffer);

      // Set metadata based on file type
      const metadata = {
        contentType: this.getContentType(fileName),
        customMetadata: {
          originalName: fileName,
          uploadedAt: new Date().toISOString(),
        },
      };

      // Upload file
      console.log(`⬆️ Starting upload to Firebase Storage...`);
      const snapshot = await uploadBytes(storageRef, uint8Array, metadata);

      // Get download URL
      console.log(`🔗 Getting download URL...`);
      const downloadURL = await getDownloadURL(snapshot.ref);

      console.log(`✅ Successfully uploaded ${fileName} to Firebase Storage`);
      console.log(`🌐 Download URL: ${downloadURL}`);

      return {
        public_id: storagePath, // Use storage path as public_id for deletion
        url: downloadURL,
        resource_type: resourceType,
      };
    } catch (error) {
      console.error("❌ Firebase Storage Upload Error:", error);
      throw new Error(
        `Failed to upload ${fileName}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Deletes media file from Firebase Storage
   * @param publicId - The storage path (public_id from upload)
   * @param resourceType - Type of resource (for compatibility, not used in Firebase)
   */
  async deleteMedia(
    publicId: string,
    resourceType: "image" | "video" | "raw" = "image"
  ): Promise<void> {
    try {
      const storageRef = ref(storage, publicId);
      await deleteObject(storageRef);
      console.log(`✅ Successfully deleted ${publicId} from Firebase Storage`);
    } catch (error) {
      console.error("❌ Firebase Storage Delete Error:", error);
      throw new Error(
        `Failed to delete ${publicId}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Gets the appropriate content type for a file
   * @param fileName - The file name
   * @returns Content type string
   */
  private getContentType(fileName: string): string {
    const extension = fileName.split(".").pop()?.toLowerCase() || "";

    const mimeTypes: Record<string, string> = {
      // Images
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      svg: "image/svg+xml",
      bmp: "image/bmp",
      tiff: "image/tiff",

      // Videos
      mp4: "video/mp4",
      webm: "video/webm",
      mov: "video/quicktime",
      avi: "video/x-msvideo",
      mkv: "video/x-matroska",
      wmv: "video/x-ms-wmv",
      flv: "video/x-flv",
    };

    return mimeTypes[extension] || "application/octet-stream";
  }

  /**
   * Uploads multiple files concurrently
   * @param files - Array of files to upload
   * @param folder - Storage folder path
   * @returns Promise with array of upload results
   */
  async uploadMultipleMedia(
    files: { buffer: Buffer; name: string }[],
    folder: string = "nourish_box"
  ): Promise<
    Array<{
      public_id: string;
      url: string;
      resource_type: "image" | "video";
      originalName: string;
    }>
  > {
    try {
      const uploadPromises = files.map(async (file) => {
        const result = await this.uploadMedia(file.buffer, file.name, folder);
        return {
          ...result,
          originalName: file.name,
        };
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error("❌ Firebase Storage Multiple Upload Error:", error);
      throw error;
    }
  }

  /**
   * Lists all files in a folder (useful for admin purposes)
   * @param folderPath - The folder path to list
   * @returns Promise with array of file information
   */
  async listFiles(folderPath: string): Promise<
    Array<{
      name: string;
      path: string;
      url: string;
      size: number;
      timeCreated: string;
    }>
  > {
    try {
      // Note: Firebase Storage doesn't have a direct list operation like Cloudinary
      // This would require using Firebase Admin SDK or Cloud Functions
      // For now, we'll return an empty array and log a warning
      console.warn(
        "⚠️ listFiles operation requires Firebase Admin SDK implementation"
      );
      return [];
    } catch (error) {
      console.error("❌ Firebase Storage List Error:", error);
      throw error;
    }
  }
}

export const firebaseStorageService = new FirebaseStorageService();
