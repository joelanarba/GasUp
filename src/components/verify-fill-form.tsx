"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Camera, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Downscale to keep the proof data URL small (deploy-safe, no object storage).
async function compress(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = dataUrl;
  });
  const max = 900;
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.7);
}

export function VerifyFillForm({ orderId, requestedKg }: { orderId: string; requestedKg: number }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [filledKg, setFilledKg] = useState(String(requestedKg));
  const [proof, setProof] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setProof(await compress(file));
    } catch {
      setError("Couldn't read that image.");
    }
  }

  async function submit() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/orders/${orderId}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filledKg: Number(filledKg), proofUrl: proof ?? "" }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Couldn't submit the fill weight.");
      setBusy(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-3 rounded-md border border-accent/40 bg-accent/5 p-3">
      <p className="flex items-center gap-2 text-sm font-semibold text-accent-foreground">
        <ShieldCheck className="h-4 w-4" /> Verify the fill
      </p>
      <div className="space-y-1.5">
        <Label htmlFor={`kg-${orderId}`}>Filled weight (kg)</Label>
        <Input
          id={`kg-${orderId}`}
          type="number"
          step="0.1"
          inputMode="decimal"
          value={filledKg}
          onChange={(e) => setFilledKg(e.target.value)}
        />
      </div>

      <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={onFile} />
      {proof ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={proof} alt="Fill proof" className="h-32 w-full rounded-md object-cover" />
          <button
            type="button"
            onClick={() => setProof(null)}
            className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-background/90 text-foreground shadow"
            aria-label="Remove photo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <Button type="button" variant="outline" className="w-full" onClick={() => fileRef.current?.click()}>
          <Camera className="h-4 w-4" /> Add scale photo (optional)
        </Button>
      )}

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <Button className="w-full" onClick={submit} disabled={busy}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Submit for student to confirm
      </Button>
    </div>
  );
}
