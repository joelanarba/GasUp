"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Variant = "student" | "rider" | "admin";

const copy: Record<Variant, { heading: string; sub: string }> = {
  student: { heading: "Welcome back", sub: "Sign in to track and refill your gas." },
  rider: { heading: "Rider sign in", sub: "Sign in to your GasUp rider dashboard." },
  admin: { heading: "Admin sign in", sub: "GasUp operations dashboard." },
};

function LoginForm() {
  const router = useRouter();
  const role = useSearchParams().get("role");
  const variant: Variant = role === "rider" ? "rider" : role === "admin" ? "admin" : "student";
  const { heading, sub } = copy[variant];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", { redirect: false, email, password });
    if (res?.error) {
      setError("Wrong email or password. Try again.");
      setLoading(false);
      return;
    }
    // Role-aware landing handled by /dashboard.
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="reveal" style={{ animationDelay: "120ms" }}>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {heading}
        </h1>
        <p className="mt-3 text-muted-foreground">{sub}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={variant === "admin" ? "admin@gasup.app" : "you@ucc.edu.gh"}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm font-medium text-destructive">
            {error}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Signing in…" : "Sign in"}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>

      {/* ─── Role-aware footer links (admins are invited, not self-served) ─── */}
      {variant === "student" && (
        <>
          <div className="mt-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">New to GasUp?</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link
              href="/register"
              className="font-semibold text-primary underline-offset-4 transition-colors hover:underline"
            >
              Create a student account
            </Link>
          </p>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            Are you a rider?{" "}
            <Link
              href="/register/rider"
              className="font-semibold text-foreground underline-offset-4 transition-colors hover:underline"
            >
              Apply to ride
            </Link>
          </p>
        </>
      )}

      {variant === "rider" && (
        <>
          <div className="mt-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">New rider?</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <Button asChild size="lg" variant="outline" className="mt-6 w-full">
            <Link href="/register/rider">Apply to ride</Link>
          </Button>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Looking to order gas?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary underline-offset-4 transition-colors hover:underline"
            >
              Student sign in
            </Link>
          </p>
        </>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
