import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Star } from "lucide-react";
import { currentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { StatusTimeline } from "@/components/status-timeline";
import { OrderActions } from "@/components/order-actions";
import { ReviewForm } from "@/components/review-form";
import { cylinderLabel } from "@/lib/cylinders";
import { formatGhs } from "@/lib/pricing";

export default async function StudentOrderDetail({ params }: { params: { id: string } }) {
  const user = await currentUser();
  const name = user?.name ?? "there";

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { supplier: true, hostel: true, review: true },
  });
  if (!order || order.studentId !== user!.id) notFound();

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
          <div className="flex justify-between border-t border-border pt-3 font-display text-lg font-semibold">
            <span>Total</span>
            <span>{formatGhs(order.feeGhs)}</span>
          </div>
        </CardContent>
      </Card>

      {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
        <div className="reveal mt-4" style={{ animationDelay: "200ms" }}>
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
