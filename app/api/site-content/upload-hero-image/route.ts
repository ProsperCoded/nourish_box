import { NextRequest, NextResponse } from "next/server";
import { storageService } from "@/app/api/storage/storage.service";
import { isAdmin } from "@/app/api/adminUtils/user.admin";
import {
  getSiteContentAdmin,
  updateSiteContentAdmin,
} from "@/app/api/adminUtils/site-content.admin";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required for authorization." },
        { status: 401 }
      );
    }

    const userIsAdmin = await isAdmin(userId);
    if (!userIsAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: User does not have admin privileges.",
        },
        { status: 403 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided." },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid file type: ${
            file.type
          }. Allowed types: ${allowedTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Get current site content to delete old image if exists
    try {
      const currentSiteContent = await getSiteContentAdmin();

      // Delete old hero image if it exists and is not the default
      if (
        currentSiteContent.heroImage &&
        currentSiteContent.heroImage.publicId !== "hero-default" &&
        currentSiteContent.heroImage.publicId.startsWith("nourish_box/hero/")
      ) {
        try {
          await storageService.deleteMedia(
            currentSiteContent.heroImage.publicId,
            "image"
          );
          console.log(
            "✅ Old hero image deleted:",
            currentSiteContent.heroImage.publicId
          );
        } catch (deleteError) {
          console.warn("⚠️ Could not delete old hero image:", deleteError);
          // Continue with upload even if deletion fails
        }
      }
    } catch (error) {
      console.warn(
        "⚠️ Could not fetch current site content for cleanup:",
        error
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create fixed filename with proper extension
    const fileExtension = file.name.split(".").pop() || "jpg";
    const fixedFileName = `hero-image.${fileExtension}`;

    // Upload to dedicated hero folder
    const uploadResult = await storageService.uploadMedia(
      buffer,
      fixedFileName,
      "nourish_box/hero"
    );

    console.log("✅ Hero image uploaded successfully:", uploadResult);

    return NextResponse.json(
      {
        success: true,
        message: "Hero image uploaded successfully",
        url: uploadResult.url,
        publicId: uploadResult.public_id, // Note: matching the expected API structure
        type: uploadResult.resource_type,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Hero image upload error:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to upload hero image: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
