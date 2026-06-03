import { getServerSession } from "next-auth";
import { Inbox, ScrollText, Star, Truck } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function SupplierDashboard() {
  const session = await getServerSession(authOptions);
  const name = session?.user?.name ?? "there";

  return (
    <DashboardShell role="SUPPLIER" name={name}>
      <div className="reveal flex items-center justify-between" style={{ animationDelay: "40ms" }}>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Supplier dashboard</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">{name.split(" ")[0]}</h1>
        </div>
        <Badge variant="success">
          <Truck className="h-3 w-3" /> Available
        </Badge>
      </div>

      <Card className="reveal mt-6" style={{ animationDelay: "120ms" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Inbox className="h-5 w-5 text-primary" /> Incoming orders
          </CardTitle>
          <CardDescription>Accept jobs, verify fill weight, advance to delivered.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid place-items-center rounded-md border border-dashed border-border bg-muted/40 px-6 py-10 text-center">
            <p className="font-display text-lg font-semibold">Order queue lands in Phase 3</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Pending refills — including pooled multi-stop trips — will show up here to accept.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Card className="reveal" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ScrollText className="h-5 w-5 text-primary" /> Active deliveries
            </CardTitle>
            <CardDescription>Jobs you&apos;ve accepted.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Nothing in progress yet.</p>
          </CardContent>
        </Card>

        <Card className="reveal" style={{ animationDelay: "260ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="h-5 w-5 text-primary" /> Your rating
            </CardTitle>
            <CardDescription>Trust earns repeat orders.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Ratings appear after your first delivery.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
