'use client';

import { auth } from '@/app/lib/firebase';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { useEffect } from 'react';

export default function OneTap() {
  useEffect(() => {
    // Ensure google script is loaded
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      // @ts-ignore
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          try {
            const credential = GoogleAuthProvider.credential(
              response.credential
            );
            const userCred = await signInWithCredential(auth, credential);
            console.log('✅ Signed in:', userCred.user);
          } catch (err) {
            console.error('❌ Sign-in error:', err);
          }
        },
      });

      // Show One Tap
      // @ts-ignore
      window.google.accounts.id.prompt();
    };
  }, []);

  return null; // no visible UI, just the One-Tap popup
}
