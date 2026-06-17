"use client";

import { useState } from "react";
import { Gift, Copy, Check, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ReferralCard({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const shareText = `Join me on GasUp — use my code ${code} to get GHS 5 off your first gas delivery! 🔥 gasup.app/register`;
  const waHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — the code is on screen to copy by hand.
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10">
            <Gift className="h-4 w-4 text-primary" />
          </span>
          Refer a friend
        </CardTitle>
        <CardDescription>
          Share your code — your friend gets GHS 5 off their first delivery, and you get GHS 5
          credit when they place their first order.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-primary/40 bg-primary/[0.04] px-4 py-3">
          <span className="font-display text-2xl font-bold tracking-[0.15em] text-primary">{code}</span>
          <Button variant="ghost" size="sm" onClick={copy} className="shrink-0 text-primary">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <Button asChild className="w-full">
          <a href={waHref} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" /> Share on WhatsApp
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
