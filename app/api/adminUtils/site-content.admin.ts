import { adminDb } from "@/app/api/lib/firebase-admin";
import {
  SiteContent,
  SiteContentUpdate,
  DEFAULT_SITE_CONTENT,
} from "@/app/utils/types/site-content.type";
import { COLLECTION } from "@/app/utils/schema/collection.enum";

const SITE_CONTENT_ID = "main-site-content";

/**
 * Get site content using admin SDK
 */
export async function getSiteContentAdmin(): Promise<SiteContent> {
  try {
    const docRef = adminDb
      .collection(COLLECTION.site_content)
      .doc(SITE_CONTENT_ID);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      // Create default site content if it doesn't exist
      const defaultContent: SiteContent = {
        id: SITE_CONTENT_ID,
        ...DEFAULT_SITE_CONTENT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await docRef.set(defaultContent);
      return defaultContent;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as SiteContent;
  } catch (error) {
    console.error("Error fetching site content (admin):", error);
    throw new Error("Failed to fetch site content");
  }
}

/**
 * Update site content using admin SDK
 */
export async function updateSiteContentAdmin(
  updates: Partial<SiteContentUpdate>
): Promise<SiteContent> {
  try {
    const docRef = adminDb
      .collection(COLLECTION.site_content)
      .doc(SITE_CONTENT_ID);

    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await docRef.update(updateData);

    // Return updated content
    return await getSiteContentAdmin();
  } catch (error) {
    console.error("Error updating site content (admin):", error);
    throw new Error("Failed to update site content");
  }
}

/**
 * Initialize site content with default values using admin SDK
 */
export async function initializeSiteContentAdmin(): Promise<SiteContent> {
  try {
    const docRef = adminDb
      .collection(COLLECTION.site_content)
      .doc(SITE_CONTENT_ID);

    const defaultContent: SiteContent = {
      id: SITE_CONTENT_ID,
      ...DEFAULT_SITE_CONTENT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await docRef.set(defaultContent);
    return defaultContent;
  } catch (error) {
    console.error("Error initializing site content (admin):", error);
    throw new Error("Failed to initialize site content");
  }
}
