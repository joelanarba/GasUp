import Link from "next/link";
import { ArrowLeft, ChevronRight, PackageOpen } from "lucide-react";
import { currentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard-shell";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { Button } from "@/components/ui/button";
import { cylinderLabel } from "@/lib/cylinders";
import { formatGhs } from "@/lib/pricing";

export default async function StudentOrdersPage() {
  const user = await currentUser();
  const name = user?.name ?? "there";

  const orders = await prisma.order.findMany({
    where: { studentId: user!.id },
    include: { supplier: true, hostel: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardShell role="STUDENT" name={name}>
      <Link
        href="/student"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>
      <div className="mt-3 flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Your orders</h1>
        <Button asChild size="sm">
          <Link href="/student/order">New refill</Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="mt-8 grid place-items-center rounded-lg border border-dashed border-border bg-card/60 px-6 py-14 text-center">
          <PackageOpen className="h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-display text-lg font-semibold">No orders yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Place your first refill to see it here.</p>
          <Button asChild className="mt-4">
            <Link href="/student/order">Order a refill</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {orders.map((o, i) => (
            <li key={o.id} className="reveal" style={{ animationDelay: `${i * 50}ms` }}>
              <Link
                href={`/student/orders/${o.id}`}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 shadow-warm transition-colors hover:border-primary/40"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{cylinderLabel(o.cylinderSize)} refill</p>
                    <OrderStatusBadge status={o.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {o.supplier?.businessName ?? "Awaiting supplier"} ·{" "}
                    {o.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display font-semibold">{formatGhs(o.feeGhs)}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DashboardShell>
  );
}
