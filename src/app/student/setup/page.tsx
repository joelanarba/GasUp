import Link from "next/link";
import { ArrowLeft, Gauge } from "lucide-react";
import { currentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard-shell";
import { GasSetupForm } from "@/components/gas-setup-form";

export default async function GasSetupPage() {
  const user = await currentUser();
  const name = user?.name ?? "there";
  const student = await prisma.user.findUnique({ where: { id: user!.id } });
  const defaultDate = student?.lastRefillAt
    ? student.lastRefillAt.toISOString().slice(0, 10)
    : "";

  return (
    <DashboardShell role="STUDENT" name={name}>
      <Link
        href="/student"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>

      <div className="reveal mt-4" style={{ animationDelay: "40ms" }}>
        <span className="inline-grid h-11 w-11 place-items-center rounded-xl bg-primary/10">
          <Gauge className="h-5 w-5 text-primary" />
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">Set up your gas</h1>
        <p className="mt-2 text-muted-foreground">
          Three quick details and we&apos;ll estimate your refill from day one — before you
          ever run dry. No history needed.
        </p>
      </div>

      <div className="reveal" style={{ animationDelay: "120ms" }}>
        <GasSetupForm
          defaultSize={student?.defaultCylinderSize ?? null}
          defaultHousehold={student?.householdSize ?? 1}
          defaultDate={defaultDate}
        />
      </div>
    </DashboardShell>
  );
}
