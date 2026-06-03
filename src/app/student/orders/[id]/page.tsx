import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Star, ShieldCheck, AlertTriangle, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DELIVERY_FEE_SOLO, DELIVERY_FEE_POOLED } from "@/lib/pricing";
import { currentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { StatusTimeline } from "@/components/status-timeline";
import { OrderActions } from "@/components/order-actions";
import { ReviewForm } from "@/components/review-form";
import { PayButton } from "@/components/pay-button";
import { cylinderLabel } from "@/lib/cylinders";
import { formatGhs } from "@/lib/pricing";

export default async function StudentOrderDetail({ params }: { params: { id: string } }) {
  const user = await currentUser();
  const name = user?.name ?? "there";

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      supplier: true,
      hostel: true,
      review: true,
      pool: { include: { _count: { select: { orders: true } } } },
    },
  });
  if (!order || order.studentId !== user!.id) notFound();

  const poolSize = order.pool?._count.orders ?? 0;

  return (
    <DashboardShell role="STUDENT" name={name}>
      <Link
        href="/student/orders"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All orders
      </Link>

      <div className="mt-3 flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {cylinderLabel(order.cylinderSize)} refill
        </h1>
        <OrderStatusBadge status={order.status} />
      </div>

      {poolSize > 1 && (
        <div className="reveal mt-4 flex items-center gap-3 rounded-lg border border-success/30 bg-success/5 p-4" style={{ animationDelay: "30ms" }}>
          <Users className="h-5 w-5 text-success" />
          <p className="text-sm">
            <span className="font-semibold text-success">Pooled with {poolSize - 1} neighbour{poolSize - 1 > 1 ? "s" : ""}.</span>{" "}
            One rider trip to Block {order.hostel.block} — you saved {formatGhs(DELIVERY_FEE_SOLO - DELIVERY_FEE_POOLED)} on delivery.
          </p>
        </div>
      )}

      <Card className="reveal mt-6" style={{ animationDelay: "60ms" }}>
        <CardContent className="p-6">
          <StatusTimeline status={order.status} />
        </CardContent>
      </Card>

      <Card className="reveal mt-4" style={{ animationDelay: "140ms" }}>
        <CardHeader>
          <CardTitle className="text-lg">Order details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Supplier" value={order.supplier?.businessName ?? "Awaiting supplier"} />
          <Row label="Cylinder" value={`${cylinderLabel(order.cylinderSize)} (${order.requestedKg} kg)`} />
          <Row
            label="Deliver to"
            value={`${order.hostel.name} — Block ${order.hostel.block}, Room ${order.roomNumber}`}
            icon
          />
          {order.specialInstructions && <Row label="Notes" value={order.specialInstructions} />}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Payment</span>
            {order.paymentStatus === "PAID" ? (
              <Badge variant="success">Paid</Badge>
            ) : order.paymentStatus === "PENDING" ? (
              <Badge variant="accent">Awaiting confirmation</Badge>
            ) : (
              <Badge variant="muted">Unpaid</Badge>
            )}
          </div>
          <div className="flex justify-between border-t border-border pt-3 font-display text-lg font-semibold">
            <span>Total</span>
            <span>{formatGhs(order.feeGhs)}</span>
          </div>
          {order.paymentStatus !== "PAID" &&
            order.status !== "CANCELLED" &&
            order.status !== "COMPLETED" && (
              <div className="pt-1">
                <PayButton orderId={order.id} amountLabel={formatGhs(order.feeGhs)} />
              </div>
            )}
        </CardContent>
      </Card>

      {order.verifiedWeightKg != null && (
        <Card className="reveal mt-4" style={{ animationDelay: "180ms" }}>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-accent" /> Verified fill
            </CardTitle>
            {order.status === "DISPUTED" ? (
              <Badge variant="destructive">Disputed</Badge>
            ) : order.weightConfirmed ? (
              <Badge variant="success">Confirmed</Badge>
            ) : (
              <Badge variant="accent">Awaiting your check</Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ordered</span>
              <span className="font-medium">{order.requestedKg} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Supplier filled</span>
              <span className="font-display text-lg font-semibold">{order.verifiedWeightKg} kg</span>
            </div>
            {order.proofUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={order.proofUrl} alt="Fill proof" className="w-full rounded-md border border-border" />
            )}
            {order.status === "VERIFYING" && (
              <p className="flex items-start gap-2 rounded-md bg-accent/10 px-3 py-2 text-accent-foreground">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                Check the cylinder weight on the scale. Confirm if it matches, or report a mismatch to raise a dispute.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
        <div className="reveal mt-4" style={{ animationDelay: "240ms" }}>
          <OrderActions orderId={order.id} role="STUDENT" status={order.status} />
        </div>
      )}

      {order.status === "COMPLETED" && (
        <Card className="reveal mt-4" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="h-5 w-5 text-accent" /> Rate this delivery
            </CardTitle>
          </CardHeader>
          <CardContent>
            {order.review ? (
              <div className="space-y-1">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={
                        n <= order.review!.rating
                          ? "h-5 w-5 fill-accent text-accent"
                          : "h-5 w-5 text-border"
                      }
                    />
                  ))}
                </div>
                {order.review.comment && (
                  <p className="text-sm text-muted-foreground">“{order.review.comment}”</p>
                )}
              </div>
            ) : (
              <ReviewForm orderId={order.id} />
            )}
          </CardContent>
        </Card>
      )}
    </DashboardShell>
  );
}

function Row({ label, value, icon }: { label: string; value: string; icon?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1.5 text-right font-medium">
        {icon && <MapPin className="h-4 w-4 text-primary" />}
        {value}
      </span>
    </div>
  );
}
