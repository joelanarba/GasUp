// Shared geo helpers — used by pooling (proximity) and the rider dispatch board (distance).

export type LatLng = { lat: number; lng: number };

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance between two points, in metres (Haversine). */
export function distanceMeters(a: LatLng, b: LatLng): number {
  const R = 6_371_000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** Human-friendly distance for the dispatch board. */
export function formatDistance(meters: number): string {
  if (meters < 950) return `${Math.round(meters / 10) * 10} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}
