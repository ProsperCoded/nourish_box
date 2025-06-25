"use client";

import React, { useEffect } from "react";
import { X, CreditCard, Shield, Lock } from "lucide-react";

interface PaystackModalProps {
  isOpen: boolean;
  onClose: (forcedClose?: boolean) => void;
  email: string;
  amount: number;
  reference: string;
  onSuccess: (response: any) => void;
  onError?: (error: any) => void;
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: any) => {
        openIframe: () => void;
      };
    };
  }
}

const PaystackModal: React.FC<PaystackModalProps> = ({
  isOpen,
  onClose,
  email,
  amount,
  reference,
  onSuccess,
  onError,
}) => {
  useEffect(() => {
    // Load Paystack script if not already loaded
    if (!window.PaystackPop) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    let publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    console.log("publicKey:", publicKey);
    if (isOpen && window.PaystackPop && reference) {
      const handler = window.PaystackPop.setup({
        publicKey: publicKey,
        key: publicKey,
        email: email,
        amount: amount * 100, // Convert to kobo
        ref: reference, // Use the reference from backend initialization
        onClose: () => {
          console.log("Payment cancelled");
          onClose(true);
        },
        callback: (response: any) => {
          console.log("Payment successful:", response);
          onSuccess(response);
          onClose(false);
        },
        onError: (error: any) => {
          console.error("Payment error:", error);
          if (onError) onError(error);
          onClose(true);
        },
      });

      // Open the payment iframe
      handler.openIframe();
    }
  }, [isOpen, reference, email, amount, onSuccess, onClose, onError]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Secure Payment
                </h3>
                <p className="text-sm text-gray-500">Powered by Paystack</p>
              </div>
            </div>
            <button
              onClick={() => onClose(true)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                NGN {amount.toLocaleString()}
              </div>
              <p className="text-gray-600">Complete your payment to continue</p>
            </div>

            {/* Security badges */}
            <div className="flex items-center justify-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="w-4 h-4 text-green-600" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Lock className="w-4 h-4 text-green-600" />
                <span>256-bit Encryption</span>
              </div>
            </div>

            {/* Loading state */}
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 text-orange-600">
                <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium">
                  Initializing secure payment...
                </span>
              </div>
            </div>

            {/* Payment info */}
            <div className="mt-6 p-4 bg-orange-50 rounded-lg">
              <p className="text-xs text-orange-800 text-center leading-relaxed">
                You will be redirected to Paystack's secure payment page. Your
                payment information is encrypted and secure.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Transaction: {reference}</span>
              <div className="flex items-center space-x-1">
                <span>Powered by</span>
                <span className="font-semibold text-blue-600">Paystack</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaystackModal;
