import Image from "next/image";
import Link from "next/link";
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
    body: "Your trust score — based on fill accuracy, ratings, and dispute history — is shown to every student you deliver to. Reliable riders earn more repeat orders.",
  },
  {
    Icon: Route,
    title: "Optimised routes",
    body: "We cluster nearby orders so you spend less on fuel and more time earning. Tight local routes mean shorter distances.",
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
                For riders
              </span>
              <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Earn on every delivery
              </h2>
              <p className="mt-3 max-w-md text-muted-foreground">
                Pick up empty cylinders, refill at your station, and bring them back full. Orders broadcast straight to your dispatch board — accept the ones near you and ride.
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
                <Link href="/register/rider">
                  Apply to ride <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <p className="mt-3 text-xs text-muted-foreground">
                Applications are reviewed within 24 hours. Approved riders get a login to start accepting orders.
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Already a rider?{" "}
                <Link
                  href="/login?role=rider"
                  className="font-semibold text-primary underline-offset-4 transition-colors hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
