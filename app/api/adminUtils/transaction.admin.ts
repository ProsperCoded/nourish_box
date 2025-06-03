import { adminDb } from "@/app/api/lib/firebase-admin";
import { Transaction } from "@/app/utils/types/transaction.type";
import { COLLECTION } from "@/app/utils/schema/collection.enum";

export async function createTransaction(transaction: Partial<Transaction>) {
  try {
    // Validate transaction data
    if (!transaction.userId || !transaction.amount) {
      throw new Error("Invalid transaction data: missing required fields");
    }

    // Generate a new document reference with auto-generated ID
    const transactionDocRef = adminDb.collection(COLLECTION.transactions).doc();

    // No need to check for existing document since we're using a new auto-generated ID

    // Create transaction with timestamp
    const transactionWithTimestamp = {
      id: transactionDocRef.id,
      ...transaction,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await transactionDocRef.set(transactionWithTimestamp);

    return transactionWithTimestamp;
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
}

export async function getTransaction(transactionId: string) {
  const transactionDocRef = adminDb
    .collection(COLLECTION.transactions)
    .doc(transactionId);
  const transactionDoc = await transactionDocRef.get();
  return transactionDoc.data() as Transaction;
}

export async function updateTransaction(
  transactionId: string,
  transaction: Transaction
) {
  const transactionDocRef = adminDb
    .collection(COLLECTION.transactions)
    .doc(transactionId);
  await transactionDocRef.update(transaction);
}
