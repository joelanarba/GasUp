"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

interface FaqItem {
  q: string;
  a: string;
}

const faqs: FaqItem[] = [
  {
    q: "How does GasUp predict when I need a refill?",
    a: "We track your past orders — delivery dates, cylinder size, and household size — to estimate your daily gas burn rate. Once we have at least two deliveries, we project when you'll run low and send a nudge before it happens.",
  },
  {
    q: "Is my gas really weighed on delivery?",
    a: "Yes. Every rider carries a digital scale and records the fill weight before handover. You see the reading in the app and confirm it matches. If it doesn't, you flag a dispute right there — no calls, no back-and-forth.",
  },
  {
    q: "What is a pooled refill?",
    a: "When multiple students in the same hostel — or close by — order around the same time, we bundle those orders into a single rider trip. Everyone pays a lower delivery fee because the rider covers one route instead of three. You'll see a 'Pooled' badge on your order if it qualifies.",
  },
  {
    q: "Which hostels does GasUp deliver to?",
    a: "We cover the private student hostels in the communities around UCC — Amamoma, Apewosika, Kwaprow, Science, and Kokoado — places like Hamglor, Ewusiwa, Topp, NEST and Golden Royal Palace. Staying local keeps routes short and delivery times fast.",
  },
  {
    q: "Do I choose my rider?",
    a: "No — when you place an order it's broadcast to all available riders near you, and the first to accept brings your gas. You just place it and track. That means faster pickups and no waiting on one specific person to be free.",
  },
  {
    q: "How do I pay for my refill?",
    a: "Two ways: pay online with mobile money (MTN MoMo, Vodafone Cash, AirtelTigo Money) or card through Paystack, or choose pay-on-delivery and settle in cash when your rider arrives. Either way the receipt sits in your order history.",
  },
  {
    q: "What if the delivered gas weighs less than I ordered?",
    a: "You flag a dispute in one tap. The order goes to 'Disputed' status and the admin team reviews it within 24 hours. The rider's trust score is updated accordingly.",
  },
  {
    q: "How are riders rated?",
    a: "After each delivery, you rate the rider on a 5-star scale. We also factor in their fill-weight accuracy and dispute history into a single trust score — ranked Excellent, Trusted, Fair, or Watch — so the most reliable riders build a strong reputation.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-20 sm:py-28 bg-background">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <ScrollReveal>
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              <HelpCircle className="h-3.5 w-3.5" />
              FAQ
            </span>
            <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Common questions
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Everything you need to know about ordering, delivery, and trust on GasUp.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <ScrollReveal key={i} delay={i * 60}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="group w-full rounded-xl border border-border/60 bg-card px-6 py-5 text-left shadow-elevated transition-all duration-300 hover:border-primary/30 hover:shadow-glow-sm"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-display text-base font-semibold sm:text-lg">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </div>
                  <div
                    className={`grid transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isOpen ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </button>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
