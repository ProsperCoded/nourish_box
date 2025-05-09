export enum TransactionStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
}
export type Transaction = {
  id: string;
  userId?: string; // optional because it can be a guest transaction
  email: string;
  reference: string;
  amount: number; // naira
  status: TransactionStatus;
  paymentMethod: string; // e.g. "card", "bank transfer", etc.

  paymentDate: string; // date in ISO format
  createdAt: string; // date in ISO format
  updatedAt: string; // date in ISO format
};
