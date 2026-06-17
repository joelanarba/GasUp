import { prisma } from "@/lib/db";

// "Give GHS 5, Get GHS 5" referral codes: first 4 letters of the name + 4 random digits,
// uppercase (e.g. "Akua Sarpong" → AKUA2847). Non-letters are stripped; short names use
// what's available, falling back to GAS so a code is always produced.
export function genReferralCode(fullName: string): string {
  const letters =
    (fullName.match(/[a-zA-Z]/g) ?? []).join("").slice(0, 4).toUpperCase() || "GAS";
  const digits = Math.floor(1000 + Math.random() * 9000); // always 4 digits
  return `${letters}${digits}`;
}

/** Generate a referral code that isn't already taken (referralCode is unique). */
export async function uniqueReferralCode(fullName: string): Promise<string> {
  for (let i = 0; i < 6; i++) {
    const code = genReferralCode(fullName);
    const taken = await prisma.user.findUnique({ where: { referralCode: code } });
    if (!taken) return code;
  }
  // Astronomically unlikely fallback — add an extra digit of entropy.
  return `${genReferralCode(fullName)}${Math.floor(Math.random() * 10)}`;
}
