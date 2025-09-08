"use client";

import { motion, useMotionValue, animate, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import RecipeCard from "./RecipeCard"; // adjust if your export name differs

type Recipe = {
  id: string | number;
  name: string;
  // include any fields RecipeCard needs
};

interface Props {
  recipe: Recipe;
  onDelete: (id: string) => Promise<void> | void;
}

/**
 * Swipe stages:
 * - First left swipe past ARM_THRESHOLD => reveal delete
 * - Second left swipe past DELETE_THRESHOLD => call onDelete immediately
 */
const ARM_THRESHOLD = -60;
const ARM_OFFSET = -80;
const DELETE_THRESHOLD = -160;

export default function SwipeToDeleteCard({ recipe, onDelete }: Props) {
  const x = useMotionValue(0);
  const [armed, setArmed] = useState(false);
  const [removing, setRemoving] = useState(false);
  const fired = useRef(false);

  const bgScale = useTransform(x, [-160, -80, 0], [1, 0.95, 0.9]);

  useEffect(() => {
    animate(x, armed ? ARM_OFFSET : 0, { type: "spring", stiffness: 420, damping: 34 });
  }, [armed, x]);

  const handleDragEnd = async (_: any, info: { offset: { x: number } }) => {
    if (removing) return;
    const offsetX = info.offset.x;

    if (!armed) {
      if (offsetX <= ARM_THRESHOLD) setArmed(true);
      else animate(x, 0, { type: "spring", stiffness: 420, damping: 34 });
      return;
    }

    if (offsetX <= DELETE_THRESHOLD && !fired.current) {
      fired.current = true;
      setRemoving(true);
      try {
        await onDelete(String(recipe.id));
      } finally {
        // quick slide-out
        animate(x, -500, { duration: 0.22 });
      }
    } else {
      animate(x, ARM_OFFSET, { type: "spring", stiffness: 420, damping: 34 });
    }
  };

  const handleTapDelete = async () => {
    if (removing) return;
    setRemoving(true);
    try {
      await onDelete(String(recipe.id));
    } finally {
      animate(x, 500, { duration: 0.18 });
    }
  };

  return (
    <div className="relative w-full max-w-[360px]">
      {/* Background layer with delete button */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-end pr-4"
        style={{ scale: bgScale }}
        aria-hidden
      >
        <button
          onClick={handleTapDelete}
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-red-600 text-white font-medium hover:bg-red-700 active:scale-95 transition"
        >
          {/* tiny inline trash icon (no extra dep) */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M3 6h18M9 6v-2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-1 0v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V6h8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Remove
        </button>
      </motion.div>

      {/* Foreground draggable card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -320, right: 0 }}
        dragElastic={0.05}
        style={{ x }}
        onDragEnd={handleDragEnd}
        className="relative z-10 touch-pan-y"
      >
        <RecipeCard recipe={recipe} />
      </motion.div>

      {armed && !removing && (
        <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-red-600">
          Swipe left again to delete permanently
        </div>
      )}
    </div>
  );
}
