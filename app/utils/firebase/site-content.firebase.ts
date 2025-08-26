import { db } from '@/app/lib/firebase';
import { COLLECTION } from '@/app/utils/schema/collection.enum';
import {
  DEFAULT_BUSINESS_RULES,
  DEFAULT_SITE_CONTENT,
  SiteContent,
  SiteContentUpdate,
} from '@/app/utils/types/site-content.type';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const SITE_CONTENT_ID = 'main-site-content';

/**
 * Get site content, create default if doesn't exist
 */
export async function getSiteContent(): Promise<SiteContent> {
  try {
    const docRef = doc(db, COLLECTION.site_content, SITE_CONTENT_ID);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      // Create default site content if it doesn't exist
      const defaultContent: SiteContent = {
        id: SITE_CONTENT_ID,
        ...DEFAULT_SITE_CONTENT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(docRef, defaultContent);
      return defaultContent;
    }

    const data = docSnap.data() as any;

    // Migration: Add business rules if they don't exist
    if (!data.businessRules) {
      const updatedData = {
        ...data,
        businessRules: DEFAULT_BUSINESS_RULES,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(docRef, updatedData);
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
    console.error('Error fetching site content:', error);
    throw new Error('Failed to fetch site content');
  }
}

/**
 * Update site content
 */
export async function updateSiteContent(
  updates: Partial<SiteContentUpdate>
): Promise<SiteContent> {
  try {
    const docRef = doc(db, COLLECTION.site_content, SITE_CONTENT_ID);

    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await updateDoc(docRef, updateData);

    // Return updated content
    return await getSiteContent();
  } catch (error) {
    console.error('Error updating site content:', error);
    throw new Error('Failed to update site content');
  }
}

/**
 * Initialize site content with default values (for seeding)
 */
export async function initializeSiteContent(): Promise<SiteContent> {
  try {
    const docRef = doc(db, COLLECTION.site_content, SITE_CONTENT_ID);

    const defaultContent: SiteContent = {
      id: SITE_CONTENT_ID,
      ...DEFAULT_SITE_CONTENT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(docRef, defaultContent);
    return defaultContent;
  } catch (error) {
    console.error('Error initializing site content:', error);
    throw new Error('Failed to initialize site content');
  }
}
