"use client";

import { useState, useEffect } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { COLLECTION } from "../../utils/schema/collection.enum";
import { Recipe } from "../../utils/types/recipe.type";
import { RecipeGrid } from "../../components/admin/RecipeGrid";
import { RecipeCardForm } from "../../components/admin/RecipeCardForm";
import { RecipeDetailModal } from "../../components/admin/RecipeDetailModal";
import { fetchRecipes } from "../../utils/firebase/recipes.firebase";
import { storageService } from "../../api/storage/storage.service";
import { X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";

export default function RecipesManagement() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecipes().then((recipes) => {
      console.log("recipes", recipes);
      setRecipes(recipes);
    });
  }, []);

  // Handle escape key to close modals
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isFormOpen) {
          setIsFormOpen(false);
        }
        if (isDetailModalOpen) {
          setIsDetailModalOpen(false);
        }
        if (isDeleteAlertOpen) {
          setIsDeleteAlertOpen(false);
          setRecipeToDelete(null);
        }
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isFormOpen, isDetailModalOpen, isDeleteAlertOpen]);

  const handleEditRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsFormOpen(true);
  };

  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsDetailModalOpen(true);
  };

  const openDeleteConfirm = (recipe: Recipe) => {
    setRecipeToDelete(recipe);
    setIsDeleteAlertOpen(true);
  };

  const confirmDeleteRecipe = async () => {
    if (!recipeToDelete) return;

    setLoading(true);
    try {
      // Delete display media if it exists
      if (recipeToDelete.displayMedia?.publicId) {
        try {
          await storageService.deleteMedia(
            recipeToDelete.displayMedia.publicId,
            recipeToDelete.displayMedia.type || "image"
          );
        } catch (error) {
          console.warn("Error deleting display media:", error);
        }
      }

      // Delete sample media if they exist
      if (recipeToDelete.samples && recipeToDelete.samples.length > 0) {
        await Promise.all(
          recipeToDelete.samples.map(async (sample) => {
            try {
              if (sample.media?.publicId) {
                await storageService.deleteMedia(
                  sample.media.publicId,
                  sample.media.type || "image"
                );
              }
            } catch (error) {
              console.warn("Error deleting sample media:", error);
            }
          })
        );
      }

      await deleteDoc(doc(db, COLLECTION.recipes, recipeToDelete.id));
      await fetchRecipes().then(setRecipes);
      setIsDeleteAlertOpen(false);
      setRecipeToDelete(null);
    } catch (error) {
      console.error("Error deleting recipe:", error);
      // Consider adding user-facing error toast here
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecipe = () => {
    setSelectedRecipe(null);
    setIsFormOpen(true);
  };

  return (
    <div className="container mx-auto pb-12">
      <RecipeGrid
        recipes={recipes}
        onEdit={handleEditRecipe}
        onDelete={openDeleteConfirm} // Use openDeleteConfirm here
        onView={handleViewRecipe}
        onAdd={handleAddRecipe}
      />

      {isFormOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto"
          onClick={(e) => {
            // Close modal when clicking on backdrop
            if (e.target === e.currentTarget) {
              setIsFormOpen(false);
            }
          }}
        >
          <div className="relative w-full max-w-4xl my-8">
            {/* X button to close modal */}
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 z-10 bg-white hover:bg-gray-100 rounded-full p-2 shadow-lg transition-colors"
              aria-label="Close modal"
            >
              <X size={20} className="text-gray-600" />
            </button>
            <RecipeCardForm
              recipe={selectedRecipe}
              onCancel={() => setIsFormOpen(false)}
              onSuccess={() => {
                setIsFormOpen(false);
                fetchRecipes().then(setRecipes);
              }}
            />
          </div>
        </div>
      )}

      {isDetailModalOpen && selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setIsDetailModalOpen(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              recipe
              <span className="font-semibold"> {recipeToDelete?.name} </span>
              and all its associated files from the servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRecipeToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRecipe}
              className="bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Yes, delete recipe"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
