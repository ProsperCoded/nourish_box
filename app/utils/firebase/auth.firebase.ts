import { signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { COLLECTION } from "@/app/utils/schema/collection.enum";
import { auth, provider, db } from "@/app/lib/firebase";

export const handleGoogleSignIn = async (
  onSuccess: () => void,
  onFailure: (error: string) => void
) => {
  try {
    const result = await signInWithPopup(auth, provider);

    // Check if user document exists
    const userDocRef = doc(db, COLLECTION.users, result.user.uid);
    const userDoc = await getDoc(userDocRef);

    // If user document doesn't exist, create it
    if (!userDoc.exists()) {
      const displayName = result.user.displayName || "";
      const [firstName = "", lastName = ""] = displayName.split(" ");

      await setDoc(
        userDocRef,
        {
          firstName: firstName,
          lastName: lastName,
          email: result.user.email,
          phone: "",
          address: "",
          city: "",
          state: "",
          lga: "",
          role: "user",
          profilePicture: result.user.photoURL || "", // Save Google profile picture
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }

    // router.push("/");
    onSuccess();
    console.log("User Info:", result.user);
  } catch (error) {
    console.error("Error signing in:", error);
    onFailure("Failed to sign in with Google. Please try again");
  }
};
