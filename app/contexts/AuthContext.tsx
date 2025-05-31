"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/app/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { User } from "../utils/types/user.type";
import { COLLECTION } from "@/app/utils/schema/collection.enum";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  refreshAuth: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (firebaseUser: any) => {
    if (firebaseUser) {
      // Get user profile from Firestore
      const userDoc = await getDoc(doc(db, COLLECTION.users, firebaseUser.uid));
      if (userDoc.exists()) {
        setUser({ ...(userDoc.data() as User), id: userDoc.id });
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, fetchUserData);
    return () => unsubscribe();
  }, []);

  const refreshAuth = async () => {
    setLoading(true);
    const currentUser = auth.currentUser;
    if (currentUser) {
      await fetchUserData(currentUser);
    } else {
      setUser(null);
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
