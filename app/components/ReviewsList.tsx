'use client';

import { MoreVertical, Pencil, Trash2, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import {
  canUserReviewRecipe,
  deleteReview,
  getRecipeReviewsWithUserDetails,
  getUserReviewForRecipe,
} from '../utils/firebase/reviews.firebase';
import { Review } from '../utils/types/review.type';
import ReviewForm from './ReviewForm';
import StarRating from './StarRating';

interface ReviewsListProps {
  recipeId: string;
  averageRating?: number;
  totalReviews?: number;
}

type ReviewWithUser = Review & {
  userName?: string;
  userAvatar?: string;
};

const ReviewsList: React.FC<ReviewsListProps> = ({
  recipeId,
  averageRating = 0,
  totalReviews = 0,
}) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  // Load reviews and user's review status
  const loadReviews = async () => {
    try {
      setLoading(true);
      const [reviewsData, userReviewData, canReviewData] = await Promise.all([
        getRecipeReviewsWithUserDetails(recipeId, 20),
        user ? getUserReviewForRecipe(user.id, recipeId) : Promise.resolve(null),
        user ? canUserReviewRecipe(user.id, recipeId) : Promise.resolve(false),
      ]);

      setReviews(reviewsData);
      setUserReview(userReviewData);
      setCanReview(canReviewData);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [recipeId, user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowDropdown(null);
    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdown]);

  const handleDeleteReview = async (reviewId: string) => {
    if (!user) return;

    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    setDeleting(reviewId);
    try {
      await deleteReview(reviewId, user.id);
      toast.success('Review deleted successfully');
      await loadReviews(); // Refresh reviews
    } catch (error: any) {
      console.error('Error deleting review:', error);
      toast.error(error.message || 'Failed to delete review');
    } finally {
      setDeleting(null);
    }
  };

  const handleReviewSubmitted = async () => {
    setShowReviewForm(false);
    setEditingReview(null);
    await loadReviews(); // Refresh reviews
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Reviews ({totalReviews})
          </h3>
          {totalReviews > 0 && (
            <StarRating
              rating={averageRating}
              totalReviews={totalReviews}
              size="md"
              showCount={false}
              className="mt-1"
            />
          )}
        </div>

        {/* Add Review Button */}
        {user && canReview && !userReview && !showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="bg-brand-btn_orange hover:bg-brand-btn_orange/90 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Write Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {user && (showReviewForm || editingReview) && (
        <ReviewForm
          recipeId={recipeId}
          existingReview={editingReview}
          onReviewSubmitted={handleReviewSubmitted}
          onCancel={() => {
            setShowReviewForm(false);
            setEditingReview(null);
          }}
        />
      )}

      {/* User's existing review notice */}
      {user && userReview && !editingReview && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-800">
                You have already reviewed this recipe.
              </p>
              <StarRating
                rating={userReview.rating}
                totalReviews={0}
                size="sm"
                showCount={false}
                className="mt-1"
              />
            </div>
            <button
              onClick={() => setEditingReview(userReview)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Edit Review
            </button>
          </div>
        </div>
      )}

      {/* No reviews state */}
      {totalReviews === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-2">No reviews yet</p>
          <p className="text-sm text-gray-400">
            Be the first to share your experience with this recipe!
          </p>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {/* User Avatar */}
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {review.userAvatar ? (
                      <img
                        src={review.userAvatar}
                        alt={review.userName || 'User'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-gray-500" />
                    )}
                  </div>

                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-800">
                        {review.userName || 'Anonymous User'}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>

                    <StarRating
                      rating={review.rating}
                      totalReviews={0}
                      size="sm"
                      showCount={false}
                      className="mb-2"
                    />

                    <p className="text-gray-700 leading-relaxed">
                      {review.comment}
                    </p>

                    {review.updatedAt !== review.createdAt && (
                      <p className="text-xs text-gray-400 mt-2">
                        Edited on {formatDate(review.updatedAt)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Menu (only for user's own review) */}
                {user && user.id === review.userId && (
                  <div className="relative">
                    <button
                      onClick={() => setShowDropdown(showDropdown === review.id ? null : review.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {showDropdown === review.id && (
                      <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
                        <button
                          onClick={() => {
                            setEditingReview(review);
                            setShowDropdown(null);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Pencil className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            handleDeleteReview(review.id);
                            setShowDropdown(null);
                          }}
                          disabled={deleting === review.id}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
                        >
                          <Trash2 className="w-3 h-3" />
                          {deleting === review.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Login prompt for non-authenticated users */}
      {!user && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-gray-600 mb-2">
            Want to share your experience with this recipe?
          </p>
          <a
            href="/login"
            className="text-brand-btn_orange hover:text-brand-btn_orange/80 font-medium"
          >
            Sign in to write a review
          </a>
        </div>
      )}
    </div>
  );
};

export default ReviewsList;
