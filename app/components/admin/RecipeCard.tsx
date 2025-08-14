"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Clock,
  DollarSign,
  Star,
  Edit,
  Trash2,
  Eye,
  Film,
  ImageIcon,
} from "lucide-react";
import { Recipe } from "@/app/utils/types/recipe.type";
import { cn } from "@/app/lib/utils/cn";

interface RecipeCardProps {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
  onView: (recipe: Recipe) => void;
}

export function RecipeCard({
  recipe,
  onEdit,
  onDelete,
  onView,
}: RecipeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Format price in Naira
  const formattedPrice = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(recipe.price);

  // Format duration in minutes
  const formattedDuration = `${Math.floor(recipe.duration / 60)} min`;

  // Control video playback on hover
  useEffect(() => {
    if (videoRef.current) {
      if (isHovered) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isHovered]);

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[4/3] overflow-hidden group">
        {recipe.displayMedia ? (
          recipe.displayMedia.type === "video" ? (
            <>
              <video
                ref={videoRef}
                src={recipe.displayMedia.url}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                controls={false}
                muted
                loop
                preload="metadata"
              />
              {!isHovered && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                  <Film size={48} className="text-white opacity-80" />
                </div>
              )}
            </>
          ) : (
            <Image
              src={recipe.displayMedia.url}
              alt={recipe.name}
              fill
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <ImageIcon size={48} className="text-gray-400" />
          </div>
        )}

        {/* Featured badge */}
        {recipe.featured && (
          <div className="absolute top-2 left-2 bg-brand-btn_orange text-white px-2 py-1 rounded-md text-xs font-semibold z-10">
            Featured
          </div>
        )}

        {/* Actions overlay on hover */}
        <div
          className={cn(
            "absolute inset-0 bg-black/60 flex items-center justify-center gap-3 transition-opacity duration-300 z-20",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          <button
            onClick={() => onView(recipe)}
            className="bg-white text-gray-800 p-2.5 rounded-full hover:bg-gray-100 transition-colors shadow-md"
            title="View Recipe"
          >
            <Eye size={20} />
          </button>
          <button
            onClick={() => onEdit(recipe)}
            className="bg-brand-logo_green text-white p-2.5 rounded-full hover:bg-opacity-90 transition-colors shadow-md"
            title="Edit Recipe"
          >
            <Edit size={20} />
          </button>
          <button
            onClick={() => onDelete(recipe)}
            className="bg-red-500 text-white p-2.5 rounded-full hover:bg-opacity-90 transition-colors shadow-md"
            title="Delete Recipe"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3
            className="text-lg font-semibold text-gray-800 line-clamp-1 mr-2 flex-grow"
            title={recipe.name}
          >
            {recipe.name}
          </h3>
          <div className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600 whitespace-nowrap">
            Order: {recipe.order}
          </div>
        </div>

        <p
          className="text-gray-600 text-sm line-clamp-2 mb-3 flex-grow"
          title={recipe.description}
        >
          {recipe.description}
        </p>

        {/* Sample Images Section */}
        {recipe.samples && recipe.samples.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-500 mb-1.5">Samples:</p>
            <div className="flex flex-wrap gap-2">
              {recipe.samples.slice(0, 4).map(
                (
                  sample,
                  index // Show up to 4 samples
                ) => (
                  <div
                    key={index}
                    className="relative group w-16 h-16 rounded overflow-hidden border border-gray-200"
                  >
                    {sample.media.type === "video" ? (
                      <video
                        src={sample.media.url}
                        className="object-cover w-full h-full"
                        preload="metadata"
                        title={sample.variant}
                      />
                    ) : (
                      <Image
                        src={sample.media.url}
                        alt={sample.variant || `Sample ${index + 1}`}
                        fill
                        sizes="64px"
                        className="object-cover"
                        title={sample.variant}
                      />
                    )}
                    {sample.variant && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1 py-0.5 truncate text-center">
                        {sample.variant}
                      </div>
                    )}
                    {sample.media.type === "video" && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <Film size={16} className="text-white opacity-80" />
                      </div>
                    )}
                  </div>
                )
              )}
              {recipe.samples.length > 4 && (
                <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500 border border-gray-200">
                  +{recipe.samples.length - 4} more
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center text-gray-600">
              <Clock size={16} className="mr-1.5" />
              <span className="text-sm">{formattedDuration}</span>
            </div>
            <div className="flex items-center text-brand-btn_orange font-semibold">
              <DollarSign size={16} className="mr-1" />
              <span className="text-sm">{formattedPrice}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
