import { Radio, Truck, Star, MapPin, Users, Zap, Navigation, Coins, Fuel, Banknote } from "lucide-react";
import { currentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { OrderActions } from "@/components/order-actions";
import { VerifyFillForm } from "@/components/verify-fill-form";
import { AcceptOrderButton } from "@/components/accept-order-button";
import { CashPaidButton } from "@/components/cash-paid-button";
import { TrustBadge } from "@/components/trust-badge";
import { supplierTrustMap } from "@/lib/trust-data";
import { cylinderLabel } from "@/lib/cylinders";
import { formatGhs, riderEarn } from "@/lib/pricing";
import { distanceMeters, formatDistance } from "@/lib/geo";
import { type Prisma } from "@prisma/client";

type BoardOrder = Prisma.OrderGetPayload<{
  include: { student: true; pool: { include: { _count: { select: { orders: true } } } } };
}>;

type Trip = {
  key: string;
  orders: BoardOrder[];
  distance: number | null;
  earn: number;
  express: boolean;
  createdAt: Date;
};

export default async function RiderDashboard() {
  const user = await currentUser();
  const name = user?.name ?? "there";

  const supplier = await prisma.supplier.findUnique({ where: { userId: user!.id } });
  if (!supplier) {
    return (
      <DashboardShell role="SUPPLIER" name={name}>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-muted">
            <Truck className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="mt-4 text-lg font-medium text-muted-foreground">No rider profile linked</p>
          <p className="mt-1 text-sm text-muted-foreground">Contact the admin to set up your account.</p>
        </div>
      </DashboardShell>
    );
  }

  const trust = (await supplierTrustMap([supplier])).get(supplier.id) ?? null;

  const [available, active] = await Promise.all([
    prisma.order.findMany({
      where: { status: "OPEN" },
      include: { student: true, pool: { include: { _count: { select: { orders: true } } } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.order.findMany({
      where: { supplierId: supplier.id, status: { notIn: ["OPEN", "COMPLETED", "CANCELLED"] } },
      include: { student: true, pool: { include: { _count: { select: { orders: true } } } } },
      orderBy: [{ express: "desc" }, { createdAt: "asc" }],
    }),
  ]);

  const base =
    supplier.lat != null && supplier.lng != null ? { lat: supplier.lat, lng: supplier.lng } : null;
  const distOf = (o: BoardOrder) =>
    base && o.lat != null && o.lng != null ? distanceMeters(base, { lat: o.lat, lng: o.lng }) : null;

  // Group OPEN orders into trips: one card per pool, one per solo order.
  const groups = new Map<string, BoardOrder[]>();
  for (const o of available) {
    const key = o.poolId ?? `solo-${o.id}`;
    groups.set(key, [...(groups.get(key) ?? []), o]);
  }
  const trips: Trip[] = Array.from(groups.entries()).map(([key, orders]) => {
    const dists = orders.map(distOf).filter((d): d is number => d != null);
    return {
      key,
      orders,
      distance: dists.length ? Math.min(...dists) : null,
      earn: orders.reduce((s, o) => s + riderEarn({ pooled: o.poolId != null }), 0),
      express: orders.some((o) => o.express),
      createdAt: orders.reduce((min, o) => (o.createdAt < min ? o.createdAt : min), orders[0].createdAt),
    };
  });
  trips.sort((a, b) => {
    if (a.express !== b.express) return a.express ? -1 : 1;
    if (a.distance != null && b.distance != null && a.distance !== b.distance)
      return a.distance - b.distance;
    if ((a.distance == null) !== (b.distance == null)) return a.distance == null ? 1 : -1;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  return (
    <DashboardShell role="SUPPLIER" name={name}>
      {/* ─── Header ─── */}
      <div className="reveal flex items-start justify-between" style={{ animationDelay: "40ms" }}>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{supplier.businessName}</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">{name.split(" ")[0]}</h1>
          {supplier.partnerStation && (
            <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
              <Fuel className="h-3.5 w-3.5 text-primary" /> Refills at {supplier.partnerStation}
            </p>
          )}
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

      {/* ─── Available orders (dispatch board) ─── */}
      <section className="reveal mt-8" style={{ animationDelay: "120ms" }}>
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10">
            <Radio className="h-4 w-4 text-primary" />
          </span>
          Available orders
          {trips.length > 0 && (
            <span className="ml-1 grid h-6 min-w-6 place-items-center rounded-full bg-primary px-1.5 text-xs font-bold text-white">
              {trips.length}
            </span>
          )}
        </h2>
        {trips.length === 0 ? (
          <EmptyNote>No open orders nearby right now. New requests appear here live.</EmptyNote>
        ) : (
          <div className="mt-4 space-y-4">
            {trips.map((t) => (
              <AvailableTripCard key={t.key} trip={t} />
            ))}
          </div>
        )}
      </section>

      {/* ─── My active deliveries ─── */}
      <section className="reveal mt-10" style={{ animationDelay: "200ms" }}>
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10">
            <Truck className="h-4 w-4 text-primary" />
          </span>
          My active deliveries ({active.length})
        </h2>
        {active.length === 0 ? (
          <EmptyNote>Nothing in progress. Accept an order above to get started.</EmptyNote>
        ) : (
          <div className="mt-4 space-y-4">
            {active.map((o) => (
              <ActiveOrderCard key={o.id} order={o} />
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

function AvailableTripCard({ trip }: { trip: Trip }) {
  const stops = trip.orders.length;
  const lead = trip.orders[0];
  return (
    <Card className="border-primary/20 shadow-glow-sm">
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-lg">
            {stops > 1 ? `${stops}-stop trip` : `${cylinderLabel(lead.cylinderSize)} · ${lead.requestedKg} kg`}
          </CardTitle>
          <CardDescription className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1">
              <Navigation className="h-3.5 w-3.5 text-primary" />
              {trip.distance != null ? `${formatDistance(trip.distance)} away` : "Distance n/a"}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-success">
              <Coins className="h-3.5 w-3.5" /> Earn {formatGhs(trip.earn)}
            </span>
          </CardDescription>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {trip.express && (
            <Badge variant="default">
              <Zap className="h-3 w-3" /> Express
            </Badge>
          )}
          {stops > 1 && (
            <Badge variant="accent">
              <Users className="h-3 w-3" /> Pooled · {stops} stops
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-2">
          {trip.orders.map((o) => (
            <li key={o.id} className="flex items-start gap-2 text-sm">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-primary/8">
                <MapPin className="h-3.5 w-3.5 text-primary" />
              </span>
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">{o.address}</span>
                {stops > 1 && ` — ${cylinderLabel(o.cylinderSize)} (${o.requestedKg} kg)`}
                {o.paymentMethod === "CASH_ON_DELIVERY" && (
                  <span className="ml-1 inline-flex items-center gap-1 text-xs text-amber-700">
                    <Banknote className="h-3 w-3" /> cash
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
        <AcceptOrderButton orderId={lead.id} poolSize={stops} />
      </CardContent>
    </Card>
  );
}

function ActiveOrderCard({ order }: { order: BoardOrder }) {
  const cashDue = order.paymentMethod === "CASH_ON_DELIVERY" && order.paymentStatus !== "PAID";
  return (
    <Card>
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
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          {order.paymentMethod === "CASH_ON_DELIVERY" ? (
            <>
              <Banknote className="h-4 w-4" />
              {order.paymentStatus === "PAID" ? "Cash collected" : "Collect cash on delivery"}
            </>
          ) : (
            <>
              <Coins className="h-4 w-4" />
              {order.paymentStatus === "PAID" ? "Paid online" : "Awaiting online payment"}
            </>
          )}
        </p>
        {order.specialInstructions && (
          <p className="rounded-lg bg-muted/40 px-3 py-2.5 text-sm">{order.specialInstructions}</p>
        )}
        {cashDue && <CashPaidButton orderId={order.id} />}
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
