"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Simulated tracking — the only mocked piece (real fleet GPS needs devices). When an
// OpenRouteService key is present we animate the rider along the ACTUAL road geometry;
// otherwise we gracefully fall back to a straight depot→hostel line. It never crashes.
const STATION = { lat: 5.118, lng: -1.286 }; // UCC-area LPG depot
const ORS_KEY = process.env.NEXT_PUBLIC_ORS_API_KEY;
const AVG_SPEED_KMH = 25; // realistic campus delivery speed for the ETA estimate
const TRAVERSE_MS = 24_000; // wall-clock time for the marker to cover the whole route (watchable)
const TICK_MS = 90;
const ARRIVE_HOLD_TICKS = 12; // ~1s "Arriving now" pause before the loop restarts

type LatLng = [number, number];

function pin(emoji: string, ring: string) {
  return L.divIcon({
    className: "",
    html: `<div style="display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:#fff;box-shadow:0 4px 10px rgba(0,0,0,.25);border:2px solid ${ring};font-size:16px">${emoji}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

// Equirectangular distance (m) — accurate enough at campus scale and cheap.
function segMeters(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const lat = ((a[0] + b[0]) / 2) * (Math.PI / 180);
  const dLat = (b[0] - a[0]) * (Math.PI / 180);
  const dLng = (b[1] - a[1]) * (Math.PI / 180) * Math.cos(lat);
  return Math.hypot(dLat, dLng) * R;
}

// Position at fraction p (0..1) of the polyline's total length, interpolating WITHIN the
// segment so the marker eases smoothly between road coordinates instead of jumping.
function pointAt(path: LatLng[], cum: number[], total: number, p: number): LatLng {
  if (path.length < 2 || total === 0) return path[0];
  const target = Math.min(Math.max(p, 0), 1) * total;
  let i = 0;
  while (i < cum.length - 2 && cum[i + 1] < target) i++;
  const a = path[i];
  const b = path[i + 1];
  const span = cum[i + 1] - cum[i];
  const f = span > 0 ? (target - cum[i]) / span : 0;
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}

// Re-fit the map to the whole route whenever it changes (straight → road).
function FitRoute({ route }: { route: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    if (route.length >= 2) {
      map.fitBounds(route as L.LatLngBoundsExpression, { padding: [28, 28], maxZoom: 16 });
    }
  }, [route, map]);
  return null;
}

export default function DeliveryMap({ destLat, destLng }: { destLat: number; destLng: number }) {
  const straight = useMemo<LatLng[]>(
    () => [
      [STATION.lat, STATION.lng],
      [destLat, destLng],
    ],
    [destLat, destLng],
  );
  const [route, setRoute] = useState<LatLng[]>(straight);
  const [p, setP] = useState(0);
  const holdRef = useRef(0);

  // Fetch the real road geometry once per destination; reset to the straight fallback first.
  // Any failure (no key, rate-limit, CORS, bad shape) leaves the fallback in place — never throws.
  useEffect(() => {
    setRoute(straight);
    if (!ORS_KEY) return;
    let cancelled = false;
    (async () => {
      try {
        const [, end] = straight; // end = [destLat, destLng]
        const url =
          `https://api.openrouteservice.org/v2/directions/driving-car` +
          `?api_key=${ORS_KEY}&start=${STATION.lng},${STATION.lat}&end=${end[1]},${end[0]}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`ORS ${res.status}`);
        const data = await res.json();
        const coords: unknown = data?.features?.[0]?.geometry?.coordinates;
        if (Array.isArray(coords) && coords.length > 1 && !cancelled) {
          // ORS returns [lng, lat]; Leaflet wants [lat, lng].
          setRoute(coords.map((c: number[]) => [c[1], c[0]] as LatLng));
        }
      } catch {
        // graceful degradation — the straight-line route already in state stays.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [straight]);

  // Cumulative segment lengths + total, recomputed when the route changes.
  const { cum, total } = useMemo(() => {
    const c: number[] = [0];
    for (let i = 1; i < route.length; i++) c.push(c[i - 1] + segMeters(route[i - 1], route[i]));
    return { cum: c, total: c[c.length - 1] ?? 0 };
  }, [route]);

  // Animate progress 0→1, hold briefly at arrival, then loop.
  useEffect(() => {
    const step = TICK_MS / TRAVERSE_MS;
    const id = window.setInterval(() => {
      setP((prev) => {
        if (prev >= 1) {
          holdRef.current += 1;
          if (holdRef.current > ARRIVE_HOLD_TICKS) {
            holdRef.current = 0;
            return 0;
          }
          return 1;
        }
        return Math.min(1, prev + step);
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  const pos = pointAt(route, cum, total, p);
  const totalMin = (total / 1000 / AVG_SPEED_KMH) * 60;
  const remainMin = totalMin * (1 - p);
  const eta = p >= 1 ? "Arriving now" : `≈ ${Math.max(1, Math.ceil(remainMin))} min away`;
  const center: [number, number] = [(STATION.lat + destLat) / 2, (STATION.lng + destLng) / 2];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between rounded-lg bg-primary/[0.08] px-3 py-2">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          {eta}
        </span>
        <span className="text-xs text-muted-foreground">Rider en route</span>
      </div>
      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: 280, width: "100%", borderRadius: 12 }}
      >
        <FitRoute route={route} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />
        <Polyline positions={route} pathOptions={{ color: "#E0521E", dashArray: "6 8", weight: 3 }} />
        <Marker position={[STATION.lat, STATION.lng]} icon={pin("⛽", "#A8A29E")}>
          <Popup>Gas depot</Popup>
        </Marker>
        <Marker position={[destLat, destLng]} icon={pin("🏠", "#16a34a")}>
          <Popup>Your hostel</Popup>
        </Marker>
        <Marker position={pos} icon={pin("🛵", "#E0521E")}>
          <Popup>Your rider</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
