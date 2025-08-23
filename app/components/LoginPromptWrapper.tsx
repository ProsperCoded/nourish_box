import { Modal } from "@mui/material";
import React from "react";
import { useLoginPrompt } from "../hooks/useLoginPrompt";
import LoginPrompt from "./auth/loginPrompt";

interface LoginPromptWrapperProps {
  mainText?: string;
  children: React.ReactNode;
  triggerOnClick?: boolean; // Whether to show prompt when children are clicked
}

export const LoginPromptWrapper: React.FC<LoginPromptWrapperProps> = ({
  mainText = "to save your favorites and manage your cart easily!",
  children,
  triggerOnClick = false,
}) => {
  const { showPrompt, triggerPrompt, handleNeverMind, hidePrompt } =
    useLoginPrompt();

  const handleChildClick = (e: React.MouseEvent) => {
    if (triggerOnClick) {
      e.preventDefault();
      e.stopPropagation();
      triggerPrompt();
    }
  };

  return (
    <>
      <div onClick={handleChildClick}>{children}</div>

      <Modal
        open={showPrompt}
        onClose={hidePrompt}
        aria-labelledby="login-prompt-modal"
        aria-describedby="login-prompt-description"
      >
        <LoginPrompt
          main_text={mainText}
          onNeverMind={handleNeverMind}
          onClose={hidePrompt}
        />
      </Modal>
    </>
  );
};

// Hook to manually trigger login prompt - now a direct alias
export const useManualLoginPrompt = useLoginPrompt;
