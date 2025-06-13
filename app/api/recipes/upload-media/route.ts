import { NextRequest, NextResponse } from "next/server";
import { storageService } from "@/app/api/storage/storage.service";
import { isAdmin } from "@/app/api/adminUtils/user.admin";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string | null; // User ID for admin check

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

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
    ];
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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await storageService.uploadMedia(
      buffer,
      file.name + new Date().getTime().toString(),
      "nourish_box/recipes"
    );

    return NextResponse.json({
      success: true,
      message: "Media uploaded successfully",
      url: uploadResult.url,
      publicId: uploadResult.public_id,
      type: uploadResult.resource_type,
    });
  } catch (error) {
    console.error("Media upload error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      {
        success: false,
        message: "Error uploading media.",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
