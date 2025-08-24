"use client";

import Image from "next/image";
import React, { useState } from "react";
import toast from "react-hot-toast";
import Logo from "../assets/nourish_box_folder/Logo files/icon.svg";
import CartComponent from "../components/Cart";
import Footer from "../components/footer";
import Nav from "../components/nav";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();

  // Show header/nav ONLY on the standalone /contact route
  const isStandaloneContact =
    pathname === "/contact" || pathname === "/contact_us"; // include either path if you use both

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

  const formWidth = showIcons ? "md:w-1/2 md:p-10" : "w-full";
  const headerOffsetClass = isStandaloneContact ? "md:mt-24" : "md:mt-0";

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
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Please enter a valid email address";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^(\+234|0)[789][01]\d{8}$/.test(formData.phone.replace(/\s/g, "")))
      newErrors.phone = "Please enter a valid Nigerian phone number";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    else if (formData.message.trim().length < 10)
      newErrors.message = "Message must be at least 10 characters long";
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(
          data.message || "Thank you for contacting us! We'll get back to you soon.",
          {
            duration: 5000,
            position: "top-center",
            style: { background: "#10B981", color: "#fff", padding: "16px", borderRadius: "8px" },
          }
        );
        setFormData({ firstName: "", lastName: "", email: "", phone: "", message: "" });
      } else {
        toast.error(data.message || "Failed to send message. Please try again.", {
          duration: 4000,
          position: "top-center",
          style: { background: "#EF4444", color: "#fff", padding: "16px", borderRadius: "8px" },
        });
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error("An error occurred. Please try again later.", {
        duration: 4000,
        position: "top-center",
        style: { background: "#EF4444", color: "#fff", padding: "16px", borderRadius: "8px" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    { question: "What is your return policy?", answer: "We accept returns within 14 days of purchase, provided the item is unused and in original packaging." },
    { question: "Do you offer international shipping?", answer: "Yes, we ship to many countries worldwide. Shipping fees and times vary by destination." },
    { question: "How can I track my order?", answer: "Once your order ships, you will receive a tracking link via email." },
    { question: "What payment methods do you accept?", answer: "We accept Visa, MasterCard, PayPal, and Apple Pay." },
    { question: "Can I change or cancel my order?", answer: "Please contact us within 24 hours to change or cancel your order." },
  ];

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="w-full bg-white max-w-[1550px]">
        {/* Desktop Nav — ONLY on standalone /contact */}
        {isStandaloneContact && (
          <div className="hidden md:block mb-5">
            <Nav />
          </div>
        )}

        <div className={`flex flex-col ${headerOffsetClass} md:flex-row justify-between items-center px-6 py-5 md:py-10 gap-10`}>
          {showIcons && (
            <div className="w-full font-inter md:w-1/2 pl-6 hidden md:flex justify-center">
              <div>
                <p className="text-xl">Get in touch</p>
                <h1 className="text-6xl py-8 font-custom">
                  We are always ready to help and answer your questions.
                </h1>
                <div className="flex py-5 justify-center w-5/6">
                  <div className="flex justify-between w-full">
                    <div>
                      <h2 className="text-2xl tracking-wide font-custom font-semibold">Call center</h2>
                      <p>Tel: 09012345678</p>
                    </div>
                    <div className="px-4">
                      <h2 className="text-2xl tracking-wide font-custom font-semibold">Our location</h2>
                      <p>Lekki: 4b akanni bashorun</p>
                      <p>Ikeja: 4b lily drive</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Right Side (Form) */}
          <div className={`w-full ${formWidth} ${formClassName ?? ""}`}>
            {/* Mobile header — ONLY on standalone /contact */}
            {isStandaloneContact && (
              <div className="md:hidden flex flex-col items-center justify-between gap-4 px-4 md:pt-20 mb-1">
                <div className="flex justify-between w-full">
                  <Image src={Logo} alt="logo" width={50} />
                  <CartComponent />
                </div>
              </div>
            )}

            {/* Mobile page title — ONLY on standalone /contact */}
            {isStandaloneContact && (
              <h1
                className={`md:hidden text-3xl md:text-3xl font-bold mb-10 font-inter ${textClassName ?? "block text-center"
                  }`}
              >
                Contact Us
              </h1>
            )}

            <form className="font-inter md:my-10 space-y-4" onSubmit={handleSubmit}>
              {/* form fields … unchanged */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-1/2">
                  <label htmlFor="firstName" className="text-lg font-light">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md p-3 mt-1 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.firstName ? "border-red-500 bg-red-50" : "border-gray-400"
                      }`}
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>

                <div className="w-full sm:w-1/2">
                  <label htmlFor="lastName" className="text-lg font-light">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md p-3 mt-1 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.lastName ? "border-red-500 bg-red-50" : "border-gray-400"
                      }`}
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="text-lg font-light">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@email.com"
                  className={`w-full border rounded-md p-3 mt-1 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.email ? "border-red-500 bg-red-50" : "border-gray-400"
                    }`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="text-lg font-light">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="08012345678"
                  className={`w-full border rounded-md p-3 mt-1 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.phone ? "border-red-500 bg-red-50" : "border-gray-400"
                    }`}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="message" className="text-lg font-light">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell us how we can help you..."
                  className={`w-full border rounded-md p-3 mt-1 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.message ? "border-red-500 bg-red-50" : "border-gray-400"
                    }`}
                />
                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-orange-500 text-white py-3 px-8 rounded-lg mt-2 hover:bg-orange-600 transition-colors disabled:bg-orange-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {isSubmitting ? "Sending..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* FAQ Section (unchanged) */}
        <div className="w-full flex flex-col items-center px-4 md:px-10 py-10">
          <h2 className="text-3xl md:text-4xl font-inter mb-6 font-bold">FAQs</h2>
          <div className="w-full md:w-10/12">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-300 rounded-lg p-4 mb-4 shadow-sm">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left font-medium flex justify-between items-center"
                >
                  <span>{faq.question}</span>
                  <span className="text-xl">{isActive.includes(index) ? "−" : "+"}</span>
                </button>
                {isActive.includes(index) && <div className="mt-2 text-gray-700">{faq.answer}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop footer (unchanged) */}
      <div className="w-full hidden md:block">
        <Footer />
      </div>
    </div>
  );
};

export default ContactUs;
