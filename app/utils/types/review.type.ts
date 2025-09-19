export type Review = {
  id: string;
  userId: string;
  recipeId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  updatedAt: string;
};
