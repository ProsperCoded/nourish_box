export type Review = {
  id: string;
  userId: string;
  recipeId: string;
  orderId: string; // Added to track which order this review belongs to
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  updatedAt: string;
};
