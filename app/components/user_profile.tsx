"use client";
import { useAuth } from "@/app/contexts/AuthContext";
import React, { useState, useEffect } from "react";
import { updateUserProfile } from "@/app/utils/firebase/users.firebase";
import { fetchStates, fetchLGAs } from "@/app/utils/client-api/locationApi";
import { User } from "@/app/utils/types/user.type";
import { AlertTriangle } from "lucide-react";
import ProfilePictureUpload from "./ProfilePictureUpload";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  lga: string;
}

const UserProfile = () => {
  const { user, refreshAuth } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    lga: "",
  });
  const [states, setStates] = useState<string[]>([]);
  const [lgas, setLgas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        lga: user.lga || "",
      });
    }
  }, [user]);

  // Load states on component mount
  useEffect(() => {
    const loadStates = async () => {
      try {
        setLoading(true);
        const statesData = await fetchStates();
        setStates(statesData);
      } catch (error) {
        console.error("Error loading states:", error);
        setMessage({ type: "error", text: "Failed to load states" });
      } finally {
        setLoading(false);
      }
    };

    loadStates();
  }, []);

  // Load LGAs when state changes
  useEffect(() => {
    const loadLGAs = async () => {
      if (formData.state) {
        try {
          const lgasData = await fetchLGAs(formData.state);
          setLgas(lgasData);
          // Reset LGA if the state changed
          if (user?.state !== formData.state) {
            setFormData((prev) => ({ ...prev, lga: "" }));
          }
        } catch (error) {
          console.error("Error loading LGAs:", error);
          setMessage({ type: "error", text: "Failed to load LGAs" });
        }
      } else {
        setLgas([]);
      }
    };

    loadLGAs();
  }, [formData.state, user?.state]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setMessage({ type: "error", text: "User not authenticated" });
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage(null);

      // Update user profile
      await updateUserProfile(user.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        lga: formData.lga,
      });

      // Refresh auth context to get updated user data
      await refreshAuth();

      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text: "Failed to update profile. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (
    name: string,
    label: string,
    type: string = "text",
    required: boolean = true
  ) => {
    const isEmpty = required && !formData[name as keyof FormData];
    return (
      <div>
        <label className="block text-gray-700 mb-2 font-inter font-light">
          {label} {required && "*"}
        </label>
        <div className="relative">
          <input
            type={type}
            name={name}
            value={formData[name as keyof FormData]}
            onChange={handleInputChange}
            className={`w-full rounded-md p-4 border-[1px] border-solid ${
              isEmpty ? "border-yellow-500 bg-yellow-50" : "border-gray-500"
            } focus:border-orange-500 focus:outline-none`}
            required={required}
            disabled={!isEditing}
          />
          {isEmpty && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 group">
              <AlertTriangle className="text-yellow-500" size={20} />
              <div className="absolute right-0 top-full mt-1 w-48 p-2 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity">
                This information is needed for delivery
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!user) {
    return (
        <form action="">
            <div >
                <h2 className='text-2xl font-inter text-gray-700 '>Personal Information</h2>
                <div className='flex items-center my-4 border-t-[1px] border-gray'>
                    
                    <div className='flex flex-col w-1/2 m-2' >
                        <label className='my-2 text-gray-700 mb-2 font-inter font-light'>First name</label>
                        <input type="text"  className='rounded-md p-4  border-[1px] border-solid border-gray-500'/>
                    </div>
                    <div className='flex flex-col w-1/2 m-2'>
                        <label className='mb-2 font-inter font-light my-2 capitalize text-gray-700'>Last name</label>
                        <input type="text" className='rounded-md p-4 border-[1px] border-solid border-gray-500 ' />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-inter font-light">
                  LGA *
                </label>
                <div className="relative">
                  <select
                    name="lga"
                    value={formData.lga}
                    onChange={handleInputChange}
                    className={`w-full rounded-md p-4 border-[1px] border-solid ${
                      !formData.lga
                        ? "border-yellow-500 bg-yellow-50"
                        : "border-gray-500"
                    } focus:border-orange-500 focus:outline-none`}
                    required
                    disabled={
                      !formData.state || lgas.length === 0 || !isEditing
                    }
                  >
                    <option value="">Select LGA</option>
                    {lgas.map((lga) => (
                      <option key={lga} value={lga}>
                        {lga}
                      </option>
                    ))}
                  </select>
                  {!formData.lga && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 group">
                      <AlertTriangle className="text-yellow-500" size={20} />
                      <div className="absolute right-0 top-full mt-1 w-48 p-2 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        This information is needed for delivery
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* City & Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {renderField("city", "City")}
              {renderField("address", "Address")}
            </div>

            {/* Submit Button */}
            {isEditing && (
              <div className="flex justify-center mt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-8 py-3 rounded-md font-semibold text-white transition-colors ${
                    isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-orange-500 hover:bg-orange-600"
                  }`}
                >
                  {isSubmitting ? "Updating..." : "Update Profile"}
                </button>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserProfile;
