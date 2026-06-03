import { getServerSession } from "next-auth";
import { Users, Store, Package, BarChart3 } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const name = session?.user?.name ?? "Admin";

  const [students, suppliers, orders, paid] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.supplier.count(),
    prisma.order.count(),
    prisma.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { feeGhs: true } }),
  ]);

  const stats = [
    { icon: Users, label: "Students", value: students },
    { icon: Store, label: "Suppliers", value: suppliers },
    { icon: Package, label: "Orders", value: orders },
    { icon: BarChart3, label: "Revenue (GHS)", value: paid._sum.feeGhs ?? 0 },
  ];

  return (
    <DashboardShell role="ADMIN" name={name}>
      <div className="reveal" style={{ animationDelay: "40ms" }}>
        <p className="text-sm font-medium text-muted-foreground">Admin console</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Overview</h1>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s, i) => (
          <Card key={s.label} className="reveal" style={{ animationDelay: `${100 + i * 60}ms` }}>
            <CardContent className="p-5">
              <s.icon className="h-5 w-5 text-primary" />
              <p className="mt-3 font-display text-3xl font-semibold tracking-tight">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="reveal mt-6" style={{ animationDelay: "360ms" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" /> Reports
          </CardTitle>
          <CardDescription>Revenue, top suppliers, and pooling rate.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid place-items-center rounded-md border border-dashed border-border bg-muted/40 px-6 py-10 text-center">
            <p className="font-display text-lg font-semibold">Charts land in Phase 8</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Order volume, completion rate, top suppliers, revenue and pooling rate — rendered with Recharts.
            </p>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
