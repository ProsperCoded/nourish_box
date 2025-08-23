import { Recipe } from '@/app/utils/types/recipe.type';

export enum DeliveryStatus {
  PENDING = 'pending',
  PACKED = 'packed',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  FAILED = 'failed',
}

export enum ReceivedStatus {
  PENDING = 'pending',
  RECEIVED = 'received',
  FAILED = 'failed',
}
export type Order = {
  id: string;
  userId?: string; // optional for guest users
  recipeId: string;
  amount: number; //naira

  deliveryId: string;

  deliveryStatus: DeliveryStatus;
  receivedStatus: ReceivedStatus; // for user, only the user changes this
  deliveryDate: string; // date in ISO format

  deliveryDurationRange: string; // e.g. "1-2 days"

  transactionId: string; // reference to the transaction

  createdAt: string; // date in ISO format
  updatedAt: string; // date in ISO format

  recipe?: Recipe;
};
