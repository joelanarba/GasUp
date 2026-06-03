import { type OrderStatus, type Role } from "@prisma/client";

export type OrderAction =
  | "accept"
  | "reject"
  | "verify"
  | "confirm"
  | "dispute"
  | "advance"
  | "cancel"
  | "complete";

type BadgeTone = "default" | "accent" | "muted" | "success" | "outline" | "destructive";

export const STATUS_META: Record<OrderStatus, { label: string; tone: BadgeTone; description: string }> = {
  PENDING: { label: "Pending", tone: "muted", description: "Waiting for the supplier to accept." },
  ACCEPTED: { label: "Accepted", tone: "default", description: "Supplier accepted — preparing your refill." },
  VERIFYING: { label: "Verifying fill", tone: "accent", description: "Confirm the filled weight matches." },
  ON_THE_WAY: { label: "On the way", tone: "accent", description: "Your rider is en route." },
  DELIVERED: { label: "Delivered", tone: "success", description: "Dropped off — confirm to close it out." },
  COMPLETED: { label: "Completed", tone: "success", description: "All done. Thanks!" },
  CANCELLED: { label: "Cancelled", tone: "destructive", description: "This order was cancelled." },
  DISPUTED: { label: "Disputed", tone: "destructive", description: "A weight mismatch was flagged." },
};

// Happy-path progress steps for the timeline UI.
export const ORDER_TIMELINE: OrderStatus[] = [
  "PENDING",
  "ACCEPTED",
  "VERIFYING",
  "ON_THE_WAY",
  "DELIVERED",
  "COMPLETED",
];

type TransitionResult =
  | { ok: true; toStatus: OrderStatus }
  | { ok: false; error: string };

/** Single source of truth for who may move an order where. */
export function transition(
  current: OrderStatus,
  action: OrderAction,
  role: Role,
): TransitionResult {
  const deny = (msg = "That action isn't allowed right now."): TransitionResult => ({
    ok: false,
    error: msg,
  });

  switch (action) {
    case "accept":
      if (role !== "SUPPLIER") return deny();
      return current === "PENDING" ? { ok: true, toStatus: "ACCEPTED" } : deny();
    case "reject":
      if (role !== "SUPPLIER") return deny();
      return current === "PENDING" ? { ok: true, toStatus: "CANCELLED" } : deny();
    case "verify":
      // Supplier submits the filled weight + proof — trust gate.
      if (role !== "SUPPLIER") return deny();
      return current === "ACCEPTED" ? { ok: true, toStatus: "VERIFYING" } : deny();
    case "confirm":
      if (role !== "STUDENT") return deny();
      return current === "VERIFYING" ? { ok: true, toStatus: "ON_THE_WAY" } : deny();
    case "dispute":
      if (role !== "STUDENT") return deny();
      return current === "VERIFYING" ? { ok: true, toStatus: "DISPUTED" } : deny();
    case "advance":
      if (role !== "SUPPLIER") return deny();
      if (current === "ON_THE_WAY") return { ok: true, toStatus: "DELIVERED" };
      return deny();
    case "cancel":
      if (role !== "STUDENT") return deny();
      return current === "PENDING" || current === "ACCEPTED"
        ? { ok: true, toStatus: "CANCELLED" }
        : deny();
    case "complete":
      if (role !== "STUDENT") return deny();
      return current === "DELIVERED" ? { ok: true, toStatus: "COMPLETED" } : deny();
    default:
      return deny();
  }
}

/** Actions to surface as buttons for a given role + status. */
export function availableActions(
  role: Role,
  status: OrderStatus,
): { action: OrderAction; label: string; variant: "default" | "outline" | "destructive" }[] {
  if (role === "SUPPLIER") {
    if (status === "PENDING")
      return [
        { action: "accept", label: "Accept", variant: "default" },
        { action: "reject", label: "Decline", variant: "outline" },
      ];
    // ACCEPTED → handled by the verify-fill form (needs weight + photo), not a plain button.
    if (status === "ON_THE_WAY")
      return [{ action: "advance", label: "Mark delivered", variant: "default" }];
  }
  if (role === "STUDENT") {
    if (status === "PENDING" || status === "ACCEPTED")
      return [{ action: "cancel", label: "Cancel order", variant: "outline" }];
    if (status === "VERIFYING")
      return [
        { action: "confirm", label: "Weight matches — confirm", variant: "default" },
        { action: "dispute", label: "Report mismatch", variant: "destructive" },
      ];
    if (status === "DELIVERED")
      return [{ action: "complete", label: "Confirm received", variant: "default" }];
  }
  return [];
}
