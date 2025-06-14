import { Recipe } from "@/app/utils/types/recipe.type";

export enum DeliveryStatus {
  PENDING = "pending",
  DELIVERED = "delivered",
  FAILED = "failed",
}
export type Order = {
  id: string;
  userId?: string; // optional for guest users
  recipeId: string;
  amount: number; //naira

  deliveryId: string;

  deliveryStatus: DeliveryStatus;
  deliveryDate: string; // date in ISO format

  deliveryDurationRange: string; // e.g. "1-2 days"

  transactionId: string; // reference to the transaction

  createdAt: string; // date in ISO format
  updatedAt: string; // date in ISO format

  recipe?: Recipe;
};
