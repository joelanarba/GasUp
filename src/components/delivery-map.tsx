"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Simulated tracking — the only mocked piece (real fleet GPS needs devices).
// A rider marker eases back and forth between the depot and the hostel.
const STATION = { lat: 5.118, lng: -1.286 }; // UCC-area LPG depot

function pin(emoji: string, ring: string) {
  return L.divIcon({
    className: "",
    html: `<div style="display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:#fff;box-shadow:0 4px 10px rgba(0,0,0,.25);border:2px solid ${ring};font-size:16px">${emoji}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

export default function DeliveryMap({ destLat, destLng }: { destLat: number; destLng: number }) {
  const dest = { lat: destLat, lng: destLng };
  const [t, setT] = useState(0);

  useEffect(() => {
    let raf = 0;
    let dir = 1;
    let p = 0;
    const tick = () => {
      p += dir * 0.012;
      if (p >= 1) { p = 1; dir = -1; }
      if (p <= 0) { p = 0; dir = 1; }
      setT(p);
      raf = window.setTimeout(tick, 90) as unknown as number;
    };
    tick();
    return () => clearTimeout(raf);
  }, []);

  const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const pos: [number, number] = [
    STATION.lat + (dest.lat - STATION.lat) * ease,
    STATION.lng + (dest.lng - STATION.lng) * ease,
  ];
  const center: [number, number] = [(STATION.lat + dest.lat) / 2, (STATION.lng + dest.lng) / 2];

  return (
    <MapContainer
      center={center}
      zoom={15}
      scrollWheelZoom={false}
      style={{ height: 280, width: "100%", borderRadius: 12 }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap'
      />
      <Polyline positions={[[STATION.lat, STATION.lng], [dest.lat, dest.lng]]} pathOptions={{ color: "#E0521E", dashArray: "6 8", weight: 3 }} />
      <Marker position={[STATION.lat, STATION.lng]} icon={pin("⛽", "#A8A29E")}>
        <Popup>Gas depot</Popup>
      </Marker>
      <Marker position={[dest.lat, dest.lng]} icon={pin("🏠", "#16a34a")}>
        <Popup>Your hostel</Popup>
      </Marker>
      <Marker position={pos} icon={pin("🛵", "#E0521E")}>
        <Popup>Your rider</Popup>
      </Marker>
    </MapContainer>
  );
}
