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
      

    </div>
  );
}
