"use client";

import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface SchoolMapProps {
  selectedSchool: any | null;
  sppgLocation: { lat: number; lng: number; name: string };
}

export function SchoolMap({ selectedSchool, sppgLocation }: SchoolMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const line = useRef<any>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!mounted || !mapContainer.current) return;

    if (!map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
        center: [sppgLocation.lng, sppgLocation.lat],
        zoom: 12,
      });
    }

    // Cleanup markers
    markers.current.forEach(m => m.remove());
    markers.current = [];

    // SPPG Marker (Blue)
    const sppgMarker = new maplibregl.Marker({ color: "#0d5c46" })
      .setLngLat([sppgLocation.lng, sppgLocation.lat])
      .setPopup(new maplibregl.Popup().setHTML(`<b>${sppgLocation.name}</b>`))
      .addTo(map.current);
    markers.current.push(sppgMarker);

    if (selectedSchool && selectedSchool.latitude && selectedSchool.longitude) {
      const coords = [
        [sppgLocation.lng, sppgLocation.lat],
        [selectedSchool.longitude, selectedSchool.latitude]
      ];

      const updateRoute = () => {
        if (!map.current) return;
        
        if (map.current.getSource('route')) {
          (map.current.getSource('route') as any).setData({
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: coords
            }
          });
        } else {
          map.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: coords
              }
            }
          });

          map.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#0d5c46',
              'line-width': 4,
              'line-dasharray': [2, 2]
            }
          });
        }

        // Fit bounds
        const bounds = new maplibregl.LngLatBounds();
        bounds.extend([sppgLocation.lng, sppgLocation.lat]);
        bounds.extend([selectedSchool.longitude, selectedSchool.latitude]);
        map.current.fitBounds(bounds, { padding: 50, duration: 1000 });

        // Add School Marker (Red)
        const schoolMarker = new maplibregl.Marker({ color: "#ef4444" })
          .setLngLat([selectedSchool.longitude, selectedSchool.latitude])
          .setPopup(new maplibregl.Popup().setHTML(`<b>${selectedSchool.nama}</b>`))
          .addTo(map.current);
        markers.current.push(schoolMarker);
      };

      if (map.current.isStyleLoaded()) {
        updateRoute();
      } else {
        map.current.once('load', updateRoute);
      }
    } else {
      // Remove line if no school selected
      const clearRoute = () => {
        if (map.current?.getSource('route')) {
          (map.current.getSource('route') as any).setData({
            type: 'FeatureCollection',
            features: []
          });
        }
        map.current?.flyTo({ center: [sppgLocation.lng, sppgLocation.lat], zoom: 12 });
      };

      if (map.current.isStyleLoaded()) {
        clearRoute();
      } else {
        map.current.once('load', clearRoute);
      }
    }

    return () => {
      // Don't remove map on every re-render, only on unmount
    };
  }, [mounted, selectedSchool, sppgLocation]);

  if (!mounted) return <div className="w-full h-full bg-slate-50 animate-pulse rounded-[24px]" />;

  return (
    <div className="w-full h-full relative group overflow-hidden rounded-[24px] border border-slate-100 shadow-inner">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Map Overlay Info */}
      <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-[16px] border border-slate-200 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#0d5c46] flex items-center justify-center text-white text-[10px] font-bold">SP</div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Pangkalan Utama</p>
            <p className="text-xs font-bold text-slate-700 leading-none">{sppgLocation.name}</p>
          </div>
        </div>
        {selectedSchool && (
          <div className="text-right">
            <p className="text-[10px] font-black text-emerald-600 uppercase leading-none mb-1">Target Sasaran</p>
            <p className="text-xs font-bold text-slate-700 leading-none">{selectedSchool.nama}</p>
          </div>
        )}
      </div>
    </div>
  );
}
