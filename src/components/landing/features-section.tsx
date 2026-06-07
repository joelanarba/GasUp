import Image from "next/image";
import { Gauge, ShieldCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  Icon: LucideIcon;
  image: string;
  title: string;
  body: string;
}

const features: Feature[] = [
  {
    Icon: Gauge,
    image: "/images/feature-predict.svg",
    title: "Predictive refill alerts",
    body: "We learn your burn rate from past orders and nudge you before the tank runs dry — \u20184 days left, refill now?\u2019 No more mid-week surprises.",
  },
  {
    Icon: ShieldCheck,
    image: "/images/feature-verify.svg",
    title: "Verified fill weight",
    body: "Every delivery comes with weighed-fill proof. Confirm the kg on arrival; any mismatch gets flagged instantly. Trust, not guesswork.",
  },
  {
    Icon: Users,
    image: "/images/feature-pool.svg",
    title: "Pooled hostel refills",
    body: "Orders from the same hostel bundle into one rider trip — you pay a lower delivery fee, the rider earns more per trip. Everyone wins.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-[#141413] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        {/* Section heading */}
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-amber-400/80">
            Why GasUp
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Built different, on purpose
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/50">
            Three features that separate GasUp from every other delivery app.
          </p>
        </div>

        {/* Cards grid */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-orange-900/10"
            >
              {/* Image area */}
              <div className="mb-6 flex w-full items-center justify-center overflow-hidden rounded-xl bg-white/[0.04] aspect-[4/3]">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  width={280}
                  height={210}
                  className="opacity-90 transition-all duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
                />
              </div>

              {/* Icon */}
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15">
                <feature.Icon className="h-5 w-5 text-primary" />
              </div>

              {/* Title */}
              <h3 className="mt-4 font-display text-xl font-semibold text-white">
                {feature.title}
              </h3>

              {/* Body */}
              <p className="mt-2 text-sm leading-relaxed text-white/50">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
