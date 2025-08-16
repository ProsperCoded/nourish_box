'use client';

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { COLLECTION } from '../schema/collection.enum';
import { Category } from '../types/category.type';

// Create a new category
export async function createCategory(
  categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION.categories), {
      ...categoryData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
}

// Fetch all categories ordered by order field
export async function fetchCategories(): Promise<Category[]> {
  try {
    const q = query(
      collection(db, COLLECTION.categories),
      orderBy('order', 'asc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt:
        doc.data().createdAt?.toDate?.()?.toISOString() ||
        new Date().toISOString(),
      updatedAt:
        doc.data().updatedAt?.toDate?.()?.toISOString() ||
        new Date().toISOString(),
    })) as Category[];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

// Fetch a single category by ID
export async function fetchCategoryById(
  categoryId: string
): Promise<Category | null> {
  try {
    const categoryDoc = await getDoc(
      doc(db, COLLECTION.categories, categoryId)
    );

    if (!categoryDoc.exists()) {
      return null;
    }

    const data = categoryDoc.data();
    return {
      id: categoryDoc.id,
      ...data,
      createdAt:
        data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt:
        data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    } as Category;
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
}

// Update a category
export async function updateCategory(
  categoryId: string,
  updates: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    const categoryRef = doc(db, COLLECTION.categories, categoryId);
    await updateDoc(categoryRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
}

// Delete a category
export async function deleteCategory(categoryId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION.categories, categoryId));
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

// Get the next order number for a new category
export async function getNextCategoryOrder(): Promise<number> {
  try {
    const categories = await fetchCategories();
    const maxOrder = categories.reduce(
      (max, category) => Math.max(max, category.order),
      0
    );
    return maxOrder + 1;
  } catch (error) {
    console.error('Error getting next category order:', error);
    return 1;
  }
}
