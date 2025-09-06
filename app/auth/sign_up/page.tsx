"use client";

import {
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import {
  createUserWithEmailAndPassword
} from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import passwordViewIcon from "../../assets/icons8-eye-48.png";
import googleLogo from "../../assets/icons8-google-48.png";
import logo from "../../assets/nourish_box_folder/Logo files/icon.svg";

import { COLLECTION } from "@/app/utils/schema/collection.enum";
import { FirebaseError } from "firebase/app";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { handleGoogleSignIn } from "../../utils/firebase/auth.firebase";
import Nav from "../../components/nav";
type LogInProps = {
  showHeader?: boolean; // optional header (mobile)
};
// Nigerian states
const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River",
  "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Federal Capital Territory (FCT)", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger",
  "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

const SignUp : React.FC<LogInProps> = ({ showHeader = true }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    country: "Nigeria",
    state: "",
    role: "user",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // handle text input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // handle select change (MUI Select)
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target as { name: string; value: string };
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { name, email, password, phone, address, state } = formData;

    if (!name || !email || !password || !phone || !address || !state) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const { password: _, ...userDetails } = formData;

      await setDoc(doc(db, COLLECTION.users, userCred.user.uid), {
        ...userDetails,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      router.push("/");
    } catch (err: unknown) {
      setLoading(false);
      if (err instanceof FirebaseError) {
        const messages: Record<string, string> = {
          "auth/email-already-in-use": "Email is already registered.",
          "auth/invalid-email": "Invalid email format.",
          "auth/weak-password": "Password must be at least 6 characters.",
        };
        setError(messages[err.code] || "Signup failed. Please try again.");
      }
    }
  };

  return (
    <div>
       <div className="hidden md:block">
           <Nav/>
            </div>

            {/* Mobile brand header */}
            {showHeader && (
              <div className="md:hidden flex flex-col items-center justify-center pt-6">
                <Link href="/" className="flex items-center gap-2">
                  <Image src={logo} alt="Nourish Box logo" width={36} height={36} />
                  <span className="text-lg font-semibold text-black">Nourish Box</span>
                </Link>
              </div>
            )}
      <main className="min-h-screen bg-brand-bg_white_clr md:mt-12 pt-20 lg:pt-0 md:min-h-screen flex items-center justify-center px-4 py-4 md:py-10">
        <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row gap-10 bg-white">
          {/* Mobile brand header */}
          <div className="md:hidden flex w-full items-center justify-center pt-6">
            <Link href="/" className="flex items-center gap-2">
              <Image src={logo} alt="Nourish Box logo" width={36} height={36} />
              <span className="text-lg font-semibold text-black">Nourish Box</span>
            </Link>
          </div>
          <div className="hidden md:flex md:w-1/2 justify-center items-center p-4">
            <Link href="/">
              <Image src={logo} alt="logo" width={600} />
            </Link>
          </div>

          <div className="w-full md:w-1/2 md:my-10 bg-white shadow-md p-6 rounded-xl">
            <h2 className="text-3xl font-bold mb-6 text-center md:text-left">Create Account</h2>

            {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
            {loading && (
              <div className="flex justify-center my-4">
                <CircularProgress />
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-4">
              <TextField label="Full Name" name="name" fullWidth required value={formData.name} onChange={handleInputChange} />
              <TextField label="Email" name="email" type="email" fullWidth required value={formData.email} onChange={handleInputChange} />

              <div className="relative">
                <TextField
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  <Image src={passwordViewIcon} alt="Toggle visibility" width={20} height={20} />
                </button>
              </div>

              <TextField label="Phone Number" name="phone" fullWidth required value={formData.phone} onChange={handleInputChange} />

              <FormControl fullWidth required>
                <InputLabel>State</InputLabel>
                <Select name="state" value={formData.state} onChange={handleSelectChange} label="State">
                  {nigerianStates.map((state) => (
                    <MenuItem key={state} value={state}>{state}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Address"
                name="address"
                multiline
                rows={2}
                fullWidth
                required
                value={formData.address}
                onChange={handleInputChange}
              />

              <button
                type="submit"
                className="bg-[#004C30] text-white font-semibold py-3 px-6 rounded-lg w-full"
              >
                Sign Up
              </button>
            </form>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-grow h-px bg-gray-300"></div>
              <span className="text-gray-400">OR</span>
              <div className="flex-grow h-px bg-gray-300"></div>
            </div>

            <button
              type="button"
              className="flex items-center justify-center gap-2 bg-gray-100 py-3 px-4 rounded-lg w-full"
              onClick={() =>
                handleGoogleSignIn(
                  () => router.push("/"),
                  (errMsg) => setError(errMsg)
                )
              }
            >
              <Image src={googleLogo} alt="Google logo" width={20} height={20} />
              <span>Continue with Google</span>
            </button>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-[#004C30] font-medium">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </main>
  </div>
  );
};

export default SignUp;
