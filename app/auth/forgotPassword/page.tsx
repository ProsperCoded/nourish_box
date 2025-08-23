"use client";

import { sendPasswordResetEmail } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import logo from "../../assets/nourish_box_folder/Logo files/icon.svg";
import { auth } from "../../lib/firebase";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Handle forgot password form submission
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      const actionCodeSettings = {
        url: `${window.location.origin}`,
        handleCodeInApp: false, // This should be false for password reset
      };
      await sendPasswordResetEmail(auth, email, actionCodeSettings);

      // await sendPasswordResetEmail(auth, email);

      setEmailSent(true);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error: any) {
      console.error("Forgot password error:", error);
      switch (error.code) {
        case "auth/user-not-found":
          toast.error("No user found with this email address");
          break;
        case "auth/invalid-email":
          toast.error("Invalid email address");
          break;
        case "auth/too-many-requests":
          toast.error("Too many requests. Please try again later");
          break;
        default:
          toast.error("Failed to send password reset email");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg_white_clr">
      <div className="flex w-100 justify-between pt-20 lg:pt-0">
        <div className="hidden md:flex md:w-1/2 justify-center items-center p-4">
          <Link href="/">
            <Image src={logo} alt="logo" width={400} />
          </Link>
        </div>
        <div className="w-full md:w-1/2 md:my-10 bg-white p-6 rounded-xl">
          <div className="flex w-full items-center justify-center bg-brand-bg_white_clr md:h-screen">
            <div className="flex flex-col items-center justify-center w-100 w-10/12">
              {!emailSent ? (
                <form
                  className="flex flex-col modal h-1/2 w-full"
                  onSubmit={handleForgotPassword}
                >
                  <h1 className="my-4 font-bold text-3xl text-black text-center md:text-left">
                    Forgot Password
                  </h1>
                  <p className="text-center text-gray-500 text-sm mb-3">
                    Fill in your account email address to send password reset link
                  </p>
                  <label className="text-sm">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="my-4 mt-1 text-black border-[1px] border-gray-400 rounded-md p-3"
                    placeholder="example@gmail.com"
                    disabled={loading}
                    required
                  />

                  <div className="flex mt-8 justify-center">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex bg-[#004C30] hover:bg-[#003825] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-16 rounded-xl items-center transition-colors"
                    >
                      {loading ? "Sending..." : "Send reset link"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h1 className="font-bold text-3xl text-black">Email Sent!</h1>
                  <p className="text-gray-500 text-lg max-w-md">
                    We've sent a password reset link to <span className="font-semibold text-black">{email}</span>
                  </p>
                  <p className="text-gray-500 text-sm">
                    Check your email and click the link to reset your password. The link will expire in 24 hours.
                  </p>
                  <div className="flex space-x-4 mt-6">
                    <button
                      onClick={() => {
                        setEmailSent(false);
                        setEmail("");
                      }}
                      className="text-brand-btn_orange hover:underline"
                    >
                      Try different email
                    </button>
                    <Link href="/auth/login" className="bg-[#004C30] hover:bg-[#003825] text-white py-2 px-6 rounded-xl transition-colors">
                      Back to Login
                    </Link>
                  </div>
                </div>
              )}

              {!emailSent && (
                <p className="mt-4 flex justify-center items-center text-brand-text_gray">
                  Remember your password?{" "}
                  <Link
                    className="ml-1 text-brand-brand_black font-semibold hover:underline"
                    href="/auth/login"
                  >
                    Log in
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
