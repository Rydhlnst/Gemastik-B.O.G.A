"use client";

import { useEffect, useRef, useState } from "react";
import { Navigation } from "lucide-react";

interface LogisticsMapProps {
  vendorName: string;
  vendorCoords?: [number, number];  // [lat, lng]
  sppgCoords?: [number, number];    // [lat, lng]
}

const DEFAULT_VENDOR: [number, number] = [-6.5971, 106.7960]; // Pasar Anyar Bogor
const DEFAULT_SPPG: [number, number]   = [-6.6090, 106.8063]; // Bogor Selatan (SPPG)

export default function LogisticsMap({
  vendorName,
  vendorCoords = DEFAULT_VENDOR,
  sppgCoords   = DEFAULT_SPPG,
}: LogisticsMapProps) {
  const mapRef    = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  const [error, setError]         = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    let mapInstance: any;

    const init = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      // Fix default icon paths for Next.js
      (L.Icon.Default as any).mergeOptions({
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      leafletRef.current = L;

      mapInstance = L.map(mapRef.current!, {
        zoomControl:      false,
        attributionControl: false,
        scrollWheelZoom:  false,
        dragging:         true,
        doubleClickZoom:  false,
      });

      // CartoDB Positron: clean white minimalist map (roads + labels only)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(mapInstance);

      // Vendor icon: Store pin (green)
      const vendorIcon = L.divIcon({
        className: "",
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;gap:0;">
            <div style="
              width:40px;height:40px;
              background:#10b981;
              border-radius:50% 50% 50% 0;
              transform:rotate(-45deg);
              border:3px solid #fff;
              box-shadow:0 4px 14px rgba(16,185,129,0.45);
              display:flex;align-items:center;justify-content:center;
            ">
              <svg style="transform:rotate(45deg);width:20px;height:20px;" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
          </div>`,
        iconSize:   [40, 48],
        iconAnchor: [20, 48],
      });

      // SPPG icon: Building/Flag pin (blue)
      const sppgIcon = L.divIcon({
        className: "",
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;gap:0;">
            <div style="
              width:40px;height:40px;
              background:#2563eb;
              border-radius:50% 50% 50% 0;
              transform:rotate(-45deg);
              border:3px solid #fff;
              box-shadow:0 4px 14px rgba(37,99,235,0.45);
              display:flex;align-items:center;justify-content:center;
            ">
              <svg style="transform:rotate(45deg);width:20px;height:20px;" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            </div>
          </div>`,
        iconSize:   [40, 48],
        iconAnchor: [20, 48],
      });

      L.marker(vendorCoords, { icon: vendorIcon }).addTo(mapInstance);
      L.marker(sppgCoords,   { icon: sppgIcon   }).addTo(mapInstance);

      // Fit map to show both markers first
      const bounds = L.latLngBounds([vendorCoords, sppgCoords]);
      mapInstance.fitBounds(bounds, { padding: [50, 50] });

      // Fetch real road route from OSRM
      try {
        const [vLat, vLng] = vendorCoords;
        const [sLat, sLng] = sppgCoords;
        const url = `https://router.project-osrm.org/route/v1/driving/${vLng},${vLat};${sLng},${sLat}?overview=full&geometries=geojson`;

        const res  = await fetch(url);
        const data = await res.json();

        if (data.routes && data.routes.length > 0) {
          const route     = data.routes[0];
          const geojson   = route.geometry;
          const distanceKm = (route.distance / 1000).toFixed(1);
          const durationMin = Math.round(route.duration / 60);

          setRouteInfo({ distance: `${distanceKm} KM`, duration: `${durationMin} Menit` });

          // Draw road route
          L.geoJSON(geojson, {
            style: {
              color:     "#2563eb",
              weight:    5,
              opacity:   0.85,
              lineCap:   "round",
              lineJoin:  "round",
              dashArray: "10, 6",
            },
          }).addTo(mapInstance);

          // Re-fit to route
          const routeCoords = geojson.coordinates.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]);
          mapInstance.fitBounds(L.latLngBounds(routeCoords), { padding: [50, 50] });
        }
      } catch {
        setError(true);
        // Fallback: draw straight line
        L.polyline([vendorCoords, sppgCoords], {
          color:  "#2563eb",
          weight: 4,
          dashArray: "10, 6",
          opacity: 0.7,
        }).addTo(mapInstance);
      }
    };

    init();

    return () => {
      if (mapInstance) mapInstance.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full h-72 rounded-[32px] overflow-hidden border border-slate-200 shadow-inner mb-6 bg-slate-100">
      {/* Map container */}
      <div ref={mapRef} className="w-full h-full z-0" />

      {/* Logistics HUD */}
      {routeInfo && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-xl px-5 py-4 rounded-[20px] border border-white/20 shadow-2xl flex flex-col gap-1.5 z-[1000]">
          <div className="flex items-center gap-2">
            <Navigation size={13} className="text-[#006b54]" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Analisis Logistik</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tighter">{routeInfo.distance}</span>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{routeInfo.duration}</span>
          </div>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-tight italic">
            {error ? "Estimasi jalur lurus" : "Rute jalan asli via OSRM"}
          </p>
        </div>
      )}

      {/* Loading state */}
      {!routeInfo && (
        <div className="absolute inset-0 flex items-end justify-center pb-6 z-[1000] pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-100 shadow text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">
            Menghitung rute...
          </div>
        </div>
      )}

      {/* Bottom label */}
      <div className="absolute bottom-4 left-4 z-[1000] pointer-events-none">
        <span className="text-[9px] font-black uppercase tracking-widest text-white drop-shadow-md bg-slate-900/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
          🗺 OpenStreetMap · OSRM Routing
        </span>
      </div>
    </div>
  );
}
