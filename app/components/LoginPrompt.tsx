import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import cancel_icon from "../assets/icons8-cancel-48.png";

export interface LoginPromptProps {
  /** Short phrase that follows "Sign up", e.g. "to save your favourites" */
  main_text: string;
  onNeverMind?: () => void;
  onClose?: () => void;
  /** Override the destination for the primary CTA */
  signUpHref?: string;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({
  main_text,
  onNeverMind,
  onClose,
  signUpHref = "/sign_up",
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on ESC for better UX & accessibility
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Close when clicking the backdrop (outside the card)
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && onClose) onClose();
  };

  const titleId = "login-prompt-title";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md sm:max-w-lg rounded-2xl bg-white shadow-xl border border-gray-200"
      >
        <div className="flex items-center justify-between p-4">
          <div className="h-6" />
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full p-2 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-gray-300"
            aria-label="Close"
          >
            <Image src={cancel_icon} alt="Close" width={18} height={18} />
          </button>
        </div>

        <div className="px-6 pb-6 text-center">
          <h1
            id={titleId}
            className="text-2xl font-semibold tracking-tight text-gray-900"
          >
            You need an account
          </h1>

          <p className="mt-3 text-gray-600">
            <span className="font-medium">Sign up</span> {main_text}.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onNeverMind}
              className="w-36 rounded-lg bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus-visible:ring focus-visible:ring-gray-300"
            >
              Never mind
            </button>

            <Link
              href={signUpHref}
              className="w-36 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 focus:outline-none focus-visible:ring focus-visible:ring-orange-300 text-center"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPrompt;
