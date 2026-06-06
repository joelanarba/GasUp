import { RiderApplicationForm } from "@/components/rider-application-form";

export default function RiderRegisterPage() {
  return (
    <div className="reveal" style={{ animationDelay: "120ms" }}>
      <div className="mb-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Ride with GasUp
        </h1>
        <p className="mt-3 text-muted-foreground">
          Pick up empty cylinders, refill at your station, and earn on every delivery. Apply below —
          our team reviews and approves new riders within 24 hours.
        </p>
      </div>
      <RiderApplicationForm />
    </div>
  );
}
