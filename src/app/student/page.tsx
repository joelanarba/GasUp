import Link from "next/link";
import { ShoppingBag, History, ChevronRight, PackageOpen } from "lucide-react";
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

  return (
    <DashboardShell role="STUDENT" name={name}>
      <div className="reveal" style={{ animationDelay: "40ms" }}>
        <p className="text-sm font-medium text-muted-foreground">Welcome back,</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">{name.split(" ")[0]}</h1>
      </div>

      <div className="reveal mt-6" style={{ animationDelay: "120ms" }}>
        {prediction.hasData ? (
          <PredictionCard prediction={prediction} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PackageOpen className="h-5 w-5 text-primary" /> Your gas level
              </CardTitle>
              <CardDescription>We&apos;ll predict your refill once you&apos;ve had one delivery.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/student/order">Order your first refill</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {activeOrder && (
        <Link
          href={`/student/orders/${activeOrder.id}`}
          className="reveal mt-4 flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-4 shadow-warm transition-colors hover:border-primary/50"
          style={{ animationDelay: "180ms" }}
        >
          <div>
            <p className="text-sm font-medium text-muted-foreground">Active order</p>
            <p className="font-semibold">{cylinderLabel(activeOrder.cylinderSize)} · {activeOrder.supplier?.businessName ?? "Finding supplier"}</p>
          </div>
          <div className="flex items-center gap-2">
            <OrderStatusBadge status={activeOrder.status} />
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </Link>
      )}

      {pooledCount > 0 && (
        <div
          className="reveal mt-4 flex items-center gap-3 rounded-lg border border-success/30 bg-success/5 p-4"
          style={{ animationDelay: "210ms" }}
        >
          <PiggyBank className="h-5 w-5 text-success" />
          <p className="text-sm">
            <span className="font-semibold text-success">You&apos;ve saved {formatGhs(pooledSavings)}</span>{" "}
            across {pooledCount} pooled refill{pooledCount > 1 ? "s" : ""}.
          </p>
        </div>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Card className="reveal" style={{ animationDelay: "240ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingBag className="h-5 w-5 text-primary" /> Order a refill
            </CardTitle>
            <CardDescription>Pick a size, choose a supplier, track to your door.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/student/order">Start an order</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="reveal" style={{ animationDelay: "300ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5 text-primary" /> Refill history
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
