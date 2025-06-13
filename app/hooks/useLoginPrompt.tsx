"use client";

import { useState, useCallback } from "react";

const PROMPT_COUNTER_KEY = "login_prompt_counter";
const INITIAL_PROMPT_COUNT = 3; // Number of times to show prompt before giving up

export const useLoginPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  const getPromptCounter = useCallback((): number => {
    if (typeof window === "undefined") return INITIAL_PROMPT_COUNT;
    const stored = localStorage.getItem(PROMPT_COUNTER_KEY);
    return stored ? parseInt(stored, 10) : INITIAL_PROMPT_COUNT;
  }, []);

  const setPromptCounter = useCallback((count: number) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(PROMPT_COUNTER_KEY, count.toString());
  }, []);

  const shouldShowPrompt = useCallback((): boolean => {
    return getPromptCounter() > 0;
  }, [getPromptCounter]);

  const handleShowPrompt = useCallback(() => {
    if (shouldShowPrompt()) {
      setShowPrompt(true);
    }
  }, [shouldShowPrompt]);

  const handleNeverMind = useCallback(() => {
    // Stop showing prompts when user clicks "Never mind"
    setPromptCounter(0);
    setShowPrompt(false);
  }, [setPromptCounter]);

  const handleAddToBag = useCallback(() => {
    // Decrease counter when user successfully adds to bag
    const currentCount = getPromptCounter();
    if (currentCount > 0) {
      setPromptCounter(currentCount - 1);
    }
    setShowPrompt(false);
  }, [getPromptCounter, setPromptCounter]);

  const hidePrompt = useCallback(() => {
    setShowPrompt(false);
  }, []);

  return {
    showPrompt,
    handleShowPrompt,
    handleNeverMind,
    handleAddToBag,
    hidePrompt,
    shouldShowPrompt: shouldShowPrompt(),
    remainingPrompts: getPromptCounter(),
  };
};
