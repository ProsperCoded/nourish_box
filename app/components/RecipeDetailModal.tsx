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
import { X, Clock, DollarSign, ShoppingBag } from "lucide-react";
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
  const videoRef = useRef<HTMLVideoElement>(null);

  // Format price in Naira
  const formattedPrice = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(recipe.price);

  const handleChange = (event: SelectChangeEvent) => {
    setOption(event.target.value);
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
    width: "80%",
    maxWidth: "1000px",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    maxHeight: "90vh",
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

        <div className="flex flex-col md:flex-row gap-6">
          {/* Media Section */}
          <div className="md:w-1/2">
            {recipe.displayMedia.type === "video" ? (
              <video
                ref={videoRef}
                src={recipe.displayMedia.url}
                className="rounded-lg w-full max-h-[400px]"
                controls
                autoPlay
              />
            ) : (
              <Image
                src={recipe.displayMedia.url}
                alt={recipe.name}
                className="rounded-lg w-full"
                width={500}
                height={300}
                style={{ objectFit: "contain", maxHeight: "400px" }}
              />
            )}
          </div>

          {/* Content Section */}
          <div className="md:w-1/2 space-y-4">
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
                    <li key={index} className="text-gray-600 text-sm">
                      • {ingredient}
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
