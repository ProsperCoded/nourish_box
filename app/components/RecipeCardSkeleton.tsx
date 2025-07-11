"use client";

import React from "react";

const RecipeCardSkeleton: React.FC = () => {
  return (
    <div className="relative bg-white rounded-xl shadow-lg overflow-hidden w-[350px]">
      {/* Shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent z-10"></div>

      {/* Media Section Skeleton */}
      <div className="relative h-48 bg-gray-300 animate-pulse">
        {/* Favorite Button Skeleton */}
        <div className="absolute top-3 right-3 w-10 h-10 bg-gray-400 rounded-full"></div>

        {/* Price Badge Skeleton */}
        <div className="absolute top-3 left-3 w-20 h-6 bg-gray-400 rounded-full"></div>

        {/* Duration Badge Skeleton */}
        <div className="absolute bottom-3 left-3 w-16 h-5 bg-gray-400 rounded-md"></div>

        {/* Play Button Skeleton (for video placeholder) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-gray-400 rounded-full opacity-60"></div>
        </div>
      </div>

      {/* Content Section Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title Skeleton */}
        <div className="space-y-2">
          <div className="h-6 bg-gray-300 rounded w-3/4 animate-pulse"></div>
        </div>

        {/* Description Skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-full animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3 animate-pulse"></div>
        </div>

        {/* Add to Cart Button Skeleton */}
        <div className="pt-2">
          <div className="w-full h-10 bg-gray-300 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCardSkeleton;
