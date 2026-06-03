import { Inbox, Truck, Star, MapPin } from "lucide-react";
import { currentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { OrderActions } from "@/components/order-actions";
import { cylinderLabel } from "@/lib/cylinders";
import { formatGhs } from "@/lib/pricing";
import { type Prisma } from "@prisma/client";

type QueueOrder = Prisma.OrderGetPayload<{ include: { student: true; hostel: true } }>;

export default async function SupplierDashboard() {
  const user = await currentUser();
  const name = user?.name ?? "there";

  const supplier = await prisma.supplier.findUnique({ where: { userId: user!.id } });
  if (!supplier) {
    return (
      <DashboardShell role="SUPPLIER" name={name}>
        <p className="text-muted-foreground">No supplier profile is linked to this account.</p>
      </DashboardShell>
    );
  }

  const orders = await prisma.order.findMany({
    where: { supplierId: supplier.id, status: { in: ["PENDING", "ACCEPTED", "ON_THE_WAY"] } },
    include: { student: true, hostel: true },
    orderBy: { createdAt: "asc" },
  });
  const incoming = orders.filter((o) => o.status === "PENDING");
  const active = orders.filter((o) => o.status !== "PENDING");

  return (
    <DashboardShell role="SUPPLIER" name={name}>
      <div className="reveal flex items-center justify-between" style={{ animationDelay: "40ms" }}>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{supplier.businessName}</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">{name.split(" ")[0]}</h1>
        </div>
        <div className="text-right">
          <Badge variant="success">
            <Truck className="h-3 w-3" /> {supplier.availability}
          </Badge>
          <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
            {supplier.ratingCount > 0 ? `${supplier.ratingAvg.toFixed(1)} (${supplier.ratingCount})` : "New"}
          </p>
        </div>
      </div>

      <section className="reveal mt-6" style={{ animationDelay: "120ms" }}>
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <Inbox className="h-5 w-5 text-primary" /> Incoming ({incoming.length})
        </h2>
        {incoming.length === 0 ? (
          <EmptyNote>No new orders right now.</EmptyNote>
        ) : (
          <div className="mt-3 space-y-3">
            {incoming.map((o) => (
              <SupplierOrderCard key={o.id} order={o} />
            ))}
          </div>
        )}
      </section>

      <section className="reveal mt-8" style={{ animationDelay: "200ms" }}>
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <Truck className="h-5 w-5 text-primary" /> Active deliveries ({active.length})
        </h2>
        {active.length === 0 ? (
          <EmptyNote>Nothing in progress.</EmptyNote>
        ) : (
          <div className="mt-3 space-y-3">
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
    <p className="mt-3 rounded-lg border border-dashed border-border bg-card/60 px-4 py-6 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

function SupplierOrderCard({ order }: { order: QueueOrder }) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-lg">
            {cylinderLabel(order.cylinderSize)} · {formatGhs(order.feeGhs)}
          </CardTitle>
          <CardDescription>{order.student.fullName}</CardDescription>
        </div>
        <OrderStatusBadge status={order.status} />
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          {order.hostel.name} — Block {order.hostel.block}, Room {order.roomNumber}
        </p>
        {order.specialInstructions && (
          <p className="rounded-md bg-muted/50 px-3 py-2 text-sm">{order.specialInstructions}</p>
        )}
        <OrderActions orderId={order.id} role="SUPPLIER" status={order.status} />
      </CardContent>
    </Card>
  );
}
