import { Suspense } from "react";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { AuthSidePanel } from "@/components/auth-side-panel";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh">
      {/* ─── Left panel — role-aware branded illustration (hidden on mobile) ─── */}
      <Suspense fallback={<div className="hidden w-[45%] bg-[#141413] lg:block" />}>
        <AuthSidePanel />
      </Suspense>

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
