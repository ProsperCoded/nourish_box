import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/app/api/lib/firebase-admin";
import { storageService } from "@/app/api/storage/storage.service";
import { Recipe } from "@/app/utils/types/recipe.type";
import { isAdmin } from "@/app/api/adminUtils/user.admin";
import { FieldValue } from "firebase-admin/firestore";
import { COLLECTION } from "@/app/utils/schema/collection.enum";

interface RouteParams {
  params: {
    recipeId: string;
  };
}

// PUT method for updating recipes
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { recipeId } = params;
    const body = await request.json();
    const { userId, ...recipeData } = body;

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

    if (!recipeId) {
      return NextResponse.json(
        { success: false, message: "Recipe ID is required." },
        { status: 400 }
      );
    }

    // Check if recipe exists
    const recipeDocRef = adminDb.collection(COLLECTION.recipes).doc(recipeId);
    const recipeDoc = await recipeDocRef.get();

    if (!recipeDoc.exists) {
      return NextResponse.json(
        { success: false, message: "Recipe not found." },
        { status: 404 }
      );
    }

    // Validate required fields
    if (
      !recipeData.name ||
      !recipeData.description ||
      !recipeData.displayMedia ||
      !recipeData.displayMedia.url ||
      !recipeData.displayMedia.publicId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required recipe fields (name, description, displayMedia).",
        },
        { status: 400 }
      );
    }

    // Prepare update data - preserve existing data like clicks
    const currentData = recipeDoc.data();
    const updateData = {
      name: recipeData.name as string,
      description: recipeData.description as string,
      displayMedia: recipeData.displayMedia as {
        url: string;
        publicId: string;
        type: "image" | "video";
      },
      samples:
        (recipeData.samples as {
          variant: string;
          media: { url: string; publicId: string; type: "image" | "video" };
        }[]) || [],
      duration: Number(recipeData.duration) || 0,
      price: Number(recipeData.price) || 0,
      ingredients: Array.isArray(recipeData.ingredients)
        ? recipeData.ingredients
        : [],
      order: Number(recipeData.order) || 0,
      featured: Boolean(recipeData.featured) || false,
      // Preserve existing fields that shouldn't be updated
      clicks: currentData?.clicks || 0,
      createdAt: currentData?.createdAt || FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Update the recipe
    await recipeDocRef.update(updateData);

    // Get the updated recipe to return
    const updatedRecipeDoc = await recipeDocRef.get();
    const updatedRecipeData = updatedRecipeDoc.data();

    const updatedRecipe: Recipe = {
      id: recipeId,
      ...updatedRecipeData,
      createdAt:
        updatedRecipeData?.createdAt?.toDate?.()?.toISOString() ||
        updatedRecipeData?.createdAt ||
        new Date().toISOString(),
      updatedAt: new Date().toISOString(), // Use current time for immediate response
    } as Recipe;

    return NextResponse.json(
      {
        success: true,
        message: "Recipe updated successfully",
        recipe: updatedRecipe,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update recipe error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      {
        success: false,
        message: "Error updating recipe.",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
