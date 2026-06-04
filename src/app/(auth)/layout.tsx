import Link from "next/link";
import Image from "next/image";
import { Brand } from "@/components/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh">
      {/* ─── Left panel — branded illustration (hidden on mobile) ─── */}
      <div className="relative hidden w-[45%] overflow-hidden bg-[#141413] lg:flex lg:flex-col lg:justify-between">
        {/* Grid dots */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
          aria-hidden="true"
        />
        {/* Warm glow */}
        <div
          className="absolute -bottom-32 -left-32 h-[30rem] w-[30rem]"
          style={{
            background: "radial-gradient(circle, hsl(15 82% 49% / 0.15), transparent 70%)",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 p-8">
          <Link href="/" aria-label="GasUp home">
            <Brand inverted />
          </Link>
        </div>

        <div className="relative z-10 flex flex-1 items-center justify-center px-10">
          <Image
            src="/images/auth-side.svg"
            alt="Student with gas cylinder"
            width={380}
            height={420}
            className="opacity-90"
            style={{ animation: "float 8s ease-in-out infinite" }}
          />
        </div>

        <div className="relative z-10 p-8">
          <p className="max-w-xs text-sm leading-relaxed text-white/40">
            Predict your refill. Verify the weight. Pool with your hostel. Built for UCC students.
          </p>
        </div>
      </div>

      {/* ─── Right panel — form ─── */}
      <div className="flex flex-1 flex-col">
        {/* Mobile-only header */}
        <header className="p-5 lg:hidden">
          <Link href="/" aria-label="GasUp home">
            <Brand />
          </Link>
        </header>

        <div className="flex flex-1 flex-col justify-center px-5 py-8 sm:px-10 lg:px-16 xl:px-24">
          <div className="mx-auto w-full max-w-md">
            {children}
          </div>
        </div>

        <footer className="px-5 py-4 text-center text-xs text-muted-foreground lg:text-left lg:px-16">
          University of Cape Coast · GasUp
        </footer>
      </div>
    </main>
  );
}
