"use client";

import { useState } from "react";
import Image from "next/image";
import { Clock, DollarSign, Star, Edit, Trash2, Eye } from "lucide-react";
import { Recipe } from "@/app/utils/types/recipe.type";
import { cn } from "@/app/lib/utils/cn";

interface RecipeCardProps {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
  onView: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, onEdit, onDelete, onView }: RecipeCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Format price in Naira
  const formattedPrice = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(recipe.price);

  // Format duration in minutes
  const formattedDuration = `${Math.floor(recipe.duration / 60)} min`;

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {recipe.displayUrl && (
          <Image
            src={recipe.displayUrl}
            alt={recipe.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        )}
        
        {/* Featured badge */}
        {recipe.featured && (
          <div className="absolute top-2 left-2 bg-brand-btn_orange text-white px-2 py-1 rounded-md text-xs font-semibold">
            Featured
          </div>
        )}

        {/* Actions overlay on hover */}
        <div className={cn(
          "absolute inset-0 bg-black/60 flex items-center justify-center gap-3 transition-opacity duration-300",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          <button
            onClick={() => onView(recipe)}
            className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="View Recipe"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => onEdit(recipe)}
            className="bg-brand-logo_green text-white p-2 rounded-full hover:bg-opacity-90 transition-colors"
            title="Edit Recipe"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => onDelete(recipe)}
            className="bg-red-500 text-white p-2 rounded-full hover:bg-opacity-90 transition-colors"
            title="Delete Recipe"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{recipe.name}</h3>
          <div className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">#{recipe.order}</div>
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{recipe.description}</p>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center text-gray-600">
            <Clock size={16} className="mr-1" />
            <span className="text-sm">{formattedDuration}</span>
          </div>
          <div className="flex items-center text-brand-btn_orange font-semibold">
            <DollarSign size={16} className="mr-1" />
            <span>{formattedPrice}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 