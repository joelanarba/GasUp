import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { currentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard-shell";
import { OrderForm, type SupplierChoice } from "@/components/order-form";
import { supplierTrustMap } from "@/lib/trust-data";

export default async function NewOrderPage() {
  const user = await currentUser();
  const name = user?.name ?? "there";

  const [student, suppliers] = await Promise.all([
    prisma.user.findUnique({ where: { id: user!.id } }),
    prisma.supplier.findMany({
      where: { availability: { not: "OFFLINE" } },
      orderBy: [{ ratingAvg: "desc" }, { pricePerKg: "asc" }],
    }),
  ]);

  const trust = await supplierTrustMap(suppliers);
  const choices: SupplierChoice[] = suppliers.map((s) => ({
    id: s.id,
    businessName: s.businessName,
    vehicleType: s.vehicleType,
    pricePerKg: s.pricePerKg,
    ratingAvg: s.ratingAvg,
    ratingCount: s.ratingCount,
    trust: trust.get(s.id) ?? null,
  }));

  return (
    <DashboardShell role="STUDENT" name={name}>
      <Link
        href="/student"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>
      <h1 className="reveal mt-3 font-display text-3xl font-semibold tracking-tight" style={{ animationDelay: "40ms" }}>
        Order a refill
      </h1>
      <p className="text-muted-foreground">Pick a size and supplier — we&apos;ll handle the rest.</p>

      <div className="reveal mt-6" style={{ animationDelay: "120ms" }}>
        <OrderForm
          suppliers={choices}
          defaultAddress={student?.defaultAddress ?? null}
          defaultLat={student?.defaultLat ?? null}
          defaultLng={student?.defaultLng ?? null}
        />
      </div>
    </DashboardShell>
  );
}
