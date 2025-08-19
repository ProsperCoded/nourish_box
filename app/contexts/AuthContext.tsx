'use client';

import { auth, db } from '@/app/lib/firebase';
import { COLLECTION } from '@/app/utils/schema/collection.enum';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../utils/types/user.type';

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
      try {
        // Get user profile from Firestore
        const userDoc = await getDoc(
          doc(db, COLLECTION.users, firebaseUser.uid)
        );
        if (userDoc.exists()) {
          const userData = { ...(userDoc.data() as User), id: userDoc.id };
          setUser(userData);
          console.log('✅ User data loaded from Firestore:', userData.email);
        } else {
          console.warn(
            '⚠️ User document not found in Firestore for:',
            firebaseUser.email
          );
          // If user document doesn't exist, we'll keep the user as null
          // The OneTap component or other auth methods should create the document
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Error fetching user data:', error);
        setUser(null);
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
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
