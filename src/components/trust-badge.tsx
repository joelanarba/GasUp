import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type Trust } from "@/lib/trust";

export function TrustBadge({ trust }: { trust: Trust }) {
  return (
    <Badge variant={trust.tone}>
      <ShieldCheck className="h-3 w-3" /> {trust.score} · {trust.label}
    </Badge>
  );
}
