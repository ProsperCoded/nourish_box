"use client";

import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import passwordView from "../assets/icons8-eye-48.png";
import google_logo from "../assets/icons8-google-48.png";
import logo from "../assets/nourish_box_folder/Logo files/icon.svg";
import { auth } from "../../lib/firebase";
import { handleGoogleSignIn } from "../../utils/firebase/auth.firebase";
import Nav from "../../components/nav";
import MobileNav from "../../components/mobile_nav";
// import Header from "../components/header";

type LogInProps = {
  showHeader?: boolean; // optional header (mobile)
};

const LogIn: React.FC<LogInProps> = ({ showHeader = true }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [view, setView] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err: unknown) {
      console.error("Login failed", err);
      setLoading(false);
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
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      {/* Desktop nav */}
      <div className="hidden md:block">
        <Nav />
      </div>

      {/* Optional mobile header */}
      {showHeader && (
        <div className="block md:hidden">
          <MobileNav />
        </div>
      )}

      {/* Optional compact mobile nav without links */}
      <div className="block md:hidden">
        <Nav noLinks={true} />
      </div>

      <div className="flex w-full justify-between md:pt-20 lg:pt-0">
        {/* Left: Logo (desktop only) */}
        <div className="hidden md:flex md:w-1/2 justify-center items-center p-4">
          <Link href="/">
            <Image src={logo} alt="logo" width={400} />
          </Link>
        </div>

        {/* Right: Form */}
        <div className="w-full md:w-1/2 md:my-10 bg-white p-6 rounded-xl">
          {error && <p className="text-red-500">{error}</p>}

          <div className="flex w-full items-center justify-center bg-brand-bg_white_clr md:h-screen">
            <div className="flex flex-col items-center justify-center w-10/12">
              <form className="flex flex-col modal h-1/2 w-full" onSubmit={handleLogin}>
                <h1 className="my-4 font-bold text-3xl text-black text-center md:text-left">
                  Log In
                </h1>

                <label className="text-sm">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="my-4 mt-1 text-black border border-gray-400 rounded-md p-3"
                  placeholder="example@gmail.com"
                />

                <label className="text-sm">Password</label>
                <div className="flex items-center mb-1 mt-1 justify-between border border-gray-400 rounded-lg pr-4 p-3">
                  <input
                    className="text-black flex-1 outline-none"
                    type={view ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="************"
                  />
                  <Image
                    src={passwordView}
                    alt="toggle password visibility"
                    onClick={() => setView(!view)}
                    width={20}
                    height={20}
                    className="cursor-pointer"
                  />
                </div>

                <p className="text-xs flex justify-end text-brand-text_gray">
                  <Link href="/forgotPassword">Forgot password</Link>
                </p>

                <div className="flex mt-8 justify-center">
                  <button
                    type="submit"
                    className="flex bg-[#004C30] text-white py-3 px-16 rounded-xl items-center"
                  >
                    Log in
                  </button>
                </div>
              </form>

              <div className="flex w-full items-center my-4">
                <p className="bg-gray-400 h-px w-1/2 mr-2" />
                <p className="text-gray-400">OR</p>
                <p className="bg-gray-400 h-px w-1/2 ml-2" />
              </div>

              <button
                type="button"
                className="flex bg-gray-200 text-gray-500 py-3 px-8 rounded-xl items-center"
                onClick={() =>
                  handleGoogleSignIn(
                    () => router.push("/"),
                    (msg: string) => setError(msg)
                  )
                }
              >
                <Image
                  src={google_logo}
                  alt="google logo"
                  className="mx-2"
                  width={20}
                  height={20}
                />
                <p>Sign in with Google</p>
              </button>

              <p className="mt-4 flex justify-center items-center text-brand-text_gray">
                Don’t have an account?{" "}
                <Link className="ml-1 text-brand-brand_black font-semibold" href="/sign_up">
                  Sign up
                </Link>
              </p>

              {error && <p className="text-red-500">{error}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogIn;
