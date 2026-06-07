import Image from "next/image";
import { MapPin, Clock, Shield, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

interface FeaturePoint {
  Icon: LucideIcon;
  title: string;
  body: string;
}

const features: FeaturePoint[] = [
  {
    Icon: MapPin,
    title: "Every hostel covered",
    body: "Amamoma, Apewosika, Kwaprow, Science — all covered.",
  },
  {
    Icon: Clock,
    title: "30-min average delivery",
    body: "Campus-only routes mean faster drops.",
  },
  {
    Icon: Shield,
    title: "Student-verified riders",
    body: "Every rider rated and trust-scored by students.",
  },
  {
    Icon: Users,
    title: "Community-first",
    body: "Built by UCC students, for UCC students.",
  },
];

export function CampusSection() {
  return (
    <section className="relative bg-[#141413] py-20 sm:py-28 overflow-hidden">
      {/* Grid dot texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden="true"
      />

      {/* Warm radial glow — bottom-right */}
      <div
        className="absolute -bottom-32 -right-32 w-[36rem] h-[36rem]"
        style={{
          background:
            "radial-gradient(circle, hsl(38 92% 50% / 0.08), transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-5">
        {/* Section heading */}
        <ScrollReveal>
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-amber-400/80">
              Campus Delivery
            </p>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Built for University of Cape Coast
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/50">
              From Amamoma to Kwaprow — we deliver to every private hostel
              in the communities around campus.
            </p>
          </div>
        </ScrollReveal>

        {/* Two-column layout */}
        <div className="mt-16 grid items-center gap-12 lg:grid-cols-2">
          {/* ─── Left column — campus photo ─── */}
          <ScrollReveal direction="left" delay={100}>
            <div className="relative overflow-hidden rounded-2xl">
              <Image
                src="/images/ucc-campus.png"
                alt="University of Cape Coast campus"
                width={800}
                height={500}
                className="h-auto w-full object-cover"
              />
            </div>
          </ScrollReveal>

          {/* ─── Right column — feature points ─── */}
          <div className="flex flex-col gap-6">
            {features.map((feature, i) => (
              <ScrollReveal key={feature.title} delay={200 + i * 120}>
                <div className="flex items-start gap-4">
                  {/* Icon container */}
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/15">
                    <feature.Icon className="h-5 w-5 text-primary" />
                  </div>

                  {/* Text */}
                  <div>
                    <h3 className="font-display text-lg font-semibold text-white">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-white/60">
                      {feature.body}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
