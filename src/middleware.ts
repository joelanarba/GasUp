import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { type Role } from "@prisma/client";
import { dashboardFor } from "@/lib/roles";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role as Role | undefined;
    const { pathname } = req.nextUrl;

    const owns =
      (pathname.startsWith("/admin") && role === "ADMIN") ||
      (pathname.startsWith("/rider") && role === "SUPPLIER") ||
      (pathname.startsWith("/student") && role === "STUDENT");

    // Authenticated but hitting another role's area → bounce to their own.
    if (!owns) {
      return NextResponse.redirect(new URL(dashboardFor(role), req.url));
    }
    return NextResponse.next();
  },
  {
    // Returning false sends unauthenticated users to the signIn page.
    callbacks: { authorized: ({ token }) => !!token },
    pages: { signIn: "/login" },
  },
);

export const config = {
  matcher: ["/student/:path*", "/rider/:path*", "/admin/:path*"],
};
