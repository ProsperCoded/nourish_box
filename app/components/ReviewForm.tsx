'use client';

import { Send, Star } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils/cn';
import { createReview, updateReview } from '../utils/firebase/reviews.firebase';
import { Review } from '../utils/types/review.type';

interface ReviewFormProps {
  recipeId: string;
  existingReview?: Review | null; // If user already has a review
  onReviewSubmitted: () => void; // Callback to refresh reviews
  onCancel?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  recipeId,
  existingReview,
  onReviewSubmitted,
  onCancel,
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('You must be logged in to submit a review');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (comment.trim().length < 10) {
      toast.error('Please write at least 10 characters in your review');
      return;
    }

    setIsSubmitting(true);

    try {
      if (existingReview) {
        // Update existing review
        await updateReview(existingReview.id, user.id, rating, comment.trim());
        toast.success('Review updated successfully!');
      } else {
        // Create new review
        await createReview(user.id, recipeId, rating, comment.trim());
        toast.success('Review submitted successfully!');
      }

      onReviewSubmitted();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className={cn(
            'w-8 h-8 p-1 transition-all duration-200 hover:scale-110',
            (hoveredRating >= i || (!hoveredRating && rating >= i))
              ? 'text-yellow-400'
              : 'text-gray-300'
          )}
          onMouseEnter={() => setHoveredRating(i)}
          onMouseLeave={() => setHoveredRating(0)}
          onClick={() => setRating(i)}
        >
          <Star
            className={cn(
              'w-full h-full',
              (hoveredRating >= i || (!hoveredRating && rating >= i))
                ? 'fill-current'
                : ''
            )}
          />
        </button>
      );
    }
    return stars;
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">
        {existingReview ? 'Edit Your Review' : 'Write a Review'}
      </h4>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <div className="flex items-center gap-1">
            {renderStars()}
            <span className="ml-2 text-sm text-gray-600">
              {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'Select a rating'}
            </span>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-2">
            Your Review *
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this recipe..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-btn_orange focus:border-brand-btn_orange resize-none"
            maxLength={500}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Minimum 10 characters</span>
            <span>{comment.length}/500</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
            className="flex-1 bg-brand-btn_orange hover:bg-brand-btn_orange/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {existingReview ? 'Updating...' : 'Submitting...'}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {existingReview ? 'Update Review' : 'Submit Review'}
              </>
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
