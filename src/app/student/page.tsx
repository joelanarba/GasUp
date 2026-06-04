import Link from "next/link";
import { ShoppingBag, History, ChevronRight, PackageOpen, ArrowRight } from "lucide-react";
import { currentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { PredictionCard } from "@/components/prediction-card";
import { cylinderLabel } from "@/lib/cylinders";
import { computePrediction, type Delivery } from "@/lib/prediction";
import { SAVING_PER_POOLED_ORDER } from "@/lib/impact";
import { formatGhs } from "@/lib/pricing";
import { PiggyBank } from "lucide-react";

export default async function StudentDashboard() {
  const user = await currentUser();
  const name = user?.name ?? "there";

  const [student, activeOrder, deliveredOrders, pooledCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: user!.id } }),
    prisma.order.findFirst({
      where: { studentId: user!.id, status: { notIn: ["COMPLETED", "CANCELLED", "DISPUTED"] } },
      include: { supplier: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      where: { studentId: user!.id, deliveredAt: { not: null } },
      select: { deliveredAt: true, requestedKg: true, verifiedWeightKg: true },
      orderBy: { deliveredAt: "asc" },
    }),
    prisma.order.count({ where: { studentId: user!.id, poolId: { not: null } } }),
  ]);
  const pooledSavings = pooledCount * SAVING_PER_POOLED_ORDER;

  const deliveries: Delivery[] = deliveredOrders
    .filter((o) => o.deliveredAt)
    .map((o) => ({ deliveredAt: o.deliveredAt as Date, kg: o.verifiedWeightKg ?? o.requestedKg }));
  const prediction = computePrediction(deliveries, student?.householdSize ?? 1);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <DashboardShell role="STUDENT" name={name}>
      <div className="reveal" style={{ animationDelay: "40ms" }}>
        <p className="text-sm font-medium text-muted-foreground">{greeting},</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">{name.split(" ")[0]}</h1>
      </div>

      <div className="reveal mt-6" style={{ animationDelay: "120ms" }}>
        {prediction.hasData ? (
          <PredictionCard prediction={prediction} />
        ) : (
          <Card className="overflow-hidden gradient-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10">
                  <PackageOpen className="h-4 w-4 text-primary" />
                </span>
                Your gas level
              </CardTitle>
              <CardDescription>We&apos;ll predict your refill once you&apos;ve had one delivery.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/student/order">
                  Order your first refill <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {activeOrder && (
        <Link
          href={`/student/orders/${activeOrder.id}`}
          className="reveal mt-4 flex items-center justify-between rounded-xl border border-primary/25 bg-primary/[0.04] p-5 shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-elevated"
          style={{ animationDelay: "180ms" }}
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active order</p>
            <p className="mt-1 font-semibold">{cylinderLabel(activeOrder.cylinderSize)} · {activeOrder.supplier?.businessName ?? "Finding supplier"}</p>
          </div>
          <div className="flex items-center gap-2">
            <OrderStatusBadge status={activeOrder.status} />
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </Link>
      )}

      {pooledCount > 0 && (
        <div
          className="reveal mt-4 flex items-center gap-3 rounded-xl border border-success/25 bg-success/[0.04] p-4 shadow-sm"
          style={{ animationDelay: "210ms" }}
        >
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-success/12">
            <PiggyBank className="h-4 w-4 text-success" />
          </span>
          <p className="text-sm">
            <span className="font-semibold text-success">You&apos;ve saved {formatGhs(pooledSavings)}</span>{" "}
            across {pooledCount} pooled refill{pooledCount > 1 ? "s" : ""}.
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card className="reveal hover-lift" style={{ animationDelay: "240ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10">
                <ShoppingBag className="h-4 w-4 text-primary" />
              </span>
              Order a refill
            </CardTitle>
            <CardDescription>Pick a size, choose a supplier, track to your door.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/student/order">
                Start an order <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="reveal hover-lift" style={{ animationDelay: "300ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10">
                <History className="h-4 w-4 text-primary" />
              </span>
              Refill history
            </CardTitle>
            <CardDescription>Past deliveries and ratings.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/student/orders">View orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
