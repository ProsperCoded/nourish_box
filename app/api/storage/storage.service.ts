import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import { cloudinaryConfig } from "../utils/config.env";

const config = {
  cloud_name: cloudinaryConfig.cloudName,
  api_key: cloudinaryConfig.apiKey,
  api_secret: cloudinaryConfig.apiSecret,
  secure: true,
};
console.log("cloudinary config", { ...config, api_secret: "[HIDDEN]" }); // Hide secret in logs
cloudinary.config(config);

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
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          public_id: fileName.split(".")[0] || fileName, // Use filename without extension as public_id
          resource_type: "auto", // Automatically detect if it's an image or video
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary Upload Error:", error);
            return reject(error);
          }
          if (!result) {
            return reject(
              new Error("Cloudinary upload failed, no result returned.")
            );
          }
          resolve({
            public_id: result.public_id,
            url: result.secure_url,
            resource_type: result.resource_type as "image" | "video",
          });
        }
      );
      const readableStream = new Readable();
      readableStream._read = () => {}; // _read is required but can be a no-op
      readableStream.push(fileBuffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  }

  async deleteMedia(
    publicId: string,
    resourceType: "image" | "video" | "raw" = "image"
  ): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
    } catch (error) {
      console.error("Cloudinary Delete Error:", error);
      // Decide if you want to throw the error or handle it, e.g. log and continue
      // For now, re-throwing to make the caller aware
      throw error;
    }
  }

  // If you need to delete folders or multiple assets, add more methods here
  // For example, to delete all assets in a folder (use with caution!):
  // async deleteFolder(folderPath: string): Promise<void> {
  //   try {
  //     // Deleting resources by prefix (folder path)
  //     await cloudinary.api.delete_resources_by_prefix(folderPath);
  //     // Optionally, delete the folder itself if it's empty and you want to remove it
  //     // Note: Cloudinary might auto-remove empty folders, or you might use `delete_folder`
  //     await cloudinary.api.delete_folder(folderPath);
  //   } catch (error) {
  //     console.error(`Cloudinary Delete Folder Error for ${folderPath}:`, error);
  //     throw error;
  //   }
  // }
}

export const storageService = new StorageService();
