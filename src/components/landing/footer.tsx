import Link from "next/link";
import { Brand } from "@/components/brand";

const productLinks: { label: string; href: string; isAnchor: boolean; disabled?: boolean }[] = [
  { label: "How it works", href: "#how-it-works", isAnchor: true },
  { label: "Features", href: "#features", isAnchor: true },
  { label: "Pricing", href: "#", isAnchor: true, disabled: true },
];

const accountLinks = [
  { label: "Sign in", href: "/login" },
  { label: "Create account", href: "/register" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background py-12">
      <div className="mx-auto max-w-5xl px-5">
        {/* Top row */}
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row">
          {/* Left */}
          <div>
            <Brand size="sm" />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Campus LPG delivery that predicts, verifies, and pools — built for
              University of Cape Coast.
            </p>
          </div>

          {/* Right — link columns */}
          <div className="grid grid-cols-2 gap-x-16 gap-y-4">
            {/* Product */}
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Product
              </p>
              <ul className="space-y-2.5">
                {productLinks.map((link) =>
                  link.disabled ? (
                    <li key={link.label}>
                      <span className="text-sm text-muted-foreground/50 cursor-default">
                        {link.label}
                      </span>
                    </li>
                  ) : (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Account */}
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Account
              </p>
              <ul className="space-y-2.5">
                {accountLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom divider */}
        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-border/40 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            University of Cape Coast · Entrepreneurship Project · 2024
          </p>
          <p className="text-xs text-muted-foreground">GasUp</p>
        </div>
      </div>
    </footer>
  );
}
