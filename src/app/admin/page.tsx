import { getServerSession } from "next-auth";
import { Users, Store, Package, BarChart3, ShieldAlert, ShieldCheck, Activity, Star, UserPlus, MapPin, Fuel } from "lucide-react";
import { type OrderStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { OrdersByStatusChart, TopSuppliersChart, PoolingDonut } from "@/components/admin-reports";
import { ImpactCard } from "@/components/impact-card";
import { AddSupplier } from "@/components/new-supplier-form";
import { ApplicationActions } from "@/components/application-actions";
import { poolingImpact } from "@/lib/impact";
import { supplierTrustMap } from "@/lib/trust-data";
import { cylinderLabel } from "@/lib/cylinders";
import { formatGhs } from "@/lib/pricing";
import { STATUS_META } from "@/lib/order-status";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const name = session?.user?.name ?? "Admin";

  const [students, suppliers, orders, paid, disputes, logs, byStatus, bySupplier, pooledCount, poolCount, supplierList, recentOrders, applications] =
    await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.supplier.count(),
      prisma.order.count(),
      prisma.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { feeGhs: true } }),
      prisma.order.findMany({
        where: { status: "DISPUTED" },
        include: { student: true, supplier: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.serviceLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
      prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.order.groupBy({
        by: ["supplierId"],
        where: { status: { in: ["DELIVERED", "COMPLETED"] } },
        _count: { _all: true },
      }),
      prisma.order.count({ where: { poolId: { not: null } } }),
      prisma.pool.count(),
      prisma.supplier.findMany({ orderBy: { ratingAvg: "desc" } }),
      prisma.order.findMany({
        include: { student: true, supplier: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.riderApplication.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  const stats = [
    { icon: Users, label: "Students", value: students },
    { icon: Store, label: "Riders", value: suppliers },
    { icon: Package, label: "Orders", value: orders },
    { icon: BarChart3, label: "Revenue (GHS)", value: paid._sum.feeGhs ?? 0 },
  ];

  const statusData = byStatus.map((s) => ({
    name: STATUS_META[s.status as OrderStatus].label,
    value: s._count._all,
  }));
  const supplierName = new Map(supplierList.map((s) => [s.id, s.businessName]));
  const supplierData = bySupplier
    .filter((b) => b.supplierId)
    .map((b) => ({ name: supplierName.get(b.supplierId!) ?? "—", deliveries: b._count._all }))
    .sort((a, b) => b.deliveries - a.deliveries)
    .slice(0, 5);
  const completedDeliveries = bySupplier.reduce((s, b) => s + b._count._all, 0);
  const impact = poolingImpact(pooledCount, poolCount);
  const trustMap = await supplierTrustMap(supplierList);

  return (
    <DashboardShell role="ADMIN" name={name}>
      <div className="reveal" style={{ animationDelay: "40ms" }}>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Admin console</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">Overview</h1>
      </div>

      {/* ─── Stats grid ─── */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s, i) => (
          <Card key={s.label} className="reveal hover-lift" style={{ animationDelay: `${100 + i * 60}ms` }}>
            <CardContent className="p-5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10">
                <s.icon className="h-5 w-5 text-primary" />
              </span>
              <p className="mt-4 font-display text-3xl font-semibold tracking-tight">{s.value}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {impact.pooledOrders > 0 && <ImpactCard impact={impact} style={{ animationDelay: "320ms" }} />}

      {/* ─── Trust & disputes ─── */}
      <Card className="reveal mt-6" style={{ animationDelay: "340ms" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {disputes.length > 0 ? (
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-destructive/10">
                <ShieldAlert className="h-4 w-4 text-destructive" />
              </span>
            ) : (
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-success/12">
                <ShieldCheck className="h-4 w-4 text-success" />
              </span>
            )}
            Trust &amp; disputes
          </CardTitle>
          <CardDescription>Weight-mismatch flags raised by students on delivery.</CardDescription>
        </CardHeader>
        <CardContent>
          {disputes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No disputes — verified fills are holding up.</p>
          ) : (
            <ul className="space-y-2">
              {disputes.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/[0.04] px-4 py-3.5 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {d.student.fullName} · {cylinderLabel(d.cylinderSize)}
                    </p>
                    <p className="text-muted-foreground">
                      {d.supplier?.businessName ?? "—"} · ordered {d.requestedKg}kg, filled{" "}
                      {d.verifiedWeightKg ?? "?"}kg
                    </p>
                  </div>
                  <span className="font-display font-semibold text-destructive">Disputed</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* ─── Reports ─── */}
      <Card className="reveal mt-4" style={{ animationDelay: "400ms" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10">
              <BarChart3 className="h-4 w-4 text-primary" />
            </span>
            Reports
          </CardTitle>
          <CardDescription>Order volume, top riders, and pooling rate.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div>
            <p className="mb-3 text-sm font-semibold text-muted-foreground">Orders by status</p>
            <OrdersByStatusChart data={statusData} />
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-semibold text-muted-foreground">Top riders (deliveries)</p>
              {supplierData.length > 0 ? (
                <TopSuppliersChart data={supplierData} />
              ) : (
                <p className="grid h-56 place-items-center text-sm text-muted-foreground">No deliveries yet.</p>
              )}
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold text-muted-foreground">Pooling rate</p>
              <PoolingDonut pooled={pooledCount} solo={Math.max(0, orders - pooledCount)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Rider applications ─── */}
      <Card className="reveal mt-4" style={{ animationDelay: "430ms" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10">
              <UserPlus className="h-4 w-4 text-primary" />
            </span>
            Rider applications
            {applications.length > 0 && (
              <span className="grid h-6 min-w-6 place-items-center rounded-full bg-primary px-1.5 text-xs font-bold text-white">
                {applications.length}
              </span>
            )}
          </CardTitle>
          <CardDescription>Self-service applications awaiting review.</CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No applications pending review.</p>
          ) : (
            <ul className="space-y-3">
              {applications.map((a) => (
                <li key={a.id} className="rounded-xl border border-border/60 bg-card/50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="text-sm">
                      <p className="font-semibold">{a.businessName}</p>
                      <p className="text-muted-foreground">{a.fullName} · {a.email}{a.phone ? ` · ${a.phone}` : ""}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
                        <span className="inline-flex items-center gap-1">{a.vehicleType}</span>
                        <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{a.coverageArea}</span>
                        {a.partnerStation && (
                          <span className="inline-flex items-center gap-1"><Fuel className="h-3.5 w-3.5" />{a.partnerStation}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <ApplicationActions applicationId={a.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* ─── Riders table ─── */}
      <Card className="reveal mt-4" style={{ animationDelay: "440ms" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10">
              <Store className="h-4 w-4 text-primary" />
            </span>
            Riders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AddSupplier />
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-muted-foreground">
                <th className="pb-3 font-medium">Business</th>
                <th className="pb-3 font-medium">Vehicle</th>
                <th className="pb-3 font-medium">Cost/kg</th>
                <th className="pb-3 font-medium">Rating</th>
                <th className="pb-3 text-right font-medium">Trust</th>
              </tr>
            </thead>
            <tbody>
              {supplierList.map((s) => {
                const t = trustMap.get(s.id);
                return (
                  <tr key={s.id} className="border-b border-border/40 transition-colors hover:bg-muted/30 last:border-0">
                    <td className="py-3 font-medium">{s.businessName}</td>
                    <td className="py-3 text-muted-foreground">{s.vehicleType}</td>
                    <td className="py-3">{s.pricePerKg}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                        {s.ratingCount > 0 ? `${s.ratingAvg.toFixed(1)} (${s.ratingCount})` : "New"}
                      </span>
                    </td>
                    <td className="py-3 text-right">{t ? `${t.score} · ${t.label}` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </CardContent>
      </Card>

      {/* ─── Recent orders ─── */}
      <Card className="reveal mt-4" style={{ animationDelay: "480ms" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10">
              <Package className="h-4 w-4 text-primary" />
            </span>
            Recent orders
          </CardTitle>
          <CardDescription>{completedDeliveries} delivered of {orders} total.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-muted-foreground">
                <th className="pb-3 font-medium">Student</th>
                <th className="pb-3 font-medium">Rider</th>
                <th className="pb-3 font-medium">Fee</th>
                <th className="pb-3 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-b border-border/40 transition-colors hover:bg-muted/30 last:border-0">
                  <td className="py-3 font-medium">{o.student.fullName}</td>
                  <td className="py-3 text-muted-foreground">{o.supplier?.businessName ?? "—"}</td>
                  <td className="py-3">{formatGhs(o.feeGhs)}</td>
                  <td className="py-3 text-right">
                    <OrderStatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* ─── Service activity ─── */}
      <Card className="reveal mt-4" style={{ animationDelay: "460ms" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10">
              <Activity className="h-4 w-4 text-primary" />
            </span>
            Service activity
          </CardTitle>
          <CardDescription>Audit trail of external calls (email · SMS · payments).</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No external calls logged yet.</p>
          ) : (
            <ul className="divide-y divide-border/40 text-sm">
              {logs.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 py-3">
                  <span className="flex items-center gap-2.5">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${l.success ? "bg-success" : "bg-destructive"}`}
                    />
                    <span className="font-medium uppercase tracking-wide">{l.service}</span>
                    <span className="text-muted-foreground">{l.action}</span>
                  </span>
                  <span className="max-w-[55%] truncate text-right text-muted-foreground">
                    {l.detail}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
