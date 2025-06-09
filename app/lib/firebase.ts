import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log("Firebase config loaded:", firebaseConfig);
console.log("Storage bucket:", firebaseConfig.storageBucket);

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Log storage initialization
console.log("Firebase Storage initialized:", !!storage);
console.log("Storage app:", storage.app.name);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

export { signInWithPopup };

// ! for seeding to the database
// import { runSeed } from "@/app/utils/seed/seed-script";
// console.log("seeding into database...");
// runSeed().catch(console.error);
