"use client";

import React, { useState } from "react";
import passwordView from "../assets/icons8-eye-48.png";
import Image from "next/image";
import google_logo from "../assets/icons8-google-48.png";
import Link from "next/link";
import logo from "../assets/nourish_box_folder/Logo files/icon.svg";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, provider, db } from "../lib/firebase";
import { FirebaseError } from "firebase/app";
import { doc, setDoc } from "firebase/firestore";
import { handleGoogleSignIn } from "../utils/firebase/auth.firebase";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
} from "@mui/material";
import { COLLECTION } from "@/app/utils/schema/collection.enum";

// Nigerian states
const nigerianStates = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    country: "Nigeria", // Default to Nigeria
    state: "",
    role: "user", // Default role
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState(false);
  const router = useRouter();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !formData.email ||
      !formData.password ||
      !formData.name ||
      !formData.phone ||
      !formData.address ||
      !formData.state
    ) {
      setError("All fields are required.");
      return;
    }

    try {
      setLoading(true);
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const { password, ...userProfile } = formData;
      // Create user profile in Firestore
      await setDoc(doc(db, COLLECTION.users, userCredential.user.uid), {
        ...userProfile,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      router.push("/");
    } catch (err: unknown) {
      console.error("Sign up failed", err);
      setLoading(false);
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case "auth/email-already-in-use":
            setError("This email is already registered. Please log in.");
            break;
          case "auth/invalid-email":
            setError("Invalid email format. Please enter a valid email.");
            break;
          case "auth/weak-password":
            setError("Password should be at least 6 characters.");
            break;
          default:
            setError("An error occurred during sign-up. Please try again.");
        }
      }
    }
  };

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="flex w-100 justify-between">
          <div className="hidden w-1/2 md:flex items-center justify-center bg-[#004C30]">
            <Image src={logo} alt="jollof rice" width={600} />
          </div>
          <div className="w-full md:w-1/2">
            {error && <p className="text-red-500 text-center mt-4">{error}</p>}
            <div className="flex w-full items-center justify-center bg-brand-bg_white_clr h-screen overflow-y-auto">
              <div className="flex flex-col items-center justify-center w-10/12 py-8">
                <form
                  className="flex flex-col w-full space-y-4"
                  onSubmit={handleSignUp}
                >
                  <h1 className="font-bold text-3xl text-black text-center md:text-left">
                    Sign Up
                  </h1>

                  <TextField
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    fullWidth
                    required
                  />

                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    fullWidth
                    required
                  />

                  <div className="relative">
                    <TextField
                      label="Password"
                      name="password"
                      type={view ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      fullWidth
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setView(!view)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    >
                      <Image
                        src={passwordView}
                        alt="view password"
                        width={20}
                        height={20}
                      />
                    </button>
                  </div>

                  <TextField
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    fullWidth
                    required
                  />

                  <FormControl fullWidth>
                    <InputLabel>State</InputLabel>
                    <Select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      label="State"
                      required
                    >
                      {nigerianStates.map((state) => (
                        <MenuItem key={state} value={state}>
                          {state}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    fullWidth
                    multiline
                    rows={2}
                    required
                  />

                  <button
                    type="submit"
                    className="bg-[#004C30] text-white py-3 px-16 rounded-xl mx-auto my-3"
                  >
                    Sign Up
                  </button>
                </form>

                <div className="flex w-full items-center my-4">
                  <div className="bg-gray-400 h-[1px] flex-1"></div>
                  <p className="mx-4 text-gray-400">OR</p>
                  <div className="bg-gray-400 h-[1px] flex-1"></div>
                </div>

                <button
                  type="button"
                  className="flex items-center bg-gray-200 text-gray-500 py-3 px-8 rounded-xl"
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
                    className="mr-2"
                    width={20}
                    height={20}
                  />
                  <span>Sign in with Google</span>
                </button>

                <p className="mt-4 text-brand-text_gray">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-brand-brand_black font-semibold"
                  >
                    Log In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUp;
