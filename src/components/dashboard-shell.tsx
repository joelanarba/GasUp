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
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
          <Brand size="sm" />
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight">{firstName}</p>
              <p className="text-xs text-muted-foreground">{roleLabel[role]}</p>
            </div>
            <Badge variant="muted">{roleLabel[role]}</Badge>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-6">{children}</main>
    </div>
  );
}
