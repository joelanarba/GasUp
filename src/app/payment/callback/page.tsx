import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
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
      <div className="mt-10">
        {paid ? (
          <CheckCircle2 className="mx-auto h-16 w-16 text-success" />
        ) : (
          <XCircle className="mx-auto h-16 w-16 text-destructive" />
        )}
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">
          {paid ? "Payment confirmed" : "Payment not confirmed"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {paid
            ? "Thanks! Your refill is paid and on its way through the queue."
            : "We couldn't confirm this payment. If you were charged, it'll reconcile shortly."}
        </p>
      </div>
      <Button asChild size="lg" className="mt-8">
        <Link href={orderId ? `/student/orders/${orderId}` : "/student"}>
          {orderId ? "View your order" : "Back to dashboard"}
        </Link>
      </Button>
    </main>
  );
}
