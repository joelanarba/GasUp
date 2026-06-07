import Image from "next/image";
import { Leaf, Fuel, TreePine } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

interface StatCard {
  Icon: LucideIcon;
  title: string;
  body: string;
}

const stats: StatCard[] = [
  {
    Icon: Leaf,
    title: "Fewer trips",
    body: "Pooled orders cut delivery runs by 60%",
  },
  {
    Icon: Fuel,
    title: "Less fuel burned",
    body: "One trip serves 4-6 rooms in your hostel",
  },
  {
    Icon: TreePine,
    title: "Campus-first",
    body: "Local riders, shorter routes, lower footprint",
  },
];

export function CO2ImpactSection() {
  return (
    <section className="bg-[#FFF8F0] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        {/* Section heading */}
        <ScrollReveal>
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-primary">
              Environmental Impact
            </p>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-[#141413] sm:text-4xl">
              Better for your wallet. Better for the planet.
            </h2>
          </div>
        </ScrollReveal>

        {/* Two-column layout */}
        <div className="mt-16 grid items-center gap-12 lg:grid-cols-2">
          {/* ─── Left column — stats ─── */}
          <div>
            {/* Big number */}
            <ScrollReveal delay={100}>
              <div className="mb-10">
                <span className="font-display text-6xl font-bold tracking-tight text-primary sm:text-7xl">
                  340+ kg
                </span>
                <p className="mt-3 max-w-sm text-lg leading-relaxed text-[#141413]/60">
                  of carbon emissions saved through pooled campus deliveries
                </p>
              </div>
            </ScrollReveal>

            {/* Stat cards row */}
            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat, i) => (
                <ScrollReveal key={stat.title} delay={200 + i * 120}>
                  <div className="rounded-xl border border-[#141413]/[0.06] bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15">
                      <stat.Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mt-3 font-display text-sm font-semibold text-[#141413]">
                      {stat.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-[#141413]/50">
                      {stat.body}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          {/* ─── Right column — photo ─── */}
          <ScrollReveal direction="right" delay={200}>
            <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-orange-900/10">
              <Image
                src="/images/hostel-pooling.png"
                alt="Students pooling hostel gas deliveries on campus"
                width={800}
                height={600}
                className="h-auto w-full object-cover"
              />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
