import { Recipe } from "@/app/utils/types/recipe.type";

export type CartItem = {
  id: string;
  recipeId: string;
  name: string;
  price: number; // not a duplicate of recipe.price, since this can suppot discounts
  quantity: number;
  image: string;
  createdAt: string;
  updatedAt: string;

  recipe?: Recipe;
};

export type Cart = {
  id: string;
  userId: string;
  items: CartItem[];
};
