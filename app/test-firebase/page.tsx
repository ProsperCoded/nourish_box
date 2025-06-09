"use client";

import { useState } from "react";
import { storage } from "../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function TestFirebasePage() {
  const [status, setStatus] = useState<string>("Ready to test");
  const [fileInput, setFileInput] = useState<File | null>(null);

  const testFirebaseConfig = () => {
    try {
      setStatus("Testing Firebase configuration...");

      // Check if storage is initialized
      if (!storage) {
        setStatus("❌ Firebase Storage is not initialized");
        return;
      }

      // Check storage app
      const app = storage.app;
      setStatus(`✅ Firebase Storage initialized. App: ${app.name}`);

      // Log environment variables (safely)
      console.log("Environment check:");
      console.log(
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID:",
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "✅ Set" : "❌ Missing"
      );
      console.log(
        "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:",
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
          ? "✅ Set"
          : "❌ Missing"
      );
      console.log(
        "NEXT_PUBLIC_FIREBASE_API_KEY:",
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✅ Set" : "❌ Missing"
      );
    } catch (error) {
      setStatus(
        `❌ Error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  const testUpload = async () => {
    if (!fileInput) {
      setStatus("❌ Please select a file first");
      return;
    }

    try {
      setStatus("🔄 Starting test upload...");

      // Create a simple test upload
      const testRef = ref(storage, `test/${Date.now()}_${fileInput.name}`);
      console.log("Test upload path:", testRef.fullPath);

      const snapshot = await uploadBytes(testRef, fileInput);
      console.log("Upload snapshot:", snapshot);

      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log("Download URL:", downloadURL);

      setStatus(`✅ Test upload successful! URL: ${downloadURL}`);
    } catch (error) {
      console.error("Test upload error:", error);
      setStatus(
        `❌ Upload failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Firebase Storage Test</h1>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Configuration Test</h2>
            <button
              onClick={testFirebaseConfig}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test Firebase Config
            </button>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Upload Test</h2>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFileInput(e.target.files?.[0] || null)}
              className="mb-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <button
              onClick={testUpload}
              disabled={!fileInput}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test Upload
            </button>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-semibold mb-2">Status:</h3>
            <p className="text-sm">{status}</p>
          </div>

          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Environment Variables Check:</h3>
            <div className="text-sm space-y-1">
              <p>
                PROJECT_ID:{" "}
                {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
                  ? "✅ Set"
                  : "❌ Missing"}
              </p>
              <p>
                STORAGE_BUCKET:{" "}
                {process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
                  ? "✅ Set"
                  : "❌ Missing"}
              </p>
              <p>
                API_KEY:{" "}
                {process.env.NEXT_PUBLIC_FIREBASE_API_KEY
                  ? "✅ Set"
                  : "❌ Missing"}
              </p>
              <p>
                AUTH_DOMAIN:{" "}
                {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
                  ? "✅ Set"
                  : "❌ Missing"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
