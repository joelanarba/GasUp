import Link from "next/link";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { verifyPayment } from "@/lib/services/payments";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/brand";

export default async function PaymentCallback({
  searchParams,
}: {
  searchParams: { reference?: string; trxref?: string };
}) {
  const reference = searchParams.reference ?? searchParams.trxref;
  let paid = false;
  let orderId: string | null = null;

  if (reference) {
    const order = await prisma.order.findFirst({ where: { paystackRef: reference } });
    orderId = order?.id ?? null;
    const result = await verifyPayment(reference);
    paid = result.paid;
    if (order && paid && order.paymentStatus !== "PAID") {
      await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "PAID" } });
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-5 text-center">
      <Brand />
      <div className="reveal mt-12" style={{ animationDelay: "100ms" }}>
        {paid ? (
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-success/12">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </span>
        ) : (
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-destructive/10">
            <XCircle className="h-10 w-10 text-destructive" />
          </span>
        )}
        <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">
          {paid ? "Payment confirmed" : "Payment not confirmed"}
        </h1>
        <p className="mt-3 max-w-xs text-muted-foreground">
          {paid
            ? "Thanks! Your refill is paid and on its way through the queue."
            : "We couldn't confirm this payment. If you were charged, it'll reconcile shortly."}
        </p>
      </div>
      <Button asChild size="lg" className="reveal mt-8" style={{ animationDelay: "250ms" }}>
        <Link href={orderId ? `/student/orders/${orderId}` : "/student"}>
          {orderId ? "View your order" : "Back to dashboard"} <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </main>
  );
}
