'use client';

import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Clock,
  Image as ImageIcon,
  ShoppingBag,
  Tag,
  X,
} from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';
import { useCategories } from '../contexts/CategoryContext';
import { Recipe } from '../utils/types/recipe.type';

interface RecipeDetailModalProps {
  recipe: Recipe;
  open: boolean;
  onClose: () => void; // simplified signature
  onAddToCart?: () => void;
  categoryName?: string; // Optional category name to display
}

type MediaKind = 'image' | 'video';
interface MediaItem {
  url: string;
  type: MediaKind;
  variant?: string;
  id: string;
}

const formatNGN = (n: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(n);

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '92%',
  maxWidth: '1100px',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 0,
  maxHeight: '95vh',
  overflow: 'hidden',
  outline: 'none',
  borderRadius: '14px',
};

const MAX_DESC = 220;
const ING_VISIBLE = 8;

const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  open,
  onClose,
  onAddToCart,
  categoryName,
}) => {
  const { addToCart, loading: cartLoading } = useCart();
  const { getCategoryName } = useCategories();

  // Use categoryName prop if provided, otherwise get it from CategoryContext
  const displayCategoryName =
    categoryName ||
    (recipe.categoryId ? getCategoryName(recipe.categoryId) : undefined);

  const [option, setOption] = useState<string>('');
  const [count, setCount] = useState(1);

  const [descExpanded, setDescExpanded] = useState(false);
  const [ingExpanded, setIngExpanded] = useState(false);

  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const allMediaItems = useMemo<MediaItem[]>(() => {
    const base: MediaItem[] = recipe.displayMedia
      ? [
          {
            id: 'display',
            url: recipe.displayMedia.url,
            type: recipe.displayMedia.type as MediaKind,
            variant: 'Display',
          },
        ]
      : [];
    const samples =
      recipe.samples?.map((s, i) => ({
        id: `sample-${i}-${s.media.publicId || i}`,
        url: s.media.url,
        type: s.media.type as MediaKind,
        variant: s.variant || `Sample ${i + 1}`,
      })) || [];
    return [...base, ...samples];
  }, [recipe]);

  useEffect(() => {
    if (!open) return;
    setCount(1);
    setOption('');
    setDescExpanded(false);
    setIngExpanded(false);
    setActiveIndex(0);
  }, [open, recipe]);

  useEffect(() => {
    if (!open || allMediaItems.length < 2) return;
    autoplayRef.current = setInterval(() => {
      setActiveIndex(idx => (idx + 1) % allMediaItems.length);
    }, 4500);
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [open, allMediaItems.length]);

  const handleChange = (event: SelectChangeEvent) =>
    setOption(event.target.value);

  const navigateMedia = (dir: 'prev' | 'next') => {
    if (allMediaItems.length < 2) return;
    setActiveIndex(idx =>
      dir === 'prev'
        ? (idx - 1 + allMediaItems.length) % allMediaItems.length
        : (idx + 1) % allMediaItems.length
    );
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) navigateMedia(delta > 0 ? 'prev' : 'next');
    touchStartX.current = null;
  };

  const mustChoosePackaging = count > 1 && !option;
  const showPackaging = count > 1;

  const handleAddToCartClick = async () => {
    try {
      await addToCart(recipe, count, option);
      toast.success(`${recipe.name} added to cart!`, {
        duration: 2500,
        position: 'top-center',
      });
      setCount(1);
      setOption('');
      if (onAddToCart) onAddToCart();
    } catch (error) {
      console.error(error);
      toast.error('Failed to add item to cart. Please try again.', {
        duration: 3500,
        position: 'top-center',
      });
    }
  };

  const durationMinutes = recipe.duration
    ? recipe.duration >= 120
      ? Math.round(recipe.duration / 60)
      : recipe.duration
    : null;

  const truncate = (s: string, n: number) =>
    s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s;

  // Normalize ingredients to an array (supports comma-separated string)
  const ingredientsArr = useMemo<string[]>(() => {
    const src = (recipe as any).ingredients;
    if (Array.isArray(src))
      return src.filter(Boolean).map(s => String(s).trim());
    if (typeof src === 'string')
      return src
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    return [];
  }, [recipe]);

  return (
    <Modal
      open={open}
      onClose={(_, __) => onClose()} // wrap MUI’s onClose to your simple callback
      aria-labelledby='recipe-title'
      aria-describedby='recipe-description'
    >
      <Box sx={modalStyle}>
        {/* Header */}
        <div className='flex items-center justify-between px-5 py-3 border-b border-gray-200'>
          <h2
            id='recipe-title'
            className='text-xl md:text-2xl font-semibold text-gray-900'
          >
            {recipe.name}
          </h2>
          <button
            onClick={onClose} // X button closes directly
            aria-label='Close modal'
            className='text-gray-500 hover:text-gray-700'
          >
            <X className='h-6 w-6' />
          </button>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2'>
          {/* LEFT: Carousel */}
          <div className='p-4 lg:p-6'>
            <div
              className='group relative w-full rounded-xl bg-gray-50 overflow-hidden shadow-sm'
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
              onMouseEnter={() =>
                autoplayRef.current && clearInterval(autoplayRef.current)
              }
            >
              <div className='relative w-full aspect-[4/3] md:aspect-video'>
                {allMediaItems.length > 0 ? (
                  allMediaItems[activeIndex].type === 'video' ? (
                    <video
                      key={allMediaItems[activeIndex].url}
                      src={allMediaItems[activeIndex].url}
                      controls
                      muted
                      playsInline
                      className='w-full h-full object-contain bg-black'
                      autoPlay
                    />
                  ) : (
                    <Image
                      key={allMediaItems[activeIndex].url}
                      src={allMediaItems[activeIndex].url}
                      alt={allMediaItems[activeIndex].variant || recipe.name}
                      fill
                      className='object-contain'
                      sizes='(max-width:1024px) 100vw, 50vw'
                      priority
                    />
                  )
                ) : (
                  <div className='w-full h-full flex items-center justify-center bg-gray-100'>
                    <div className='flex flex-col items-center text-gray-400'>
                      <ImageIcon className='w-10 h-10 mb-2' />
                      <span className='text-sm'>No media available</span>
                    </div>
                  </div>
                )}
              </div>

              {allMediaItems.length > 1 && (
                <>
                  <button
                    onClick={() => navigateMedia('prev')}
                    className='absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/85 hover:bg-white shadow rounded-full'
                    aria-label='Previous media'
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    onClick={() => navigateMedia('next')}
                    className='absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/85 hover:bg-white shadow rounded-full'
                    aria-label='Next media'
                  >
                    <ChevronRight size={22} />
                  </button>

                  <div className='absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2'>
                    {allMediaItems.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveIndex(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        className={`h-2.5 w-2.5 rounded-full transition ${
                          i === activeIndex
                            ? 'bg-gray-900'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* RIGHT: Content */}
          <div className='px-5 py-5 lg:py-6 lg:pr-6 border-t lg:border-t-0 lg:border-l border-gray-200'>
            {/* Description */}
            {recipe.description && (
              <div className='max-w-[56ch]'>
                <p
                  id='recipe-description'
                  className='text-[15px] leading-7 text-gray-700'
                >
                  {descExpanded
                    ? recipe.description
                    : truncate(recipe.description, MAX_DESC)}
                </p>
                {recipe.description.length > MAX_DESC && (
                  <button
                    type='button'
                    onClick={() => setDescExpanded(s => !s)}
                    className='mt-2 text-sm font-medium text-orange-600 hover:underline'
                  >
                    {descExpanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            )}

            {/* Duration */}
            {durationMinutes !== null && (
              <div className='mt-3 flex items-center gap-2 text-sm text-gray-600'>
                <Clock className='w-4 h-4' />
                <span>{durationMinutes} min</span>
              </div>
            )}

            {/* Category */}
            {displayCategoryName && (
              <div className='mt-3 flex items-center gap-2 text-sm text-gray-600'>
                <Tag className='w-4 h-4' />
                <span className='px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-medium'>
                  {displayCategoryName}
                </span>
              </div>
            )}

            {/* Ingredients — two-column with icons */}
            {ingredientsArr.length > 0 && (
              <div className='mt-6'>
                <h4 className='text-base md:text-lg font-semibold text-gray-800 mb-2'>
                  Ingredients
                </h4>

                <ul className='grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2'>
                  {(ingExpanded
                    ? ingredientsArr
                    : ingredientsArr.slice(0, ING_VISIBLE)
                  ).map((ing, idx) => (
                    <li
                      key={idx}
                      className='flex items-start gap-2 text-[15px] leading-6 text-gray-800'
                    >
                      <span className='mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-50 text-green-700 border border-green-200'>
                        <ChefHat className='h-3.5 w-3.5' />
                      </span>
                      <span className='flex-1'>{ing}</span>
                    </li>
                  ))}
                </ul>

                {ingredientsArr.length > ING_VISIBLE && (
                  <button
                    type='button'
                    onClick={() => setIngExpanded(s => !s)}
                    className='mt-3 text-sm font-medium text-orange-600 hover:underline'
                  >
                    {ingExpanded
                      ? 'Show fewer'
                      : `Show ${ingredientsArr.length - ING_VISIBLE} more`}
                  </button>
                )}
              </div>
            )}

            {/* Packaging choice (only if more than one pack) */}
            {showPackaging && (
              <div className='mt-6'>
                <p className='font-medium text-gray-800 mb-2'>
                  Packaging choice (if more than one pack)
                </p>

                <FormControl fullWidth>
                  <InputLabel id='packaging-label'>Select packaging</InputLabel>
                  <Select
                    labelId='packaging-label'
                    value={option}
                    label='Select packaging'
                    onChange={handleChange}
                  >
                    <MenuItem value='separate'>Packed separately</MenuItem>
                    <MenuItem value='together'>Packed as one</MenuItem>
                  </Select>
                </FormControl>

                {mustChoosePackaging && (
                  <p className='text-sm text-orange-600 mt-1'>
                    Please choose a packaging option.
                  </p>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className='mt-6 flex items-center gap-3'>
              <span className='text-sm text-gray-600'>Quantity</span>
              <div className='flex items-center border border-gray-300 rounded-lg overflow-hidden'>
                <button
                  className='px-3 py-2 hover:bg-gray-100'
                  onClick={() => setCount(c => Math.max(1, c - 1))}
                >
                  -
                </button>
                <span
                  aria-live='polite'
                  className='px-4 py-2 border-x border-gray-300'
                >
                  {count}
                </span>
                <button
                  className='px-3 py-2 hover:bg-gray-100'
                  onClick={() => setCount(c => c + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Price + CTA */}
            <div className='mt-7 pt-5 border-t border-gray-200'>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                <div>
                  <h4 className='text-xs text-gray-500 uppercase tracking-wider'>
                    Total Price
                  </h4>
                  <p className='text-2xl font-extrabold text-gray-900'>
                    {formatNGN((recipe.price || 0) * count)}
                  </p>
                </div>
                <button
                  className='sm:w-auto w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-6 rounded-lg font-medium transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                  onClick={handleAddToCartClick}
                  disabled={cartLoading || (showPackaging && !option)}
                >
                  <ShoppingBag className='w-4 h-4' />
                  {cartLoading
                    ? 'Adding...'
                    : showPackaging && !option
                      ? 'Choose packaging'
                      : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Box>
    </Modal>
  );
};

export default RecipeDetailModal;
