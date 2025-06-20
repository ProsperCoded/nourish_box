"use client";

import React, { useState } from "react";
import passwordView from "../assets/icons8-eye-48.png";
import Image from "next/image";
import google_logo from "../assets/icons8-google-48.png";
import Link from "next/link";
import logo from "../assets/nourish_box_folder/Logo files/icon.svg";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, provider, db } from "../lib/firebase";
import { FirebaseError } from "firebase/app";
import { handleGoogleSignIn } from "../utils/firebase/auth.firebase";

const LogIn = () => {
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
      console.error("Login failed", error);
      setLoading(false);
      if (err instanceof FirebaseError) {
        console.error("Firebase Error:", err.code, err.message); // Log error details
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
        console.error("Unexpected Error:", err);
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="flex w-100 justify-between">
          <Link
            href="/"
            className="w-1/2  items-center justify-center hidden md:flex "
          >
            <Image src={logo} alt="jollof rice" width={600} />
          </Link>
          {/* <div className="w-1/2  items-center justify-center hidden md:flex ">
            <Image src={logo} alt="jollof rice" width={600} />
          </div> */}
          <div className="w-full md:w-1/2">
            {error && <p style={{ color: "red" }}>{error}</p>}

            <div className="flex w-full items-center justify-center bg-brand-bg_white_clr h-screen md:h-screen">
              {/* <div className=' hidden md:block p-2 md:w-1/3 '>
                            <Image src={Sidebar} alt='side bar' />
                        </div> */}

              <div className="flex flex-col items-center justify-center w-100 w-10/12  ">
                <form
                  className="flex flex-col modal h-1/2 w-full   "
                  onSubmit={handleLogin}
                >
                  <h1 className="my-4 font-bold text-3xl text-black text-center md:text-left ">
                    Log In
                  </h1>

                  <label className=" text-sm ">Email</label>
                  <input
                    width="w-full"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="my-4 mt-1 text-black border-[1px] border-gray-400 rounded-md p-3"
                    placeholder="example@gmail.com"
                  />
                  <label className=" text-sm ">Create Password</label>
                  <div className="flex items-center mb-1 mt-1 justify-between border-gray-400 border-[1px] border-solid rounded-lg pr-4 p-3">
                    <input
                      width="w-full"
                      className="  text-black"
                      type={view ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="************"
                    />
                    <Image
                      src={passwordView}
                      alt="icon to view password"
                      onClick={() => setView(!view)}
                      width={20}
                      height={20}
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
                  <p className="bg-gray-400 h-[1px] w-1/2 mr-2"></p>
                  <p className="text-gray-400">OR</p>
                  <p className="bg-gray-400 h-[1px] w-1/2 ml-2"></p>
                </div>
                <button
                  type="button"
                  className="flex bg-gray-200 text-gray-500 py-3 px-8 rounded-xl items-center"
                  onClick={(e) =>
                    handleGoogleSignIn(
                      () => {
                        router.push("/");
                      },
                      (error: string) => {
                        setError(error);
                      }
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
                  You have an account?{" "}
                  <Link
                    className="ml-1 text-brand-brand_black font-semibold"
                    href="/sign_up"
                  >
                    Sign up
                  </Link>
                </p>
                {error && <p>{error}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogIn;
