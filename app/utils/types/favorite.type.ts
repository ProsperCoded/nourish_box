import { Recipe } from "@/app/utils/types/recipe.type";
import { User } from "@/app/utils/types/user.type";

export type Favorite = {
  id: string;
  userId: string;
  recipeId: string;
  createdAt: string; // date in ISO format
  updatedAt: string; // date in ISO format
  recipe?: Recipe;
  user?: User;
};
