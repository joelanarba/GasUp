import { getServerSession } from "next-auth";
import { Gauge, ShoppingBag, History, Sparkles } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);
  const name = session?.user?.name ?? "there";

  return (
    <DashboardShell role="STUDENT" name={name}>
      <div className="reveal" style={{ animationDelay: "40ms" }}>
        <p className="text-sm font-medium text-muted-foreground">Welcome back,</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">{name.split(" ")[0]}</h1>
      </div>

      <Card className="reveal mt-6 overflow-hidden" style={{ animationDelay: "120ms" }}>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-primary" /> Your gas level
            </CardTitle>
            <CardDescription>Refill prediction from your history</CardDescription>
          </div>
          <Badge variant="accent">
            <Sparkles className="h-3 w-3" /> Predictive
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid place-items-center rounded-md border border-dashed border-border bg-muted/40 px-6 py-10 text-center">
            <p className="font-display text-lg font-semibold">Gas-gauge lands next build</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              We&apos;ll forecast “≈N days left” from your refill cadence and nudge you before
              the cylinder runs dry.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Card className="reveal" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingBag className="h-5 w-5 text-primary" /> Order a refill
            </CardTitle>
            <CardDescription>Pick a size, pay, track to your door.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full">Coming in Phase 3</Button>
          </CardContent>
        </Card>

        <Card className="reveal" style={{ animationDelay: "260ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5 text-primary" /> Refill history
            </CardTitle>
            <CardDescription>Past deliveries and ratings.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Your delivered orders will appear here.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
