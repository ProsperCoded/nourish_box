import { auth, db, provider } from '@/app/lib/firebase';
import { COLLECTION } from '@/app/utils/schema/collection.enum';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Shared function to create user document in Firestore
export const createUserDocument = async (
  firebaseUser: any
): Promise<boolean> => {
  try {
    const userDocRef = doc(db, COLLECTION.users, firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);

    // If user document doesn't exist, create it
    if (!userDoc.exists()) {
      const displayName = firebaseUser.displayName || '';
      const [firstName = '', lastName = ''] = displayName.split(' ');

      await setDoc(
        userDocRef,
        {
          firstName: firstName,
          lastName: lastName,
          email: firebaseUser.email,
          phone: '',
          address: '',
          city: '',
          state: '',
          lga: '',
          role: 'user',
          profilePicture: firebaseUser.photoURL || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      console.log(
        '✅ User document created in Firestore for:',
        firebaseUser.email
      );
      return true; // Document was created
    } else {
      console.log('✅ User document already exists for:', firebaseUser.email);
      return false; // Document already existed
    }
  } catch (error) {
    console.error('❌ Error creating user document:', error);
    throw error;
  }
};

export const handleGoogleSignIn = async (
  onSuccess: (firebaseUser: any) => void,
  onFailure: (error: string) => void
) => {
  try {
    const result = await signInWithPopup(auth, provider);

    // Use the shared function to create user document
    await createUserDocument(result.user);

    onSuccess(result.user);
    console.log('✅ Google sign-in successful:', result.user.email);
  } catch (error) {
    console.error('❌ Error signing in with Google:', error);
    onFailure('Failed to sign in with Google. Please try again');
  }
};
