import Link from "next/link";
import { Brand } from "@/components/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-5 py-8">
      <header className="reveal">
        <Link href="/" aria-label="GasUp home">
          <Brand />
        </Link>
      </header>
      <div className="flex flex-1 flex-col justify-center py-8">{children}</div>
      <footer className="text-center text-xs text-muted-foreground">
        University of Cape Coast · GasUp
      </footer>
    </main>
  );
}
