import { adminDb } from '@/app/api/lib/firebase-admin';
import { storageService } from '@/app/api/storage/storage.service';
import { COLLECTION } from '@/app/utils/schema/collection.enum';
import {
  BusinessRules,
  DEFAULT_BUSINESS_RULES,
  DEFAULT_SITE_CONTENT,
  SiteContent,
  SiteContentUpdate,
} from '@/app/utils/types/site-content.type';

const SITE_CONTENT_ID = 'main-site-content';

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

    const data = docSnap.data() as any;

    // Migration: Add business rules if they don't exist
    if (!data.businessRules) {
      console.log('🔄 Migrating site content to include business rules');
      const updatedData = {
        ...data,
        businessRules: DEFAULT_BUSINESS_RULES,
        updatedAt: new Date().toISOString(),
      };

      await docRef.update(updatedData);
      return {
        id: docSnap.id,
        ...updatedData,
      } as SiteContent;
    }

    return {
      id: docSnap.id,
      ...data,
    } as SiteContent;
  } catch (error) {
    console.error('Error fetching site content (admin):', error);
    throw new Error('Failed to fetch site content');
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

    // If we're updating the hero image, clean up the old one first
    if (updates.heroImage) {
      await cleanupOldHeroImage(updates.heroImage);
    }

    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await docRef.update(updateData);

    // Return updated content
    return await getSiteContentAdmin();
  } catch (error) {
    console.error('Error updating site content (admin):', error);
    throw new Error('Failed to update site content');
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
    console.error('Error initializing site content (admin):', error);
    throw new Error('Failed to initialize site content');
  }
}

/**
 * Get business rules using admin SDK
 */
export async function getBusinessRulesAdmin(): Promise<BusinessRules> {
  try {
    const siteContent = await getSiteContentAdmin();
    return siteContent.businessRules || DEFAULT_BUSINESS_RULES;
  } catch (error) {
    console.error('Error fetching business rules (admin):', error);
    throw new Error('Failed to fetch business rules');
  }
}

/**
 * Update business rules using admin SDK
 */
export async function updateBusinessRulesAdmin(
  businessRules: Partial<BusinessRules>
): Promise<BusinessRules> {
  try {
    const docRef = adminDb
      .collection(COLLECTION.site_content)
      .doc(SITE_CONTENT_ID);

    // Merge with existing business rules
    const currentContent = await getSiteContentAdmin();
    const updatedBusinessRules = {
      ...currentContent.businessRules,
      ...businessRules,
    };

    const updateData = {
      businessRules: updatedBusinessRules,
      updatedAt: new Date().toISOString(),
    };

    await docRef.update(updateData);

    return updatedBusinessRules;
  } catch (error) {
    console.error('Error updating business rules (admin):', error);
    throw new Error('Failed to update business rules');
  }
}

/**
 * Clean up old hero image when updating with a new one
 */
async function cleanupOldHeroImage(newHeroImage: {
  url: string;
  publicId: string;
  type: 'image' | 'video';
}): Promise<void> {
  try {
    // Get current site content to check for existing image
    const currentContent = await getSiteContentAdmin();

    // Check if there's an existing image that's not the default
    const currentImage = currentContent.heroImage;
    const isCurrentImageDefault =
      currentImage.url === DEFAULT_SITE_CONTENT.heroImage.url ||
      currentImage.url.includes('/hero.png') ||
      currentImage.publicId === DEFAULT_SITE_CONTENT.heroImage.publicId;

    // Check if new image is the default
    const isNewImageDefault =
      newHeroImage.url === DEFAULT_SITE_CONTENT.heroImage.url ||
      newHeroImage.url.includes('/hero.png') ||
      newHeroImage.publicId === DEFAULT_SITE_CONTENT.heroImage.publicId;

    // If we have a non-default current image and we're setting a new one (including default),
    // clean up the old one
    if (
      !isCurrentImageDefault &&
      currentImage.publicId !== newHeroImage.publicId
    ) {
      console.log(`🧹 Cleaning up old hero image: ${currentImage.publicId}`);
      try {
        await storageService.deleteMedia(currentImage.publicId, 'image');
        console.log(`✅ Successfully deleted old hero image`);
      } catch (deleteError) {
        console.warn(`⚠️ Failed to delete old hero image: ${deleteError}`);
        // Don't throw error for cleanup failures, just log them
      }
    }
  } catch (error) {
    console.error('Error in cleanupOldHeroImage:', error);
    // Don't throw error for cleanup failures to prevent blocking updates
  }
}
