"use client";

import { useState } from "react";
import Image from "next/image";
import { Grid, List, Search, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { Recipe } from "@/app/utils/types/recipe.type";
import { RecipeCard } from "./RecipeCard";
import { cn } from "@/app/lib/utils/cn";

interface RecipeGridProps {
  recipes: Recipe[];
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
  onView: (recipe: Recipe) => void;
  onAdd: () => void;
}

export function RecipeGrid({ recipes, onEdit, onDelete, onView, onAdd }: RecipeGridProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter recipes based on search term
  const filteredRecipes = recipes.filter(recipe => 
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Search bar */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-logo_green focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Add new recipe button */}
          <button
            onClick={onAdd}
            className="flex items-center gap-2 bg-brand-logo_green text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            <Plus size={18} />
            <span>New Recipe</span>
          </button>

          {/* View mode toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-md transition-colors",
                viewMode === "grid" ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
              title="Grid View"
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-md transition-colors",
                viewMode === "list" ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {filteredRecipes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No recipes found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? "Try a different search term" : "Add your first recipe to get started"}
          </p>
          {!searchTerm && (
            <button
              onClick={onAdd}
              className="inline-flex items-center gap-2 bg-brand-logo_green text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
            >
              <Plus size={18} />
              <span>Add Recipe</span>
            </button>
          )}
        </div>
      ) : (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onEdit={onEdit}
                onDelete={onDelete}
                onView={onView}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipe
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Featured
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecipes.map((recipe) => (
                    <tr key={recipe.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 relative rounded overflow-hidden">
                            {recipe.displayUrl && (
                              <Image
                                src={recipe.displayUrl}
                                alt={recipe.name}
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{recipe.name}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">{recipe.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Intl.NumberFormat('en-NG', {
                          style: 'currency',
                          currency: 'NGN',
                          minimumFractionDigits: 0,
                        }).format(recipe.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Math.floor(recipe.duration / 60)} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {recipe.order}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          recipe.featured ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}>
                          {recipe.featured ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => onView(recipe)}
                            className="text-gray-500 hover:text-gray-700"
                            title="View Recipe"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => onEdit(recipe)}
                            className="text-brand-logo_green hover:text-opacity-80"
                            title="Edit Recipe"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => onDelete(recipe)}
                            className="text-red-500 hover:text-opacity-80"
                            title="Delete Recipe"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
} 