import { Recipe } from "@/app/utils/types/recipe.type";
import { User } from "@/app/utils/types/user.type";

export type Comment = {
  id: string;
  userId: string;
  recipeId: string;
  content: string;
  displayUrl: string;
  createdAt: string; // date in ISO format
  updatedAt: string; // date in ISO format
  user?: User;
  recipe?: Recipe;
};
