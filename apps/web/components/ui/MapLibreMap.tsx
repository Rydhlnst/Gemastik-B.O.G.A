"use client";

import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { 
  sekolahList, 
  getVendorsBySekolah, 
  sppgList,
  sppgSekolahList,
  type Sekolah, 
  type Vendor 
} from "../../lib/mbgdummydata";
import { MapSearch } from "./MapSearch";

interface MapLibreMapProps {
  selectedSchool: Sekolah | null;
  onSchoolSelect: (school: Sekolah) => void;
  userSchoolId?: number;
}

export default function MapLibreMap({ selectedSchool, onSchoolSelect, userSchoolId }: MapLibreMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const [is3D, setIs3D] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!mounted || !mapContainer.current) return;

    // Initialize Map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      center: [107.6191, -6.9175], // Bandung Center
      zoom: 13,
      pitch: 0,
      bearing: 0,
      antialias: true
    });

    map.current.on('load', () => {
      if (!map.current) return;

      // Add 3D Building Extrusions (if available in style)
      // Carto Voyager has building data
      const layers = map.current.getStyle().layers;
      const labelLayerId = layers?.find(layer => layer.type === 'symbol' && layer.layout?.['text-field'])?.id;

      if (map.current.getSource('openmaptiles')) {
        map.current.addLayer({
          'id': '3d-buildings',
          'source': 'openmaptiles',
          'source-layer': 'building',
          'type': 'fill-extrusion',
          'minzoom': 15,
          'paint': {
            'fill-extrusion-color': '#e2e8f0',
            'fill-extrusion-height': ['get', 'render_height'],
            'fill-extrusion-base': ['get', 'render_min_height'],
            'fill-extrusion-opacity': 0.6
          }
        }, labelLayerId);
      }

      // Add atmospheric fog if supported by the version
      const anyMap = map.current as any;
      if (anyMap.setFog) {
        anyMap.setFog({
          'range': [-1, 10],
          'color': '#ffffff',
          'high-color': '#4f46e5',
          'space-color': '#000000',
          'horizon-blend': 0.5
        });
      }

      renderMarkers();
    });

    return () => {
      map.current?.remove();
    };
  }, [mounted]);

  // Handle markers
  const renderMarkers = () => {
    if (!map.current) return;

    // Clear old markers
    markers.current.forEach(m => m.remove());
    markers.current = [];

    sekolahList.forEach(school => {
      const el = document.createElement('div');
      el.className = 'school-marker-container';
      
      const isUserSchool = userSchoolId === school.id;
      const isSelected = selectedSchool?.id === school.id;
      
      // Marker color logic: Only logged in school is Orange, others are grey
      const markerColor = isUserSchool 
        ? 'linear-gradient(135deg,#f59e0b,#fbbf24)' 
        : 'linear-gradient(135deg,#94a3b8,#cbd5e1)';
      
      el.innerHTML = `
        <div class="relative group">
          ${isUserSchool ? `
            <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-white px-3 py-1.5 rounded-lg shadow-xl border border-orange-100 flex items-center gap-2 whitespace-nowrap z-50">
               <div class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
               <span class="text-[10px] font-black text-slate-800 uppercase tracking-widest">${school.nama}</span>
            </div>
          ` : ''}
          <div style="
            width: ${isUserSchool ? '48px' : '36px'}; 
            height: ${isUserSchool ? '48px' : '36px'};
            background: ${markerColor};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            border: ${isUserSchool ? '4px' : '3px'} solid white;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            cursor: pointer;
            ${isUserSchool ? 'animation: bounce 2s infinite;' : ''}
          " class="${isSelected && !isUserSchool ? 'scale-110 border-indigo-400' : ''}">
            <svg width="${isUserSchool ? '22' : '16'}" height="${isUserSchool ? '22' : '16'}" fill="white" viewBox="0 0 24 24">
              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
            </svg>
          </div>
          ${!isUserSchool && isSelected ? `
            <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded text-[9px] font-bold whitespace-nowrap">
              ${school.nama}
            </div>
          ` : ''}
        </div>
      `;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([school.lng, school.lat])
        .setPopup(new maplibregl.Popup({ offset: 35 }).setHTML(`
          <div style="padding: 12px; font-family: inherit; min-width: 150px;">
            <p style="font-weight: 900; font-size: 13px; margin-bottom: 4px; color: #1e293b; text-transform: uppercase; letter-spacing: 0.05em;">${school.nama}</p>
            <div style="height: 1px; background: #f1f5f9; margin: 8px 0;"></div>
            <p style="font-size: 10px; color: #64748b; font-weight: 600; display: flex; align-items: center; gap: 6px;">
               <span style="width: 8px; height: 8px; border-radius: 50%; background: ${isUserSchool ? '#f59e0b' : '#94a3b8'};"></span>
               ${school.jenjang} · ${school.total_siswa} Siswa
            </p>
          </div>
        `))
        .addTo(map.current!);

      el.addEventListener('click', () => {
        onSchoolSelect(school);
      });

      markers.current.push(marker);
    });
  };

  useEffect(() => {
    if (!map.current) return;
    renderMarkers();

    const targetSchool = selectedSchool || (userSchoolId ? sekolahList.find(s => s.id === userSchoolId) : null);

    if (targetSchool) {
      map.current.flyTo({
        center: [targetSchool.lng, targetSchool.lat],
        zoom: is3D ? 16 : 14,
        pitch: is3D ? 60 : 0,
        duration: 2000,
        essential: true
      });
      renderRoutes(targetSchool);
    }
  }, [selectedSchool, is3D, userSchoolId]);

  const renderRoutes = async (target?: Sekolah) => {
    const schoolToRender = target || selectedSchool;
    if (!map.current || !schoolToRender) return;

    const vendorsRelasi = getVendorsBySekolah(schoolToRender.id);
    const applicableSPPGIds = sppgSekolahList
      .filter(ss => ss.sekolah_id === schoolToRender.id)
      .map(ss => ss.sppg_id);
    const applicableSPPGs = sppgList.filter(s => applicableSPPGIds.includes(s.id));
    
    // Cleanup previous routes
    const style = map.current.getStyle();
    if (style && style.layers) {
      style.layers.forEach(l => {
        if (l.id.startsWith('route-')) map.current?.removeLayer(l.id);
      });
    }
    if (style && style.sources) {
      Object.keys(style.sources).forEach(s => {
        if (s.startsWith('route-source-')) map.current?.removeSource(s);
      });
    }

    applicableSPPGs.forEach(sppg => {
      const sel = document.createElement('div');
      sel.innerHTML = `
        <div style="
          width: 32px; height: 32px; 
          background: #4f46e5; 
          border: 3px solid white;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        ">
          <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
            <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/>
          </svg>
        </div>
      `;
      const sMarker = new maplibregl.Marker({ element: sel })
        .setLngLat([sppg.lng, sppg.lat])
        .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 10px;">
            <p style="font-weight: 800; font-size: 13px;">${sppg.nama}</p>
            <p style="font-size: 10px; color: #64748b;">Pusat Layanan Gizi (SPPG)</p>
          </div>
        `))
        .addTo(map.current!);
      markers.current.push(sMarker);
    });

    const colors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

    vendorsRelasi.forEach(async (av, idx) => {
      const v = av.vendor;
      const color = colors[idx % colors.length];

      try {
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${v.lng},${v.lat};${schoolToRender.lng},${schoolToRender.lat}?overview=full&geometries=geojson`);
        const data = await res.json();
        
        if (data.routes?.[0]) {
          const sourceId = `route-source-${v.id}`;
          const layerId = `route-layer-${v.id}`;
          const glowId = `route-glow-${v.id}`;

          map.current?.addSource(sourceId, {
            type: 'geojson',
            data: data.routes[0].geometry
          });

          // Outer Glow
          map.current?.addLayer({
            id: glowId,
            type: 'line',
            source: sourceId,
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': color,
              'line-width': av.is_primary ? 8 : 4,
              'line-opacity': 0.2,
              'line-blur': 4
            }
          });

          // Main Line
          map.current?.addLayer({
            id: layerId,
            type: 'line',
            source: sourceId,
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': color,
              'line-width': av.is_primary ? 3 : 2,
              'line-dasharray': av.is_primary ? [1] : [2, 2],
              'line-opacity': 0.8
            }
          });

          // Add Vendor Marker
          const vel = document.createElement('div');
          vel.innerHTML = `
            <div style="
              width: 30px; height: 30px; 
              background: ${color}; 
              border: 2.5px solid white;
              border-radius: 8px;
              display: flex; align-items: center; justify-content: center;
              box-shadow: 0 4px 10px rgba(0,0,0,0.15);
            ">
              <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
                <path d="M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5z"/>
              </svg>
            </div>
          `;
          const vMarker = new maplibregl.Marker({ element: vel })
            .setLngLat([v.lng, v.lat])
            .addTo(map.current!);
          markers.current.push(vMarker);
        }
      } catch (e) {
        console.error("Routing error", e);
      }
    });
  };

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

  if (!mounted) return <div className="w-full h-full bg-slate-50 animate-pulse" />;

  return (
    <div className="w-full h-full relative group">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* 2D/3D Toggle Control */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={toggle3D}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md transition-all border ${
            is3D 
            ? 'bg-indigo-600 text-white border-transparent' 
            : 'bg-white/80 text-slate-800 border-slate-200 hover:bg-white'
          }`}
        >
          {is3D ? (
            <>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              3D View
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-slate-300" />
              2D Flat
            </>
          )}
        </button>
      </div>

      <MapSearch onSelect={(s) => onSchoolSelect(s)} />

      <style jsx global>{`
        .maplibregl-popup-content {
          border-radius: 12px !important;
          padding: 0 !important;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1) !important;
          border: 1px solid rgba(0,0,0,0.05) !important;
        }
        .maplibregl-popup-close-button {
          padding: 4px 8px !important;
          color: #94a3b8 !important;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
