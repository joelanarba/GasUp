import { Resend } from "resend";
import { logService } from "./log";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM ?? "GasUp <onboarding@resend.dev>";

function configured(): boolean {
  return !!apiKey && !apiKey.includes("re_xxx");
}

export type EmailResult = { ok: boolean; skipped?: boolean };

// Transactional email via Resend. Wrapped + audited; degrades gracefully so a
// failed send can never crash the order flow.
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<EmailResult> {
  if (!configured()) {
    await logService("resend", "send", false, "skipped — RESEND_API_KEY not set");
    return { ok: false, skipped: true };
  }
  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    if (error) {
      await logService("resend", "send", false, `${opts.subject} → ${opts.to}: ${error.message}`);
      return { ok: false };
    }
    await logService("resend", "send", true, `${opts.subject} → ${opts.to} (${data?.id ?? "ok"})`);
    return { ok: true };
  } catch (e) {
    await logService("resend", "send", false, e instanceof Error ? e.message : "unknown error");
    return { ok: false };
  }
}
