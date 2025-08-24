"use client";

import React, { Suspense, useMemo, useState } from "react";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import passwordView from "../assets/icons8-eye-48.png";
import google_logo from "../assets/icons8-google-48.png";
import logo from "../assets/nourish_box_folder/Logo files/icon.svg";
import { auth } from "../lib/firebase";
import { handleGoogleSignIn } from "../utils/firebase/auth.firebase";
import Nav from "../components/nav";
import MobileNav from "../components/mobile_nav";

/** Wrapper puts a Suspense boundary above the hook usage */
export default function LogIn() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-500">Loading…</div>}>
      <LogInInner />
    </Suspense>
  );
}

const LogInInner: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [view, setView] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Show header only on /login (support both /login and /auth/login)
  const isLoginRoute = pathname === "/login" || pathname === "/auth/login";

  // Route-based top padding: pt-10 on /login, pt-0 on /profile?tab=login
  const paddingTopClass = useMemo(() => {
    const isProfileLoginTab =
      pathname?.startsWith("/profile") &&
      searchParams?.get("tab")?.toLowerCase() === "login";

    if (isLoginRoute) return "pt-10";
    if (isProfileLoginTab) return "pt-0";
    return "pt-0";
  }, [pathname, searchParams, isLoginRoute]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err: unknown) {
      console.error("Login failed", err);
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case "auth/user-not-found":
            setError("User not found. Please check your email.");
            break;
          case "auth/wrong-password":
            setError("Incorrect password. Please try again.");
            break;
          case "auth/invalid-email":
            setError("Invalid email format. Please enter a valid email.");
            break;
          case "auth/too-many-requests":
            setError("Too many failed attempts. Try again later.");
            break;
          default:
            setError("An error occurred during sign-in.");
        }
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header only on /login */}
      {isLoginRoute && (
        <>
          <div className="hidden md:block">
            <Nav />
          </div>
          <div className="md:hidden">
            <MobileNav />
          </div>
        </>
      )}

      <div className={`flex w-full justify-between ${paddingTopClass}`}>
        {/* Left: Logo (desktop only) */}
        <div className="hidden md:flex md:w-1/2 justify-center items-center p-4">
          <Link href="/" aria-label="Go to homepage">
            <Image src={logo} alt="Brand logo" width={400} />
          </Link>
        </div>

        {/* Right: Form */}
        <div className="w-full md:w-1/2 md:my-10 bg-white p-6">
          <div className="flex w-full items-center justify-center bg-brand-bg_white_clr">
            <div className="flex flex-col items-center justify-center w-11/12 sm:w-10/12 md:w-9/12 max-w-md">
              <form className="w-full" onSubmit={handleLogin} noValidate>
                <h1 className="my-4 font-bold text-3xl text-black text-center md:text-left">
                  Log in
                </h1>

                {error && (
                  <p className="mb-3 text-sm text-red-600" role="alert" aria-live="polite">
                    {error}
                  </p>
                )}

                <label htmlFor="email" className="text-sm text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="my-2 text-black border border-gray-300 rounded-md p-3 w-full focus:outline-none focus:ring focus:ring-gray-300"
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                />

                <label htmlFor="password" className="text-sm text-gray-700">
                  Password
                </label>
                <div className="flex items-center mt-2 mb-1 justify-between border border-gray-300 rounded-md pr-2 p-2">
                  <input
                    id="password"
                    className="text-black flex-1 outline-none p-1"
                    type={view ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setView((v) => !v)}
                    aria-pressed={view}
                    aria-label={view ? "Hide password" : "Show password"}
                    className="inline-flex items-center justify-center rounded-md p-1 hover:bg-gray-100 focus:outline-none focus:ring focus:ring-gray-200"
                  >
                    <Image src={passwordView} alt="Toggle password visibility" width={20} height={20} />
                  </button>
                </div>

                <p className="text-xs flex justify-end text-brand-text_gray">
                  <Link href="/forgotPassword" className="hover:underline">
                    Forgot password
                  </Link>
                </p>

                <div className="flex mt-6 justify-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex bg-[#004C30] disabled:opacity-80 disabled:cursor-not-allowed text-white py-3 px-16 rounded-xl items-center justify-center"
                  >
                    {loading ? "Signing in…" : "Log in"}
                  </button>
                </div>
              </form>

              <div className="flex w-full items-center my-6">
                <span className="bg-gray-300 h-px w-1/2 mr-2" />
                <span className="text-gray-400 text-sm">OR</span>
                <span className="bg-gray-300 h-px w-1/2 ml-2" />
              </div>

              <button
                type="button"
                disabled={loading}
                className="flex bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl items-center justify-center w-full sm:w-auto disabled:opacity-80 disabled:cursor-not-allowed"
                onClick={() =>
                  handleGoogleSignIn(
                    () => router.push("/"),
                    (msg: string) => setError(msg)
                  )
                }
              >
                <Image src={google_logo} alt="Google logo" className="mr-2" width={20} height={20} />
                <span>Sign in with Google</span>
              </button>

              <p className="mt-6 flex justify-center items-center text-brand-text_gray text-sm">
                Don’t have an account?
                <Link className="ml-1 text-brand-brand_black font-semibold hover:underline" href="/sign_up">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
