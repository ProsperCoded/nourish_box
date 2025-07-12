"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Save,
  RefreshCw,
  Upload,
  AlertTriangle,
  CheckCircle,
  Image as ImageIcon,
} from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import { SiteContent } from "@/app/utils/types/site-content.type";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import Image from "next/image";

export default function SiteContentPage() {
  const { user } = useAuth();
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [heroHeading, setHeroHeading] = useState("");
  const [heroDescription, setHeroDescription] = useState("");
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);

  // Fetch site content on mount
  useEffect(() => {
    fetchSiteContent();
  }, []);

  // Update form state when site content changes
  useEffect(() => {
    if (siteContent) {
      setHeroHeading(siteContent.heroHeading);
      setHeroDescription(siteContent.heroDescription);
      setHeroImagePreview(siteContent.heroImage.url);
    }
  }, [siteContent]);

  const fetchSiteContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/site-content");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch site content");
      }

      setSiteContent(data.data);
    } catch (error) {
      console.error("Error fetching site content:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch site content"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        setError("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      setHeroImageFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setHeroImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const uploadHeroImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", user?.id || "");

    const response = await fetch("/api/recipes/upload-media", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to upload image");
    }

    return {
      url: data.url,
      publicId: data.public_id,
      type: "image" as const,
    };
  };

  const handleSave = async () => {
    if (!user?.id) {
      setError("User authentication required");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      let heroImage = siteContent?.heroImage;

      // Upload new image if selected
      if (heroImageFile) {
        setUploading(true);
        heroImage = await uploadHeroImage(heroImageFile);
        setUploading(false);
      }

      // Update site content
      const response = await fetch("/api/site-content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          heroHeading,
          heroDescription,
          heroImage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update site content");
      }

      setSiteContent(data.data);
      setHeroImageFile(null);
      setSuccess("Site content updated successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error updating site content:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update site content"
      );
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const hasChanges = () => {
    if (!siteContent) return false;

    return (
      heroHeading !== siteContent.heroHeading ||
      heroDescription !== siteContent.heroDescription ||
      heroImageFile !== null
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] w-full">
        <div className="loader"></div>
        <p className="text-lg font-semibold text-brand-logo_green mt-4">
          Loading Site Content...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
            <Settings className="w-8 h-8 mr-3 text-brand-logo_green" />
            Site Content Management
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Manage and update your website's content
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            onClick={fetchSiteContent}
            disabled={loading}
            variant="outline"
            className="border-brand-logo_green text-brand-logo_green hover:bg-brand-logo_green hover:text-white"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Error and Success Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3"
        >
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3"
        >
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
          <div>
            <p className="text-green-800 font-medium">Success</p>
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        </motion.div>
      )}

      {/* Hero Section Content Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">
              Hero Section Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Hero Heading */}
            <div>
              <label
                htmlFor="heroHeading"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Hero Heading
              </label>
              <Input
                id="heroHeading"
                type="text"
                value={heroHeading}
                onChange={(e) => setHeroHeading(e.target.value)}
                placeholder="Enter hero heading"
                className="w-full"
                disabled={saving || uploading}
              />
            </div>

            {/* Hero Description */}
            <div>
              <label
                htmlFor="heroDescription"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Hero Description
              </label>
              <textarea
                id="heroDescription"
                value={heroDescription}
                onChange={(e) => setHeroDescription(e.target.value)}
                placeholder="Enter hero description"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-logo_green focus:border-brand-logo_green"
                disabled={saving || uploading}
              />
            </div>

            {/* Hero Image */}
            <div>
              <label
                htmlFor="heroImage"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Hero Image
              </label>

              {/* Current/Preview Image */}
              {heroImagePreview && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    {heroImageFile ? "Preview:" : "Current Image:"}
                  </p>
                  <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
                    <Image
                      src={heroImagePreview}
                      alt="Hero image preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              {/* File Input */}
              <div className="flex items-center space-x-4">
                <label
                  htmlFor="heroImageInput"
                  className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose New Image</span>
                </label>
                <input
                  id="heroImageInput"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={saving || uploading}
                />
                {heroImageFile && (
                  <span className="text-sm text-gray-600">
                    {heroImageFile.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB
              </p>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSave}
                disabled={!hasChanges() || saving || uploading}
                className="bg-brand-logo_green hover:bg-brand-logo_green/90 text-white px-6 py-2"
              >
                {uploading ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-bounce" />
                    Uploading...
                  </>
                ) : saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Preview Section */}
      {siteContent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Hero Heading:
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {heroHeading || "No heading set"}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Hero Description:
                  </h3>
                  <p className="text-gray-600">
                    {heroDescription || "No description set"}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Hero Image:
                  </h3>
                  {heroImagePreview ? (
                    <div className="relative w-full max-w-md h-48 border border-gray-300 rounded-lg overflow-hidden">
                      <Image
                        src={heroImagePreview}
                        alt="Hero image"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full max-w-md h-48 border border-gray-300 rounded-lg bg-gray-50">
                      <div className="text-center">
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No image set</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
