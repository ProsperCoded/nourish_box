import { NextRequest, NextResponse } from "next/server";
import {
  getSiteContentAdmin,
  updateSiteContentAdmin,
} from "@/app/api/adminUtils/site-content.admin";
import { isAdmin } from "@/app/api/adminUtils/user.admin";
import { SiteContentUpdate } from "@/app/utils/types/site-content.type";

// GET site content
export async function GET() {
  try {
    const siteContent = await getSiteContentAdmin();

    return NextResponse.json(
      {
        success: true,
        data: siteContent,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching site content:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch site content",
      },
      { status: 500 }
    );
  }
}

// PUT update site content (Admin only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...updates } = body;

    // Check if user ID is provided
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required for authorization." },
        { status: 401 }
      );
    }

    // Check if user is admin
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

    // Validate updates
    const updateData: Partial<SiteContentUpdate> = {};

    if (updates.heroHeading !== undefined) {
      updateData.heroHeading = updates.heroHeading;
    }

    if (updates.heroDescription !== undefined) {
      updateData.heroDescription = updates.heroDescription;
    }

    if (updates.heroImage !== undefined) {
      if (!updates.heroImage.url || !updates.heroImage.publicId) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid hero image data: missing url or publicId",
          },
          { status: 400 }
        );
      }
      updateData.heroImage = updates.heroImage;
    }

    // Update site content
    const updatedSiteContent = await updateSiteContentAdmin(updateData);

    return NextResponse.json(
      {
        success: true,
        message: "Site content updated successfully",
        data: updatedSiteContent,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating site content:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update site content",
      },
      { status: 500 }
    );
  }
}
