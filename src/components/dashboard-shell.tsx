import { type Role } from "@prisma/client";
import { Brand } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { SignOutButton } from "@/components/sign-out-button";
import { SupportLink } from "@/components/support-button";

const roleLabel: Record<Role, string> = {
  STUDENT: "Student",
  SUPPLIER: "Rider",
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
  // Sign-out lands on the role-appropriate login variant (students go to the landing).
  const signOutTo =
    role === "ADMIN" ? "/login?role=admin" : role === "SUPPLIER" ? "/login?role=rider" : "/";
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
            <SupportLink />
            <SignOutButton callbackUrl={signOutTo} />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-5 py-8">{children}</main>
    </div>
  );
}
