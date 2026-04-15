"use client";

import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { 
  sekolahList, 
  getVendorsBySekolah, 
  type Sekolah, 
  type Vendor 
} from "../../lib/mbgdummydata";
import { MapSearch } from "./MapSearch";

interface MapLibreMapProps {
  selectedSchool: Sekolah | null;
  onSchoolSelect: (school: Sekolah) => void;
}

export default function MapLibreMap({ selectedSchool, onSchoolSelect }: MapLibreMapProps) {
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
      el.className = 'school-marker';
      const isSelected = selectedSchool?.id === school.id;
      
      el.innerHTML = `
        <div style="
          width: ${isSelected ? '44px' : '36px'}; 
          height: ${isSelected ? '44px' : '36px'};
          background: ${isSelected ? 'linear-gradient(135deg,#f59e0b,#ef4444)' : 'linear-gradient(135deg,#4f46e5,#06b6d4)'};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          border: ${isSelected ? '4px' : '3px'} solid white;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
          ${isSelected ? 'animation: bounce 1.5s infinite;' : ''}
        ">
          <svg width="${isSelected ? '20' : '16'}" height="${isSelected ? '20' : '16'}" fill="white" viewBox="0 0 24 24">
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
        onSchoolSelect(school);
      });

      markers.current.push(marker);
    });
  };

  useEffect(() => {
    if (!map.current) return;
    renderMarkers();

    if (selectedSchool) {
      map.current.flyTo({
        center: [selectedSchool.lng, selectedSchool.lat],
        zoom: is3D ? 16 : 14,
        pitch: is3D ? 60 : 0,
        duration: 2000,
        essential: true
      });
      renderRoutes();
    }
  }, [selectedSchool, is3D]);

  const renderRoutes = async () => {
    if (!map.current || !selectedSchool) return;

    const vendorsRelasi = getVendorsBySekolah(selectedSchool.id);
    
    // Cleanup previous routes
    const style = map.current.getStyle();
    if (style && style.layers) {
      style.layers.forEach(l => {
        if (l.id.startsWith('route-')) map.current?.removeLayer(l.id);
      });
    }
    Object.keys(map.current.getStyle().sources || {}).forEach(s => {
      if (s.startsWith('route-source-')) map.current?.removeSource(s);
    });

    const colors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

    vendorsRelasi.forEach(async (av, idx) => {
      const v = av.vendor;
      const color = colors[idx % colors.length];

      try {
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${v.lng},${v.lat};${selectedSchool.lng},${selectedSchool.lat}?overview=full&geometries=geojson`);
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
