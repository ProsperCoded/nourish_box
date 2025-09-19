'use client';

import { Star, StarHalf } from 'lucide-react';
import { cn } from '../lib/utils/cn';

interface StarRatingProps {
  rating: number; // Average rating (e.g., 4.3)
  totalReviews?: number; // Total number of reviews
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean; // Whether to show review count
  className?: string;
  interactive?: boolean; // For input rating components
  onRatingChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  totalReviews = 0,
  size = 'sm',
  showCount = true,
  className = '',
  interactive = false,
  onRatingChange,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className={cn(
            sizeClasses[size],
            'fill-yellow-400 text-yellow-400',
            interactive && 'cursor-pointer hover:scale-110 transition-transform'
          )}
          onClick={() => interactive && onRatingChange?.(i + 1)}
        />
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star
            className={cn(sizeClasses[size], 'text-gray-300')}
            onClick={() => interactive && onRatingChange?.(fullStars + 1)}
          />
          <StarHalf
            className={cn(
              sizeClasses[size],
              'absolute inset-0 fill-yellow-400 text-yellow-400',
              interactive && 'cursor-pointer hover:scale-110 transition-transform'
            )}
            onClick={() => interactive && onRatingChange?.(fullStars + 1)}
          />
        </div>
      );
    }

    // Empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star
          key={`empty-${i}`}
          className={cn(
            sizeClasses[size],
            'text-gray-300',
            interactive && 'cursor-pointer hover:scale-110 transition-transform'
          )}
          onClick={() => interactive && onRatingChange?.(fullStars + (hasHalfStar ? 1 : 0) + i + 1)}
        />
      );
    }

    return stars;
  };

  if (rating === 0 && totalReviews === 0) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn(sizeClasses[size], 'text-gray-300')}
            />
          ))}
        </div>
        <span className={cn('text-gray-500', textSizeClasses[size])}>
          No reviews yet
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="flex items-center gap-0.5">
        {renderStars()}
      </div>

      {showCount && (
        <div className={cn('flex items-center gap-1', textSizeClasses[size])}>
          <span className="font-medium text-gray-700">
            {rating > 0 ? rating.toFixed(1) : '0.0'}
          </span>
          {totalReviews > 0 && (
            <span className="text-gray-500">
              ({totalReviews.toLocaleString()})
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StarRating;
