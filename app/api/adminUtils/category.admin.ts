import { COLLECTION } from '../../utils/schema/collection.enum';
import { Category } from '../../utils/types/category.type';
import { adminDb } from '../lib/firebase-admin';

// Create a new category (admin)
export async function createCategoryAdmin(
  categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const docRef = await adminDb.collection(COLLECTION.categories).add({
      ...categoryData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating category (admin):', error);
    throw error;
  }
}

// Fetch all categories (admin)
export async function fetchCategoriesAdmin(): Promise<Category[]> {
  try {
    const snapshot = await adminDb
      .collection(COLLECTION.categories)
      .orderBy('order', 'asc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Category[];
  } catch (error) {
    console.error('Error fetching categories (admin):', error);
    throw error;
  }
}

// Fetch a single category by ID (admin)
export async function fetchCategoryByIdAdmin(
  categoryId: string
): Promise<Category | null> {
  try {
    const doc = await adminDb
      .collection(COLLECTION.categories)
      .doc(categoryId)
      .get();

    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data(),
    } as Category;
  } catch (error) {
    console.error('Error fetching category (admin):', error);
    throw error;
  }
}

// Update a category (admin)
export async function updateCategoryAdmin(
  categoryId: string,
  updates: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    await adminDb
      .collection(COLLECTION.categories)
      .doc(categoryId)
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      });
  } catch (error) {
    console.error('Error updating category (admin):', error);
    throw error;
  }
}

// Delete a category (admin)
export async function deleteCategoryAdmin(categoryId: string): Promise<void> {
  try {
    await adminDb.collection(COLLECTION.categories).doc(categoryId).delete();
  } catch (error) {
    console.error('Error deleting category (admin):', error);
    throw error;
  }
}

// Get the next order number for a new category (admin)
export async function getNextCategoryOrderAdmin(): Promise<number> {
  try {
    const categories = await fetchCategoriesAdmin();
    const maxOrder = categories.reduce(
      (max, category) => Math.max(max, category.order),
      0
    );
    return maxOrder + 1;
  } catch (error) {
    console.error('Error getting next category order (admin):', error);
    return 1;
  }
}
