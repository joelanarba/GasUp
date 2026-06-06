import { ShoppingBag, ShieldCheck, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Step {
  number: number;
  Icon: LucideIcon;
  title: string;
  body: string;
}

const steps: Step[] = [
  {
    number: 1,
    Icon: ShoppingBag,
    title: "Order your refill",
    body: "Pick a cylinder size or a custom cash amount, drop your location, and pay online or on delivery.",
  },
  {
    number: 2,
    Icon: ShieldCheck,
    title: "A rider accepts & verifies",
    body: "Your order broadcasts to nearby riders. The first to accept takes your empty cylinder to a station, refills it, and uploads the weight — you confirm it matches on delivery.",
  },
  {
    number: 3,
    Icon: Truck,
    title: "Track to your door",
    body: "Follow your rider in real time. Nearby orders pool automatically so you pay less per refill.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-5">
        {/* Section heading */}
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-primary">
            How It Works
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Three steps to a refill
          </h2>
        </div>

        {/* Steps */}
        <div className="relative mt-16 grid gap-8 md:grid-cols-3 md:gap-4">
          {/* Connecting line (desktop only) */}
          <div
            className="absolute left-0 right-0 top-7 z-0 hidden md:block"
            aria-hidden="true"
          >
            <div className="mx-auto h-px w-[calc(100%-8rem)] bg-border/60" />
          </div>

          {steps.map((step) => (
            <div
              key={step.number}
              className="relative z-10 flex flex-col items-center text-center md:px-4"
            >
              {/* Numbered circle */}
              <div className="flame-gradient grid h-14 w-14 place-items-center rounded-full font-display text-xl font-semibold text-white shadow-lg shadow-orange-900/20">
                {step.number}
              </div>

              {/* Icon */}
              <step.Icon className="mt-6 h-8 w-8 text-primary/70" />

              {/* Title */}
              <h3 className="mt-4 font-display text-xl font-semibold">
                {step.title}
              </h3>

              {/* Body */}
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
