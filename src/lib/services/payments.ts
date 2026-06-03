import crypto from "crypto";
import { logService } from "./log";

const secret = process.env.PAYSTACK_SECRET_KEY;

export function paymentsConfigured(): boolean {
  return !!secret && !secret.includes("xxx");
}

export type InitResult =
  | { ok: true; authorizationUrl: string; reference: string }
  | { ok: false; skipped?: boolean; error?: string };

// Paystack (TEST mode). All calls wrapped + audited; degrades gracefully.
export async function initPayment(opts: {
  email: string;
  amountGhs: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<InitResult> {
  if (!paymentsConfigured()) {
    await logService("paystack", "init", false, "skipped — PAYSTACK_SECRET_KEY not set");
    return { ok: false, skipped: true };
  }
  try {
    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: opts.email,
        amount: Math.round(opts.amountGhs * 100), // pesewas
        currency: "GHS",
        reference: opts.reference,
        callback_url: opts.callbackUrl,
        metadata: opts.metadata,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.status) {
      await logService("paystack", "init", false, data?.message ?? `HTTP ${res.status}`);
      return { ok: false, error: data?.message ?? "init failed" };
    }
    await logService("paystack", "init", true, opts.reference);
    return { ok: true, authorizationUrl: data.data.authorization_url, reference: data.data.reference };
  } catch (e) {
    await logService("paystack", "init", false, e instanceof Error ? e.message : "unknown error");
    return { ok: false, error: "network error" };
  }
}

export async function verifyPayment(
  reference: string,
): Promise<{ ok: boolean; paid: boolean }> {
  if (!paymentsConfigured()) {
    await logService("paystack", "verify", false, "skipped — PAYSTACK_SECRET_KEY not set");
    return { ok: false, paid: false };
  }
  try {
    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const data = await res.json();
    const paid = res.ok && data?.data?.status === "success";
    await logService("paystack", "verify", res.ok, `${reference}: ${data?.data?.status ?? data?.message}`);
    return { ok: res.ok, paid };
  } catch (e) {
    await logService("paystack", "verify", false, e instanceof Error ? e.message : "unknown error");
    return { ok: false, paid: false };
  }
}

/** Verify a Paystack webhook signature (HMAC SHA512 of the raw body). */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!secret || !signature) return false;
  const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  } catch {
    return false;
  }
}
