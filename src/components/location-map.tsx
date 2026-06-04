"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type LatLng = { lat: number; lng: number };

// Custom pin icon
const pinIcon = () =>
  L.divIcon({
    className: "",
    html: `<div class="lp-pin-wrap"><span class="lp-ping"></span><div style="position:relative;display:grid;place-items:center;width:38px;height:38px;border-radius:9999px;background:linear-gradient(135deg,#F7A823,#E0521E 70%);box-shadow:0 10px 22px -8px rgba(224,82,30,.85);border:2.5px solid #fff"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

function Recenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.6 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center[0], center[1]]);
  return null;
}

function ClickCapture({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationMap({
  center,
  zoom = 16,
  userPos,
  onPick,
  interactive = true,
  height = 300,
}: {
  center: [number, number];
  zoom?: number;
  userPos: LatLng | null;
  onPick?: (lat: number, lng: number) => void;
  interactive?: boolean;
  height?: number;
}) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      dragging={interactive}
      doubleClickZoom={interactive}
      scrollWheelZoom={false}
      touchZoom={interactive}
      zoomControl={interactive}
      keyboard={interactive}
      style={{ height, width: "100%", borderRadius: 14, zIndex: 0 }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap"
      />
      <Recenter center={center} zoom={zoom} />
      {interactive && onPick && <ClickCapture onPick={onPick} />}

      {userPos && (
        <Marker
          position={[userPos.lat, userPos.lng]}
          icon={pinIcon()}
          draggable={interactive}
          zIndexOffset={2000}
          eventHandlers={{
            dragend: (e) => {
              if (!onPick) return;
              const p = (e.target as L.Marker).getLatLng();
              onPick(p.lat, p.lng);
            },
          }}
        />
      )}
    </MapContainer>
  );
}
