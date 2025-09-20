import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { COLLECTION } from '../schema/collection.enum';
import { Review } from '../types/review.type';

/**
 * Create a new review for a recipe
 */
export async function createReview(
  userId: string,
  recipeId: string,
  rating: number,
  comment: string
): Promise<Review> {
  try {
    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Check if user has already reviewed this recipe
    const existingReview = await getUserReviewForRecipe(userId, recipeId);
    if (existingReview) {
      throw new Error('You have already reviewed this recipe');
    }

    const now = new Date().toISOString();
    const reviewData = {
      userId,
      recipeId,
      rating,
      comment,
      createdAt: now,
      updatedAt: now,
    };

    const reviewRef = await addDoc(
      collection(db, COLLECTION.reviews),
      reviewData
    );

    // Update recipe aggregate ratings
    await updateRecipeRatingAggregate(recipeId);

    return {
      id: reviewRef.id,
      ...reviewData,
    };
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
}

/**
 * Update an existing review
 */
export async function updateReview(
  reviewId: string,
  userId: string,
  rating: number,
  comment: string
): Promise<Review> {
  try {
    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const reviewRef = doc(db, COLLECTION.reviews, reviewId);
    const reviewSnap = await getDoc(reviewRef);

    if (!reviewSnap.exists()) {
      throw new Error('Review not found');
    }

    const reviewData = reviewSnap.data() as Review;

    // Check if user owns this review
    if (reviewData.userId !== userId) {
      throw new Error('You can only update your own reviews');
    }

    const updatedData = {
      rating,
      comment,
      updatedAt: new Date().toISOString(),
    };

    await updateDoc(reviewRef, updatedData);

    // Update recipe aggregate ratings
    await updateRecipeRatingAggregate(reviewData.recipeId);

    return {
      ...reviewData,
      ...updatedData,
    };
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
}

/**
 * Delete a review
 */
export async function deleteReview(
  reviewId: string,
  userId: string
): Promise<void> {
  try {
    const reviewRef = doc(db, COLLECTION.reviews, reviewId);
    const reviewSnap = await getDoc(reviewRef);

    if (!reviewSnap.exists()) {
      throw new Error('Review not found');
    }

    const reviewData = reviewSnap.data() as Review;

    // Check if user owns this review
    if (reviewData.userId !== userId) {
      throw new Error('You can only delete your own reviews');
    }

    await deleteDoc(reviewRef);

    // Update recipe aggregate ratings
    await updateRecipeRatingAggregate(reviewData.recipeId);
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
}

/**
 * Get all reviews for a specific recipe
 */
export async function getRecipeReviews(
  recipeId: string,
  limitCount: number = 20
): Promise<Review[]> {
  try {
    const reviewsRef = collection(db, COLLECTION.reviews);
    // Removed orderBy from query to avoid composite index requirement
    const q = query(
      reviewsRef,
      where('recipeId', '==', recipeId),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const reviews = querySnapshot.docs.map(
      doc =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Review
    );

    // Sort client-side to avoid needing a composite index
    reviews.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return reviews;
  } catch (error) {
    console.error('Error fetching recipe reviews:', error);
    throw new Error('Failed to fetch reviews');
  }
}

/**
 * Get reviews with user details for a specific recipe
 */
export async function getRecipeReviewsWithUserDetails(
  recipeId: string,
  limitCount: number = 20
): Promise<(Review & { userName?: string; userAvatar?: string })[]> {
  try {
    const reviews = await getRecipeReviews(recipeId, limitCount);

    if (reviews.length === 0) {
      return [];
    }

    // Get unique user IDs
    const userIds = [...new Set(reviews.map(review => review.userId))];

    // Fetch user details in batches
    const usersMap = new Map<
      string,
      { firstName: string; lastName: string; avatar?: string }
    >();

    for (const userId of userIds) {
      try {
        const userRef = doc(db, COLLECTION.users, userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          usersMap.set(userId, {
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            avatar: userData.avatar,
          });
        }
      } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
      }
    }

    // Combine reviews with user data
    return reviews.map(review => {
      const user = usersMap.get(review.userId);
      return {
        ...review,
        userName: user
          ? `${user.firstName} ${user.lastName}`.trim()
          : 'Anonymous User',
        userAvatar: user?.avatar,
      };
    });
  } catch (error) {
    console.error('Error fetching recipe reviews with user details:', error);
    throw new Error('Failed to fetch reviews with user details');
  }
}

/**
 * Get all reviews by a specific user
 */
export async function getUserReviews(userId: string): Promise<Review[]> {
  try {
    const reviewsRef = collection(db, COLLECTION.reviews);
    // Removed orderBy from query to avoid composite index requirement
    const q = query(reviewsRef, where('userId', '==', userId));

    const querySnapshot = await getDocs(q);
    const reviews = querySnapshot.docs.map(
      doc =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Review
    );

    // Sort client-side to avoid needing a composite index
    reviews.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return reviews;
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    throw new Error('Failed to fetch user reviews');
  }
}

/**
 * Get a specific user's review for a recipe
 */
export async function getUserReviewForRecipe(
  userId: string,
  recipeId: string
): Promise<Review | null> {
  try {
    const reviewsRef = collection(db, COLLECTION.reviews);
    const q = query(
      reviewsRef,
      where('userId', '==', userId),
      where('recipeId', '==', recipeId),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Review;
  } catch (error) {
    console.error('Error fetching user review for recipe:', error);
    return null;
  }
}

/**
 * Get recipe rating aggregate
 */
export async function getRecipeRatingAggregate(recipeId: string): Promise<{
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
}> {
  try {
    const reviewsRef = collection(db, COLLECTION.reviews);
    const q = query(reviewsRef, where('recipeId', '==', recipeId));

    const querySnapshot = await getDocs(q);
    const reviews = querySnapshot.docs.map(doc => doc.data() as Review);

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const totalReviews = reviews.length;
    const sumRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = sumRatings / totalReviews;

    // Calculate rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    });

    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalReviews,
      ratingDistribution,
    };
  } catch (error) {
    console.error('Error calculating recipe rating aggregate:', error);
    throw new Error('Failed to calculate rating aggregate');
  }
}

/**
 * Update recipe rating aggregate (internal function)
 */
async function updateRecipeRatingAggregate(recipeId: string): Promise<void> {
  try {
    const aggregate = await getRecipeRatingAggregate(recipeId);

    const recipeRef = doc(db, COLLECTION.recipes, recipeId);
    await updateDoc(recipeRef, {
      averageRating: aggregate.averageRating,
      totalReviews: aggregate.totalReviews,
      ratingDistribution: aggregate.ratingDistribution,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating recipe rating aggregate:', error);
    // Don't throw here as this is an internal operation
  }
}

/**
 * Get recent reviews across all recipes (for admin dashboard)
 */
export async function getRecentReviews(limitCount: number = 10): Promise<
  (Review & {
    userName?: string;
    recipeName?: string;
    userAvatar?: string;
  })[]
> {
  try {
    const reviewsRef = collection(db, COLLECTION.reviews);
    const q = query(
      reviewsRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const reviews = querySnapshot.docs.map(
      doc =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Review
    );

    if (reviews.length === 0) {
      return [];
    }

    // Get unique user and recipe IDs
    const userIds = [...new Set(reviews.map(review => review.userId))];
    const recipeIds = [...new Set(reviews.map(review => review.recipeId))];

    // Fetch user and recipe details
    const [usersMap, recipesMap] = await Promise.all([
      // Fetch users
      Promise.all(
        userIds.map(async userId => {
          try {
            const userRef = doc(db, COLLECTION.users, userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const userData = userSnap.data();
              return {
                id: userId,
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                avatar: userData.avatar,
              };
            }
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
          }
          return null;
        })
      ).then(results => {
        const map = new Map();
        results.filter(Boolean).forEach(user => map.set(user!.id, user));
        return map;
      }),

      // Fetch recipes
      Promise.all(
        recipeIds.map(async recipeId => {
          try {
            const recipeRef = doc(db, COLLECTION.recipes, recipeId);
            const recipeSnap = await getDoc(recipeRef);
            if (recipeSnap.exists()) {
              const recipeData = recipeSnap.data();
              return {
                id: recipeId,
                name: recipeData.name || 'Unknown Recipe',
              };
            }
          } catch (error) {
            console.error(`Error fetching recipe ${recipeId}:`, error);
          }
          return null;
        })
      ).then(results => {
        const map = new Map();
        results.filter(Boolean).forEach(recipe => map.set(recipe!.id, recipe));
        return map;
      }),
    ]);

    // Combine data
    return reviews.map(review => {
      const user = usersMap.get(review.userId);
      const recipe = recipesMap.get(review.recipeId);

      return {
        ...review,
        userName: user
          ? `${user.firstName} ${user.lastName}`.trim()
          : 'Anonymous User',
        userAvatar: user?.avatar,
        recipeName: recipe?.name || 'Unknown Recipe',
      };
    });
  } catch (error) {
    console.error('Error fetching recent reviews:', error);
    throw new Error('Failed to fetch recent reviews');
  }
}

/**
 * Get best performing recipes based on ratings (for admin dashboard)
 */
export async function getBestPerformingRecipes(limitCount: number = 5): Promise<
  Array<{
    id: string;
    name: string;
    averageRating: number;
    totalReviews: number;
    price: number;
  }>
> {
  try {
    const recipesRef = collection(db, COLLECTION.recipes);
    const q = query(
      recipesRef,
      where('totalReviews', '>', 0),
      orderBy('averageRating', 'desc'),
      orderBy('totalReviews', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || 'Unknown Recipe',
        averageRating: data.averageRating || 0,
        totalReviews: data.totalReviews || 0,
        price: data.price || 0,
      };
    });
  } catch (error) {
    console.error('Error fetching best performing recipes:', error);
    // Fallback: get recipes ordered by clicks if no reviews exist
    try {
      const recipesRef = collection(db, COLLECTION.recipes);
      const fallbackQuery = query(
        recipesRef,
        orderBy('clicks', 'desc'),
        limit(limitCount)
      );

      const fallbackSnapshot = await getDocs(fallbackQuery);
      return fallbackSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Unknown Recipe',
          averageRating: data.averageRating || 0,
          totalReviews: data.totalReviews || 0,
          price: data.price || 0,
        };
      });
    } catch (fallbackError) {
      console.error('Error in fallback query:', fallbackError);
      return [];
    }
  }
}

/**
 * Check if user can review a recipe (must have completed order for that recipe)
 */
export async function canUserReviewRecipe(
  userId: string,
  recipeId: string
): Promise<boolean> {
  try {
    // Check if user has any completed orders containing this recipe
    const ordersRef = collection(db, COLLECTION.orders);
    const q = query(
      ordersRef,
      where('userId', '==', userId),
      where('deliveryStatus', '==', 'completed')
    );

    const querySnapshot = await getDocs(q);

    // Check if any completed order contains the recipe
    for (const orderDoc of querySnapshot.docs) {
      const orderData = orderDoc.data();
      if (orderData.recipeIds && orderData.recipeIds.includes(recipeId)) {
        return true;
      }
      // Also check single recipeId field (backward compatibility)
      if (orderData.recipeId === recipeId) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking if user can review recipe:', error);
    return false;
  }
}
