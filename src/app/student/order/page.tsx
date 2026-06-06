import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { currentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard-shell";
import { OrderForm } from "@/components/order-form";

export default async function NewOrderPage() {
  const user = await currentUser();
  const name = user?.name ?? "there";

  const student = await prisma.user.findUnique({ where: { id: user!.id } });

  return (
    <DashboardShell role="STUDENT" name={name}>
      <Link
        href="/student"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>
      <h1 className="reveal mt-3 font-display text-3xl font-semibold tracking-tight" style={{ animationDelay: "40ms" }}>
        Order a refill
      </h1>
      <p className="text-muted-foreground">
        Pick a size and amount — we&apos;ll broadcast it to nearby riders and the first to accept brings it.
      </p>

      <div className="reveal mt-6" style={{ animationDelay: "120ms" }}>
        <OrderForm
          defaultAddress={student?.defaultAddress ?? null}
          defaultLat={student?.defaultLat ?? null}
          defaultLng={student?.defaultLng ?? null}
        />
      </div>
    </DashboardShell>
  );
}
