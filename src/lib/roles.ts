import { type Role } from "@prisma/client";

/** Home dashboard path for a given role. Defaults to the student area. */
export function dashboardFor(role: Role | undefined | null): string {
  if (role === "ADMIN") return "/admin";
  if (role === "SUPPLIER") return "/rider";
  return "/student";
}
