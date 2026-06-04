import { Inbox, Truck, Star, MapPin, Users, Zap } from "lucide-react";
import { currentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { OrderActions } from "@/components/order-actions";
import { VerifyFillForm } from "@/components/verify-fill-form";
import { TrustBadge } from "@/components/trust-badge";
import { supplierTrustMap } from "@/lib/trust-data";
import { cylinderLabel } from "@/lib/cylinders";
import { formatGhs } from "@/lib/pricing";
import { type Prisma } from "@prisma/client";

type QueueOrder = Prisma.OrderGetPayload<{
  include: { student: true; pool: { include: { _count: { select: { orders: true } } } } };
}>;

export default async function SupplierDashboard() {
  const user = await currentUser();
  const name = user?.name ?? "there";

  const supplier = await prisma.supplier.findUnique({ where: { userId: user!.id } });
  const trust = supplier ? (await supplierTrustMap([supplier])).get(supplier.id) ?? null : null;
  if (!supplier) {
    return (
      <DashboardShell role="SUPPLIER" name={name}>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-muted">
            <Truck className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="mt-4 text-lg font-medium text-muted-foreground">No supplier profile linked</p>
          <p className="mt-1 text-sm text-muted-foreground">Contact the admin to set up your account.</p>
        </div>
      </DashboardShell>
    );
  }

  const orders = await prisma.order.findMany({
    where: { supplierId: supplier.id, status: { notIn: ["COMPLETED", "CANCELLED"] } },
    include: { pool: { include: { _count: { select: { orders: true } } } }, student: true },
    orderBy: [{ express: "desc" }, { createdAt: "asc" }],
  });
  const incoming = orders.filter((o) => o.status === "PENDING");
  const active = orders.filter((o) => o.status !== "PENDING");

  return (
    <DashboardShell role="SUPPLIER" name={name}>
      {/* ─── Header ─── */}
      <div className="reveal flex items-start justify-between" style={{ animationDelay: "40ms" }}>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{supplier.businessName}</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">{name.split(" ")[0]}</h1>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Badge variant="success">
            <Truck className="h-3 w-3" /> {supplier.availability}
          </Badge>
          {trust && <TrustBadge trust={trust} />}
          <p className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
            {supplier.ratingCount > 0 ? `${supplier.ratingAvg.toFixed(1)} (${supplier.ratingCount})` : "New"}
          </p>
        </div>
      </div>

      {/* ─── Incoming ─── */}
      <section className="reveal mt-8" style={{ animationDelay: "120ms" }}>
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10">
            <Inbox className="h-4 w-4 text-primary" />
          </span>
          Incoming
          {incoming.length > 0 && (
            <span className="ml-1 grid h-6 w-6 place-items-center rounded-full bg-primary text-xs font-bold text-white">
              {incoming.length}
            </span>
          )}
        </h2>
        {incoming.length === 0 ? (
          <EmptyNote>No new orders right now.</EmptyNote>
        ) : (
          <div className="mt-4 space-y-4">
            {incoming.map((o) => (
              <SupplierOrderCard key={o.id} order={o} isNew />
            ))}
          </div>
        )}
      </section>

      {/* ─── Active ─── */}
      <section className="reveal mt-10" style={{ animationDelay: "200ms" }}>
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10">
            <Truck className="h-4 w-4 text-primary" />
          </span>
          Active deliveries ({active.length})
        </h2>
        {active.length === 0 ? (
          <EmptyNote>Nothing in progress.</EmptyNote>
        ) : (
          <div className="mt-4 space-y-4">
            {active.map((o) => (
              <SupplierOrderCard key={o.id} order={o} />
            ))}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-xl border-2 border-dashed border-border/60 bg-card/40 px-4 py-8 text-center">
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

function SupplierOrderCard({ order, isNew }: { order: QueueOrder; isNew?: boolean }) {
  return (
    <Card className={isNew ? "border-primary/20 shadow-glow-sm" : ""}>
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-lg">
            {cylinderLabel(order.cylinderSize)} · {formatGhs(order.feeGhs)}
          </CardTitle>
          <CardDescription className="mt-0.5">{order.student.fullName}</CardDescription>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <OrderStatusBadge status={order.status} />
          {order.express && (
            <Badge variant="default">
              <Zap className="h-3 w-3" /> Express
            </Badge>
          )}
          {order.pool && order.pool._count.orders > 1 && (
            <Badge variant="accent">
              <Users className="h-3 w-3" /> Pooled · {order.pool._count.orders} stops
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/8">
            <MapPin className="h-3.5 w-3.5 text-primary" />
          </span>
          {order.address}
        </p>
        {order.specialInstructions && (
          <p className="rounded-lg bg-muted/40 px-3 py-2.5 text-sm">{order.specialInstructions}</p>
        )}
        {order.status === "ACCEPTED" ? (
          <VerifyFillForm orderId={order.id} requestedKg={order.requestedKg} />
        ) : order.status === "VERIFYING" ? (
          <div className="rounded-lg border border-accent/25 bg-accent/[0.04] px-4 py-3 text-sm text-accent-foreground">
            Sent {order.verifiedWeightKg} kg to {order.student.fullName.split(" ")[0]} — waiting for them to confirm.
          </div>
        ) : (
          <OrderActions orderId={order.id} role="SUPPLIER" status={order.status} />
        )}
      </CardContent>
    </Card>
  );
}
