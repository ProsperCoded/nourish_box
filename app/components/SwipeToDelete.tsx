"use client";

import { motion, useMotionValue, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import RecipeCard from "./RecipeCard";

type Recipe = {
  id: string | number;
  name: string;
};

interface Props {
  recipe: Recipe;
  onDelete: (id: string) => Promise<void> | void;
}

/**
 * Behavior (no background UI):
 * - First left swipe past ARM_THRESHOLD: "armed" state and rests slightly left (visual cue).
 * - Second left swipe past DELETE_THRESHOLD: deletes immediately.
 */
const ARM_THRESHOLD = -60;
const ARM_OFFSET = -80;
const DELETE_THRESHOLD = -160;

export default function SwipeToDeleteCard({ recipe, onDelete }: Props) {
  const x = useMotionValue(0);
  const [armed, setArmed] = useState(false);
  const [removing, setRemoving] = useState(false);
  const fired = useRef(false);

  useEffect(() => {
    animate(x, armed ? ARM_OFFSET : 0, { type: "spring", stiffness: 420, damping: 34 });
  }, [armed, x]);

  const handleDragEnd = async (_: any, info: { offset: { x: number } }) => {
    if (removing) return;
    const offsetX = info.offset.x;

    if (!armed) {
      // First swipe: arm and keep the card slightly left as a subtle cue
      if (offsetX <= ARM_THRESHOLD) setArmed(true);
      else animate(x, 0, { type: "spring", stiffness: 420, damping: 34 });
      return;
    }

    // Second deeper swipe: delete
    if (offsetX <= DELETE_THRESHOLD && !fired.current) {
      fired.current = true;
      setRemoving(true);
      try {
        await onDelete(String(recipe.id));
      } finally {
        animate(x, -500, { duration: 0.22 });
      }
    } else {
      // Stay armed (slightly left)
      animate(x, ARM_OFFSET, { type: "spring", stiffness: 420, damping: 34 });
    }
  };

  return (
    <div className="relative w-full max-w-[360px]">
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
    </div>
  );
}
