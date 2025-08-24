"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import cancel_icon from "../assets/icons8-cancel-48.png";

/**
 * A11y-friendly login/signup gate.
 * - ESC to close
 * - Click outside to close
 * - Focus trap while open
 * - Locks page scroll while open
 *
 * Usage:
 * const [open, setOpen] = useState(false);
 * <LoginPrompt
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   onNeverMind={() => setOpen(false)}
 *   main_text="log in to view your favorites"
 * />
 */
export type LoginPromptProps = {
  /** Controls visibility; if omitted, defaults to true. */
  open?: boolean;
  /** Heading text */
  title?: string;
  /** Back-compat: short phrase that follows "Sign up or" */
  main_text?: string;
  /** Alternative to main_text – full message paragraph */
  message?: React.ReactNode;
  /** CTA destinations */
  signUpHref?: string;
  loginHref?: string;
  /** Events */
  onNeverMind?: () => void;
  onClose?: () => void;
  /** Behavior */
  dismissOnBackdrop?: boolean; // default true
  dismissOnEsc?: boolean; // default true
  /** Styling */
  className?: string;
};

const focusableSelector =
  'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';

const LoginPrompt: React.FC<LoginPromptProps> = ({
  open = true,
  title = "You need an account",
  main_text,
  message,
  signUpHref = "/sign_up",
  loginHref = "/login",
  onNeverMind,
  onClose,
  dismissOnBackdrop = true,
  dismissOnEsc = true,
  className,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Don’t render at all if closed
  if (!open) return null;

  // A11y: trap focus, optional ESC close, restore focus, lock scroll
  useEffect(() => {
    const root = dialogRef.current;
    if (!root) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Initial focus
    (closeBtnRef.current ??
      (root.querySelector(focusableSelector) as HTMLElement | null) ??
      undefined)?.focus?.();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissOnEsc) {
        onClose?.();
        return;
      }

      if (e.key === "Tab") {
        const nodes = Array.from(
          root.querySelectorAll<HTMLElement>(focusableSelector)
        ).filter((el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden"));
        if (!nodes.length) {
          e.preventDefault();
          return;
        }
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey) {
          if (active === first || !root.contains(active)) {
            e.preventDefault();
            last.focus();
          }
        } else if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // lock scroll

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [dismissOnEsc, onClose]);

  const titleId = "login-prompt-title";

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dismissOnBackdrop) return;
    if (e.target === e.currentTarget) onClose?.();
  };

  // Compose message text
  const body = message ?? (
    <p className="mt-3 text-gray-600">
      <span className="font-medium">Sign up</span>
      {" or "}
      <Link href={loginHref} className="font-medium text-gray-800 hover:underline">
        log in
      </Link>
      {" "}
      {main_text ? (
        <>
          to {main_text.replace(/^to\s+/i, "")}
        </>
      ) : (
        <>to continue.</>
      )}
    </p>
  );

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
        className={`w-full max-w-md sm:max-w-lg rounded-2xl bg-white shadow-xl border border-gray-200 ${className ?? ""}`}
      >
        <div className="flex items-center justify-end p-4">
          <button
            ref={closeBtnRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
            className="inline-flex items-center justify-center rounded-full p-2 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-gray-300"
            aria-label="Close"
          >
            <Image src={cancel_icon} alt="Close" width={18} height={18} />
          </button>
        </div>

        <div className="px-6 pb-6 text-center">
          <h1 id={titleId} className="text-2xl font-semibold tracking-tight text-gray-900">
            {title}
          </h1>

          {body}

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
