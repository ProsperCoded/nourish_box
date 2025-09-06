'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { auth } from '@/app/lib/firebase';
import { createUserDocument } from '@/app/utils/firebase/auth.firebase';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    google: any;
  }
}

export default function OneTap() {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [hasShownPrompt, setHasShownPrompt] = useState(false);
  const { user, loading, refreshAuth } = useAuth();

  // Handle OneTap callback
  const handleOneTapCallback = async (response: any) => {
    try {
      console.log('🔄 Processing OneTap credential...');

      const credential = GoogleAuthProvider.credential(response.credential);
      const userCred = await signInWithCredential(auth, credential);

      console.log('✅ OneTap sign-in successful:', userCred.user.email);

      // Create user document in Firestore if it doesn't exist (using shared function)
      await createUserDocument(userCred.user);

      // Refresh auth context to load the new user data
      await refreshAuth();

      // Hide the One Tap prompt after successful sign-in
      if (window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
      }
    } catch (err: any) {
      console.error('❌ OneTap sign-in error:', err);
      if (err.code) {
        console.error(`Error Code: ${err.code}`);
      }
      if (err.message) {
        console.error(`Error Message: ${err.message}`);
      }


      // Handle specific errors
      if (err.code === 'auth/popup-closed-by-user') {
        console.log('User closed the popup');
      } else if (err.code === 'auth/cancelled-popup-request') {
        console.log('Popup request was cancelled');
      } else {
        console.error('Unexpected OneTap error:', err.message);
      }
    }
  };

  // Initialize Google One Tap
  const initializeOneTap = () => {
    if (!window.google?.accounts?.id) {
      console.warn('Google Identity Services not available');
      return;
    }

    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      console.error(
        '❌ Google Client ID not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your environment variables.'
      );
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleOneTapCallback,
        auto_select: false, // Don't auto-select accounts
        cancel_on_tap_outside: true, // Allow users to dismiss by clicking outside
        context: 'signin', // Context for the prompt
        itp_support: true, // Enable Intelligent Tracking Prevention support
        ux_mode: 'popup',
      });

      // Only show prompt if user is not authenticated and we haven't shown it yet
      if (!user && !hasShownPrompt) {
        console.log('🔄 Showing OneTap prompt...');
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.getNotDisplayedReason) {
            console.log(
              'OneTap prompt not displayed:',
              notification.getNotDisplayedReason()
            );
          }
          if (notification.getSkippedReason) {
            console.log(
              'OneTap prompt skipped:',
              notification.getSkippedReason()
            );
          }
          if (notification.getDismissedReason) {
            console.log(
              'OneTap prompt dismissed:',
              notification.getDismissedReason()
            );
          }
        });
        setHasShownPrompt(true);
      }
    } catch (error) {
      console.error('Error initializing OneTap:', error);
    }
  };

  useEffect(() => {
    // Don't show OneTap if user is already authenticated or still loading
    if (loading || user) {
      return;
    }

    // Check if script is already loaded
    if (window.google?.accounts?.id && !isScriptLoaded) {
      setIsScriptLoaded(true);
      initializeOneTap();
      return;
    }

    // Load Google Identity Services script if not already loaded
    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log('✅ Google Identity Services script loaded');
        setIsScriptLoaded(true);
        // Small delay to ensure script is fully initialized
        setTimeout(initializeOneTap, 100);
      };

      script.onerror = () => {
        console.error('❌ Failed to load Google Identity Services script');
      };

      document.head.appendChild(script);
    }

    // Cleanup function
    return () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.cancel();
        } catch (error) {
          console.warn('Error cancelling OneTap:', error);
        }
      }
    };
  }, [user, loading, isScriptLoaded]);

  // Reset hasShownPrompt when user logs out
  useEffect(() => {
    if (!user) {
      setHasShownPrompt(false);
    }
  }, [user]);

  return null; // No visible UI, just the OneTap popup
}
