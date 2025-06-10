import { adminDb } from "@/app/api/lib/firebase-admin";
import { Transaction } from "@/app/utils/types/transaction.type";
import { COLLECTION } from "@/app/utils/schema/collection.enum";

export async function createTransaction(transaction: Partial<Transaction>) {
  try {
    // Validate transaction data
    if (!transaction.email || !transaction.amount) {
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

    console.log("transactionWithTimestamp:", transactionWithTimestamp);

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

export async function getTransactionByReference(
  reference: string
): Promise<Transaction | null> {
  try {
    const transactionQuery = await adminDb
      .collection(COLLECTION.transactions)
      .where("reference", "==", reference)
      .limit(1)
      .get();

    if (transactionQuery.empty) {
      return null;
    }

    const transactionDoc = transactionQuery.docs[0];
    return {
      id: transactionDoc.id,
      ...transactionDoc.data(),
    } as Transaction;
  } catch (error) {
    console.error("Error getting transaction by reference:", error);
    throw new Error("Failed to get transaction by reference");
  }
}

export async function updateTransaction(
  transactionId: string,
  updateData: Partial<Transaction>
) {
  try {
    const timestamp = new Date().toISOString();

    await adminDb
      .collection(COLLECTION.transactions)
      .doc(transactionId)
      .update({
        ...updateData,
        updatedAt: timestamp,
      });
  } catch (error) {
    console.error("Error updating transaction:", error);
    throw new Error("Failed to update transaction");
  }
}
