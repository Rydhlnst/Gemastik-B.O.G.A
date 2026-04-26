"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { 
  vendorList, 
  vendorSekolahList, 
  sekolahList 
} from "@/lib/mbgdummydata";
import { Maximize2 } from "lucide-react";

export default function VendorServiceMapLibre({ type, onExpand }: { type: "minimap" | "fullmap", onExpand?: () => void }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  
  const [mounted, setMounted] = useState(false);

  // Setup Data for Vendor ID 1
  const vendor = useMemo(() => vendorList.find(v => v.id === 1)!, []);
  const servicePoints = useMemo(() => {
    const relations = vendorSekolahList.filter(vs => vs.vendor_id === vendor.id);
    return relations.map(r => ({
      ...r,
      sekolah: sekolahList.find(s => s.id === r.sekolah_id)!
    }));
  }, [vendor.id]);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!mounted || !mapContainer.current) return;

    const isMinimap = type === "minimap";

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      center: [vendor.lng, vendor.lat],
      zoom: isMinimap ? 11 : 13,
      interactive: !isMinimap
    });

    map.current.on('load', () => {
      renderContent();
    });

    return () => {
      map.current?.remove();
    };
  }, [mounted]);

  const renderContent = () => {
    if (!map.current) return;

    // Vendor Marker
    const vEl = document.createElement('div');
    vEl.innerHTML = `
      <div style="
        width: 32px; height: 32px;
        background: var(--role-primary); border: 3px solid hsl(var(--surface));
        border-radius: 10px; display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 10px hsl(220 13% 10% / 0.20);
      ">
        <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
          <path d="M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5z"/>
        </svg>
      </div>
    `;
    new maplibregl.Marker({ element: vEl })
      .setLngLat([vendor.lng, vendor.lat])
      .addTo(map.current);

    // School Markers & Routes
    servicePoints.forEach(p => {
      const sEl = document.createElement('div');
      sEl.innerHTML = `
        <div style="
          width: 28px; height: 28px;
          background: var(--role-accent); border: 2.5px solid hsl(var(--surface));
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 10px hsl(220 13% 10% / 0.16);
        ">
          <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
            <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
          </svg>
        </div>
      `;
      new maplibregl.Marker({ element: sEl })
        .setLngLat([p.sekolah.lng, p.sekolah.lat])
        .addTo(map.current!);

      // Simple routing lines
      addRouteLine(vendor, p.sekolah);
    });
  };

  const addRouteLine = async (v: typeof vendor, s: (typeof servicePoints[0])['sekolah']) => {
    if (!map.current) return;
    const sId = `route-${v.id}-${s.id}`;

    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${v.lng},${v.lat};${s.lng},${s.lat}?overview=full&geometries=geojson`);
      const data = await res.json();
      
      if (data.routes?.[0] && map.current) {
        map.current.addSource(sId, {
          type: 'geojson',
          data: data.routes[0].geometry
        });

        map.current.addLayer({
          id: `${sId}-line`,
          type: 'line',
          source: sId,
          paint: {
            'line-color': 'var(--role-primary)',
            'line-width': 2,
            'line-dasharray': [2, 2],
            'line-opacity': 0.6
          }
        });
      }
    } catch (e) {
      // Fallback to straight line if OSRM fails
      if (map.current) {
        map.current.addSource(sId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [[v.lng, v.lat], [s.lng, s.lat]]
            },
            properties: {}
          }
        });
        map.current.addLayer({
          id: `${sId}-line`,
          type: 'line',
          source: sId,
          paint: {
            'line-color': 'var(--role-primary)',
            'line-width': 2,
            'line-dasharray': [2, 2],
            'line-opacity': 0.6
          }
        });
      }
    }
  };

  if (!mounted) return <div className="w-full h-full bg-muted-bg animate-pulse rounded-[var(--radius-lg)]" />;

  const isMinimap = type === "minimap";

  return (
    <div className="relative w-full h-full rounded-[var(--radius-lg)] overflow-hidden group border border-border bg-surface">
      <div ref={mapContainer} className="w-full h-full" />
      
      {isMinimap && (
        <div 
          onClick={onExpand}
          className="absolute inset-0 z-[1001] bg-transparent hover:bg-foreground/5 cursor-pointer transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
        >
          <div className="bg-surface/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-border flex items-center gap-2 scale-90 group-hover:scale-100 transition-transform">
            <Maximize2 className="w-4 h-4 text-role-primary" />
            <span className="text-xs font-semibold uppercase text-role-primary tracking-wider">Buka Peta Live</span>
          </div>
        </div>
      )}
    </div>
  );
}
