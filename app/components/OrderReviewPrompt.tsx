'use client';

import { Check, MessageSquare, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils/cn';
import {
  canUserReviewRecipe,
  createReview,
  getUserReviewForRecipe,
} from '../utils/firebase/reviews.firebase';
import { Recipe } from '../utils/types/recipe.type';

interface OrderReviewPromptProps {
  recipes: Recipe[];
  orderId: string;
  onReviewSubmitted?: () => void;
}

interface RecipeReviewState {
  recipeId: string;
  hasReview: boolean;
  canReview: boolean;
  rating: number;
  comment: string;
  isSubmitting: boolean;
  showForm: boolean;
}

const OrderReviewPrompt: React.FC<OrderReviewPromptProps> = ({
  recipes,
  orderId,
  onReviewSubmitted,
}) => {
  const { user } = useAuth();
  const [recipeStates, setRecipeStates] = useState<Record<string, RecipeReviewState>>({});
  const [loading, setLoading] = useState(true);

  // Initialize review states for all recipes
  useEffect(() => {
    const initializeRecipeStates = async () => {
      if (!user || !recipes.length) {
        setLoading(false);
        return;
      }

      try {
        const states: Record<string, RecipeReviewState> = {};

        for (const recipe of recipes) {
          const [existingReview, canReview] = await Promise.all([
            getUserReviewForRecipe(user.id, recipe.id),
            canUserReviewRecipe(user.id, recipe.id),
          ]);

          states[recipe.id] = {
            recipeId: recipe.id,
            hasReview: !!existingReview,
            canReview,
            rating: 0,
            comment: '',
            isSubmitting: false,
            showForm: false,
          };
        }

        setRecipeStates(states);
      } catch (error) {
        console.error('Error initializing recipe states:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeRecipeStates();
  }, [user, recipes]);

  const updateRecipeState = (recipeId: string, updates: Partial<RecipeReviewState>) => {
    setRecipeStates(prev => ({
      ...prev,
      [recipeId]: { ...prev[recipeId], ...updates },
    }));
  };

  const handleStarClick = (recipeId: string, rating: number) => {
    updateRecipeState(recipeId, { rating });
  };

  const handleSubmitReview = async (recipeId: string) => {
    if (!user) return;

    const state = recipeStates[recipeId];
    if (!state || state.rating === 0 || state.comment.trim().length < 10) {
      toast.error('Please provide a rating and at least 10 characters of feedback');
      return;
    }

    updateRecipeState(recipeId, { isSubmitting: true });

    try {
      await createReview(user.id, recipeId, state.rating, state.comment.trim());

      updateRecipeState(recipeId, {
        hasReview: true,
        showForm: false,
        isSubmitting: false,
      });

      toast.success('Thank you for your review!');
      onReviewSubmitted?.();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error.message || 'Failed to submit review');
      updateRecipeState(recipeId, { isSubmitting: false });
    }
  };

  const toggleReviewForm = (recipeId: string) => {
    const state = recipeStates[recipeId];
    updateRecipeState(recipeId, { showForm: !state.showForm });
  };

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-48"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  // Check if any recipes can be reviewed and haven't been reviewed yet
  const reviewableRecipes = recipes.filter(recipe => {
    const state = recipeStates[recipe.id];
    return state?.canReview && !state?.hasReview;
  });

  if (reviewableRecipes.length === 0) {
    return null; // Don't show prompt if no recipes can be reviewed
  }

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
            How were the recipes from this order? Your feedback helps other food lovers!
          </p>

          <div className="space-y-3">
            {reviewableRecipes.map((recipe) => {
              const state = recipeStates[recipe.id];
              if (!state) return null;

              return (
                <div key={recipe.id} className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={recipe.displayMedia?.url || '/app/assets/food.png'}
                        alt={recipe.name}
                        className="w-10 h-10 rounded-lg object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/app/assets/food.png';
                        }}
                      />
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          {recipe.name}
                        </p>
                        {state.hasReview && (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Review submitted
                          </p>
                        )}
                      </div>
                    </div>

                    {!state.hasReview && (
                      <button
                        onClick={() => toggleReviewForm(recipe.id)}
                        className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                      >
                        {state.showForm ? 'Cancel' : 'Review'}
                      </button>
                    )}
                  </div>

                  {/* Review Form */}
                  {state.showForm && !state.hasReview && (
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
                      {/* Rating */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rating
                        </label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => handleStarClick(recipe.id, rating)}
                              className="transition-colors"
                            >
                              <Star
                                className={cn(
                                  'w-5 h-5',
                                  rating <= state.rating
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Comment
                        </label>
                        <textarea
                          value={state.comment}
                          onChange={(e) => updateRecipeState(recipe.id, { comment: e.target.value })}
                          placeholder="Share your thoughts about this recipe..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                          maxLength={500}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Minimum 10 characters</span>
                          <span>{state.comment.length}/500</span>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSubmitReview(recipe.id)}
                          disabled={state.isSubmitting || state.rating === 0 || state.comment.trim().length < 10}
                          className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          {state.isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            'Submit Review'
                          )}
                        </button>
                        <button
                          onClick={() => toggleReviewForm(recipe.id)}
                          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderReviewPrompt;
