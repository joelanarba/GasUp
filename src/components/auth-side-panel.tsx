"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Brand } from "@/components/brand";

// Role-aware left panel for the auth pages. A layout can't read search params, so
// this client component reads ?role= itself (wrapped in <Suspense> by the layout).
// student/rider show an illustration + tagline; admin is a plain, serious dark panel.
const panels = {
  student: {
    showArt: true,
    tagline:
      "Predict your refill. Verify the weight. Pool with your hostel. Built for UCC students.",
  },
  rider: {
    showArt: true,
    tagline:
      "Pick up empties, refill at your station, and earn on every drop. Ride with GasUp.",
  },
  admin: {
    showArt: false,
    tagline: null,
  },
} as const;

export function AuthSidePanel() {
  const role = useSearchParams().get("role");
  const variant =
    role === "rider" ? panels.rider : role === "admin" ? panels.admin : panels.student;

  return (
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

      {variant.showArt && (
        <div className="relative z-10 flex flex-1 items-center justify-center px-10">
          <Image
            src="/images/auth-side.svg"
            alt=""
            width={380}
            height={420}
            className="opacity-90"
            style={{ animation: "float 8s ease-in-out infinite" }}
          />
        </div>
      )}

      {variant.tagline && (
        <div className="relative z-10 p-8">
          <p className="max-w-xs text-sm leading-relaxed text-white/40">{variant.tagline}</p>
        </div>
      )}
    </div>
  );
}
