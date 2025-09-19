'use client';

import { MessageSquare, Star } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils/cn';
import { createReview } from '../utils/firebase/reviews.firebase';
import { Recipe } from '../utils/types/recipe.type';

interface OrderReviewPromptProps {
  recipes: Recipe[];
  orderId: string;
  onReviewSubmitted?: () => void;
}

const OrderReviewPrompt: React.FC<OrderReviewPromptProps> = ({
  recipes,
  orderId,
  onReviewSubmitted,
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);

  // Use the first recipe for the review (or primary recipe)
  const primaryRecipe = recipes[0];

  if (!user || !primaryRecipe) {
    return null;
  }

  const handleStarClick = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleSubmitReview = async () => {
    if (!user || !primaryRecipe) return;

    if (rating === 0 || comment.trim().length < 10) {
      toast.error('Please provide a rating and at least 10 characters of feedback');
      return;
    }

    setIsSubmitting(true);

    try {
      await createReview(user.id, primaryRecipe.id, rating, comment.trim());

      // Reset form
      setRating(0);
      setComment('');
      setShowForm(false);

      toast.success('Thank you for your review!');
      onReviewSubmitted?.();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
        </div>

        <div className="flex-1">
          <h4 className="font-medium text-gray-800 mb-2">
            Share Your Experience!
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            How was your order? Your feedback helps other food lovers!
          </p>

          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Write a Review
            </button>
          ) : (
            <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-4">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((starRating) => (
                    <button
                      key={starRating}
                      type="button"
                      onClick={() => handleStarClick(starRating)}
                      className="transition-colors"
                    >
                      <Star
                        className={cn(
                          'w-6 h-6',
                          starRating <= rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        )}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'Select rating'}
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts about this order..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                  maxLength={500}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Minimum 10 characters</span>
                  <span>{comment.length}/500</span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleSubmitReview}
                  disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderReviewPrompt;
