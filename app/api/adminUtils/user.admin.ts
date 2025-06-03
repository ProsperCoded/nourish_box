import { adminDb } from "@/app/api/lib/firebase-admin";
import { User } from "@/app/utils/types/user.type";
import { COLLECTION } from "@/app/utils/schema/collection.enum";

export async function isAdmin(userId: string | undefined): Promise<boolean> {
  if (!userId) {
    console.warn("isAdmin check failed: userId is undefined.");
    return false;
  }

  try {
    const userDocRef = adminDb.collection(COLLECTION.users).doc(userId);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      console.warn(`isAdmin check: User with ID '${userId}' not found.`);
      return false;
    }

    const userData = userDoc.data() as User;
    return userData.role === "admin";
  } catch (error) {
    console.error(
      `Error checking admin status for user ID '${userId}':`,
      error
    );
    return false;
  }
}

export async function getUserById(userId: string) {
  const userDocRef = adminDb.collection(COLLECTION.users).doc(userId);
  const userDoc = await userDocRef.get();
  return userDoc.data() as User;
}
