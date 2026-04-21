import { useState } from "react";
import { Star, X } from "lucide-react";
import { VoxCard } from "./VoxCard";
import { VoxButton } from "./VoxButton";
import { VoxTextarea } from "./VoxInput";

interface FeedbackModalProps {
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}

export function FeedbackModal({ onClose, onSubmit }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit(rating, comment);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
      <VoxCard className="relative w-full max-w-sm overflow-hidden p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-900">Rate your experience</h2>
          <p className="mt-1.5 text-sm text-slate-500">
            How satisfied were you with the resolution of this Vox?
          </p>

          <div className="my-6 flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    star <= (hoverRating || rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-200"
                  }`}
                />
              </button>
            ))}
          </div>

          <VoxTextarea
            placeholder="Tell us what went well or what could be improved... (Optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mb-6 h-24 resize-none"
          />

          <VoxButton
            className="w-full"
            disabled={rating === 0}
            onClick={handleSubmit}
          >
            Submit Feedback
          </VoxButton>
        </div>
      </VoxCard>
    </div>
  );
}
