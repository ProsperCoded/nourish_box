"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { Delivery } from "../utils/types/delivery.type";
import { CartItem } from "../utils/types/cart.tyes";
import Image from "next/image";
import { CircularProgress } from "@mui/material";
import PaystackModal from "../components/PaystackModal";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag, Clock, Users } from "lucide-react";
import {
  validateDeliveryInfo,
  calculateTotalWithDelivery,
  generatePaymentReference,
} from "../utils/checkout.utils";
import { fetchStates, fetchLGAs } from "../utils/client-api/locationApi";
import toast from "react-hot-toast";

const CheckoutPage = () => {
  const { cart, getTotalPrice, clearCart, loading: cartLoading } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [deliveryInfo, setDeliveryInfo] = useState<Partial<Delivery>>({
    deliveryName: "",
    deliveryEmail: "",
    deliveryPhone: "",
    deliveryAddress: "",
    deliveryCity: "",
    deliveryState: "",
    deliveryLGA: "",
    deliveryNote: "",
  });

  const [states, setStates] = useState<string[]>([]);
  const [lgas, setLgas] = useState<string[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [paymentReference, setPaymentReference] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);

  // Prefill form with user data if logged in
  useEffect(() => {
    if (user) {
      setDeliveryInfo({
        deliveryName: `${user.firstName} ${user.lastName}`,
        deliveryEmail: user.email,
        deliveryPhone: user.phone || "",
        deliveryAddress: user.address || "",
        deliveryCity: user.city || "",
        deliveryState: user.state || "",
        deliveryLGA: user.lga || "",
        deliveryNote: "",
      });
    }
  }, [user]);

  // Load states on component mount
  useEffect(() => {
    const loadStates = async () => {
      try {
        setLoadingLocations(true);
        const statesData = await fetchStates();
        setStates(statesData);
      } catch (error) {
        console.error("Error loading states:", error);
        setFormErrors((prev) => ({
          ...prev,
          deliveryState: "Failed to load states",
        }));
      } finally {
        setLoadingLocations(false);
      }
    };

    loadStates();
  }, []);

  // Load LGAs when state changes
  useEffect(() => {
    const loadLGAs = async () => {
      if (deliveryInfo.deliveryState) {
        try {
          setLoadingLocations(true);
          const lgasData = await fetchLGAs(deliveryInfo.deliveryState);
          setLgas(lgasData);
          // Reset LGA if the state changed
          if (user?.state !== deliveryInfo.deliveryState) {
            setDeliveryInfo((prev) => ({ ...prev, deliveryLGA: "" }));
          }
        } catch (error) {
          console.error("Error loading LGAs:", error);
          setFormErrors((prev) => ({
            ...prev,
            deliveryLGA: "Failed to load LGAs",
          }));
        } finally {
          setLoadingLocations(false);
        }
      } else {
        setLgas([]);
      }
    };

    loadLGAs();
  }, [deliveryInfo.deliveryState, user?.state]);

  const cartItems = cart?.items || [];
  const totalPrice = getTotalPrice();
  const deliveryFee = 1500; // Fixed delivery fee
  const finalTotal = calculateTotalWithDelivery(totalPrice, deliveryFee);

  const handleInputChange = (field: keyof Delivery, value: string) => {
    setDeliveryInfo((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Memoized validation to prevent infinite re-renders
  const isFormValid = useMemo(() => {
    const { isValid } = validateDeliveryInfo(deliveryInfo);
    return isValid && agreedToTerms;
  }, [deliveryInfo, agreedToTerms]);

  const validateForm = (): boolean => {
    const { isValid, errors } = validateDeliveryInfo(deliveryInfo);

    if (!agreedToTerms) {
      errors.terms = "You must agree to the terms and conditions";
    }

    setFormErrors(errors);
    return isValid && agreedToTerms;
  };

  // Initialize transaction with backend
  const initializeTransaction = async () => {
    try {
      setPaymentLoading(true);

      const payload = {
        amount: finalTotal,
        recipes: cartItems.map((item) => item.recipeId),
        ...(user ? { userId: user.id } : { email: deliveryInfo.deliveryEmail }),
        delivery: {
          name: deliveryInfo.deliveryName,
          email: deliveryInfo.deliveryEmail,
          phone: deliveryInfo.deliveryPhone,
          address: deliveryInfo.deliveryAddress,
          city: deliveryInfo.deliveryCity,
          state: deliveryInfo.deliveryState,
          note: deliveryInfo.deliveryNote || "",
        },
      };

      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        status: boolean;
        message: string;
        data: {
          authorization_url: string;
          access_code: string;
          reference: string;
          transactionId: string;
          deliveryId: string;
        };
      };

      if (response.ok) {
        setPaymentReference(data.data.reference);
        setTransactionId(data.data.transactionId);
        // Show payment modal after successful initialization
        setShowPaymentModal(true);
        return data.data;
      } else {
        setPaymentReference("");
        setTransactionId("");
        throw new Error(data.message || "Failed to initialize transaction");
      }
    } catch (error) {
      console.error("Transaction initialization error:", error);
      setPaymentReference("");
      setTransactionId("");
      alert("Failed to initialize payment. Please try again.");
      throw error;
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePaymentSuccess = async (response: any) => {
    console.log("Payment successful:", response);
    setPaymentLoading(true);
    setShowPaymentModal(false);

    try {
      // Verify payment on backend using the reference and transactionId
      const verifyRes = await fetch(
        `/api/paystack/verify?reference=${response.reference}&transactionId=${transactionId}`
      );
      const verifyData = await verifyRes.json();

      if (verifyRes.ok) {
        toast.success("Payment successful! Your order has been placed.", {
          duration: 5000,
          position: "top-center",
          style: {
            background: "#10B981",
            color: "#fff",
            padding: "16px",
            borderRadius: "8px",
          },
        });
        await clearCart();
        router.push("/profile?section=orders"); // Updated redirect path
      } else {
        toast.error(
          `Payment verification failed: ${
            verifyData.message || "Unknown error"
          }`,
          {
            duration: 5000,
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
      console.error("Payment verification error:", error);
      toast.error("Payment verification failed. Please contact support.", {
        duration: 5000,
        position: "top-center",
        style: {
          background: "#EF4444",
          color: "#fff",
          padding: "16px",
          borderRadius: "8px",
        },
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePaymentClose = (forcedClose: boolean = false) => {
    console.log("Payment dialog closed");
    setShowPaymentModal(false);
    setPaymentLoading(false);
    // Reset payment reference so user can try again
    setPaymentReference("");
    setTransactionId("");
    if (!forcedClose) {
      toast.error("Payment was cancelled. Please try again.", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#EF4444",
          color: "#fff",
          padding: "16px",
          borderRadius: "8px",
        },
      });
    }
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Initialize transaction before showing payment modal
      await initializeTransaction();
    } catch (error) {
      // Error already handled in initializeTransaction
      return;
    }
  };

  if (cartLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CircularProgress size={40} />
      </div>
    );
  }

  if (!cart || cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <ShoppingBag size={64} className="text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          Your cart is empty
        </h2>
        <p className="text-gray-500 mb-6">
          Add some delicious recipes to get started
        </p>
        <button
          onClick={() => router.push("/recipes")}
          className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
        >
          Browse Recipes
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">
            Complete your order and get your recipes delivered
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Delivery Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Delivery Information
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={deliveryInfo.deliveryName || ""}
                    onChange={(e) =>
                      handleInputChange("deliveryName", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      formErrors.deliveryName
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter your full name"
                  />
                  {formErrors.deliveryName && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.deliveryName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={deliveryInfo.deliveryEmail || ""}
                    onChange={(e) =>
                      handleInputChange("deliveryEmail", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      formErrors.deliveryEmail
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter your email"
                  />
                  {formErrors.deliveryEmail && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.deliveryEmail}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={deliveryInfo.deliveryPhone || ""}
                  onChange={(e) =>
                    handleInputChange("deliveryPhone", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    formErrors.deliveryPhone
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter your phone number"
                />
                {formErrors.deliveryPhone && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.deliveryPhone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Address *
                </label>
                <textarea
                  value={deliveryInfo.deliveryAddress || ""}
                  onChange={(e) =>
                    handleInputChange("deliveryAddress", e.target.value)
                  }
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    formErrors.deliveryAddress
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter your full delivery address"
                />
                {formErrors.deliveryAddress && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.deliveryAddress}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={deliveryInfo.deliveryCity || ""}
                    onChange={(e) =>
                      handleInputChange("deliveryCity", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      formErrors.deliveryCity
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter your city"
                  />
                  {formErrors.deliveryCity && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.deliveryCity}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    value={deliveryInfo.deliveryState || ""}
                    onChange={(e) =>
                      handleInputChange("deliveryState", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      formErrors.deliveryState
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    disabled={loadingLocations}
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  {formErrors.deliveryState && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.deliveryState}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LGA *
                  </label>
                  <select
                    value={deliveryInfo.deliveryLGA || ""}
                    onChange={(e) =>
                      handleInputChange("deliveryLGA", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      formErrors.deliveryLGA
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    disabled={!deliveryInfo.deliveryState || loadingLocations}
                  >
                    <option value="">Select LGA</option>
                    {lgas.map((lga) => (
                      <option key={lga} value={lga}>
                        {lga}
                      </option>
                    ))}
                  </select>
                  {formErrors.deliveryLGA && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.deliveryLGA}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Note (Optional)
                </label>
                <textarea
                  value={deliveryInfo.deliveryNote || ""}
                  onChange={(e) =>
                    handleInputChange("deliveryNote", e.target.value)
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Any special instructions for delivery"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6">
              {cartItems.map((item: CartItem) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                    {item.displayMedia.type === "video" ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={item.displayMedia.url}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <div className="w-4 h-4 rounded-full bg-white/30 flex items-center justify-center">
                            <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent ml-0.5" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Image
                        src={item.displayMedia.url}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    )}
                  </div>

                  <div className="flex-grow">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                    {item.recipe && (
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Clock size={12} className="mr-1" />
                        <span>{Math.floor(item.recipe.duration / 60)} min</span>
                        {item.recipe.servings && (
                          <>
                            <Users size={12} className="ml-2 mr-1" />
                            <span>{item.recipe.servings} servings</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      NGN {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>NGN {totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>NGN {deliveryFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-gray-900 border-t pt-2">
                <span>Total</span>
                <span>NGN {finalTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Terms and Agreement */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-orange-600 hover:text-orange-700 underline"
                  >
                    Terms and Conditions
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-orange-600 hover:text-orange-700 underline"
                  >
                    Privacy Policy
                  </a>
                  . I understand that recipes will be delivered within 24-48
                  hours and all sales are final.
                </label>
              </div>
              {formErrors.terms && (
                <p className="text-red-500 text-sm mt-2">{formErrors.terms}</p>
              )}
            </div>

            {/* Payment Button */}
            <div className="mt-6">
              <button
                onClick={handlePayment}
                disabled={paymentLoading || !isFormValid}
                className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {paymentLoading ? (
                  <div className="flex items-center justify-center">
                    <CircularProgress
                      size={20}
                      color="inherit"
                      className="mr-2"
                    />
                    {paymentReference ? "Processing..." : "Initializing..."}
                  </div>
                ) : (
                  `Pay NGN ${finalTotal.toLocaleString()}`
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Custom Paystack Modal */}
        <PaystackModal
          isOpen={showPaymentModal}
          onClose={handlePaymentClose}
          email={deliveryInfo.deliveryEmail || "guest@nourish.com"}
          amount={finalTotal}
          reference={paymentReference}
          onSuccess={handlePaymentSuccess}
        />
      </div>
    </div>
  );
};

export default CheckoutPage;
