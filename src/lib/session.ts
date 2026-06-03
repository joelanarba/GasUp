import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { type Role } from "@prisma/client";

export type SessionUser = { id: string; role: Role; name?: string | null; email?: string | null };

/** Current user (or null) — for server components and route handlers. */
export async function currentUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as SessionUser) ?? null;
}
