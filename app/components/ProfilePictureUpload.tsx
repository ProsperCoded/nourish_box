"use client";
import React, { useState, useRef } from "react";
import Image from "next/image";
import { Camera, Upload, X } from "lucide-react";
import { updateUserProfilePicture } from "@/app/utils/firebase/users.firebase";
import { useAuth } from "@/app/contexts/AuthContext";
import userIcon from "../assets/icons8-user-48.png";

interface ProfilePictureUploadProps {
  currentPicture?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  onUploadComplete?: (url: string) => void;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentPicture,
  size = "lg",
  showLabel = true,
  onUploadComplete,
}) => {
  const { user, refreshAuth } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      setSelectedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    try {
      setIsUploading(true);
      const newProfilePictureUrl = await updateUserProfilePicture(
        user.id,
        selectedFile,
        currentPicture
      );

      // Refresh auth context to get updated user data
      await refreshAuth();

      // Reset states
      setSelectedFile(null);
      setPreviewUrl(null);

      // Call the callback if provided
      if (onUploadComplete) {
        onUploadComplete(newProfilePictureUrl);
      }

      alert("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert("Failed to upload profile picture. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayImage = previewUrl || currentPicture || userIcon;

  return (
    <div className="flex flex-col items-center space-y-4">
      {showLabel && (
        <label className="block text-gray-700 mb-2 font-inter font-light">
          Profile Picture
        </label>
      )}

      <div className="relative group">
        <div
          className={`${sizeClasses[size]} relative rounded-full overflow-hidden border-2 border-gray-300 hover:border-orange-400 transition-colors cursor-pointer`}
        >
          <Image
            src={displayImage}
            alt="Profile picture"
            fill
            className="object-cover"
          />

          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera
              className="text-white"
              size={size === "sm" ? 16 : size === "md" ? 20 : 24}
            />
          </div>
        </div>

        {/* Upload indicator */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* File input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Action buttons */}
      {selectedFile && (
        <div className="flex space-x-3">
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Upload size={16} />
            {isUploading ? "Uploading..." : "Upload"}
          </button>

          <button
            onClick={handleCancel}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <X size={16} />
            Cancel
          </button>
        </div>
      )}

      {/* Click to change text */}
      {!selectedFile && (
        <p className="text-sm text-gray-500 text-center">
          Click the image to change your profile picture
        </p>
      )}
    </div>
  );
};

export default ProfilePictureUpload;
