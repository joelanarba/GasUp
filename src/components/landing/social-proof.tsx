const metrics = [
  { value: "500+", label: "Refills delivered" },
  { value: "150+", label: "Active students" },
  { value: "4.8", label: "Average rating" },
  { value: "GHS 2k+", label: "Student savings" },
] as const;

export function SocialProof() {
  return (
    <section className="border-b border-border/50 bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-5 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Trusted by students across campus
        </p>

        {/* Metrics row */}
        <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-4">
          {metrics.map((m) => (
            <div key={m.label}>
              <p className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {m.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Campus label */}
        <div className="mt-10">
          <div className="mx-auto mb-4 h-px w-12 bg-border" />
          <p className="text-sm text-muted-foreground">
            Built for University of Cape Coast
          </p>
        </div>
      </div>
    </section>
  );
}
