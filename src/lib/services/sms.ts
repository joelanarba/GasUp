import { logService } from "./log";

const apiKey = process.env.MNOTIFY_API_KEY;
const sender = process.env.MNOTIFY_SENDER_ID ?? "GasUp";

function configured(): boolean {
  return !!apiKey && apiKey !== "xxx";
}

export type SmsResult = { ok: boolean; skipped?: boolean };

// SMS via mNotify (Ghana). Wrapped + audited; degrades gracefully — a dead SMS
// API must never take down checkout. https://readthedocs.mnotify.com
export async function sendSms(opts: { to?: string | null; message: string }): Promise<SmsResult> {
  if (!opts.to) {
    await logService("mnotify", "send", false, "skipped — no phone on file");
    return { ok: false, skipped: true };
  }
  if (!configured()) {
    await logService("mnotify", "send", false, "skipped — MNOTIFY_API_KEY not set");
    return { ok: false, skipped: true };
  }
  try {
    const res = await fetch(`https://api.mnotify.com/api/sms/quick?key=${encodeURIComponent(apiKey!)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient: [opts.to], sender, message: opts.message }),
    });
    const body = await res.text();
    const ok = res.ok;
    await logService("mnotify", "send", ok, `→ ${opts.to}: ${body.slice(0, 140)}`);
    return { ok };
  } catch (e) {
    await logService("mnotify", "send", false, e instanceof Error ? e.message : "unknown error");
    return { ok: false };
  }
}
