'use client';

import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { getRecipeReviewsWithUserDetails } from '../utils/firebase/reviews.firebase';
import { Review } from '../utils/types/review.type';
import StarRating from './StarRating';

interface ReviewsHorizontalListProps {
  recipeId: string;
  totalReviews: number;
}

type ReviewWithUser = Review & {
  userName?: string;
  userAvatar?: string;
};

const ReviewsHorizontalList: React.FC<ReviewsHorizontalListProps> = ({
  recipeId,
  totalReviews,
}) => {
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        const reviewsData = await getRecipeReviewsWithUserDetails(recipeId, 10);
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error loading reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    if (totalReviews > 0) {
      loadReviews();
    } else {
      setLoading(false);
    }
  }, [recipeId, totalReviews]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-80 bg-gray-50 rounded-lg p-4">
            <div className="animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div>
                  <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (totalReviews === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-sm">No reviews yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Be the first to share your experience!
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      {reviews.length > 2 && (
        <>
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 hover:bg-white shadow-lg rounded-full text-gray-600 hover:text-gray-800 transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 hover:bg-white shadow-lg rounded-full text-gray-600 hover:text-gray-800 transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Reviews Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {reviews.map((review) => (
          <div
            key={review.id}
            className="flex-shrink-0 w-80 bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* User Info */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                {review.userAvatar ? (
                  <img
                    src={review.userAvatar}
                    alt={review.userName || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-gray-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm truncate">
                  {review.userName || 'Anonymous User'}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(review.createdAt)}
                </p>
              </div>
            </div>

            {/* Rating */}
            <StarRating
              rating={review.rating}
              totalReviews={0}
              size="sm"
              showCount={false}
              className="mb-3"
            />

            {/* Comment */}
            <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-orange-200">
              <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                {review.comment}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
      {reviews.length > 0 && (
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
            Showing {reviews.length} of {totalReviews} reviews
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewsHorizontalList;
