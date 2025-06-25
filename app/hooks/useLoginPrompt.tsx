"use client";

import { useState, useCallback } from "react";

const PROMPT_COUNTER_KEY = "login_prompt_counter";
const INITIAL_PROMPT_COUNT = 3; // Number of times to show prompt before giving up

export const useLoginPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  const getPromptCounter = useCallback((): number => {
    if (typeof window === "undefined") return INITIAL_PROMPT_COUNT;
    const stored = localStorage.getItem(PROMPT_COUNTER_KEY);
    // Return stored value, or initial if null/undefined
    return stored != null ? parseInt(stored, 10) : INITIAL_PROMPT_COUNT;
  }, []);

  const setPromptCounter = useCallback((count: number) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(PROMPT_COUNTER_KEY, count.toString());
  }, []);

  const decrementPromptCounter = useCallback(() => {
    const currentCount = getPromptCounter();
    if (currentCount > 0) {
      const newCount = currentCount - 1;
      setPromptCounter(newCount);
      return newCount; // Return new value for immediate use
    }
    return currentCount; // Return current value if already 0
  }, [getPromptCounter, setPromptCounter]);

  const handleNeverMind = useCallback(() => {
    // Reset counter to initial value when user clicks "Never mind"
    setPromptCounter(INITIAL_PROMPT_COUNT);
    setShowPrompt(false);
  }, [setPromptCounter]);

  const triggerPrompt = useCallback(() => {
    setShowPrompt(true);
  }, []);

  const hidePrompt = useCallback(() => {
    setShowPrompt(false);
  }, []);

  return {
    showPrompt,
    triggerPrompt,
    hidePrompt,
    handleNeverMind,
    decrementPromptCounter,
    getPromptCounter,
  };
};
