"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapPin, AlertCircle, Loader2 } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface Props {
  /** Human-readable address to geocode */
  alamat: string;
  /** Vendor name — shown as marker label */
  vendorNama: string;
  /** Optional known coords — skips geocoding if provided */
  lat?: number;
  lng?: number;
  /** Map height in px (default 220) */
  height?: number;
}

type GeoState =
  | { status: "loading" }
  | { status: "ok"; lat: number; lng: number }
  | { status: "error" };

// ── Nominatim Geocode ─────────────────────────────────────────────────────────

async function geocodeAddress(
  alamat: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const q = encodeURIComponent(alamat + ", Indonesia");
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
      { headers: { "Accept-Language": "id" } }
    );
    if (!res.ok) return null;
    const data: { lat: string; lon: string }[] = await res.json();
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

// ── Marker HTML ───────────────────────────────────────────────────────────────

function createMarkerEl(label: string): HTMLElement {
  const wrap = document.createElement("div");
  wrap.style.cssText = `
    display: flex; flex-direction: column; align-items: center;
    pointer-events: none; user-select: none;
  `;

  const dot = document.createElement("div");
  dot.style.cssText = `
    width: 32px; height: 32px; border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    background: linear-gradient(135deg, #6366f1, #06b6d4);
    border: 2.5px solid white;
    box-shadow: 0 4px 12px rgba(99,102,241,0.4);
    display: flex; align-items: center; justify-content: center;
  `;

  const icon = document.createElement("div");
  icon.style.cssText = `
    width: 12px; height: 12px; border-radius: 50%;
    background: white; transform: rotate(45deg);
  `;
  dot.appendChild(icon);

  const badge = document.createElement("div");
  badge.textContent = label;
  badge.style.cssText = `
    margin-top: 4px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 2px 8px;
    font-size: 9px;
    font-weight: 800;
    color: #334155;
    box-shadow: 0 2px 6px rgba(0,0,0,0.10);
    white-space: nowrap;
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
  `;

  wrap.appendChild(dot);
  wrap.appendChild(badge);
  return wrap;
}

// ── Component ────────────────────────────────────────────────────────────────

export function VendorLocationMap({
  alamat,
  vendorNama,
  lat: knownLat,
  lng: knownLng,
  height = 220,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  const [geo, setGeo] = useState<GeoState>(() =>
    knownLat !== undefined && knownLng !== undefined
      ? { status: "ok", lat: knownLat, lng: knownLng }
      : { status: "loading" }
  );
  const [mounted, setMounted] = useState(false);

  // SSR guard
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Geocode if no known coords
  useEffect(() => {
    if (knownLat !== undefined && knownLng !== undefined) return;
    let cancelled = false;
    geocodeAddress(alamat).then((result) => {
      if (cancelled) return;
      setGeo(result ? { status: "ok", ...result } : { status: "error" });
    });
    return () => { cancelled = true; };
  }, [alamat, knownLat, knownLng]);

  // Init / update map when coords ready
  useEffect(() => {
    if (!mounted || geo.status !== "ok" || !containerRef.current) return;

    const { lat, lng } = geo;

    // First init
    if (!mapRef.current) {
      mapRef.current = new maplibregl.Map({
        container: containerRef.current,
        style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
        center: [lng, lat],
        zoom: 15,
        interactive: true,
      });

      // Remove logo / attribution for cleaner embed
      mapRef.current.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        "top-right"
      );

      markerRef.current = new maplibregl.Marker({ element: createMarkerEl(vendorNama), anchor: "bottom" })
        .setLngLat([lng, lat])
        .addTo(mapRef.current);
    } else {
      // Re-center if coords changed
      mapRef.current.flyTo({ center: [lng, lat], zoom: 15 });
      markerRef.current?.setLngLat([lng, lat]);
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, geo]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (!mounted || geo.status === "loading") {
    return (
      <div
        className="w-full rounded-2xl border border-slate-100 bg-slate-50 flex flex-col items-center justify-center gap-2"
        style={{ height }}
      >
        <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
        <p className="text-[9px] font-bold text-slate-400">Memuat lokasi…</p>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (geo.status === "error") {
    return (
      <div
        className="w-full rounded-2xl border border-dashed border-red-200 bg-red-50/50 flex flex-col items-center justify-center gap-2 px-4 text-center"
        style={{ height }}
      >
        <AlertCircle className="w-6 h-6 text-red-400" />
        <p className="text-[10px] font-black text-red-600">Lokasi tidak dapat ditemukan</p>
        <p className="text-[9px] text-red-400">Periksa alamat vendor dan coba lagi</p>
        <p className="text-[8px] text-red-300 mt-1 font-mono">{alamat}</p>
      </div>
    );
  }

  // ── Map ───────────────────────────────────────────────────────────────────
  return (
    <div className="w-full flex flex-col gap-2">
      <div
        className="w-full rounded-2xl overflow-hidden border border-slate-100 shadow-sm relative"
        style={{ height }}
      >
        <div ref={containerRef} className="w-full h-full" />
      </div>
      {/* Address label */}
      <div className="flex items-start gap-1.5 px-1">
        <MapPin className="w-3 h-3 text-indigo-400 mt-0.5 flex-shrink-0" />
        <p className="text-[9px] text-slate-500 font-semibold leading-snug">{alamat}</p>
      </div>
    </div>
  );
}
