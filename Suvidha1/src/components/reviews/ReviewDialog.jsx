import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Modal, Button, Textarea, Alert } from "../ui";
import StarRating from "./StarRating";
import { reviewsApi } from "../../services/api";
import { errorMessage } from "../../services/http";

/**
 * Leaves a review for a completed booking.
 *
 * The server checks the booking belongs to the reviewer and is completed, and
 * refuses a second review for the same booking.
 */
export default function ReviewDialog({ open, booking, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [aspects, setAspects] = useState({ punctuality: 0, quality: 0, behaviour: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (event) => {
    event.preventDefault();

    if (!rating) {
      setError("Please choose a star rating.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const result = await reviewsApi.create({
        bookingId: booking._id || booking.id,
        rating,
        comment: comment.trim(),
        punctuality: aspects.punctuality || null,
        quality: aspects.quality || null,
        behaviour: aspects.behaviour || null,
      });

      setDone(true);
      onSubmitted?.(result.review);
    } catch (err) {
      setError(errorMessage(err, "Could not submit your review."));
    } finally {
      setSaving(false);
    }
  };

  const close = () => {
    setRating(0);
    setComment("");
    setAspects({ punctuality: 0, quality: 0, behaviour: 0 });
    setError("");
    setDone(false);
    onClose?.();
  };

  if (done) {
    return (
      <Modal open={open} onClose={close} size="sm" title="Thanks for the feedback">
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 size={26} className="text-emerald-600" aria-hidden="true" />
          </span>
          <p className="text-sm text-slate-600">
            Your review is live on {booking?.workerName}'s profile and counts towards their rating.
          </p>
          <Button fullWidth onClick={close}>
            Close
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Rate your experience"
      description={booking ? `${booking.service} with ${booking.workerName}` : undefined}
    >
      <form onSubmit={submit} className="space-y-5">
        {error && <Alert tone="error">{error}</Alert>}

        <StarRating value={rating} onChange={setRating} label="Overall rating" required />

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["punctuality", "Punctuality"],
            ["quality", "Work quality"],
            ["behaviour", "Behaviour"],
          ].map(([key, label]) => (
            <StarRating
              key={key}
              size={18}
              label={label}
              value={aspects[key]}
              onChange={(v) => setAspects((a) => ({ ...a, [key]: v }))}
            />
          ))}
        </div>

        <Textarea
          label="Anything else?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What went well, what could be better…"
          rows={3}
          maxLength={1000}
          hint={`${comment.length}/1000`}
        />

        <Button type="submit" fullWidth loading={saving}>
          Submit review
        </Button>
      </form>
    </Modal>
  );
}
