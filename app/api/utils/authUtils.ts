import { adminDb } from "@/app/lib/firebase-admin";
import { User } from "@/app/utils/types/user.type";

/**
 * Checks if a user is an admin.
 * @param userId The ID of the user to check.
 * @returns True if the user is an admin, false otherwise.
 */
export async function isAdmin(userId: string | undefined): Promise<boolean> {
  if (!userId) {
    console.warn("isAdmin check failed: userId is undefined.");
    return false;
  }

  try {
    const userDocRef = adminDb.collection("users").doc(userId);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      console.warn(`isAdmin check: User with ID '${userId}' not found.`);
      return false;
    }

    const userData = userDoc.data() as User;
    return userData.role === "admin";
  } catch (error) {
    console.error(`Error checking admin status for user ID '${userId}':`, error);
    return false;
  }
}

/**
 * Middleware-like function to verify admin status from a NextApiRequest.
 * It expects a userId to be passed in the request body or query.
 * Responds with 401 if no userId, 403 if not admin, otherwise returns true.
 */
// This is a conceptual example. In Next.js 13+ App Router, 
// you'd integrate this logic directly into your Route Handlers.
// For pages router, you might use it like this:
/*
import { NextApiRequest, NextApiResponse } from 'next';

export async function requireAdmin(req: NextApiRequest, res: NextApiResponse): Promise<boolean> {
  const userId = req.body.userId || req.query.userId as string;
  if (!userId) {
    res.status(401).json({ message: "User ID is required for admin verification." });
    return false;
  }
  const userIsAdmin = await isAdmin(userId);
  if (!userIsAdmin) {
    res.status(403).json({ message: "Forbidden: User does not have admin privileges." });
    return false;
  }
  return true;
}
*/ 