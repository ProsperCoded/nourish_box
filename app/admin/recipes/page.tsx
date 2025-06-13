"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc, orderBy, query } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../../lib/firebase";
import { COLLECTION } from "../../utils/schema/collection.enum";
import { Recipe } from "../../utils/types/recipe.type";
import { v4 as uuidv4 } from "uuid";
import { RecipeGrid } from "../../components/admin/RecipeGrid";
import { RecipeCardForm } from "../../components/admin/RecipeCardForm";
import { RecipeDetailModal } from "../../components/admin/RecipeDetailModal";
import { fetchRecipes } from "../../utils/firebase/recipes.firebase";
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
      console.log('recipes', recipes)
      setRecipes(recipes);
    });
  }, []);



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
      if (recipeToDelete.displayUrl) {
        try {
          const displayRef = ref(storage, recipeToDelete.displayUrl);
          await deleteObject(displayRef);
        } catch (error) {
          console.warn("Error deleting display file:", error); // Use warn for non-critical deletion errors
        }
      }

      if (recipeToDelete.samples && recipeToDelete.samples.length > 0) {
        await Promise.all(
          recipeToDelete.samples.map(async (sample) => {
            try {
              const sampleRef = ref(storage, sample.image);
              await deleteObject(sampleRef);
            } catch (error) {
              console.warn("Error deleting sample file:", error); // Use warn
            }
          })
        );
      }

      await deleteDoc(doc(db, COLLECTION.recipes, recipeToDelete.id));
      await fetchRecipes().then(setRecipes); // Re-fetch and update recipes
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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
              This action cannot be undone. This will permanently delete the recipe
              <span className="font-semibold"> {recipeToDelete?.name} </span>
              and all its associated files from the servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRecipeToDelete(null)}>Cancel</AlertDialogCancel>
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