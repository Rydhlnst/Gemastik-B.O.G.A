"use client";

import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  X,
  Truck as TruckIcon,
  Navigation,
  CheckCircle2,
  ShieldCheck,
  Package,
} from "lucide-react";
import { sekolahList, vendorList } from "../../lib/mbgdummydata";
import { motion, AnimatePresence } from "framer-motion";

interface DriverUnit {
  id: string;
  name: string;
  vendorId: number;
  sekolahId: number;
  status: string;
  manifest: string;
  lat: number;
  lng: number;
}

interface MapSupervisionProps {
  activeDrivers: DriverUnit[];
  selectedDriverId: string | null;
  onExit: () => void;
  onSelectDriver: (id: string) => void;
}

// ─── Haversine ──────────────────────────────────────────────────────────────
function haversine(p1: [number, number], p2: [number, number]) {
  const R = 6371;
  const dLat = (p2[1] - p1[1]) * Math.PI / 180;
  const dLon = (p2[0] - p1[0]) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(p1[1] * Math.PI / 180) * Math.cos(p2[1] * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function MapSupervision({
  activeDrivers,
  selectedDriverId,
  onExit,
  onSelectDriver,
}: MapSupervisionProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const staticMarkersRef = useRef<maplibregl.Marker[]>([]);
  const driverMarkersRef = useRef<Record<string, maplibregl.Marker>>({});
  const truckMarkerRef = useRef<maplibregl.Marker | null>(null);
  const animTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [mounted, setMounted] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [is3D, setIs3D] = useState(false);
  const [inspectedDriver, setInspectedDriver] = useState<DriverUnit | null>(null);
  const [distRemaining, setDistRemaining] = useState(0);
  const [eta, setEta] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  const prevSelectedId = useRef<string | null>(null);

  // ── Mount ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
    };
  }, []);

  // ── Init map ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted || !mapContainer.current) return;

    const m = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
      center: [107.6191, -6.9175],
      zoom: 12,
      pitch: 0,
      antialias: true,
    });

    map.current = m;

    m.on("load", () => {
      setMapReady(true);
      renderStaticMarkers();
    });

    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
      m.remove();
    };
  }, [mounted]);

  // ── Static school + vendor markers (rendered once on load) ─────────────────
  const renderStaticMarkers = () => {
    if (!map.current) return;

    staticMarkersRef.current.forEach((m) => m.remove());
    staticMarkersRef.current = [];

    sekolahList.forEach((school) => {
      const el = document.createElement("div");
      el.innerHTML = `
        <div style="width:32px;height:32px;background:white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(0,0,0,0.1);border:2px solid #6366f1;">
          <svg width="16" height="16" fill="#6366f1" viewBox="0 0 24 24">
            <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
          </svg>
        </div>`;
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([school.lng, school.lat])
        .addTo(map.current!);
      staticMarkersRef.current.push(marker);
    });

    vendorList.forEach((vendor) => {
      const el = document.createElement("div");
      el.innerHTML = `
        <div style="width:28px;height:28px;background:#6366f1;border-radius:8px;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 4px 10px rgba(99,102,241,0.2);">
          <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
            <path d="M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5z"/>
          </svg>
        </div>`;
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([vendor.lng, vendor.lat])
        .addTo(map.current!);
      staticMarkersRef.current.push(marker);
    });
  };

  // ── Dynamic driver markers (updated when activeDrivers changes) ────────────
  useEffect(() => {
    if (!mapReady || !map.current) return;

    const activeIds = new Set(activeDrivers.map((d) => d.id));

    // Remove stale markers
    Object.keys(driverMarkersRef.current).forEach((id) => {
      if (!activeIds.has(id)) {
        driverMarkersRef.current[id].remove();
        delete driverMarkersRef.current[id];
      }
    });

    // Add / update
    activeDrivers.forEach((driver) => {
      if (driverMarkersRef.current[driver.id]) {
        driverMarkersRef.current[driver.id].setLngLat([driver.lng, driver.lat]);
      } else {
        const el = document.createElement("div");
        el.innerHTML = `
          <div class="group cursor-pointer relative">
            <div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white text-[8px] font-black px-2 py-1 rounded border border-white/20 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">${driver.id}</div>
            <div style="width:36px;height:36px;background:#6366f1;border-radius:12px;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 8px 20px rgba(99,102,241,0.4);">
              <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1.5-7l1.96 2.5H15V11h1.5z"/>
              </svg>
            </div>
          </div>`;
        const marker = new maplibregl.Marker({ element: el, anchor: "center" })
          .setLngLat([driver.lng, driver.lat])
          .addTo(map.current!);
        el.onclick = () => onSelectDriver(driver.id);
        driverMarkersRef.current[driver.id] = marker;
      }
    });
  }, [activeDrivers, mapReady]);

  // ── Route source helpers ───────────────────────────────────────────────────
  const SOURCE_ID = "supervision-route";
  const LAYER_ID = `${SOURCE_ID}-line`;

  const clearRoute = () => {
    if (!map.current) return;
    try {
      if (map.current.getLayer(LAYER_ID)) map.current.removeLayer(LAYER_ID);
      if (map.current.getSource(SOURCE_ID)) map.current.removeSource(SOURCE_ID);
    } catch (_) {}
  };

  const addRouteLayer = (coords: [number, number][]) => {
    if (!map.current) return;
    clearRoute();
    map.current.addSource(SOURCE_ID, {
      type: "geojson",
      data: { type: "Feature", geometry: { type: "LineString", coordinates: coords }, properties: {} },
    });
    map.current.addLayer({
      id: LAYER_ID,
      type: "line",
      source: SOURCE_ID,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": "#6366f1", "line-width": 5, "line-opacity": 0.75 },
    });
  };

  const updateRouteCoords = (coords: [number, number][]) => {
    if (!map.current) return;
    const src = map.current.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
    src?.setData({ type: "Feature", geometry: { type: "LineString", coordinates: coords }, properties: {} });
  };

  // ── Animated driving truck CSS (injected once) ─────────────────────────────
  const injectDrivingCSS = () => {
    if (document.getElementById("gov-driving-anim")) return;
    const s = document.createElement("style");
    s.id = "gov-driving-anim";
    s.innerHTML = `
      @keyframes gov-bob {
        0%,100% { transform: translateY(0) rotate(0deg); }
        25% { transform: translateY(-3px) rotate(-2deg); }
        75% { transform: translateY(-3px) rotate(2deg); }
      }
      .gov-truck-anim { animation: gov-bob 0.35s ease-in-out infinite; }
    `;
    document.head.appendChild(s);
  };

  // ── Cinematic fly + live route animation ───────────────────────────────────
  const runCinematicSimulation = async (driver: DriverUnit) => {
    if (!map.current) return;

    const vendor = vendorList.find((v) => v.id === driver.vendorId);
    const school = sekolahList.find((s) => s.id === driver.sekolahId);
    if (!vendor || !school) return;

    // Fetch real route
    let path: [number, number][] = [];
    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${vendor.lng},${vendor.lat};${school.lng},${school.lat}?overview=full&geometries=geojson`
      );
      const data = await res.json();
      path = data.routes?.[0]?.geometry?.coordinates ?? [];
    } catch (_) {}

    if (!path.length || !map.current) return;

    setIsSimulating(true);
    setIs3D(true);
    injectDrivingCSS();

    // Draw full route
    addRouteLayer(path);

    // ── Cinematic sequence: school → driver ──
    map.current.flyTo({ center: [school.lng, school.lat], zoom: 16, pitch: 45, duration: 3000, essential: true });
    await new Promise((r) => setTimeout(r, 3500));
    if (!map.current) return;
    map.current.flyTo({ center: [vendor.lng, vendor.lat], zoom: 17.5, pitch: 65, bearing: -15, duration: 3000, essential: true });
    await new Promise((r) => setTimeout(r, 3500));
    if (!map.current) return;

    // ── Create animated truck marker ──
    truckMarkerRef.current?.remove();
    const el = document.createElement("div");
    el.innerHTML = `
      <div class="group relative">
        <div class="absolute bottom-full mb-3 px-3 py-1 bg-black/80 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
          <p class="text-[9px] font-black text-white uppercase tracking-widest">${driver.id}</p>
        </div>
        <div class="gov-truck-anim w-12 h-12 flex items-center justify-center bg-indigo-600 rounded-2xl border-2 border-white shadow-2xl relative">
          <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
            <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1.5-7l1.96 2.5H15V11h1.5z"/>
          </svg>
          <div class="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
        </div>
      </div>`;

    const truckMarker = new maplibregl.Marker({ element: el, anchor: "center" })
      .setLngLat(path[0] as [number, number])
      .addTo(map.current!);
    truckMarkerRef.current = truckMarker;

    // ── Step-by-step movement ──
    let step = 0;
    const move = () => {
      if (!map.current || !truckMarkerRef.current) return;

      // Check if selection was cleared externally
      if (!selectedDriverIdRef.current) {
        stopSimulation();
        return;
      }

      if (step < path.length - 1) {
        const cur = path[step];
        const nxt = path[step + 1];

        // Bearing for camera
        const y = Math.sin(nxt[0] - cur[0]) * Math.cos(nxt[1]);
        const x = Math.cos(cur[1]) * Math.sin(nxt[1]) - Math.sin(cur[1]) * Math.cos(nxt[1]) * Math.cos(nxt[0] - cur[0]);
        const bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;

        step++;
        const remaining = path.slice(step);
        truckMarkerRef.current.setLngLat(path[step] as [number, number]);

        // Trim route to show only remaining path
        updateRouteCoords(remaining);

        // Distance & ETA
        let dist = 0;
        for (let i = 0; i < remaining.length - 1; i++) {
          dist += haversine(remaining[i] as [number, number], remaining[i + 1] as [number, number]);
        }
        setDistRemaining(dist);
        setEta(Math.ceil(dist * 1.5 * 60)); // minutes

        // Camera follow
        map.current.easeTo({ center: path[step] as [number, number], bearing: bearing - 8, pitch: 62, zoom: 17, duration: 600, easing: (t) => t });

        animTimerRef.current = setTimeout(move, 600);
      } else {
        // Arrived
        stopSimulation(true);
      }
    };

    animTimerRef.current = setTimeout(move, 500);
  };

  const stopSimulation = (arrived = false) => {
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    truckMarkerRef.current?.remove();
    truckMarkerRef.current = null;
    clearRoute();
    setIsSimulating(false);
    setIs3D(false);
    setDistRemaining(0);
    setEta(0);
    if (map.current) {
      map.current.easeTo({ pitch: 0, bearing: 0, zoom: 12, center: [107.6191, -6.9175], duration: 2000 });
    }
  };

  // Keep a ref to selectedDriverId so the animation loop can read it without stale closure
  const selectedDriverIdRef = useRef<string | null>(null);
  selectedDriverIdRef.current = selectedDriverId;

  // ── React to selectedDriverId changes ─────────────────────────────────────
  useEffect(() => {
    if (!mapReady) return;

    const driver = activeDrivers.find((d) => d.id === selectedDriverId) || null;
    setInspectedDriver(driver);

    if (selectedDriverId && selectedDriverId !== prevSelectedId.current) {
      // NEW selection — stop any existing simulation, start new one
      stopSimulation();
      if (driver) runCinematicSimulation(driver);
    } else if (!selectedDriverId && prevSelectedId.current) {
      // Selection cleared
      stopSimulation();
      setInspectedDriver(null);
    }

    prevSelectedId.current = selectedDriverId;
  }, [selectedDriverId, mapReady]);

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
    };
  }, []);

  return (
    <div className="relative w-full h-full rounded-[40px] overflow-hidden border border-white/20 shadow-2xl">
      <div ref={mapContainer} className="w-full h-full" />

      {/* ── Inspection Panel ── */}
      <AnimatePresence>
        {inspectedDriver && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="absolute bottom-10 left-10 right-10 z-[500] pointer-events-none"
          >
            <div className="max-w-4xl mx-auto bg-slate-900/80 backdrop-blur-3xl border border-white/20 rounded-[32px] p-6 shadow-2xl pointer-events-auto overflow-hidden relative">
              {/* Accent glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full -mr-10 -mt-10" />

              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                {/* Driver profile */}
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600 border border-white/20 flex items-center justify-center text-white relative">
                    <TruckIcon className="w-8 h-8" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1">Inspecting Unit</p>
                    <h4 className="text-2xl font-black text-white tracking-tighter mb-1">{inspectedDriver.id}</h4>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-white/50">
                      <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-400" /> Secure Link</span>
                      <span className="flex items-center gap-1"><Navigation className="w-3 h-3" /> {inspectedDriver.status}</span>
                    </div>
                  </div>
                </div>

                <div className="hidden md:block w-[1px] h-12 bg-white/10" />

                {/* Shipment info */}
                <div className="flex flex-1 gap-12">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Manifest</p>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-white/60" />
                      <p className="text-sm font-black text-white">{inspectedDriver.manifest}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Destination</p>
                    <p className="text-sm font-black text-white">{sekolahList.find((s) => s.id === inspectedDriver.sekolahId)?.nama}</p>
                  </div>
                  {isSimulating && distRemaining > 0 && (
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Sisa Jarak</p>
                      <p className="text-sm font-black text-emerald-400">{distRemaining.toFixed(1)} km · {eta} min</p>
                    </div>
                  )}
                </div>

                {/* Close */}
                <button
                  onClick={onExit}
                  className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-white/60 hover:text-red-400 transition-all flex items-center justify-center group"
                >
                  <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              {/* Live progress bar */}
              <div className="mt-6 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "30%" }}
                  animate={{ width: isSimulating ? `${Math.max(5, 100 - distRemaining * 8)}%` : "65%" }}
                  transition={{ duration: 0.6 }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .maplibregl-canvas { outline: none; }
      `}</style>
    </div>
  );
}
