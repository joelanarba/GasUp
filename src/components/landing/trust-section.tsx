import Image from "next/image";
import { AlertTriangle, Scale, ShieldCheck, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

interface TrustPoint {
  Icon: LucideIcon;
  title: string;
  description: string;
}

const trustPoints: TrustPoint[] = [
  {
    Icon: Scale,
    title: "Weighed fill proof",
    description: "Digital scale reading shared before you accept",
  },
  {
    Icon: Star,
    title: "Rider trust scores",
    description:
      "Ratings, fill accuracy, and dispute history combined into one score",
  },
  {
    Icon: AlertTriangle,
    title: "Instant dispute resolution",
    description: "Flag a mismatch — admin reviews within 24 hours",
  },
];

export function TrustSection() {
  return (
    <section id="trust" className="bg-[#FFFBF5] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          {/* Left column — text content */}
          <ScrollReveal direction="left">
            <div>
              {/* Label */}
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-primary">
                  Trust &amp; Safety
                </p>
              </div>

              {/* Heading */}
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
                Every refill, verified.
              </h2>

              {/* Description */}
              <p className="mt-4 leading-relaxed text-neutral-500">
                We built GasUp around one principle: you should never wonder
                whether you got your full gas. Every delivery is weighed, every
                rider is scored, and every dispute is resolved.
              </p>

              {/* Trust points list */}
              <ul className="mt-8 space-y-6">
                {trustPoints.map((point) => (
                  <li key={point.title} className="flex gap-4">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10">
                      <point.Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-semibold text-neutral-900">
                        {point.title}
                      </h3>
                      <p className="mt-0.5 text-sm text-neutral-500">
                        {point.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          {/* Right column — image */}
          <ScrollReveal direction="right" delay={200}>
            <div className="flex items-center justify-center">
              <div className="overflow-hidden rounded-2xl border-2 border-amber-200/60">
                <Image
                  src="/images/weighing-scale.png"
                  alt="Cylinder being weighed on a digital scale"
                  width={500}
                  height={600}
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
