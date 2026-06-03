import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { dashboardFor } from "@/lib/roles";
import { prisma } from "@/lib/db";
import { RegisterForm, type HostelOption } from "@/components/register-form";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect(dashboardFor(session.user.role));

  const hostels = await prisma.hostel.findMany({
    orderBy: [{ name: "asc" }, { block: "asc" }],
  });
  const options: HostelOption[] = hostels.map((h) => ({
    id: h.id,
    label: `${h.name} — Block ${h.block}`,
  }));

  return (
    <div className="reveal" style={{ animationDelay: "120ms" }}>
      <h1 className="font-display text-3xl font-semibold tracking-tight">Create your account</h1>
      <p className="mt-2 text-muted-foreground">
        Students only — set up in under a minute and start tracking your gas.
      </p>
      <RegisterForm hostels={options} />
    </div>
  );
}
