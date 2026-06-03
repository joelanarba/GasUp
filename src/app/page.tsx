import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Gauge, ShieldCheck, Users, ArrowRight } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { dashboardFor } from "@/lib/roles";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Gauge,
    title: "Predictive refill",
    body: "We learn your burn rate and nudge you — “≈4 days left” — before the cylinder runs dry mid-week.",
  },
  {
    icon: ShieldCheck,
    title: "Verified fill",
    body: "Every delivery comes with a weighed-fill photo. Confirm the kg on arrival; mismatches get flagged.",
  },
  {
    icon: Users,
    title: "Pooled refills",
    body: "Orders from the same hostel block bundle into one rider trip — you pay less, the rider earns more.",
  },
];

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect(dashboardFor(session.user.role));

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-10 pt-6 sm:max-w-2xl">
      <header className="flex items-center justify-between reveal" style={{ animationDelay: "0ms" }}>
        <Brand />
        <Button asChild variant="ghost" size="sm">
          <Link href="/login">Sign in</Link>
        </Button>
      </header>

      <section className="mt-14 sm:mt-20">
        <p
          className="reveal text-sm font-semibold uppercase tracking-[0.2em] text-primary"
          style={{ animationDelay: "80ms" }}
        >
          Campus gas, sorted
        </p>
        <h1
          className="reveal mt-4 font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl"
          style={{ animationDelay: "160ms" }}
        >
          Never run out of <span className="flame-text">gas</span> again.
        </h1>
        <p
          className="reveal mt-5 max-w-prose text-lg leading-relaxed text-muted-foreground"
          style={{ animationDelay: "240ms" }}
        >
          GasUp predicts when your cylinder will run low, proves the weight you paid for,
          and pools hostel orders so a refill costs less. Built for UCC.
        </p>

        <div
          className="reveal mt-8 flex flex-col gap-3 sm:flex-row"
          style={{ animationDelay: "320ms" }}
        >
          <Button asChild size="lg">
            <Link href="/register">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">I already have an account</Link>
          </Button>
        </div>
      </section>

      <section className="mt-16 grid gap-4 sm:mt-20 sm:grid-cols-3">
        {features.map((f, i) => (
          <div
            key={f.title}
            className="reveal rounded-lg border border-border/70 bg-card/70 p-5 shadow-warm backdrop-blur-sm"
            style={{ animationDelay: `${400 + i * 90}ms` }}
          >
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/12 text-primary">
              <f.icon className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold">{f.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </section>

      <footer className="mt-auto pt-16 text-center text-xs text-muted-foreground">
        University of Cape Coast · GasUp
      </footer>
    </main>
  );
}
