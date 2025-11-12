'use client';
import { Modal } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import LoginPrompt from './LoginPrompt';
// import { useManualLoginPrompt } from '../auth/loginPromptWrapper';
import { useManualLoginPrompt } from './LoginPromptWrapper';
import RecipeDetailModal from './RecipeDetailModal';

import { Clock, Heart, Play, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useCategories } from '../contexts/CategoryContext';
import { useFavorites } from '../contexts/FavContext';
import useMobileVs from '../hooks/useMobileVs';
import { cn } from '../lib/utils/cn';
import { Recipe } from '../utils/types/recipe.type';
import StarRating from './StarRating';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const { getCategoryName } = useCategories();
  const categoryName = getCategoryName(recipe.categoryId || '');
  const { addFavorite, deleteFavorite, isFavorite } = useFavorites();
  const { user } = useAuth();
  const {
    showPrompt,
    triggerPrompt,
    hidePrompt,
    decrementPromptCounter,
    handleNeverMind,
  } = useManualLoginPrompt();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMobile = useMobileVs();
  const router = useRouter();

  const isFavorited = isFavorite(recipe.id.toString());

  const formattedPrice = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(recipe.price);

  const formattedDuration = recipe.duration
    ? `${Math.floor(recipe.duration / 60)} min`
    : 'Quick';

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      triggerPrompt();
      return;
    }

    try {
      setIsLoading(true);
      setIsHeartAnimating(true);

      if (isFavorited) {
        await deleteFavorite(recipe.id.toString());
        toast.success('Removed from favorites', {
          duration: 2000,
          position: 'top-center',
        });
      } else {
        await addFavorite(recipe);
        toast.success('Added to favorites', {
          duration: 2000,
          position: 'top-center',
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites', {
        duration: 3000,
        position: 'top-center',
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsHeartAnimating(false), 300);
    }
  };

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isMobile) {
      router.push(`/shop/${recipe.id}`);
    } else {
      setOpen(true);
    }
  };

  // Handle card click to open modal
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    handleOpen(e);
  };

  const handleClose = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setOpen(false);
  };

  const handleModalAddToCart = () => {
    setOpen(false);

    if (!user) {
      const newCount = decrementPromptCounter();
      if (newCount === 0) {
        triggerPrompt();
      }
    }
  };

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
      className='relative bg-white rounded-xl shadow-lg overflow-hidden w-[300px] transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] group cursor-pointer'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Media Section */}
      <div className='relative h-48 overflow-hidden'>
        {recipe.displayMedia.type === 'video' ? (
          <>
            <video
              ref={videoRef}
              src={recipe.displayMedia.url}
              className='object-cover w-full h-full transition-transform duration-500 group-hover:scale-110'
              muted
              loop
            />
            {!isHovered && (
              <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-30'>
                <Play className='w-12 h-12 text-white drop-shadow-lg' />
              </div>
            )}
          </>
        ) : (
          <img
            src={recipe.displayMedia.url}
            alt={recipe.name}
            // fill
            loading='lazy'
            className='object-cover transition-transform duration-500 group-hover:scale-110'
          />
        )}

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          disabled={isLoading}
          className={cn(
            'absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-sm transition-all duration-300 z-10',
            'hover:scale-110 active:scale-95',
            isFavorited
              ? 'bg-red-500/90 text-white shadow-lg'
              : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500',
            isHeartAnimating && 'animate-pulse scale-125'
          )}
        >
          <Heart
            className={cn(
              'w-5 h-5 transition-all duration-300',
              isFavorited ? 'fill-current' : '',
              isHeartAnimating && 'animate-bounce'
            )}
          />
        </button>

        {/* Price Badge */}
        <div className='absolute top-3 left-3 bg-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg'>
          {formattedPrice}
        </div>

        {/* Duration Badge */}
        {recipe.duration && (
          <div className='absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1'>
            <Clock className='w-3 h-3' />
            {formattedDuration}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        <div
          className={`flex justify-between items-start ${recipe.name.length > 7 ? "flex-col self-start " : ""
            }`}
        >
          <h3 className="text-md xl:text-lg font-inter font-bold text-gray-800 line-clamp-1 pr-2 flex-grow">
            {recipe.name}
          </h3>

          {categoryName && (
            <div
              className={`flex items-center gap-1.5 text-xs text-gray-500 ${recipe.name.length > 7 ? "self-end mt-1" : ""
                }`}
            >

              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                {categoryName}
              </span>
            </div>
          )}
        </div>

        {recipe.description && (
          <p className="text-gray-600 text-sm font-inter line-clamp-2 leading-relaxed">
            {recipe.description}
          </p>
        )}

        {/* Rating Section - Only show if there are reviews */}
        {(recipe.totalReviews || 0) > 0 && (
          <div className="flex items-center justify-between">
            <StarRating
              rating={recipe.averageRating || 0}
              totalReviews={recipe.totalReviews || 0}
              size="sm"
              showCount={true}
            />
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={e => {
              e.stopPropagation()
              handleOpen(e)
            }}
            className="w-full bg-brand-btn_orange hover:from-orange-500 hover:to-[#F15A28] text-white py-2.5 px-4 rounded-lg font-medium font-inter transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            <ShoppingBag className="w-4 h-4" />
            Add to Cart
          </button>
        </div>

        <RecipeDetailModal
          recipe={recipe}
          open={open}
          onClose={handleClose}
          onAddToCart={handleModalAddToCart}
        />
      </div>


      <Modal open={showPrompt} onClose={hidePrompt}>
        <LoginPrompt
          main_text='to add to favorites, add to cart and save time on your next order!'
          onNeverMind={handleNeverMind}
          onClose={hidePrompt}
        />
      </Modal>
    </div>
  );
};

export default RecipeCard;
