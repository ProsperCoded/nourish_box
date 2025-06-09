import { firebaseStorageService } from "./firebase-storage.service";

// Re-export Firebase Storage Service as Storage Service for backward compatibility
export class StorageService {
  async uploadMedia(
    fileBuffer: Buffer,
    fileName: string,
    folder: string = "nourish_box"
  ): Promise<{
    public_id: string;
    url: string;
    resource_type: "image" | "video";
  }> {
    return await firebaseStorageService.uploadMedia(
      fileBuffer,
      fileName,
      folder
    );
  }

  async deleteMedia(
    publicId: string,
    resourceType: "image" | "video" | "raw" = "image"
  ): Promise<void> {
    return await firebaseStorageService.deleteMedia(publicId, resourceType);
  }

  // Additional Firebase Storage methods
  async uploadMultipleMedia(
    files: { buffer: Buffer; name: string }[],
    folder: string = "nourish_box"
  ) {
    return await firebaseStorageService.uploadMultipleMedia(files, folder);
  }
}

export const storageService = new StorageService();
