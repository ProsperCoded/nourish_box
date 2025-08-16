"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Check, X } from "lucide-react";
import { Category } from "@/app/utils/types/category.type";
import { cn } from "@/app/lib/utils/cn";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface CategoryManagerProps {
  categories: Category[];
  selectedCategoryId?: string;
  onCategorySelect: (categoryId: string) => void;
  onCategoryCreate: (name: string, description?: string) => Promise<void>;
  onCategoryUpdate: (categoryId: string, name: string, description?: string) => Promise<void>;
  onCategoryDelete: (categoryId: string) => Promise<void>;
  loading?: boolean;
}

export function CategoryManager({
  categories,
  selectedCategoryId,
  onCategorySelect,
  onCategoryCreate,
  onCategoryUpdate,
  onCategoryDelete,
  loading = false,
}: CategoryManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);

  const handleCategorySelect = (categoryId: string) => {
    onCategorySelect(categoryId);
    setIsOpen(false);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      await onCategoryCreate(newCategoryName.trim(), newCategoryDescription.trim());
      setNewCategoryName("");
      setNewCategoryDescription("");
      setIsCreating(false);
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !newCategoryName.trim()) return;
    
    try {
      await onCategoryUpdate(editingCategory.id, newCategoryName.trim(), newCategoryDescription.trim());
      setEditingCategory(null);
      setNewCategoryName("");
      setNewCategoryDescription("");
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    setIsDeleting(true);
    try {
      await onCategoryDelete(categoryToDelete.id);
      setCategoryToDelete(null);
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const startEditing = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryDescription(category.description || "");
    setIsCreating(false);
  };

  const startCreating = () => {
    setIsCreating(true);
    setEditingCategory(null);
    setNewCategoryName("");
    setNewCategoryDescription("");
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setIsCreating(false);
    setNewCategoryName("");
    setNewCategoryDescription("");
  };

  return (
    <>
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category Filter
        </label>
        
        {/* Category Select Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={loading}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-brand-logo_green focus:border-transparent",
              "hover:border-gray-400",
              loading && "opacity-50 cursor-not-allowed"
            )}
          >
            <span className="text-gray-900">
              {selectedCategory ? selectedCategory.name : "All Categories"}
            </span>
            <svg
              className={cn(
                "w-5 h-5 text-gray-400 transition-transform",
                isOpen && "rotate-180"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
              {/* All Categories Option */}
              <button
                onClick={() => handleCategorySelect("")}
                className={cn(
                  "w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100",
                  !selectedCategoryId && "bg-brand-logo_green bg-opacity-10 text-brand-logo_green font-medium"
                )}
              >
                All Categories
              </button>

              {/* Category List */}
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={cn(
                    "flex items-center group border-b border-gray-100 last:border-b-0",
                    selectedCategoryId === category.id && "bg-brand-logo_green bg-opacity-10"
                  )}
                >
                  {editingCategory?.id === category.id ? (
                    // Edit Mode
                    <div className="flex-1 p-3 space-y-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-logo_green"
                        placeholder="Category name"
                        autoFocus
                      />
                      <input
                        type="text"
                        value={newCategoryDescription}
                        onChange={(e) => setNewCategoryDescription(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-logo_green"
                        placeholder="Description (optional)"
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={handleUpdateCategory}
                          disabled={!newCategoryName.trim() || loading}
                          className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="p-1 text-gray-500 hover:bg-gray-50 rounded"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <button
                        onClick={() => handleCategorySelect(category.id)}
                        className={cn(
                          "flex-1 px-4 py-3 text-left hover:bg-gray-50 transition-colors",
                          selectedCategoryId === category.id && "text-brand-logo_green font-medium"
                        )}
                      >
                        <div className="font-medium">{category.name}</div>
                        {category.description && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {category.description}
                          </div>
                        )}
                      </button>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditing(category)}
                          className="p-1.5 text-gray-500 hover:text-brand-logo_green hover:bg-gray-50 rounded"
                          title="Edit category"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => setCategoryToDelete(category)}
                          className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-gray-50 rounded"
                          title="Delete category"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Create New Category */}
              {isCreating ? (
                <div className="p-3 space-y-2 border-t border-gray-200 bg-gray-50">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-logo_green"
                    placeholder="New category name"
                    autoFocus
                  />
                  <input
                    type="text"
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-logo_green"
                    placeholder="Description (optional)"
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={handleCreateCategory}
                      disabled={!newCategoryName.trim() || loading}
                      className="p-1 text-green-600 hover:bg-green-100 rounded disabled:opacity-50"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={startCreating}
                  className="w-full px-4 py-3 text-left text-brand-logo_green hover:bg-green-50 transition-colors border-t border-gray-200 flex items-center gap-2"
                >
                  <Plus size={16} />
                  <span className="font-medium">Add New Category</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the category{" "}
              <span className="font-semibold">{categoryToDelete?.name}</span>?
              This action cannot be undone. Recipes in this category will need to be recategorized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}