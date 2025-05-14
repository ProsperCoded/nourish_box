"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Clock, DollarSign, Star, ShoppingBag } from "lucide-react";
import { Recipe } from "@/app/utils/types/recipe.type";

interface RecipeDetailModalProps {
  recipe: Recipe;
  onClose: () => void;
}

export function RecipeDetailModal({ recipe, onClose }: RecipeDetailModalProps) {
  const [activeImage, setActiveImage] = useState<string>(recipe.displayUrl);
  const [isVideo, setIsVideo] = useState<boolean>(
    recipe.displayUrl.includes("mp4") || recipe.displayUrl.includes("webm")
  );

  // Format price in Naira
  const formattedPrice = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(recipe.price);

  // Format duration in minutes
  const formattedDuration = `${Math.floor(recipe.duration / 60)} min`;

  const handleThumbnailClick = (image: string) => {
    setActiveImage(image);
    setIsVideo(image.includes("mp4") || image.includes("webm"));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-200 rounded-full hover:bg-gray-300 z-10"
        >
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div className="space-y-4">
            {/* Main image or video */}
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              {isVideo ? (
                <video
                  src={activeImage}
                  controls
                  className="w-full h-full object-contain"
                  autoPlay
                />
              ) : (
                <Image
                  src={activeImage}
                  alt={recipe.name}
                  fill
                  className="object-contain"
                />
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <div
                className={`relative h-20 w-20 flex-shrink-0 rounded overflow-hidden cursor-pointer border-2 ${
                  activeImage === recipe.displayUrl
                    ? "border-brand-logo_green"
                    : "border-transparent"
                }`}
                onClick={() => handleThumbnailClick(recipe.displayUrl)}
              >
                {recipe.displayUrl.includes("mp4") || recipe.displayUrl.includes("webm") ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-xs text-gray-500">Video</span>
                  </div>
                ) : (
                  <Image
                    src={recipe.displayUrl}
                    alt="Main"
                    fill
                    className="object-cover"
                  />
                )}
              </div>

              {recipe.samples?.map((sample, index) => (
                <div
                  key={index}
                  className={`relative h-20 w-20 flex-shrink-0 rounded overflow-hidden cursor-pointer border-2 ${
                    activeImage === sample.image
                      ? "border-brand-logo_green"
                      : "border-transparent"
                  }`}
                  onClick={() => handleThumbnailClick(sample.image)}
                >
                  <Image
                    src={sample.image}
                    alt={sample.variant}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-1">
                    <span className="text-xs text-white truncate block">
                      {sample.variant}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="pb-4 border-b">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-gray-800">{recipe.name}</h2>
                {recipe.featured && (
                  <span className="bg-brand-btn_orange text-white px-2 py-1 rounded text-xs uppercase font-semibold flex items-center">
                    <Star size={12} className="mr-1" />
                    Featured
                  </span>
                )}
              </div>
              <p className="text-gray-600 mt-2">{recipe.description}</p>
            </div>

            <div className="pb-4 border-b space-y-2">
              <div className="flex justify-between">
                <div className="flex items-center">
                  <Clock size={18} className="mr-2 text-gray-500" />
                  <span className="text-gray-700">Preparation Time</span>
                </div>
                <span className="font-medium">{formattedDuration}</span>
              </div>

              <div className="flex justify-between">
                <div className="flex items-center">
                  <DollarSign size={18} className="mr-2 text-brand-btn_orange" />
                  <span className="text-gray-700">Price</span>
                </div>
                <span className="font-bold text-brand-btn_orange">{formattedPrice}</span>
              </div>

              <div className="flex justify-between">
                <div className="flex items-center">
                  <ShoppingBag size={18} className="mr-2 text-gray-500" />
                  <span className="text-gray-700">Order</span>
                </div>
                <span className="font-medium">#{recipe.order}</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Ingredients</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <span className="bg-brand-logo_green/10 text-brand-logo_green p-1 rounded-full mr-2">
                      ✓
                    </span>
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 