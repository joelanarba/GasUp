"use client";

import dynamic from "next/dynamic";

// Leaflet touches `window`, so load the map only on the client.
const DeliveryMap = dynamic(() => import("./delivery-map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[280px] w-full animate-pulse place-items-center rounded-xl bg-muted text-sm text-muted-foreground">
      Loading map…
    </div>
  ),
});

export function DeliveryTracker({ lat, lng }: { lat: number; lng: number }) {
  return <DeliveryMap destLat={lat} destLng={lng} />;
}
