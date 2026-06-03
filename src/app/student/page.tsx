import Link from "next/link";
import { Gauge, ShoppingBag, History, Sparkles, ChevronRight } from "lucide-react";
import { currentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { cylinderLabel } from "@/lib/cylinders";

export default async function StudentDashboard() {
  const user = await currentUser();
  const name = user?.name ?? "there";

  const activeOrder = await prisma.order.findFirst({
    where: { studentId: user!.id, status: { notIn: ["COMPLETED", "CANCELLED", "DISPUTED"] } },
    include: { supplier: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardShell role="STUDENT" name={name}>
      <div className="reveal" style={{ animationDelay: "40ms" }}>
        <p className="text-sm font-medium text-muted-foreground">Welcome back,</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">{name.split(" ")[0]}</h1>
      </div>

      <Card className="reveal mt-6 overflow-hidden" style={{ animationDelay: "120ms" }}>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-primary" /> Your gas level
            </CardTitle>
            <CardDescription>Refill prediction from your history</CardDescription>
          </div>
          <Badge variant="accent">
            <Sparkles className="h-3 w-3" /> Predictive
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid place-items-center rounded-md border border-dashed border-border bg-muted/40 px-6 py-10 text-center">
            <p className="font-display text-lg font-semibold">Gas-gauge lands next build</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              We&apos;ll forecast “≈N days left” from your refill cadence and nudge you before
              the cylinder runs dry.
            </p>
          </div>
        </CardContent>
      </Card>

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
