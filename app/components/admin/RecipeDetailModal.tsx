'use client';

import { useCategories } from '@/app/contexts/CategoryContext';
import { cn } from '@/app/lib/utils/cn';
import { Recipe } from '@/app/utils/types/recipe.type';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  PlayCircle,
  ShoppingBag,
  Star,
  Tag,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';

interface RecipeDetailModalProps {
  recipe: Recipe;
  onClose: () => void;
}

interface MediaItem {
  url: string;
  type: 'image' | 'video';
  variant?: string;
  id: string;
}

export function RecipeDetailModal({ recipe, onClose }: RecipeDetailModalProps) {
  const { getCategoryName } = useCategories();

  const [activeMedia, setActiveMedia] = useState<MediaItem>({
    id: 'display',
    url: recipe.displayMedia.url,
    type: recipe.displayMedia.type,
  });

  const allMediaItems: MediaItem[] = [
    {
      id: 'display',
      url: recipe.displayMedia.url,
      type: recipe.displayMedia.type,
      variant: 'Display',
    },
    ...(recipe.samples?.map((sample, index) => ({
      id: `sample-${index}-${sample.media.publicId || index}`,
      url: sample.media.url,
      type: sample.media.type,
      variant: sample.variant || `Sample ${index + 1}`,
    })) || []),
  ];

  const formattedPrice = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(recipe.price);

  const formattedDuration = `${Math.floor(recipe.duration / 60)} min ${recipe.duration % 60} sec`;

  // Get category name using CategoryContext
  const categoryName = recipe.categoryId
    ? getCategoryName(recipe.categoryId)
    : undefined;

  const handleThumbnailClick = (media: MediaItem) => {
    setActiveMedia(media);
  };

  const thumbnailsContainerRef = useRef<HTMLDivElement>(null);

  const scrollThumbnails = (direction: 'left' | 'right') => {
    if (thumbnailsContainerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      thumbnailsContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[100] overflow-y-auto backdrop-blur-sm'>
      <div className='bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto relative flex flex-col'>
        <button
          onClick={onClose}
          className='absolute top-3 right-3 p-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors z-20'
          aria-label='Close modal'
        >
          <X size={22} />
        </button>

        <div className='p-6 sm:p-8 flex-grow'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8'>
            {/* Media Column */}
            <div className='flex flex-col space-y-3'>
              <div className='relative aspect-video bg-gray-200 rounded-lg overflow-hidden shadow-inner'>
                {activeMedia.type === 'video' ? (
                  <video
                    key={activeMedia.url}
                    src={activeMedia.url}
                    controls
                    className='w-full h-full object-contain bg-black'
                    autoPlay
                  />
                ) : (
                  <Image
                    key={activeMedia.url}
                    src={activeMedia.url}
                    alt={activeMedia.variant || recipe.name}
                    fill
                    className='object-contain'
                    sizes='(max-width: 1024px) 100vw, 50vw'
                  />
                )}
              </div>

              {/* Thumbnails Carousel */}
              {allMediaItems.length > 1 && (
                <div className='relative flex items-center'>
                  <button
                    onClick={() => scrollThumbnails('left')}
                    className='absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-white/80 hover:bg-white rounded-full shadow-md text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed -ml-3'
                    aria-label='Scroll left'
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div
                    ref={thumbnailsContainerRef}
                    className='flex gap-2 overflow-x-auto scroll-smooth scrollbar-hide py-1 px-1 flex-grow'
                  >
                    {allMediaItems.map(media => (
                      <div
                        key={media.id}
                        className={cn(
                          'relative h-16 w-24 sm:h-20 sm:w-28 flex-shrink-0 rounded-md overflow-hidden cursor-pointer border-2 transition-all duration-200 hover:opacity-80',
                          activeMedia.id === media.id
                            ? 'border-brand-logo_green shadow-lg scale-105'
                            : 'border-gray-200 hover:border-gray-400'
                        )}
                        onClick={() => handleThumbnailClick(media)}
                        title={
                          media.variant ||
                          (media.type === 'video' ? 'Video' : 'Image')
                        }
                      >
                        {media.type === 'video' ? (
                          <>
                            <video
                              src={media.url}
                              className='w-full h-full object-cover bg-black'
                              preload='metadata'
                            />
                            <div className='absolute inset-0 flex items-center justify-center bg-black/30'>
                              <PlayCircle
                                size={24}
                                className='text-white opacity-90'
                              />
                            </div>
                          </>
                        ) : (
                          <Image
                            src={media.url}
                            alt={media.variant || 'Thumbnail'}
                            fill
                            className='object-cover'
                            sizes='120px'
                          />
                        )}
                        {media.variant && media.variant !== 'Display' && (
                          <div className='absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1.5 py-0.5 truncate text-center'>
                            {media.variant}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => scrollThumbnails('right')}
                    className='absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-white/80 hover:bg-white rounded-full shadow-md text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed -mr-3'
                    aria-label='Scroll right'
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Details Column */}
            <div className='space-y-5 lg:max-h-[calc(95vh-100px)] lg:overflow-y-auto lg:pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'>
              <div className='pb-4 border-b border-gray-200'>
                <div className='flex justify-between items-start mb-1'>
                  <h2 className='text-2xl sm:text-3xl font-bold text-gray-800 leading-tight'>
                    {recipe.name}
                  </h2>
                  {recipe.featured && (
                    <span className='bg-yellow-400 text-yellow-900 px-2.5 py-1 rounded-full text-xs uppercase font-semibold flex items-center shadow-sm'>
                      <Star size={14} className='mr-1.5 fill-current' />
                      Featured
                    </span>
                  )}
                </div>
                <p className='text-gray-600 text-sm sm:text-base leading-relaxed'>
                  {recipe.description}
                </p>
              </div>

              <div className='grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:text-base'>
                <div className='flex items-center col-span-2 sm:col-span-1'>
                  <Clock
                    size={20}
                    className='mr-2.5 text-gray-500 flex-shrink-0'
                  />
                  <span className='text-gray-600'>Prep Time:</span>
                  <span className='font-medium text-gray-800 ml-auto pl-2'>
                    {formattedDuration}
                  </span>
                </div>

                <div className='flex items-center col-span-2 sm:col-span-1'>
                  <DollarSign
                    size={20}
                    className='mr-2.5 text-brand-btn_orange flex-shrink-0'
                  />
                  <span className='text-gray-600'>Price:</span>
                  <span className='font-bold text-brand-btn_orange ml-auto pl-2'>
                    {formattedPrice}
                  </span>
                </div>

                {categoryName && (
                  <div className='flex items-center col-span-2 sm:col-span-1'>
                    <Tag
                      size={20}
                      className='mr-2.5 text-gray-500 flex-shrink-0'
                    />
                    <span className='text-gray-600'>Category:</span>
                    <span className='font-medium text-gray-800 ml-auto pl-2'>
                      {categoryName}
                    </span>
                  </div>
                )}

                <div className='flex items-center col-span-2 sm:col-span-1'>
                  <ShoppingBag
                    size={20}
                    className='mr-2.5 text-gray-500 flex-shrink-0'
                  />
                  <span className='text-gray-600'>Display Order:</span>
                  <span className='font-medium text-gray-800 ml-auto pl-2'>
                    #{recipe.order}
                  </span>
                </div>
              </div>

              <div>
                <h3 className='text-lg font-semibold text-gray-700 mb-2.5'>
                  Ingredients
                </h3>
                {(() => {
                  // Normalize ingredients to array
                  const ingredientsArray = Array.isArray(recipe.ingredients)
                    ? recipe.ingredients
                    : typeof recipe.ingredients === 'string'
                      ? recipe.ingredients
                          .split(',')
                          .map(s => s.trim())
                          .filter(Boolean)
                      : [];

                  return ingredientsArray.length > 0 ? (
                    <ul className='space-y-1.5'>
                      {ingredientsArray.map((ingredient, index) => (
                        <li
                          key={index}
                          className='flex items-start text-gray-700 text-sm sm:text-base'
                        >
                          <span className='bg-green-100 text-green-700 text-xs font-bold p-1 rounded-full mr-2.5 mt-0.5 flex-shrink-0 w-5 h-5 flex items-center justify-center'>
                            ✓
                          </span>
                          <span>{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className='text-gray-500 italic text-sm'>
                      No ingredients listed.
                    </p>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
