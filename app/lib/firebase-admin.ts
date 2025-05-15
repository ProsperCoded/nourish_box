import * as admin from "firebase-admin";

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
      // databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com` // Optional: if you use Realtime Database
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } catch (error: any) {
    console.error("Firebase Admin SDK initialization error:", error.message);
    // Log more details if available
    if (error.errorInfo) {
      console.error("Firebase Admin SDK errorInfo:", error.errorInfo);
    }
     if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      console.error("Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID env variable");
    }
    if (!process.env.FIREBASE_CLIENT_EMAIL) {
      console.error("Missing FIREBASE_CLIENT_EMAIL env variable");
    }
    if (!privateKey) {
      console.error("Missing FIREBASE_PRIVATE_KEY env variable or key is invalid after processing.");
    }
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage(); // If you need to interact with Firebase Storage via Admin SDK

export default admin; 