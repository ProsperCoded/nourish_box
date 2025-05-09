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

  // deliver info
  deliveryAddress: string;
  deliveryPhone1: string;
  deliveryPhone2?: string; // optional
  deliveryName: string;
  deliveryEmail: string;
  deliveryNote?: string; // extra note for delivery

  deliveryStatus: DeliveryStatus;
  deliveryDate: string; // date in ISO format

  deliveryDurationRange: string; // e.g. "1-2 days"

  transactionId: string; // reference to the transaction

  createdAt: string; // date in ISO format
  updatedAt: string; // date in ISO format

  recipe?: Recipe;
  transaction?: Transaction;
};
