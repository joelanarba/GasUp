import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { dashboardFor } from "@/lib/roles";

// Neutral post-login landing: routes each user to their role's home.
export default async function DashboardRedirect() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  redirect(dashboardFor(session.user.role));
}
