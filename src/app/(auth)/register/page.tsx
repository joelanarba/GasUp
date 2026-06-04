import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { dashboardFor } from "@/lib/roles";
import { RegisterForm } from "@/components/register-form";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect(dashboardFor(session.user.role));

  return (
    <div className="reveal" style={{ animationDelay: "120ms" }}>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Create your account
        </h1>
        <p className="mt-3 text-muted-foreground">
          Students only — set up in under a minute and start tracking your gas.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
