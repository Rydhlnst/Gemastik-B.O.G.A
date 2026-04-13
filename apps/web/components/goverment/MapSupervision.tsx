"use client";

import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { 
  X, 
  Truck as TruckIcon,
  Navigation,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Package
} from "lucide-react";
import { 
  sekolahList, 
  vendorList,
} from "../../lib/mbgdummydata";
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

export default function MapSupervision({ 
  activeDrivers, 
  selectedDriverId, 
  onExit,
  onSelectDriver
}: MapSupervisionProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<Record<string, maplibregl.Marker>>({});
  const [mounted, setMounted] = useState(false);
  const [is3D, setIs3D] = useState(false);
  const [inspectedDriver, setInspectedDriver] = useState<DriverUnit | null>(null);

  const prevSelectedId = useRef<string | null>(null);

  // Sync internal state with props
  useEffect(() => {
    const driver = activeDrivers.find(d => d.id === selectedDriverId) || null;
    setInspectedDriver(driver);

    if (map.current) {
      if (selectedDriverId && selectedDriverId !== prevSelectedId.current) {
        // NEW Selection: Trigger Cinematic Sequence
        if (driver) handleCinematicFly(driver);
      } else if (!selectedDriverId && prevSelectedId.current) {
        // Selection Cleared: Reset View
        handleResetView();
      } else if (driver && selectedDriverId === prevSelectedId.current) {
        // Position Update while Inspecting: Smoothly follow
        map.current.easeTo({
          center: [driver.lng, driver.lat],
          duration: 1000,
          easing: (t) => t
        });
      }
    }
    
    prevSelectedId.current = selectedDriverId;
  }, [selectedDriverId, activeDrivers]);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!mounted || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      center: [107.6191, -6.9175],
      zoom: 12,
      pitch: 0,
    });

    return () => {
      map.current?.remove();
    };
  }, [mounted]);

  // Sync Markers with activeDrivers
  useEffect(() => {
    if (map.current && map.current.loaded()) {
      renderMarkers();
    }
  }, [activeDrivers]);

  const staticMarkersRendered = useRef(false);

  const renderMarkers = () => {
    if (!map.current) return;

    // 1. Render Static Markers (Schools & Vendors) Only Once
    if (!staticMarkersRendered.current) {
      sekolahList.forEach((school) => {
        const el = document.createElement('div');
        el.innerHTML = `
          <div style="width: 32px; height: 32px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.1); border: 2px solid #6366f1;">
            <svg width="16" height="16" fill="#6366f1" viewBox="0 0 24 24">
              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
            </svg>
          </div>
        `;
        new maplibregl.Marker({ element: el })
          .setLngLat([school.lng, school.lat])
          .addTo(map.current!);
      });

      vendorList.forEach((vendor) => {
        const el = document.createElement('div');
        el.innerHTML = `
          <div style="width: 28px; height: 28px; background: #6366f1; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 10px rgba(99,102,241,0.2);">
            <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
              <path d="M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5z"/>
            </svg>
          </div>
        `;
        new maplibregl.Marker({ element: el })
          .setLngLat([vendor.lng, vendor.lat])
          .addTo(map.current!);
      });

      staticMarkersRendered.current = true;
    }

    // 2. Manage Dynamic Markers (Drivers)
    const activeIds = new Set(activeDrivers.map(d => d.id));
    
    // Remove markers that are no longer active
    Object.keys(markers.current).forEach(id => {
      if (!activeIds.has(id)) {
        markers.current[id].remove();
        delete markers.current[id];
      }
    });

    // Render/Update Active Drivers
    activeDrivers.forEach((driver) => {
      if (markers.current[driver.id]) {
        // Update Position if marker exists
        markers.current[driver.id].setLngLat([driver.lng, driver.lat]);
      } else {
        // Create new marker
        const el = document.createElement('div');
        el.innerHTML = `
          <div class="group cursor-pointer relative">
             <div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white text-[8px] font-black px-2 py-1 rounded border border-white/20 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
               ${driver.id}
             </div>
             <div style="width: 36px; height: 36px; background: #6366f1; border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);">
               <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                 <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.1 0-2.34-3-3h2v-5l-3-4zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-3-9h2l2.35 3H15V9z"/>
               </svg>
             </div>
          </div>
        `;
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([driver.lng, driver.lat])
          .addTo(map.current!);

        el.onclick = () => onSelectDriver(driver.id);
        markers.current[driver.id] = marker;
      }
    });
  };

  const handleCinematicFly = async (driver: DriverUnit) => {
    if (!map.current) return;
    setIs3D(true);

    const vendor = vendorList.find(v => v.id === driver.vendorId);
    const school = sekolahList.find(s => s.id === driver.sekolahId);

    if (!vendor || !school) return;

    // Render Path
    renderDetailedRoute(vendor, school);

    // Initial Fly to School (Target)
    map.current.flyTo({
      center: [school.lng, school.lat],
      zoom: 16,
      pitch: 45,
      duration: 3000,
      essential: true
    });

    // Secondary Fly to lock on vehicle
    setTimeout(() => {
      map.current?.flyTo({
        center: [driver.lng, driver.lat],
        zoom: 17.5,
        pitch: 65,
        bearing: -15,
        duration: 3000,
        essential: true
      });
    }, 3500);
  };

  const renderDetailedRoute = async (v: any, s: any) => {
    if (!map.current) return;
    const sourceId = 'supervision-route';
    if (map.current.getSource(sourceId)) {
      map.current.removeLayer(`${sourceId}-line`);
      map.current.removeSource(sourceId);
    }

    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${v.lng},${v.lat};${s.lng},${s.lat}?overview=full&geometries=geojson`);
      const data = await res.json();
      if (data.routes?.[0]) {
        map.current.addSource(sourceId, {
          type: 'geojson',
          data: data.routes[0].geometry
        });
        map.current.addLayer({
          id: `${sourceId}-line`,
          type: 'line',
          source: sourceId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#6366f1',
            'line-width': 5,
            'line-opacity': 0.6
          }
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetView = () => {
    if (!map.current) return;
    setIs3D(false);
    map.current.flyTo({
      center: [107.6191, -6.9175],
      zoom: 12,
      pitch: 0,
      bearing: 0,
      duration: 2000
    });
    
    // Clear path
    if (map.current.getLayer('supervision-route-line')) {
      map.current.removeLayer('supervision-route-line');
      map.current.removeSource('supervision-route');
    }
  };

  return (
    <div className="relative w-full h-full rounded-[40px] overflow-hidden border border-white/20 shadow-2xl">
      <div ref={mapContainer} className="w-full h-full" />



      {/* Inspection Panel */}
      <AnimatePresence>
        {inspectedDriver && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="absolute bottom-10 left-10 right-10 z-[500] pointer-events-none"
          >
            <div className="max-w-4xl mx-auto bg-slate-900/80 backdrop-blur-3xl border border-white/20 rounded-[32px] p-6 shadow-2xl pointer-events-auto overflow-hidden relative">
               {/* Accent Glow */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full -mr-10 -mt-10" />
               
               <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  {/* Driver Profile */}
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

                  {/* Shipment Info */}
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
                        <p className="text-sm font-black text-white">{sekolahList.find(s => s.id === inspectedDriver.sekolahId)?.nama}</p>
                     </div>
                  </div>

                  {/* Actions */}
                  <button 
                    onClick={onExit}
                    className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-white/60 hover:text-red-400 transition-all flex items-center justify-center group"
                  >
                    <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                  </button>
               </div>

               {/* Live Progress Bar Simulation */}
               <div className="mt-6 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: "30%" }}
                    animate={{ width: "65%" }}
                    transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                  />
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .maplibregl-canvas {
          outline: none;
        }
      `}</style>
    </div>
  );
}
