'use client';

import { Edit, MessageSquare, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils/cn';
import { createReview, getUserReviewForRecipe, updateReview } from '../utils/firebase/reviews.firebase';
import { Recipe } from '../utils/types/recipe.type';
import { Review } from '../utils/types/review.type';

interface OrderReviewManagerProps {
  recipes: Recipe[];
  orderId: string;
  onReviewSubmitted?: () => void;
}

interface RecipeReviewState {
  recipeId: string;
  existingReview: Review | null;
  showForm: boolean;
  rating: number;
  comment: string;
  isSubmitting: boolean;
}

const OrderReviewManager: React.FC<OrderReviewManagerProps> = ({
  recipes,
  orderId,
  onReviewSubmitted,
}) => {
  const { user } = useAuth();
  const [recipeStates, setRecipeStates] = useState<Record<string, RecipeReviewState>>({});
  const [loading, setLoading] = useState(true);

  // Use the first recipe for the review (or primary recipe)
  const primaryRecipe = recipes[0];

  useEffect(() => {
    const loadReviewStates = async () => {
      if (!user || !primaryRecipe) {
        setLoading(false);
        return;
      }

      try {
        // Check for existing review for the primary recipe
        const existingReview = await getUserReviewForRecipe(user.id, primaryRecipe.id);

        setRecipeStates({
          [primaryRecipe.id]: {
            recipeId: primaryRecipe.id,
            existingReview,
            showForm: false,
            rating: existingReview?.rating || 0,
            comment: existingReview?.comment || '',
            isSubmitting: false,
          }
        });
      } catch (error) {
        console.error('Error loading review states:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReviewStates();
  }, [user, primaryRecipe]);

  if (!user || !primaryRecipe) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-48"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const state = recipeStates[primaryRecipe.id];
  if (!state) return null;

  const handleStarClick = (selectedRating: number) => {
    setRecipeStates(prev => ({
      ...prev,
      [primaryRecipe.id]: {
        ...prev[primaryRecipe.id],
        rating: selectedRating
      }
    }));
  };

  const handleCommentChange = (comment: string) => {
    setRecipeStates(prev => ({
      ...prev,
      [primaryRecipe.id]: {
        ...prev[primaryRecipe.id],
        comment
      }
    }));
  };

  const toggleForm = () => {
    setRecipeStates(prev => ({
      ...prev,
      [primaryRecipe.id]: {
        ...prev[primaryRecipe.id],
        showForm: !prev[primaryRecipe.id].showForm,
        rating: prev[primaryRecipe.id].existingReview?.rating || 0,
        comment: prev[primaryRecipe.id].existingReview?.comment || '',
      }
    }));
  };

  const handleSubmitReview = async () => {
    if (!user || !primaryRecipe) return;

    if (state.rating === 0 || state.comment.trim().length < 10) {
      toast.error('Please provide a rating and at least 10 characters of feedback');
      return;
    }

    setRecipeStates(prev => ({
      ...prev,
      [primaryRecipe.id]: {
        ...prev[primaryRecipe.id],
        isSubmitting: true
      }
    }));

    try {
      if (state.existingReview) {
        // Update existing review
        const updatedReview = await updateReview(
          state.existingReview.id,
          user.id,
          state.rating,
          state.comment.trim()
        );

        setRecipeStates(prev => ({
          ...prev,
          [primaryRecipe.id]: {
            ...prev[primaryRecipe.id],
            existingReview: updatedReview,
            showForm: false,
            isSubmitting: false,
          }
        }));

        toast.success('Review updated successfully!');
      } else {
        // Create new review
        const newReview = await createReview(
          user.id,
          primaryRecipe.id,
          state.rating,
          state.comment.trim(),
          orderId
        );

        setRecipeStates(prev => ({
          ...prev,
          [primaryRecipe.id]: {
            ...prev[primaryRecipe.id],
            existingReview: newReview,
            showForm: false,
            isSubmitting: false,
          }
        }));

        toast.success('Thank you for your review!');
      }

      onReviewSubmitted?.();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error.message || 'Failed to submit review');
      setRecipeStates(prev => ({
        ...prev,
        [primaryRecipe.id]: {
          ...prev[primaryRecipe.id],
          isSubmitting: false
        }
      }));
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
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
          {state.existingReview && !state.showForm ? (
            // Show existing review
            <div>
              <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                Your Review
                <button
                  onClick={toggleForm}
                  className="text-orange-600 hover:text-orange-700 text-sm flex items-center gap-1"
                  title="Edit review"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </button>
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Reviewed on {formatDate(state.existingReview.createdAt)}
              </p>

              <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-3">
                {/* Show existing rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Rating
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((starRating) => (
                      <Star
                        key={starRating}
                        className={cn(
                          'w-5 h-5',
                          starRating <= state.existingReview!.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        )}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {state.existingReview.rating} star{state.existingReview.rating !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Show existing comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Comment
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-800">
                    {state.existingReview.comment}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Show review form (new or edit)
            <div>
              <h4 className="font-medium text-gray-800 mb-2">
                {state.existingReview ? 'Edit Your Review' : 'Share Your Experience!'}
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {state.existingReview
                  ? 'Update your review for this order'
                  : 'How was your order? Your feedback helps other food lovers!'
                }
              </p>

              {!state.showForm && !state.existingReview ? (
                <button
                  onClick={toggleForm}
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
                              starRating <= state.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            )}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        {state.rating > 0 ? `${state.rating} star${state.rating !== 1 ? 's' : ''}` : 'Select rating'}
                      </span>
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comment
                    </label>
                    <textarea
                      value={state.comment}
                      onChange={(e) => handleCommentChange(e.target.value)}
                      placeholder="Share your thoughts about this order..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                      maxLength={500}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Minimum 10 characters</span>
                      <span>{state.comment.length}/500</span>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSubmitReview}
                      disabled={state.isSubmitting || state.rating === 0 || state.comment.trim().length < 10}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {state.isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          {state.existingReview ? 'Updating...' : 'Submitting...'}
                        </>
                      ) : (
                        state.existingReview ? 'Update Review' : 'Submit Review'
                      )}
                    </button>
                    <button
                      onClick={toggleForm}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderReviewManager;
