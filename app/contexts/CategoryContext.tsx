'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { fetchCategories } from '../utils/firebase/categories.firebase';
import { Category } from '../utils/types/category.type';

interface CategoryContextType {
  categories: { [categoryId: string]: Category }; // Performance-optimized structure
  categoriesArray: Category[]; // For components that need array format
  isLoading: boolean;
  error: string | null;

  // Efficient category lookup methods
  getCategoryById: (categoryId: string) => Category | undefined;
  getCategoryName: (categoryId: string) => string | undefined;

  // Category management functions (for admin)
  createCategory: (name: string, description?: string) => Promise<void>;
  updateCategory: (
    categoryId: string,
    name: string,
    description?: string
  ) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  refreshCategories: () => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined
);

export const CategoryProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<{
    [categoryId: string]: Category;
  }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert categories object to array for components that need it
  const categoriesArray = Object.values(categories).sort(
    (a, b) => a.order - b.order
  );

  const refreshCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedCategories = await fetchCategories();

      // Convert array to {categoryId: category} structure for O(1) lookups
      const categoriesMap = fetchedCategories.reduce(
        (acc, category) => {
          acc[category.id] = category;
          return acc;
        },
        {} as { [categoryId: string]: Category }
      );

      setCategories(categoriesMap);
    } catch (err) {
      setError('Failed to load categories');
      console.error('Error loading categories:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  // Efficient O(1) category lookup by ID
  const getCategoryById = useCallback(
    (categoryId: string): Category | undefined => {
      return categories[categoryId];
    },
    [categories]
  );

  // Efficient O(1) category name lookup by ID
  const getCategoryName = useCallback(
    (categoryId: string): string | undefined => {
      return categories[categoryId]?.name;
    },
    [categories]
  );

  // Category management functions for admin
  const createCategory = async (name: string, description?: string) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        throw new Error('Failed to create category');
      }

      const result = await response.json();
      if (result.success) {
        // Add the new category to our local state
        const newCategory = result.data;
        setCategories(prev => ({
          ...prev,
          [newCategory.id]: newCategory,
        }));
      }
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  };

  const updateCategory = async (
    categoryId: string,
    name: string,
    description?: string
  ) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        throw new Error('Failed to update category');
      }

      // Update the category in our local state
      setCategories(prev => {
        const existingCategory = prev[categoryId];
        if (existingCategory) {
          return {
            ...prev,
            [categoryId]: {
              ...existingCategory,
              name,
              description: description || null,
              updatedAt: new Date().toISOString(),
            },
          };
        }
        return prev;
      });
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      // Remove the category from our local state
      setCategories(prev => {
        const newCategories = { ...prev };
        delete newCategories[categoryId];
        return newCategories;
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  return (
    <CategoryContext.Provider
      value={{
        categories,
        categoriesArray,
        isLoading,
        error,
        getCategoryById,
        getCategoryName,
        createCategory,
        updateCategory,
        deleteCategory,
        refreshCategories,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export function useCategories() {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within CategoryProvider');
  }
  return context;
}

export default CategoryProvider;
