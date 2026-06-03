"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ReviewForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (rating < 1) {
      setError("Tap a star to rate.");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/orders/${orderId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Couldn't save your rating.");
      setBusy(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(n)}
            onClick={() => setRating(n)}
            className="p-0.5"
          >
            <Star
              className={cn(
                "h-7 w-7 transition-colors",
                (hover || rating) >= n ? "fill-accent text-accent" : "text-border",
              )}
            />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Anything to add? (optional)"
        rows={2}
        maxLength={280}
        className="flex w-full rounded-md border border-input bg-card px-3.5 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      />
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      <Button onClick={submit} disabled={busy}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Submit rating
      </Button>
    </div>
  );
}
