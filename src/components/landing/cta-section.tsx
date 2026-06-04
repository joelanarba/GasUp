import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-[#141413] py-20 sm:py-28">
      {/* Background glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, hsl(15 82% 49% / 0.08), transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-2xl px-5 text-center">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Ready to never worry about gas&nbsp;again?
        </h2>

        <p className="mt-4 text-lg text-white/50">
          Join hundreds of UCC students who refill smarter, cheaper, and with
          zero stress.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className="flame-gradient inline-flex items-center gap-2 rounded-full px-8 py-3.5 font-semibold text-white shadow-lg shadow-orange-900/25 transition-all hover:scale-[1.02] hover:shadow-orange-900/40 active:scale-[0.98]"
          >
            Create free account
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/login"
            className="rounded-full border border-white/20 px-8 py-3.5 text-white/70 transition-all hover:border-white/40 hover:text-white"
          >
            I already have an account
          </Link>
        </div>
      </div>
    </section>
  );
}
