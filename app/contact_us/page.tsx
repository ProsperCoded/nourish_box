"use client";

import Image from "next/image";
import React, { useState } from "react";
import Logo from "../assets/nourish_box_folder/Logo files/icon.svg";
import Cancel from "../assets/icons8-cancel-64.png";
import Link from "next/link";
import toast from "react-hot-toast";

interface Props {
  className?: string;
  formClassName?: string;
  textClassName?: string;
  showIcons?: boolean;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

const ContactUs: React.FC<Props> = ({
  className,
  formClassName,
  textClassName,
  showIcons = true,
}) => {
  const [isActive, setIsActive] = useState<number[]>([]);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const formWidth = showIcons ? "md:w-1/2 md:p-10" : "w-full bg-gray-50 ";

  const toggleFAQ = (index: number) => {
    setIsActive((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (
      !/^(\+234|0)[789][01]\d{8}$/.test(formData.phone.replace(/\s/g, ""))
    ) {
      newErrors.phone = "Please enter a valid Nigerian phone number";
    }
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          data.message ||
            "Thank you for contacting us! We'll get back to you soon.",
          {
            duration: 5000,
            position: "top-center",
            style: {
              background: "#10B981",
              color: "#fff",
              padding: "16px",
              borderRadius: "8px",
            },
          }
        );

        // Reset form on success
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          message: "",
        });
      } else {
        toast.error(
          data.message || "Failed to send message. Please try again.",
          {
            duration: 4000,
            position: "top-center",
            style: {
              background: "#EF4444",
              color: "#fff",
              padding: "16px",
              borderRadius: "8px",
            },
          }
        );
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error("An error occurred. Please try again later.", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#EF4444",
          color: "#fff",
          padding: "16px",
          borderRadius: "8px",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      question: "What is your return policy?",
      answer:
        "We accept returns within 14 days of purchase, provided the item is unused and in original packaging.",
    },
    {
      question: "Do you offer international shipping?",
      answer:
        "Yes, we ship to many countries worldwide. Shipping fees and times vary by destination.",
    },
    {
      question: "How can I track my order?",
      answer:
        "Once your order ships, you will receive a tracking link via email.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept Visa, MasterCard, PayPal, and Apple Pay.",
    },
    {
      question: "Can I change or cancel my order?",
      answer:
        "Please contact us within 24 hours to change or cancel your order.",
    },
  ];

  return (
    <div className="w-full bg-white">
      {/* Contact Section */}
      <div className="flex flex-col md:flex-row justify-between items-center min-h-screen px-6  py-10 gap-10">
        {showIcons && (
          <div className="w-full md:w-1/2 hidden md:flex justify-center">
            <Link href="/">
              <Image src={Logo} alt="logo" width={500} height={500} />
            </Link>
          </div>
        )}

        {/* Right Side (Form) */}
        <div
          className={`w-full  ${formWidth} ${formClassName ?? ""} ${
            formClassName ?? ""
          }`}
        >
          {showIcons && (
            <div className="flex justify-end mb-4">
              <Link href="/">
                <Image src={Cancel} alt="cancel" width={35} height={35} />
              </Link>
            </div>
          )}

          <h1
            className={`text-3xl text-center md:text-4xl font-semibold mb-6 font-inter ${
              textClassName ?? ""
            }`}
          >
            Contact Us
          </h1>

          <form className="font-inter space-y-4" onSubmit={handleSubmit}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-1/2">
                <label htmlFor="firstName" className="text-lg font-light">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full border rounded-md p-3 mt-1 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.firstName
                      ? "border-red-500 bg-red-50"
                      : "border-gray-400"
                  }`}
                  placeholder="Enter your first name"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div className="w-full sm:w-1/2">
                <label htmlFor="lastName" className="text-lg font-light">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full border rounded-md p-3 mt-1 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.lastName
                      ? "border-red-500 bg-red-50"
                      : "border-gray-400"
                  }`}
                  placeholder="Enter your last name"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="text-lg font-light">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@email.com"
                className={`w-full border rounded-md p-3 mt-1 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.email ? "border-red-500 bg-red-50" : "border-gray-400"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="text-lg font-light">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="08012345678"
                className={`w-full border rounded-md p-3 mt-1 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.phone ? "border-red-500 bg-red-50" : "border-gray-400"
                }`}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label htmlFor="message" className="text-lg font-light">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Tell us how we can help you..."
                className={`w-full border rounded-md p-3 mt-1 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.message
                    ? "border-red-500 bg-red-50"
                    : "border-gray-400"
                }`}
              ></textarea>
              {errors.message && (
                <p className="text-red-500 text-sm mt-1">{errors.message}</p>
              )}
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-orange-500 text-white py-3 px-8 rounded-lg mt-2 hover:bg-orange-600 transition-colors disabled:bg-orange-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {isSubmitting ? "Sending..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="w-full flex flex-col items-center px-4 md:px-10 py-10">
        <h2 className="text-3xl md:text-4xl font-inter mb-6">FAQs</h2>
        <div className="w-full md:w-10/12">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-300 rounded-lg p-4 mb-4 shadow-sm"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left font-medium flex justify-between items-center"
              >
                <span>{faq.question}</span>
                <span className="text-xl">
                  {isActive.includes(index) ? "−" : "+"}
                </span>
              </button>
              {isActive.includes(index) && (
                <div className="mt-2 text-gray-700">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
