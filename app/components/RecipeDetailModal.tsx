"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  Modal,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import {
  X,
  Clock,
  DollarSign,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  Image as ImageIcon,
} from "lucide-react";
import { Recipe } from "../utils/types/recipe.type";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import toast from "react-hot-toast";

interface RecipeDetailModalProps {
  recipe: Recipe;
  open: boolean;
  onClose: (e: React.MouseEvent | React.KeyboardEvent) => void;
  onAddToCart?: () => void;
}

interface MediaItem {
  url: string;
  type: "image" | "video";
  variant?: string;
  id: string;
}

const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  open,
  onClose,
  onAddToCart,
}) => {
  const { user } = useAuth();
  const { addToCart, loading: cartLoading } = useCart();
  const [option, setOption] = useState<string>("");
  const [count, setCount] = useState(1);
  const [activeMedia, setActiveMedia] = useState<MediaItem>({
    id: "display",
    url: recipe.displayMedia.url,
    type: recipe.displayMedia.type,
  });
  const thumbnailsContainerRef = useRef<HTMLDivElement>(null);

  // Create all media items including display and samples
  const allMediaItems: MediaItem[] = [
    {
      id: "display",
      url: recipe.displayMedia.url,
      type: recipe.displayMedia.type,
      variant: "Display",
    },
    ...(recipe.samples?.map((sample, index) => ({
      id: `sample-${index}-${sample.media.publicId || index}`,
      url: sample.media.url,
      type: sample.media.type,
      variant: sample.variant || `Sample ${index + 1}`,
    })) || []),
  ];

  // Format price in Naira
  const formattedPrice = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(recipe.price);

  const handleChange = (event: SelectChangeEvent) => {
    setOption(event.target.value);
  };

  const handleThumbnailClick = (media: MediaItem) => {
    setActiveMedia(media);
  };

  const scrollThumbnails = (direction: "left" | "right") => {
    if (thumbnailsContainerRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      thumbnailsContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleAddToCartClick = async () => {
    try {
      await addToCart(recipe, count, option);

      toast.success(`${recipe.name} added to cart!`, {
        duration: 3000,
        position: "top-center",
      });

      // Reset form state
      setCount(1);
      setOption("");

      // Call parent callback if provided
      if (onAddToCart) {
        onAddToCart();
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart. Please try again.", {
        duration: 4000,
        position: "top-center",
      });
    }
  };

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: "1200px",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    maxHeight: "95vh",
    overflow: "auto",
    outline: "none",
    borderRadius: "12px",
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      onClick={(e) => e.stopPropagation()}
      disableAutoFocus={true}
      disableEnforceFocus={true}
    >
      <Box sx={modalStyle}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors z-50"
          aria-label="Close modal"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Media Section */}
          <div className="space-y-4">
            {/* Main Media Display */}
            <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden shadow-inner">
              {activeMedia.type === "video" ? (
                <video
                  key={activeMedia.url}
                  src={activeMedia.url}
                  controls
                  className="w-full h-full object-contain bg-black"
                  autoPlay
                />
              ) : (
                <Image
                  key={activeMedia.url}
                  src={activeMedia.url}
                  alt={activeMedia.variant || recipe.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              )}
            </div>

            {/* Thumbnails Carousel */}
            {allMediaItems.length > 1 && (
              <div className="relative flex items-center">
                <button
                  onClick={() => scrollThumbnails("left")}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-white/80 hover:bg-white rounded-full shadow-md text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed -ml-3"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={20} />
                </button>

                <div
                  ref={thumbnailsContainerRef}
                  className="flex gap-2 overflow-x-auto scroll-smooth scrollbar-hide py-1 px-1 flex-grow"
                >
                  {allMediaItems.map((media) => (
                    <div
                      key={media.id}
                      className={`relative h-16 w-24 sm:h-20 sm:w-28 flex-shrink-0 rounded-md overflow-hidden cursor-pointer border-2 transition-all duration-200 hover:opacity-80 ${
                        activeMedia.id === media.id
                          ? "border-orange-500 shadow-lg scale-105"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                      onClick={() => handleThumbnailClick(media)}
                      title={
                        media.variant ||
                        (media.type === "video" ? "Video" : "Image")
                      }
                    >
                      {media.type === "video" ? (
                        <>
                          <video
                            src={media.url}
                            className="w-full h-full object-cover bg-black"
                            preload="metadata"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <PlayCircle
                              size={24}
                              className="text-white opacity-90"
                            />
                          </div>
                        </>
                      ) : (
                        <Image
                          src={media.url}
                          alt={media.variant || "Thumbnail"}
                          fill
                          className="object-cover"
                          sizes="120px"
                        />
                      )}
                      {media.variant && media.variant !== "Display" && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1.5 py-0.5 truncate text-center">
                          {media.variant}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => scrollThumbnails("right")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-white/80 hover:bg-white rounded-full shadow-md text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed -mr-3"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="space-y-4 lg:max-h-[calc(95vh-100px)] lg:overflow-y-auto lg:pr-2">
            {/* Title and Description */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {recipe.name}
              </h2>
              {recipe.description && (
                <p className="text-gray-600">{recipe.description}</p>
              )}
            </div>

            {/* Recipe Info */}
            <div className="flex items-center gap-4 text-sm">
              {recipe.duration && (
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{Math.floor(recipe.duration / 60)} min</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-orange-600 font-semibold">
                <DollarSign className="w-4 h-4" />
                <span>{formattedPrice}</span>
              </div>
            </div>

            {/* Ingredients */}
            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-700 mb-2">
                  Ingredients
                </h4>
                <ul className="space-y-1">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li
                      key={index}
                      className="text-gray-600 text-sm flex items-start"
                    >
                      <span className="bg-green-100 text-green-700 text-xs font-bold p-1 rounded-full mr-2 mt-0.5 flex-shrink-0 w-5 h-5 flex items-center justify-center">
                        ✓
                      </span>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Packaging Options */}
            <div>
              <p className="font-semibold text-gray-700 mb-2">
                How do you want it packaged? (if more than one portion ordered)
              </p>
              <FormControl fullWidth>
                <InputLabel id="dropdown-label">Choose an option</InputLabel>
                <Select
                  labelId="dropdown-label"
                  value={option}
                  label="Choose an option"
                  onChange={handleChange}
                >
                  <MenuItem value="separate">Pack separately</MenuItem>
                  <MenuItem value="together">Pack as one</MenuItem>
                </Select>
              </FormControl>
            </div>

            {/* Quantity Selector */}
            <div className="flex justify-center">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  className="px-3 py-2 hover:bg-gray-100 transition-colors"
                  onClick={() => setCount(Math.max(1, count - 1))}
                >
                  -
                </button>
                <span className="px-4 py-2 border-x border-gray-300">
                  {count}
                </span>
                <button
                  className="px-3 py-2 hover:bg-gray-100 transition-colors"
                  onClick={() => setCount(count + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Price and Add to Cart */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div>
                <h4 className="text-sm text-gray-500">Total Price</h4>
                <p className="text-2xl font-bold text-gray-800">
                  {new Intl.NumberFormat("en-NG", {
                    style: "currency",
                    currency: "NGN",
                    minimumFractionDigits: 0,
                  }).format(recipe.price * count)}
                </p>
              </div>
              <button
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                onClick={handleAddToCartClick}
                disabled={cartLoading}
              >
                <ShoppingBag className="w-4 h-4" />
                {cartLoading ? "Adding..." : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      </Box>
    </Modal>
  );
};

export default RecipeDetailModal;
