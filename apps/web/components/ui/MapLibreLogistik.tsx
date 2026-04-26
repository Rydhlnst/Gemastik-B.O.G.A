"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { 
  Search, 
  Maximize2, 
  Minimize2, 
  X, 
  Camera, 
  Navigation,
  Truck as TruckIcon
} from "lucide-react";
import { 
  sekolahList, 
  vendorList,
  getVendorsBySekolah, 
  type Sekolah, 
  type Vendor 
} from "../../lib/mbgdummydata";
import { QRScannerModal } from "./QRScannerModal";
import { DriverControlPanel } from "./DriverPanel";

const VENDOR_COLORS = ["#00e57a", "#00c8ff", "#7040e0", "#ff4d4d", "#facc15"];

export default function MapLibreLogistik() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const driverMarker = useRef<maplibregl.Marker | null>(null);
  
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isDriverMode, setIsDriverMode] = useState(false);
  const [isTripActive, setIsTripActive] = useState(false);
  const [is3D, setIs3D] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
  const [distRemaining, setDistRemaining] = useState<number>(0);
  const [eta, setEta] = useState<number>(0);

  // Driver animation state
  const [driverPos, setDriverPos] = useState<[number, number] | null>(null);
  const animationFrameRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
      if (animationFrameRef.current) clearTimeout(animationFrameRef.current);
    };
  }, []);

  useEffect(() => {
    if (!mounted || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      center: [107.6191, -6.9175],
      zoom: 12,
      pitch: 0,
      bearing: 0,
      antialias: true
    });

    map.current.on('load', () => {
      renderMarkers();
    });

    return () => {
      map.current?.remove();
    };
  }, [mounted]);

  // Handle Markers
  const renderMarkers = () => {
    if (!map.current) return;

    markers.current.forEach(m => m.remove());
    markers.current = [];

    // Render Schools
    sekolahList.forEach((school, originalIdx) => {
      const el = document.createElement('div');
      const isSelected = selectedSchoolId === school.id;
      
      el.innerHTML = `
        <div style="
          width: ${isSelected ? '44px' : '36px'}; 
          height: ${isSelected ? '44px' : '36px'};
          background: ${isSelected ? 'linear-gradient(135deg,#00e57a,#00ff8c)' : '#ffffff'};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          border: 2px solid ${isSelected ? '#fff' : '#00e57a'};
          transition: all 0.3s ease;
          cursor: pointer;
        ">
          <svg width="${isSelected ? '18' : '15'}" height="${isSelected ? '18' : '15'}" fill="${isSelected ? '#0f2027' : '#00e57a'}" viewBox="0 0 24 24">
            <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
          </svg>
        </div>
      `;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([school.lng, school.lat])
        .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 10px; font-family: inherit;">
            <p style="font-weight: 800; font-size: 14px; margin-bottom: 2px;">${school.nama}</p>
            <p style="font-size: 11px; color: #64748b;">${school.jenjang} · ${school.total_siswa} Siswa</p>
          </div>
        `))
        .addTo(map.current!);

      el.addEventListener('click', () => {
        setSelectedSchoolId(school.id === selectedSchoolId ? null : school.id);
      });

      markers.current.push(marker);

      // Render Vendors for this school if needed or just render all vendors
      const vendors = getVendorsBySekolah(school.id);
      vendors.forEach((relasi, vIdx) => {
        const vendor = relasi.vendor;
        const color = VENDOR_COLORS[(originalIdx + vIdx) % VENDOR_COLORS.length];
        const isVendorSelected = selectedVendorId === vendor.id;

        const vel = document.createElement('div');
        vel.innerHTML = `
          <div style="
            width: ${isVendorSelected ? '40px' : '32px'}; 
            height: ${isVendorSelected ? '40px' : '32px'};
            background: ${color}; 
            border: 2px solid white;
            border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 10px 20px ${color}44;
            transition: all 0.3s ease;
            cursor: pointer;
          ">
            <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
              <path d="M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5z"/>
            </svg>
          </div>
        `;

        const vMarker = new maplibregl.Marker({ element: vel })
          .setLngLat([vendor.lng, vendor.lat])
          .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`
            <div style="padding: 10px; font-family: inherit;">
              <p style="font-weight: 800; font-size: 14px; margin-bottom: 2px;">${vendor.nama}</p>
              <p style="font-size: 11px; color: ${color}; font-weight: 700;">${vendor.kategori.toUpperCase()}</p>
              <p style="font-size: 10px; color: #64748b; margin-top: 4px;">${vendor.on_time_rate}% Ketepatan Waktu</p>
            </div>
          `))
          .addTo(map.current!);

        vel.addEventListener('click', () => {
          setSelectedVendorId(vendor.id === selectedVendorId ? null : vendor.id);
        });

        markers.current.push(vMarker);
        
        // Render Route if vendor is selected or school is selected
        if (isVendorSelected || isSelected) {
           renderRoute(vendor, school, color, isVendorSelected);
        }
      });
    });
  };

  const renderRoute = async (vendor: Vendor, school: Sekolah, color: string, isHighlighted: boolean) => {
    if (!map.current) return;
    
    const sourceId = `route-${vendor.id}-${school.id}`;
    if (map.current.getSource(sourceId)) return; // Already exists

    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${vendor.lng},${vendor.lat};${school.lng},${school.lat}?overview=full&geometries=geojson`);
      const data = await res.json();
      
      if (data.routes?.[0] && map.current) {
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
            'line-color': color,
            'line-width': isHighlighted ? 4 : 2,
            'line-opacity': isHighlighted ? 0.8 : 0.3
          }
        });
      }
    } catch (e) {
      console.error("Routing error", e);
    }
  };

  useEffect(() => {
    if (map.current) {
      const style = map.current.getStyle();
      if (style) {
        if (style.layers) {
          style.layers.forEach(l => {
            if (l.id.startsWith('route-')) map.current?.removeLayer(l.id);
          });
        }
        if (style.sources) {
          Object.keys(style.sources).forEach(s => {
            if (s.startsWith('route-')) map.current?.removeSource(s);
          });
        }
      }
      
      renderMarkers();
    }
  }, [selectedVendorId, selectedSchoolId]);

  const getHaversineDistance = (p1: [number, number], p2: [number, number]) => {
    const R = 6371;
    const dLat = (p2[1] - p1[1]) * Math.PI / 180;
    const dLon = (p2[0] - p1[0]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(p1[1] * Math.PI / 180) * Math.cos(p2[1] * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Driver Simulation (Ported from Leaflet version with 3D Cinematic Follow)
  useEffect(() => {
    if (isTripActive && map.current) {
      const runSimulation = async () => {
        const v = vendorList[0];
        const s = sekolahList[0];
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${v.lng},${v.lat};${s.lng},${s.lat}?overview=full&geometries=geojson`);
        const data = await res.json();
        const path = data.routes?.[0]?.geometry?.coordinates;
        
        if (path && map.current) {
          // 1. Cinematic Sequence: Destination first, then Start, then Follow
          setIs3D(true);
          
          // Add Blue Active Route
          if (map.current.getSource('active-trip-route')) {
            map.current.removeLayer('active-trip-route-line');
            map.current.removeSource('active-trip-route');
          }
          map.current.addSource('active-trip-route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: data.routes[0].geometry,
              properties: {}
            }
          });
          map.current.addLayer({
            id: 'active-trip-route-line',
            type: 'line',
            source: 'active-trip-route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#3b82f6',
              'line-width': 6,
              'line-opacity': 0.8
            }
          });

          // First Focus: Destination (School)
          map.current.flyTo({
            center: [s.lng, s.lat],
            zoom: 16,
            pitch: 45,
            duration: 3500,
            essential: true
          });
          
          // Second Focus: Lock to Driver (Vendor)
          setTimeout(() => {
            if (map.current) {
              map.current.flyTo({
                center: [v.lng, v.lat],
                zoom: 17,
                pitch: 65,
                bearing: -15,
                duration: 3500,
                essential: true
              });
            }
          }, 4500);

          // Create Animated Driving CSS
          if (!document.getElementById('driving-anim')) {
            const style = document.createElement('style');
            style.id = 'driving-anim';
            style.innerHTML = `
              @keyframes driving-bob {
                0%, 100% { transform: translateY(0) rotate(0); }
                25% { transform: translateY(-3px) rotate(-2deg); }
                75% { transform: translateY(-3px) rotate(2deg); }
              }
              .animate-driving {
                animation: driving-bob 0.3s ease-in-out infinite;
              }
            `;
            document.head.appendChild(style);
          }

          let step = 0;
          const move = () => {
            if (!driverMarker.current && map.current) {
              const el = document.createElement('div');
              el.className = "w-12 h-12 relative flex items-center justify-center group";
              el.innerHTML = `
                <div class="absolute bottom-full mb-3 px-3 py-1 bg-black/80 backdrop-blur-md rounded-lg border border-white/20 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity z-50">
                   <p class="text-[9px] font-black text-white whitespace-nowrap uppercase tracking-widest">${v.nama}</p>
                </div>
                <div class="w-12 h-12 flex items-center justify-center bg-blue-600 rounded-2xl border-2 border-white shadow-2xl animate-driving relative">
                  <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                    <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.1 0-2.34-3-3h2v-5l-3-4zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-3-9h2l2.35 3H15V9z"/>
                  </svg>
                  <div class="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
              `;
              driverMarker.current = new maplibregl.Marker({ 
                element: el,
                anchor: 'center'
              })
                .setLngLat(path[0])
                .addTo(map.current);
              
              // Hide initially to prevent top-left glitch
              el.style.display = 'none';
            }

            if (step < path.length - 1 && isTripActive) {
              // Show marker when movement starts
              if (driverMarker.current) {
                const element = driverMarker.current.getElement();
                if (element) element.style.display = 'block';
              }
              const currentPos = path[step];
              const nextPos = path[step + 1];
              
              // Calculate bearing for cinematic look
              const y = Math.sin(nextPos[0] - currentPos[0]) * Math.cos(nextPos[1]);
              const x = Math.cos(currentPos[1]) * Math.sin(nextPos[1]) - Math.sin(currentPos[1]) * Math.cos(nextPos[1]) * Math.cos(nextPos[0] - currentPos[0]);
              const bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;

              step++;
              const remainingPath = path.slice(step);
              driverMarker.current?.setLngLat(path[step]);
              
              // ─── TRAILING PATH DELETION ───
              // Update route source to only show remaining path ahead of the driver
              if (map.current.getSource('active-trip-route')) {
                (map.current.getSource('active-trip-route') as maplibregl.GeoJSONSource).setData({
                  type: 'Feature',
                  geometry: {
                    type: 'LineString',
                    coordinates: remainingPath
                  },
                  properties: {}
                });
              }

              // Calculate remaining distance and ETA
              let remaining = 0;
              for (let i = 0; i < remainingPath.length - 1; i++) {
                remaining += getHaversineDistance(remainingPath[i], remainingPath[i+1]);
              }
              setDistRemaining(remaining);
              setEta(Math.ceil(remaining * 1.5)); // Approx 40km/h simulation
              
              // Follow camera (Adjusted duration for smoother high-frequency updates)
              map.current?.easeTo({
                center: path[step],
                bearing: bearing - 8, 
                pitch: 62,
                zoom: 17,
                duration: 600,
                easing: (t) => t
              });

              animationFrameRef.current = setTimeout(move, 600);
            } else if (step >= path.length - 1) {
              setIsTripActive(false);
              setIs3D(false);
              if (map.current?.getLayer('active-trip-route-line')) {
                map.current.removeLayer('active-trip-route-line');
                map.current.removeSource('active-trip-route');
              }
              map.current?.easeTo({ pitch: 0, bearing: 0, duration: 1500 });
              alert("Trip Berhasil: Paket telah tiba di tujuan!");
            }
          };
          
          animationFrameRef.current = setTimeout(move, 9000); // Wait for cinematic flyTo sequence to finish
        }
      };
      runSimulation();
    } else {
      if (driverMarker.current) {
        driverMarker.current.remove();
        driverMarker.current = null;
      }
      if (map.current?.getLayer('active-trip-route-line')) {
        map.current.removeLayer('active-trip-route-line');
        map.current.removeSource('active-trip-route');
      }
      if (animationFrameRef.current) clearTimeout(animationFrameRef.current);
    }
  }, [isTripActive]);

  const toggle3D = () => {
    if (!map.current) return;
    const next3D = !is3D;
    setIs3D(next3D);
    map.current.easeTo({
      pitch: next3D ? 60 : 0,
      bearing: next3D ? -20 : 0,
      duration: 1000
    });
  };

  if (!mounted) {
    return (
      <div className="w-full h-[clamp(28rem,50vw,42rem)] bg-slate-50/50 backdrop-blur-sm rounded-3xl border border-slate-200 overflow-hidden relative">
        <div className="absolute top-6 inset-x-6 flex items-start justify-between">
          <div className="w-full max-w-[320px] h-12 bg-white/80 rounded-2xl animate-pulse shadow-sm" />
          <div className="flex gap-2">
            <div className="w-10 h-10 bg-white/80 rounded-xl animate-pulse shadow-sm" />
            <div className="w-10 h-10 bg-white/80 rounded-xl animate-pulse shadow-sm" />
            <div className="w-10 h-10 bg-white/80 rounded-xl animate-pulse shadow-sm" />
          </div>
        </div>
        <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
               <div className="w-16 h-16 bg-slate-200 rounded-full animate-bounce" />
               <div className="w-32 h-4 bg-slate-200 rounded-full animate-pulse" />
            </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`
        relative w-full overflow-hidden rounded-3xl border border-white/20 shadow-2xl transition-all duration-700
        ${isExpanded ? "fixed inset-8 z-[100] h-[calc(100vh-64px)]" : "h-[clamp(28rem,50vw,42rem)]"}
      `}
    >
      <div ref={mapContainer} className="w-full h-full" />

      {/* Top Controls (Ported from MapLogistikThemed) */}
      <div className="absolute top-6 inset-x-6 z-[1000] flex items-start justify-between gap-4 pointer-events-none">
        <div className="w-full max-w-[320px] pointer-events-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari armada..."
              className="w-full bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 shadow-2xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
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
               onClick={toggle3D}
               className={`w-10 h-10 rounded-xl backdrop-blur-md border shadow-2xl flex items-center justify-center transition-all ${is3D ? 'bg-indigo-600 text-white' : 'bg-white/90 border-white text-gray-700'}`}
               title="Toggle 3D"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
          {(selectedVendorId || selectedSchoolId) && (
            <button 
              onClick={() => { setSelectedVendorId(null); setSelectedSchoolId(null); }}
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
              destination={`${vendorList[0].nama} → ${sekolahList[0].nama}`}
            />
         </div>
      )}

      {/* Live HUD Tracking Overlay */}
      {isTripActive && distRemaining > 0 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
           <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/20 px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-10 animate-in slide-in-from-bottom-4 duration-700">
              <div className="flex flex-col">
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Jarak Tersisa</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-black text-white tabular-nums">{distRemaining.toFixed(1)}</p>
                  <p className="text-xs font-bold text-white/60">km</p>
                </div>
              </div>
              <div className="w-[1px] h-8 bg-white/10" />
              <div className="flex flex-col">
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Estimasi Tiba</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-black text-emerald-400 tabular-nums">{eta}</p>
                  <p className="text-xs font-bold text-emerald-500/60">min</p>
                </div>
              </div>
              <div className="w-[1px] h-8 bg-white/10" />
              <div className="flex flex-col">
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Tujuan</p>
                <p className="text-sm font-black text-white truncate max-w-[120px] tracking-tight">{sekolahList[0].nama}</p>
              </div>
           </div>
        </div>
      )}

      <QRScannerModal 
        isOpen={isScanOpen} 
        onClose={() => setIsScanOpen(false)}
        onScan={(data) => console.log("Scanned:", data)}
      />

      {!isExpanded && !isDriverMode && (
        <div className="absolute bottom-6 right-6 z-[500] pointer-events-none hidden md:block">
          <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-6 pointer-events-auto">
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
        .maplibregl-popup-content {
          border-radius: 12px !important;
          padding: 0 !important;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1) !important;
          border: 1px solid rgba(0,0,0,0.05) !important;
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
