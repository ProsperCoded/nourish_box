import { Recipe } from "@/app/utils/types/recipe.type";
import { Transaction } from "@/app/utils/types/transaction.type";

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
}

export enum DeliveryStatus {
  PENDING = "pending",
  DELIVERED = "delivered",
  FAILED = "failed",
}
export type Payment = {
  id: string;
  userId?: string; // optional for guest users
  recipeId: string;
  amount: number; //naira
  status: PaymentStatus;

  deliveryId: string;

  deliveryStatus: DeliveryStatus;
  deliveryDate: string; // date in ISO format

  deliveryDurationRange: string; // e.g. "1-2 days"

  transactionId: string; // reference to the transaction

  createdAt: string; // date in ISO format
  updatedAt: string; // date in ISO format

  recipe?: Recipe;
  transaction?: Transaction;
};
