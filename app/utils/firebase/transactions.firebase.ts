import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { COLLECTION } from "@/app/utils/schema/collection.enum";
import { Transaction } from "@/app/utils/types/transaction.type";
import { Delivery } from "@/app/utils/types/delivery.type";

export async function getTransactionByReference(reference: string) {
  const transactionRef = doc(db, COLLECTION.transactions, reference);
  const transactionSnap = await getDoc(transactionRef);
  if (!transactionSnap.exists()) return null;

  const transaction = transactionSnap.data() as Transaction;

  // Get delivery information if deliveryId exists
  if (transaction.deliveryId) {
    const deliveryRef = doc(db, COLLECTION.deliveries, transaction.deliveryId);
    const deliverySnap = await getDoc(deliveryRef);
    if (deliverySnap.exists()) {
      transaction.delivery = {
        ...deliverySnap.data(),
        deliveryId: transaction.deliveryId,
      } as Delivery;
    }
  }

  return transaction;
}

export async function getTransactionById(id: string) {
  const transactionRef = doc(db, COLLECTION.transactions, id);
  const transactionSnap = await getDoc(transactionRef);
  if (!transactionSnap.exists()) return null;

  const transaction = transactionSnap.data() as Transaction;

  // Get delivery information if deliveryId exists
  if (transaction.deliveryId) {
    const deliveryRef = doc(db, COLLECTION.deliveries, transaction.deliveryId);
    const deliverySnap = await getDoc(deliveryRef);
    if (deliverySnap.exists()) {
      transaction.delivery = {
        ...deliverySnap.data(),
        deliveryId: transaction.deliveryId,
      } as Delivery;
    }
  }

  return transaction;
}

export async function getAllTransactions() {
  const transactionsCollection = collection(db, COLLECTION.transactions);
  const querySnapshot = await getDocs(transactionsCollection);
  const transactions = await Promise.all(
    querySnapshot.docs.map(async (doc) => {
      const transaction = doc.data() as Transaction;

      // Get delivery information if deliveryId exists
      if (transaction.deliveryId) {
        const deliveryRef = doc(
          db,
          COLLECTION.deliveries,
          transaction.deliveryId
        );
        const deliverySnap = await getDoc(deliveryRef);
        if (deliverySnap.exists()) {
          transaction.delivery = {
            ...deliverySnap.data(),
            deliveryId: transaction.deliveryId,
          } as Delivery;
        }
      }

      return transaction;
    })
  );
  return transactions;
}
