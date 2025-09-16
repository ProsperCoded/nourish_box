"use client";

import React, { useState } from "react";

export type ReviewItem = {
  id: number;
  name: string;
  rating: number;
  comment: string;
};

// Dummy reviews without user pictures
const dummyReviews: ReviewItem[] = [
  { id: 1, name: "Rere", rating: 5, comment: "Fantastic service! Everything was smooth and easy." },
  { id: 2, name: "Adeola Daphson", rating: 4, comment: "Great experience overall, great portion sizes too." },
  { id: 3, name: "Sarah Ademola", rating: 5, comment: "Absolutely loved it. Will definitely recommend to friends!" },
  { id: 4, name: "David Willams", rating: 4, comment: "It was okay, i enjoyed the jerk Chicken." },
  { id: 5, name: "Temilola Adewale", rating: 4, comment: "Very good quality for the price. Would buy again." },
];

const StarDisplay: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex gap-1 text-yellow-500">
    {Array.from({ length: 5 }, (_, i) => (
      <span key={i}>{i < rating ? "★" : "☆"}</span>
    ))}
  </div>
);

export default function DummyReviews() {
  // Desktop carousel state
  const [scrollIndex, setScrollIndex] = useState(0);
  const visibleCount = 2; // how many reviews to show at once on desktop

  function scrollLeft() {
    setScrollIndex((prev) => Math.max(prev - 1, 0));
  }

  function scrollRight() {
    setScrollIndex((prev) => Math.min(prev + 1, dummyReviews.length - visibleCount));
  }

  return (
    <div className="mx-auto max-w-3xl p-6 font-inter">
      <h2 className="mb-4 text-center text-xl font-semibold">Customer Reviews</h2>

      {/* Mobile & Tablet: Vertical list (shown < lg) */}
      <div className="block lg:hidden space-y-4">
        {dummyReviews.map((review) => (
          <div key={review.id} className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">{review.name}</p>
              <StarDisplay rating={review.rating} />
            </div>
            <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
          </div>
        ))}
      </div>

      {/* Desktop: Horizontal carousel (shown >= lg) */}
      <div className="relative mt-2 hidden items-center lg:flex">
        {/* Left Arrow */}
        <button
          type="button"
          onClick={scrollLeft}
          disabled={scrollIndex === 0}
          className="absolute left-0 z-10 h-10 w-10 rounded-full bg-gray-200 text-xl disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Scroll left"
        >
          ‹
        </button>

        {/* Reviews Container */}
        <div className="mx-12 flex overflow-hidden">
          <div
            className="flex transition-transform duration-300"
            style={{
              transform: `translateX(-${scrollIndex * (100 / visibleCount)}%)`,
              width: `${(dummyReviews.length / visibleCount) * 100}%`,
            }}
          >
            {dummyReviews.map((review) => (
              <div key={review.id} className="w-1/2 flex-shrink-0 px-3">
                <div className="h-full rounded-xl w-full border border-gray-200 p-4">
                  <div className="flex w-full items-center justify-between">
                    <p className="font-medium">{review.name}</p>
                    <StarDisplay rating={review.rating} />
                  </div>
                  <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Arrow */}
        <button
          type="button"
          onClick={scrollRight}
          disabled={scrollIndex >= dummyReviews.length - visibleCount}
          className="absolute right-0 z-10 h-10 w-10 rounded-full bg-gray-200 text-xl disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Scroll right"
        >
          ›
        </button>
      </div>
    </div>
  );
}
