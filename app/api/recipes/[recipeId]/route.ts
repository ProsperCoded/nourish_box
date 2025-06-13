import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/app/api/lib/firebase-admin";
import { storageService } from "@/app/api/storage/storage.service";
import { Recipe } from "@/app/utils/types/recipe.type";
import { isAdmin } from "@/app/api/adminUtils/user.admin";

interface DeleteParams {
  params: {
    recipeId: string;
  };
}

export async function DELETE(request: NextRequest, { params }: DeleteParams) {
  try {
    const { recipeId } = params;
    // For DELETE requests, userId for authorization might come from headers or a parsed token in a real app.
    // For this implementation, we'll expect it in the request body (though not standard for DELETE).
    // Alternatively, it could be passed as a query parameter if preferred for simplicity here.
    // Let's try to get it from a custom header first, then query, then body for flexibility.
    let userId = request.headers.get("x-user-id");

    if (!userId) {
      const { searchParams } = new URL(request.url);
      userId = searchParams.get("userId");
    }

    if (!userId) {
      try {
        const body = await request.json();
        userId = body.userId;
      } catch (e) {
        // Could be no body or invalid JSON, proceed without it if not found
      }
    }

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User ID is required for authorization (provide as x-user-id header, userId query param, or in body).",
        },
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

    if (!recipeId) {
      return NextResponse.json(
        { success: false, message: "Recipe ID is required." },
        { status: 400 }
      );
    }

    const recipeDocRef = adminDb.collection("recipes").doc(recipeId);
    const recipeDoc = await recipeDocRef.get();

    if (!recipeDoc.exists) {
      return NextResponse.json(
        { success: false, message: "Recipe not found." },
        { status: 404 }
      );
    }

    const recipeData = recipeDoc.data() as Recipe;

    // Delete associated media from Cloudinary
    const mediaToDelete: {
      publicId: string;
      type: "image" | "video" | "raw";
    }[] = [];

    if (recipeData.displayMedia && recipeData.displayMedia.publicId) {
      mediaToDelete.push({
        publicId: recipeData.displayMedia.publicId,
        type: recipeData.displayMedia.type || "image", // Default to image if type is somehow missing
      });
    }

    if (recipeData.samples && recipeData.samples.length > 0) {
      recipeData.samples.forEach((sample) => {
        if (sample.media && sample.media.publicId) {
          mediaToDelete.push({
            publicId: sample.media.publicId,
            type: sample.media.type || "image", // Default to image
          });
        }
      });
    }

    // Perform deletions from Cloudinary
    // Consider error handling for individual deletions (e.g., if one fails, should we proceed?)
    for (const media of mediaToDelete) {
      try {
        await storageService.deleteMedia(media.publicId, media.type);
        console.log(
          `Successfully deleted media ${media.publicId} from Cloudinary.`
        );
      } catch (cloudinaryError) {
        console.error(
          `Failed to delete media ${media.publicId} from Cloudinary:`,
          cloudinaryError
        );
        // Optionally, collect these errors and report them, but don't block Firebase deletion
      }
    }

    // Delete recipe document from Firestore
    await recipeDocRef.delete();

    return NextResponse.json(
      {
        success: true,
        message: "Recipe and associated media deleted successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete recipe error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      {
        success: false,
        message: "Error deleting recipe.",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
