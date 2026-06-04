"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Brand } from "@/components/brand";

const navLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "About", href: "#about" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll(); // check initial position
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const linkColor = scrolled
    ? "text-foreground/70 hover:text-foreground"
    : "text-white/80 hover:text-white";

  return (
    <>
      <nav
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-background/90 backdrop-blur-xl border-b border-border/50 shadow-sm"
            : "bg-transparent border-b border-transparent"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8 py-3.5">
          {/* Brand */}
          <Link href="/" className="relative z-10">
            <Brand size="sm" inverted={!scrolled} />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn("text-sm font-medium transition-colors", linkColor)}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className={cn("text-sm font-medium transition-colors", linkColor)}
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="flame-gradient text-white text-sm font-semibold rounded-full px-6 py-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-900/20 hover:shadow-orange-900/35"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={cn(
              "md:hidden relative z-10 p-2 -mr-2 transition-colors",
              mobileOpen
                ? "text-foreground"
                : scrolled
                  ? "text-foreground"
                  : "text-white"
            )}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-background/98 backdrop-blur-xl transition-all duration-300",
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      >
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className="text-2xl font-display font-semibold text-foreground/80 hover:text-foreground transition-colors"
          >
            {link.label}
          </a>
        ))}

        <div className="flex flex-col items-center gap-4 mt-4">
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="text-lg text-foreground/70 hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            onClick={() => setMobileOpen(false)}
            className="flame-gradient text-white font-semibold rounded-full px-8 py-3.5 text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-900/25"
          >
            Get Started
          </Link>
        </div>
      </div>
    </>
  );
}
