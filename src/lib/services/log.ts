import { prisma } from "@/lib/db";

// Audit trail for every external service call. Never throws — logging must not
// be able to take down the flow it's auditing.
export async function logService(
  service: "resend" | "mnotify" | "paystack",
  action: string,
  success: boolean,
  detail?: string,
): Promise<void> {
  try {
    await prisma.serviceLog.create({
      data: { service, action, success, detail: detail?.slice(0, 500) ?? null },
    });
  } catch (e) {
    console.error("[ServiceLog] failed to write", e);
  }
}
