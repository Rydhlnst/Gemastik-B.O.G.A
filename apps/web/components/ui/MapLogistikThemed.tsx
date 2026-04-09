"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Search, Maximize2, Minimize2, X, MapPin, Truck as TruckIcon, Camera, Play, Circle, Navigation } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css";
// @ts-ignore
import { GestureHandling } from "leaflet-gesture-handling";

import {
  sekolahList,
  vendorList,
  getVendorsBySekolah,
} from "../../lib/mbgdummydata";
import { getRoute } from "../../lib/osrmService";
import { QRScannerModal } from "./QRScannerModal";
import { DriverControlPanel } from "./DriverPanel";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const iconSrc = typeof icon === "string" ? icon : (icon as any).src;
const iconShadowSrc = typeof iconShadow === "string" ? iconShadow : (iconShadow as any).src;

// Register Plugins
// @ts-ignore
L.Map.addInitHook("addHandler", "gestureHandling", GestureHandling);

L.Marker.prototype.options.icon = L.icon({
  iconUrl: iconSrc,
  shadowUrl: iconShadowSrc,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const VENDOR_COLORS = ["#00e57a", "#00c8ff", "#7040e0", "#ff4d4d", "#facc15"];

// ─── Child Components ─────────────────────────────────────────────────────────

function GestureHandlingComponent() {
  const map = useMap();
  useEffect(() => {
    if (map) {
      // @ts-ignore
      map.gestureHandling.enable();
    }
  }, [map]);
  return null;
}

// ─── Custom Icons ─────────────────────────────────────────────────────────────

const makeSchoolIcon = (selected: boolean) => {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${selected ? 44 : 36}px; height:${selected ? 44 : 36}px;
      background:${selected ? "linear-gradient(135deg,#00e57a,#00ff8c)" : "#ffffff"};
      border-radius:50%; display:flex; align-items:center; justify-content:center;
      box-shadow:0 8px 16px rgba(0, 0, 0, 0.1), 0 0 0 3px ${selected ? "rgba(0, 229, 122, 0.3)" : "rgba(0, 229, 122, 0.1)"}; 
      border: 2px solid ${selected ? "#fff" : "#00e57a"};
      transition: all 0.3s ease;
      ${selected ? "animation:pulse-neon 1.5s infinite;" : ""}
    ">
      <svg width="${selected ? 18 : 15}" height="${selected ? 18 : 15}" fill="${selected ? "#0f2027" : "#00e57a"}" viewBox="0 0 24 24">
        <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
      </svg>
    </div>`,
    iconSize: [selected ? 44 : 36, selected ? 44 : 36],
    iconAnchor: [selected ? 22 : 18, selected ? 44 : 36],
  });
};

const makeVendorIcon = (color: string, isPrimary: boolean, selected: boolean) => {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${selected ? 40 : 32}px; height:${selected ? 40 : 32}px;
      background:${color}; border-radius:10px; display:flex; align-items:center;
      justify-content:center; box-shadow:0 10px 20px ${color}44; border:2px solid white;
      transition: all 0.3s ease;
    ">
      <svg width="14" height="14" fill="#ffffff" viewBox="0 0 24 24">
        <path d="M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5z"/>
      </svg>
    </div>`,
    iconSize: [selected ? 40 : 32, selected ? 40 : 32],
    iconAnchor: [selected ? 20 : 16, selected ? 40 : 32],
  });
};

const makeDriverIcon = () => {
  return L.divIcon({
    className: "",
    html: `<div class="bg-emerald-600 p-2 rounded-xl border-2 border-white shadow-xl animate-bounce">
      <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
        <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-3-9h2l2.35 3H15V9z"/>
      </svg>
    </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
};

// ─── Map Controller ───────────────────────────────────────────────────────────

function MapEffectHandler({ focusPoint }: { focusPoint: [number, number] | null }) {
  const map = useMap();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!map) return;
    map.invalidateSize();
    if (focusPoint && !isNaN(focusPoint[0]) && !isNaN(focusPoint[1])) {
      map.flyTo(focusPoint, 15, { animate: true, duration: 1.5 });
      isFirstRender.current = false;
    } else if (!isFirstRender.current) {
      const defaultCenter: [number, number] = [-6.205, 106.838];
      map.flyTo(defaultCenter, 12, { animate: true, duration: 1 });
    }
  }, [focusPoint, map]);
  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MapLogistikThemed() {
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isDriverMode, setIsDriverMode] = useState(false);
  const [isTripActive, setIsTripActive] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);
  
  // Real-Road Routing Data
  const [roadPaths, setRoadPaths] = useState<Record<string, [number, number][]>>({});
  
  // Driver Animation
  const [driverPos, setDriverPos] = useState<[number, number] | null>(null);
  const driverRef = useRef<L.Marker | null>(null);
  const animationFrameRef = useRef<NodeJS.Timeout | null>(null);
  const stepIndexRef = useRef(0);

  useEffect(() => {
    setMounted(true);
    return () => {
       if (animationFrameRef.current) clearTimeout(animationFrameRef.current);
    };
  }, []);

  // Fetch routes for visible connections
  useEffect(() => {
    if (!mounted) return;
    
    // Only fetch for primary demo IDs or current selection to avoid rate limit
    const fetchVisibleRoutes = async () => {
      const pairs = [
        { v: 1, s: 1, key: "1-1" },
        { v: 3, s: 1, key: "3-3" }, // Vendor 3 is logistics
        { v: 5, s: 2, key: "5-2" }
      ];

      for (const p of pairs) {
        if (!roadPaths[p.key]) {
          const v = vendorList.find(v => v.id === p.v)!;
          const s = sekolahList.find(s => s.id === p.s)!;
          const path = await getRoute([v.lat, v.lng], [s.lat, s.lng], p.key);
          setRoadPaths(prev => ({ ...prev, [p.key]: path }));
        }
      }
    };

    fetchVisibleRoutes();
  }, [mounted, roadPaths]);

  // Driver Simulation Logic (High Performance)
  useEffect(() => {
    if (isTripActive && roadPaths["1-1"]) {
      const path = roadPaths["1-1"];
      stepIndexRef.current = 0;
      setDriverPos(path[0]);

      const moveNext = () => {
        if (stepIndexRef.current < path.length - 1) {
          stepIndexRef.current += 1;
          const nextPos = path[stepIndexRef.current];
          
          if (driverRef.current) {
            // Apply a smooth CSS transition to the marker icon
            const icon = driverRef.current.getElement();
            if (icon) {
              icon.style.transition = "transform 2s linear";
            }
            driverRef.current.setLatLng(nextPos);
          }
          
          animationFrameRef.current = setTimeout(moveNext, 2000);
        } else {
          setIsTripActive(false);
          alert("Trip Berhasil: Paket telah tiba di SDN Cempaka!");
        }
      };

      animationFrameRef.current = setTimeout(moveNext, 1000);
    } else {
      if (animationFrameRef.current) clearTimeout(animationFrameRef.current);
      setDriverPos(null);
    }
  }, [isTripActive, roadPaths]);

  const filteredVendors = useMemo(() => {
    if (!searchQuery) return vendorList;
    return vendorList.filter(v => v.nama.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  const displayData = useMemo(() => {
    return sekolahList.map((school, originalIdx) => {
      const allVendors = getVendorsBySekolah(school.id);
      const isConnectedToSelected = selectedVendorId 
        ? allVendors.some(v => v.vendor_id === selectedVendorId)
        : true;

      return {
        school,
        vendors: isConnectedToSelected ? allVendors : [],
        originalIdx,
        isHidden: selectedVendorId ? !isConnectedToSelected : false
      };
    });
  }, [selectedVendorId]);

  const selectedPoint = useMemo<[number, number] | null>(() => {
    if (!selectedVendorId) return null;
    const vendor = vendorList.find(v => v.id === selectedVendorId);
    return vendor ? [vendor.lat, vendor.lng] : null;
  }, [selectedVendorId]);

  if (!mounted) return null;

  return (
    <div 
      className={`
        relative w-full overflow-hidden rounded-3xl border border-white/20 shadow-2xl transition-all duration-700
        ${isExpanded ? "fixed inset-8 z-[100] h-[calc(100vh-64px)]" : "h-[clamp(28rem,50vw,42rem)]"}
      `}
    >
      <MapContainer
        center={[-6.205, 106.838]}
        zoom={12}
        style={{ height: "100%", width: "100%", background: "#f8fafc" }}
        zoomControl={false}
        // @ts-ignore
        gestureHandling={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <MapEffectHandler focusPoint={selectedPoint} />
        <GestureHandlingComponent />

        {/* Render Driver Marker during Simulation */}
        {driverPos && (
          <Marker 
            position={driverPos} 
            icon={makeDriverIcon()} 
            // @ts-ignore
            ref={driverRef}
          />
        )}

        {displayData.map(({ school, vendors, originalIdx, isHidden }) => {
          if (isHidden) return null;
          return (
            <div key={`s-${school.id}`}>
              <Marker position={[school.lat, school.lng]} icon={makeSchoolIcon(false)}>
                <Popup className="custom-glass-popup">
                  <div className="p-1 min-w-[150px]">
                    <p className="font-bold text-emerald-600 text-sm mb-1">{school.nama}</p>
                    <p className="text-[10px] text-gray-600">{school.total_siswa} Siswa · {school.jenjang}</p>
                  </div>
                </Popup>
              </Marker>

              {vendors.map((relasi, vendorIdx) => {
                const color = VENDOR_COLORS[(originalIdx + vendorIdx) % VENDOR_COLORS.length];
                const v = relasi.vendor;
                const isSelected = selectedVendorId === v.id;
                
                const pathKey = `${v.id}-${school.id}`;
                const positions: [number, number][] = roadPaths[pathKey] || [[v.lat, v.lng], [school.lat, school.lng]];

                return (
                  <div key={`v-${v.id}-${school.id}`}>
                    <Polyline
                      positions={positions}
                      pathOptions={{ 
                        color, 
                        weight: isSelected ? 4 : 2, 
                        opacity: isSelected ? 0.8 : 0.3,
                        className: isSelected ? "ant-path-flow" : ""
                      }}
                    />
                    <Marker 
                      position={[v.lat, v.lng]} 
                      icon={makeVendorIcon(color, relasi.is_primary, isSelected)}
                      eventHandlers={{ click: () => setSelectedVendorId(v.id) }}
                    >
                      <Popup className="custom-glass-popup">
                        <div className="p-1 min-w-[150px]">
                          <p className="font-bold text-gray-800 text-sm mb-0.5">{v.nama}</p>
                          <p className="text-[10px] font-bold" style={{ color }}>{v.kategori.toUpperCase()}</p>
                          <p className="text-[10px] text-gray-500 mt-1">{v.on_time_rate}% Ketepatan Waktu</p>
                        </div>
                      </Popup>
                    </Marker>
                  </div>
                );
              })}
            </div>
          );
        })}
      </MapContainer>

      {/* Top Controls */}
      <div className="absolute top-6 inset-x-6 z-[1000] flex items-start justify-between gap-4 pointer-events-none">
        <div className="w-full max-w-[320px] pointer-events-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-white/40" />
            </div>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari armada..."
              className="w-full bg-[#0f2027]/90 backdrop-blur-xl border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/30 shadow-2xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 pointer-events-auto">
          <div className="flex gap-2">
            <button 
              onClick={() => setIsScanOpen(true)}
              className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md border border-white shadow-2xl flex items-center justify-center text-gray-700 hover:bg-white transition-all"
              title="Scan QR"
            >
              <Camera className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsDriverMode(!isDriverMode)}
              className={`w-10 h-10 rounded-xl backdrop-blur-md border shadow-2xl flex items-center justify-center transition-all ${isDriverMode ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-white/90 border-white text-gray-700'}`}
              title="Menu Sopir"
            >
              <Navigation className="w-5 h-5 rotate-45" />
            </button>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md border border-white shadow-2xl flex items-center justify-center text-gray-700 hover:bg-white transition-all"
            >
              {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
          {selectedVendorId && (
            <button 
              onClick={() => setSelectedVendorId(null)}
              className="w-10 h-10 self-end rounded-xl bg-red-500/90 backdrop-blur-md border border-red-400/50 text-white flex items-center justify-center shadow-2xl hover:bg-red-600 transition-all animate-in zoom-in"
              title="Reset View"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {isDriverMode && (
         <div className="absolute top-20 right-6 z-[1000] w-64 pointer-events-auto">
            <DriverControlPanel 
              isTripActive={isTripActive}
              onToggleTrip={setIsTripActive}
            />
         </div>
      )}

      <QRScannerModal 
        isOpen={isScanOpen} 
        onClose={() => setIsScanOpen(false)}
        onScan={(data) => console.log("Scanned:", data)}
      />

      {!isExpanded && !isDriverMode && (
        <div className="absolute bottom-6 right-6 z-[500] pointer-events-none hidden md:block">
          <div className="bg-[#0f2027]/80 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-6 pointer-events-auto">
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Fleet</span>
              <span className="text-lg font-black text-white">142</span>
            </div>
            <div className="w-[1px] h-6 bg-white/10" />
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">SLA</span>
              <span className="text-lg font-black text-emerald-400">98%</span>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .leaflet-control-attribution {
          background: transparent !important;
          color: rgba(0, 0, 0, 0.3) !important;
          font-size: 8px !important;
          padding: 0 10px !important;
          margin-bottom: 4px !important;
        }
        .custom-glass-popup .leaflet-popup-content-wrapper {
          background: rgba(255, 255, 255, 0.8) !important;
          backdrop-filter: blur(12px) !important;
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
          border-radius: 16px !important;
        }
        @keyframes pulse-neon {
          0% { box-shadow: 0 0 0 0 rgba(0, 229, 122, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(0, 229, 122, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 229, 122, 0); }
        }
      `}</style>
    </div>
  );
}
