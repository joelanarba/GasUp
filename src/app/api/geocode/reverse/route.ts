import { NextResponse } from "next/server";

// Reverse-geocode lat/lng → a short, human-readable address using OpenStreetMap
// Nominatim (same provider as our map tiles, free, no key). Proxied server-side so
// we can send a policy-compliant User-Agent and degrade gracefully: any failure
// returns { address: null } so the order flow falls back to manual entry, never crashes.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  const url =
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
    `&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const r = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      headers: {
        // Nominatim usage policy requires an identifying UA with contact/app URL.
        "User-Agent": "GasUp/1.0 (https://gasup-ucc.vercel.app)",
        "Accept-Language": "en",
      },
    });
    if (!r.ok) return NextResponse.json({ address: null }, { status: 200 });

    const data: { display_name?: string; address?: Record<string, string> } = await r.json();
    return NextResponse.json({ address: formatAddress(data) }, { status: 200 });
  } catch {
    // network error / timeout / abort — silent fallback to manual entry
    return NextResponse.json({ address: null }, { status: 200 });
  } finally {
    clearTimeout(timeout);
  }
}

// Build a concise "spot, area, city" string from Nominatim's structured parts,
// falling back to the first few segments of display_name.
function formatAddress(data: { display_name?: string; address?: Record<string, string> }): string | null {
  const a = data.address ?? {};
  const spot = a.amenity || a.building || a.road || a.pedestrian || a.residential || a.neighbourhood;
  const area = a.suburb || a.quarter || a.neighbourhood || a.village || a.hamlet;
  const city = a.city || a.town || a.municipality || a.county;

  const parts = [spot, area, city].filter(Boolean) as string[];
  const seen = new Set<string>();
  const cleaned = parts.filter((p) => (seen.has(p) ? false : (seen.add(p), true)));

  if (cleaned.length > 0) return cleaned.join(", ");
  if (data.display_name) return data.display_name.split(",").slice(0, 3).join(",").trim();
  return null;
}
