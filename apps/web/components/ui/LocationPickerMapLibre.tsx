"use client";

import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface LocationPickerMapLibreProps {
  onLocationChange?: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function LocationPickerMapLibre({
  onLocationChange,
  initialLat = -6.9175,
  initialLng = 107.6191,
}: LocationPickerMapLibreProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  
  const [position, setPosition] = useState<[number, number]>([initialLng, initialLat]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!mounted || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      center: [initialLng, initialLat],
      zoom: 13,
    });

    marker.current = new maplibregl.Marker({ draggable: true, color: "#065F46" })
      .setLngLat([initialLng, initialLat])
      .addTo(map.current);

    marker.current.on('dragend', () => {
      const lngLat = marker.current?.getLngLat();
      if (lngLat) {
        setPosition([lngLat.lng, lngLat.lat]);
        onLocationChange?.(lngLat.lat, lngLat.lng);
      }
    });

    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      setPosition([lng, lat]);
      marker.current?.setLngLat([lng, lat]);
      onLocationChange?.(lat, lng);
    });

    return () => {
      map.current?.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  if (!mounted) return <div className="w-full h-full bg-slate-50 animate-pulse rounded-3xl" />;

  return (
    <div className="w-full h-full relative group">
      <div ref={mapContainer} className="w-full h-full" />
      
      <div className="absolute bottom-4 left-4 right-4 z-[1000] pointer-events-none">
         <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-2xl pointer-events-auto">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Titik Koordinat Terpilih</p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-900 tabular-nums font-mono">
                {position[1].toFixed(6)}, {position[0].toFixed(6)}
              </p>
              <div className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-[9px] font-black uppercase tracking-tighter shadow-sm border border-emerald-100">
                Ready for on-chain hash
              </div>
            </div>
         </div>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur-md p-2 rounded-xl border border-slate-200 shadow-xl text-[10px] font-bold text-slate-500 flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           Klik atau Seret untuk atur lokasi
        </div>
      </div>
    </div>
  );
}
