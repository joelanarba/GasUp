"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, X, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ApplicationActions({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [notes, setNotes] = useState("");
  const [approved, setApproved] = useState<{ email: string; tempPassword: string } | null>(null);

  async function review(action: "approve" | "reject") {
    setBusy(action);
    setError(null);
    const res = await fetch(`/api/admin/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, notes: action === "reject" ? notes : undefined }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Couldn't process this application.");
      setBusy(null);
      return;
    }
    if (action === "approve" && data.tempPassword) {
      setApproved({ email: data.email, tempPassword: data.tempPassword });
      setBusy(null);
      return; // keep the temp password on screen until the admin dismisses it
    }
    router.refresh();
  }

  if (approved) {
    return (
      <div className="rounded-lg border border-success/30 bg-success/[0.05] p-3 text-sm">
        <p className="flex items-center gap-1.5 font-medium text-success">
          <KeyRound className="h-4 w-4" /> Approved — share these credentials
        </p>
        <p className="mt-2 text-muted-foreground">
          <span className="font-medium text-foreground">{approved.email}</span>
          <br />
          Temp password: <code className="rounded bg-muted px-1.5 py-0.5 font-mono">{approved.tempPassword}</code>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          We also emailed these (delivery depends on the email sandbox).
        </p>
        <Button size="sm" className="mt-3" onClick={() => router.refresh()}>
          Done
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rejecting ? (
        <div className="space-y-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            maxLength={500}
            placeholder="Reason (optional — emailed to the applicant)"
            className="flex w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          />
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" onClick={() => review("reject")} disabled={busy !== null}>
              {busy === "reject" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
              Confirm reject
            </Button>
            <Button size="sm" variant="outline" onClick={() => setRejecting(false)} disabled={busy !== null}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => review("approve")} disabled={busy !== null}>
            {busy === "approve" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Approve
          </Button>
          <Button size="sm" variant="outline" onClick={() => setRejecting(true)} disabled={busy !== null}>
            <X className="h-4 w-4" /> Reject
          </Button>
        </div>
      )}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}
