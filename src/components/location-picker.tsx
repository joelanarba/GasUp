"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, LocateFixed, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";

export type LatLng = { lat: number; lng: number };
const CAMPUS_CENTER = { lat: 5.1118, lng: -1.2917 };

const LocationMap = dynamic(() => import("./location-map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[300px] w-full animate-pulse place-items-center bg-muted text-sm text-muted-foreground">
      Loading map…
    </div>
  ),
});

export type LocationValue = { address: string; lat: number | null; lng: number | null };

type GeoState = "idle" | "locating" | "ok" | "denied" | "unsupported" | "error";

export function LocationPicker({
  value,
  onChange,
  autoLocate = true,
}: {
  value?: LocationValue;
  onChange: (v: LocationValue) => void;
  autoLocate?: boolean;
}) {
  const [address, setAddress] = useState(value?.address ?? "");
  const [pos, setPos] = useState<LatLng | null>(
    value?.lat && value?.lng ? { lat: value.lat, lng: value.lng } : null
  );
  const [geo, setGeo] = useState<GeoState>("idle");
  const [geocoding, setGeocoding] = useState(false);

  // Don't clobber an address the student typed/saved themselves. An explicit
  // "Use my location" click overrides this; passive pin drags respect it.
  const manuallyEdited = useRef<boolean>(!!value?.address);
  // Guard so a slow reverse-geocode response can't overwrite a newer one.
  const reqId = useRef(0);

  const center: [number, number] = pos
    ? [pos.lat, pos.lng]
    : [CAMPUS_CENTER.lat, CAMPUS_CENTER.lng];

  useEffect(() => {
    onChange({ address, lat: pos?.lat ?? null, lng: pos?.lng ?? null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, pos]);

  // Turn coordinates into a readable address and fill the field. `force` is set
  // for explicit "Use my location" clicks so they win over a stale typed value.
  async function reverseGeocode(lat: number, lng: number, force: boolean) {
    if (manuallyEdited.current && !force) return;
    const id = ++reqId.current;
    setGeocoding(true);
    try {
      const r = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
      const data = (await r.json().catch(() => ({}))) as { address?: string | null };
      if (id !== reqId.current) return; // a newer request superseded this one
      if (data.address && (force || !manuallyEdited.current)) {
        manuallyEdited.current = false;
        setAddress(data.address);
      }
    } catch {
      /* leave the field for manual entry */
    } finally {
      if (id === reqId.current) setGeocoding(false);
    }
  }

  function locate() {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setGeo("unsupported");
      return;
    }
    setGeo("locating");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const { latitude, longitude } = p.coords;
        setPos({ lat: latitude, lng: longitude });
        setGeo("ok");
        reverseGeocode(latitude, longitude, true);
      },
      (err) => setGeo(err.code === err.PERMISSION_DENIED ? "denied" : "error"),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 },
    );
  }

  function pick(lat: number, lng: number) {
    setPos({ lat, lng });
    reverseGeocode(lat, lng, false);
  }

  useEffect(() => {
    if (autoLocate && !pos) locate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-warm">
      <div className="relative">
        <LocationMap
          center={center}
          userPos={pos}
          onPick={pick}
        />
        <button
          type="button"
          onClick={locate}
          className="absolute right-3 top-3 z-[1000] inline-flex items-center gap-1.5 rounded-full border border-border bg-card/95 px-3.5 py-2 text-sm font-medium text-foreground shadow-warm backdrop-blur transition-colors hover:border-primary/50 hover:text-primary"
        >
          {geo === "locating" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LocateFixed className="h-4 w-4 text-primary" />
          )}
          {geo === "locating" ? "Locating…" : "Use my location"}
        </button>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <label htmlFor="lp-address" className="mb-1.5 block text-sm font-medium">
            Delivery address
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              id="lp-address"
              value={address}
              onChange={(e) => {
                manuallyEdited.current = true;
                setAddress(e.target.value);
              }}
              placeholder="e.g. Science Market, near the blue gate"
              className="pl-10 h-11"
            />
          </div>
          {geocoding ? (
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Finding your address…
            </p>
          ) : geo === "denied" ? (
            <p className="mt-2 text-xs text-destructive">
              Location is blocked for this site. Allow it in your browser and tap “Use my location” again — or just type your address below.
            </p>
          ) : geo === "unsupported" ? (
            <p className="mt-2 text-xs text-destructive">
              Your browser can’t share location — type your address below and drag the pin.
            </p>
          ) : geo === "error" ? (
            <p className="mt-2 text-xs text-destructive">
              Couldn’t get your location. Try “Use my location” again, or type your address below.
            </p>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              Tap “Use my location” to fill this automatically, then add a landmark. Drag the pin to mark your exact spot for the rider.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
