import { RefreshCw, ShieldCheck, Fingerprint, Wallet, BarChart3 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

interface RoadmapItem {
  Icon: LucideIcon;
  title: string;
  body: string;
}

// Informational only — these are NOT built. Presented as future innovations so
// judges/investors see the vision beyond the MVP.
const roadmap: RoadmapItem[] = [
  {
    Icon: RefreshCw,
    title: "GasUp Auto",
    body: "Automatic refill ordering the moment we predict you're about to run out. Set it once and never chase gas again.",
  },
  {
    Icon: ShieldCheck,
    title: "Pay-on-Verified-Fill",
    body: "Your payment is held and released only after the delivered weight is verified — zero risk of underfilling.",
  },
  {
    Icon: Fingerprint,
    title: "Cylinder Identity Tracking",
    body: "Every cylinder gets a unique ID and full history — instant anti-swap protection and recall safety.",
  },
  {
    Icon: Wallet,
    title: "GasUp Wallet",
    body: "Top up once and pay for refills in a tap. A prepaid balance for faster checkout and easy household budgeting.",
  },
  {
    Icon: BarChart3,
    title: "Rider Intelligence Dashboard",
    body: "Demand forecasting and route insights that help riders stock smarter and deliver faster.",
  },
];

export function RoadmapSection() {
  return (
    <section id="roadmap" className="bg-[#141413] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        {/* Section heading */}
        <ScrollReveal>
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-amber-400/80">
              Phase 2 Innovations
            </p>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              What&apos;s next for GasUp
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/50">
              We&apos;re just getting started. Here&apos;s where GasUp goes next — each one building
              on prediction, trust, and pooling.
            </p>
          </div>
        </ScrollReveal>

        {/* Cards grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {roadmap.map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 90}>
              <div className="group relative h-full rounded-2xl border border-white/[0.06] bg-white/[0.03] p-7 transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.06]">
                {/* Coming-soon pill — makes the roadmap status unmistakable */}
                <span className="absolute right-5 top-5 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                  Coming soon
                </span>

                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15">
                  <item.Icon className="h-5 w-5 text-primary" />
                </div>

                <h3 className="mt-5 font-display text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{item.body}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={120}>
          <p className="mt-12 text-center text-xs text-white/35">
            Roadmap items are in development and not yet available.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
