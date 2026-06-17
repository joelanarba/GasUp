import { MessageCircle } from "lucide-react";

// Placeholder support line — the team replaces this with the real GasUp WhatsApp number.
const SUPPORT_NUMBER = "233200000000";

function waLink(orderId?: string) {
  const text = orderId
    ? `Hi GasUp Support, I need help with order ${orderId}`
    : "Hi GasUp Support, I need help with my order";
  return `https://wa.me/${SUPPORT_NUMBER}?text=${encodeURIComponent(text)}`;
}

/**
 * Floating WhatsApp support bubble, fixed bottom-right. Pass `orderId` to pre-fill the
 * message with the order reference. A plain anchor — opens WhatsApp natively, no JS needed.
 */
export function SupportButton({ orderId }: { orderId?: string }) {
  return (
    <a
      href={waLink(orderId)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with GasUp support on WhatsApp"
      className="pulse-glow flame-gradient fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full text-white shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}

/** Compact header link to the same WhatsApp support thread — reachable from every page. */
export function SupportLink() {
  return (
    <a
      href={waLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with GasUp support on WhatsApp"
      className="inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <MessageCircle className="h-4 w-4" />
      <span className="hidden sm:inline">Chat Support</span>
    </a>
  );
}
