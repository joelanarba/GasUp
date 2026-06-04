import Image from "next/image";
import { TrendingUp, Shield, Route, Star, ArrowRight } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";
import { Button } from "@/components/ui/button";

const benefits = [
  {
    Icon: TrendingUp,
    title: "Earn more per trip",
    body: "Pooled orders mean more drops per route. You deliver to 4-6 rooms in one hostel run instead of zigzagging campus.",
  },
  {
    Icon: Shield,
    title: "Build your reputation",
    body: "Your trust score — based on fill accuracy, ratings, and dispute history — is visible to every student. Top-rated suppliers get picked first.",
  },
  {
    Icon: Route,
    title: "Optimised routes",
    body: "We cluster orders by hostel block so you spend less on fuel and more time earning. Campus-only means shorter distances.",
  },
  {
    Icon: Star,
    title: "Transparent ratings",
    body: "Students rate every delivery. Consistent quality means more orders, higher visibility, and repeat customers.",
  },
];

export function SuppliersSection() {
  return (
    <section className="py-20 sm:py-28 bg-background">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — Image */}
          <ScrollReveal direction="left">
            <div className="relative overflow-hidden rounded-2xl shadow-elevated">
              <Image
                src="/images/campus-delivery.png"
                alt="Gas delivery rider on campus"
                width={600}
                height={450}
                className="h-auto w-full object-cover"
              />
              {/* Overlay badge */}
              <div className="absolute bottom-4 left-4 rounded-xl bg-white/90 backdrop-blur-sm px-4 py-3 shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Average rider earnings</p>
                <p className="font-display text-2xl font-bold text-primary">GHS 120<span className="text-sm font-normal text-muted-foreground">/day</span></p>
              </div>
            </div>
          </ScrollReveal>

          {/* Right — Content */}
          <div>
            <ScrollReveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                <TrendingUp className="h-3.5 w-3.5" />
                For suppliers
              </span>
              <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Grow your gas business on campus
              </h2>
              <p className="mt-3 max-w-md text-muted-foreground">
                Join the network of verified suppliers serving UCC students. More orders, optimised routes, and a trust system that rewards quality.
              </p>
            </ScrollReveal>

            <div className="mt-8 space-y-5">
              {benefits.map((b, i) => (
                <ScrollReveal key={b.title} delay={i * 80}>
                  <div className="flex gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10">
                      <b.Icon className="h-5 w-5 text-primary" />
                    </span>
                    <div>
                      <h3 className="font-display text-base font-semibold">{b.title}</h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">{b.body}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={400}>
              <Button asChild size="lg" className="mt-8">
                <a href="mailto:suppliers@gasup.app?subject=GasUp%20supplier%20partnership">
                  Partner with us <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <p className="mt-3 text-xs text-muted-foreground">
                Suppliers are onboarded by the GasUp team — reach out and we&apos;ll set up your account.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
