import { type Role } from "@prisma/client";
import { Brand } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { SignOutButton } from "@/components/sign-out-button";

const roleLabel: Record<Role, string> = {
  STUDENT: "Student",
  SUPPLIER: "Supplier",
  ADMIN: "Admin",
};

export function DashboardShell({
  role,
  name,
  children,
}: {
  role: Role;
  name: string;
  children: React.ReactNode;
}) {
  const firstName = name.split(" ")[0] ?? name;
  const initial = firstName.charAt(0).toUpperCase();
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-3">
          <Brand size="sm" />
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight">{firstName}</p>
              <p className="text-xs text-muted-foreground">{roleLabel[role]}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {initial}
            </div>
            <Badge variant="muted" className="hidden sm:inline-flex">{roleLabel[role]}</Badge>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-5 py-8">{children}</main>
    </div>
  );
}
