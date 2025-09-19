"use client";

import React, { useEffect, useMemo, useState } from "react";

export type ReviewData = {
  rating: number;
  comment: string;
  images: File[];
};

type Props = {
  onSubmit?: (data: ReviewData) => void | Promise<void>;
  className?: string;
  title?: string;
  /**
   * If true, comment becomes optional (only rating required)
   */
  commentOptional?: boolean;
};

const Star: React.FC<{
  value: number;
  active: boolean;
  onClick: (value: number) => void;
  onMouseEnter?: (value: number) => void;
  onMouseLeave?: () => void;
  label?: string;
}> = ({ value, active, onClick, onMouseEnter, onMouseLeave, label }) => {
  return (
    <button
      type="button"
      aria-label={label ?? `${value} star`}
      aria-pressed={active}
      onClick={() => onClick(value)}
      onMouseEnter={() => onMouseEnter?.(value)}
      onMouseLeave={onMouseLeave}
      className={`text-3xl leading-none transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 rounded ${active ? "text-yellow-500" : "text-gray-300"
        }`}
    >
      ★
    </button>
  );
};

export default function ReviewSection({
  onSubmit,
  className,
  title = "Leave a Review",
  commentOptional = false,
}: Props) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const displayRating = hoverRating || rating;

  const previews = useMemo(() =>
    files.map((f) => ({ file: f, url: URL.createObjectURL(f) })), [files]
  );

  useEffect(() => {
    return () => {
      // revoke object URLs on unmount
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
    // only when unmounting; previews is fine as dep here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFiles(inputFiles: FileList | null) {
    if (!inputFiles) return;
    const list = Array.from(inputFiles).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...list]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);

    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }

    if (!commentOptional && comment.trim().length === 0) {
      setError("Please add a comment.");
      return;
    }

    const payload: ReviewData = { rating, comment: comment.trim(), images: files };

    try {
      setSubmitting(true);
      await onSubmit?.(payload);
      setOk("Thanks for your review!");
      // Optional: reset form
      setRating(0);
      setHoverRating(0);
      setComment("");
      setFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`mx-auto max-w-md rounded-2xl font-inter p-6 shadow ${className ?? ""}`}
    >
      <h2 className="mb-3 text-center text-xl font-semibold">{title}</h2>

      {/* Stars */}
      <div className="mb-4 flex items-center justify-center gap-2" role="radiogroup" aria-label="Star rating">
        {Array.from({ length: 5 }, (_, i) => i + 1).map((v) => (
          <Star
            key={v}
            value={v}
            active={v <= displayRating}
            onClick={(val) => setRating(val)}
            onMouseEnter={(val) => setHoverRating(val)}
            onMouseLeave={() => setHoverRating(0)}
            label={`${v} ${v === 1 ? "star" : "stars"}`}
          />
        ))}
      </div>

      {/* Comment */}
      <label className="mb-1 block text-sm font-medium" htmlFor="comment">
        Comment {commentOptional ? <span className="text-gray-400">(optional)</span> : null}
      </label>
      <textarea
        id="comment"
        className="h-28 w-full resize-none rounded-md border border-gray-300 p-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
        placeholder="Write your comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      {/* Image Upload */}
      <div className="mt-4">
        <label className="mb-1 block text-sm font-medium" htmlFor="images">Add photos</label>
        <input
          id="images"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.currentTarget.files)}
          className="block w-full cursor-pointer rounded-md border border-gray-300 p-2 text-sm"
        />
        {files.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3">
            {previews.map((p, idx) => (
              <div key={idx} className="relative">
                <img
                  src={p.url}
                  alt={p.file.name}
                  className="h-20 w-20 rounded-md border object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-black/70 text-center text-xs text-white"
                  aria-label={`Remove ${p.file.name}`}
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-600" role="alert">{error}</p>}
      {ok && <p className="mt-3 text-sm text-green-600" role="status">{ok}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 w-full rounded-md bg-emerald-600 px-4 py-3 text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}

/**
 * Usage example (App Router):
 *
 * // app/reviews/page.tsx
 * import ReviewSection from "@/components/ReviewSection";
 *
 * export default function Page() {
 *   async function handleSubmit(data: ReviewData) {
 *     // TODO: send to your API route or server action
 *     // const res = await fetch("/api/reviews", { method: "POST", body: await toFormData(data) });
 *     console.log(data);
 *   }
 *   return <div className="p-6"><ReviewSection onSubmit={handleSubmit} /></div>;
 * }
 *
 * // Optional helper to convert to FormData for uploads
 * export async function toFormData(data: ReviewData) {
 *   const fd = new FormData();
 *   fd.append("rating", String(data.rating));
 *   fd.append("comment", data.comment);
 *   data.images.forEach((file, i) => fd.append("images", file, file.name ?? `image-${i}.jpg`));
 *   return fd;
 * }
 */
