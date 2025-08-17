import * as admin from 'firebase-admin';
import { configService, ENV } from '../utils/config.env';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: configService.get(ENV.FIREBASE_PROJECT_ID),
        clientEmail: configService.get(ENV.FIREBASE_CLIENT_EMAIL),
        privateKey: configService.get(ENV.FIREBASE_PRIVATE_KEY),
      }),
      // databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com` // Optional: if you use Realtime Database
    });
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error:', error.message);
    // Log more details if available
    if (error.errorInfo) {
      console.error('Firebase Admin SDK errorInfo:', error.errorInfo);
    }
    // Environment variable validation is now handled in config.ts
    throw error; // Re-throw to prevent the app from starting with invalid Firebase config
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage(); // If you need to interact with Firebase Storage via Admin SDK

export default admin;
