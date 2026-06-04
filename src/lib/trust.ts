// Supplier trust score — deepens the verified-fill pillar by combining star
// rating with how reliably the supplier's filled weights are confirmed (vs disputed).

export type TrustTone = "success" | "default" | "accent" | "destructive";

export type Trust = { score: number; label: string; tone: TrustTone };

export type TrustInput = {
  ratingAvg: number;
  ratingCount: number;
  confirmed: number; // orders where the student confirmed the weight
  disputed: number; // orders flagged as weight mismatch
};

export function computeTrust({ ratingAvg, ratingCount, confirmed, disputed }: TrustInput): Trust {
  // Neutral-good priors so brand-new suppliers aren't punished for having no data.
  const ratingPart = ratingCount > 0 ? ratingAvg / 5 : 0.85;
  const verified = confirmed + disputed;
  const fillPart = verified > 0 ? confirmed / verified : 0.9;

  const score = Math.round((ratingPart * 0.7 + fillPart * 0.3) * 100);

  let label: string;
  let tone: TrustTone;
  if (score >= 85) { label = "Excellent"; tone = "success"; }
  else if (score >= 70) { label = "Trusted"; tone = "default"; }
  else if (score >= 50) { label = "Fair"; tone = "accent"; }
  else { label = "Watch"; tone = "destructive"; }

  return { score, label, tone };
}
