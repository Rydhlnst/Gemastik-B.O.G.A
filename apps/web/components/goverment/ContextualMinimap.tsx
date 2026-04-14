"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Maximize2, X, Truck, AlertCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

export type MinimapEntity = {
  id: string | number;
  lat: number;
  lng: number;
  type: "driver" | "anomaly" | "delayed" | "school" | "vendor";
  label?: string;
};

interface ContextualMinimapProps {
  entities: MinimapEntity[];
  navigateTo?: string;
  navigateParams?: Record<string, string>;
  label?: string;
  tooltipText?: string;
}

// Bandung bounding box
const LAT_MIN = -6.97, LAT_MAX = -6.87;
const LNG_MIN = 107.57, LNG_MAX = 107.65;

const entityColors: Record<MinimapEntity["type"], string> = {
  driver: "#6366f1",
  anomaly: "#ef4444",
  delayed: "#f59e0b",
  school: "#10b981",
  vendor: "#06b6d4",
};

const entityIcons: Record<MinimapEntity["type"], React.ReactNode> = {
  driver: <Truck className="w-2.5 h-2.5" />,
  anomaly: <AlertCircle className="w-2.5 h-2.5" />,
  delayed: <Clock className="w-2.5 h-2.5" />,
  school: null,
  vendor: null,
};

export function ContextualMinimap({
  entities,
  navigateTo = "/goverment/pengawasan",
  navigateParams = {},
  label = "Peta Kontekstual",
  tooltipText,
}: ContextualMinimapProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  const toPercent = (entity: MinimapEntity) => ({
    x: ((entity.lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 100,
    y: ((entity.lat - LAT_MAX) / (LAT_MIN - LAT_MAX)) * 100,
  });

  const hasAnomalies = entities.some(e => e.type === "anomaly");

  const handleNavigate = () => {
    const params = new URLSearchParams(navigateParams).toString();
    router.push(`${navigateTo}${params ? `?${params}` : ""}`);
  };

  return (
    <div className="relative">
      {/* Collapsed Toggle */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${
            hasAnomalies
              ? "bg-red-50 border border-red-200 text-red-600 hover:bg-red-100"
              : "bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100"
          }`}
        >
          <MapPin className={`w-3 h-3 ${hasAnomalies ? "animate-pulse" : ""}`} />
          {label}
          {hasAnomalies && (
            <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center">
              {entities.filter(e => e.type === "anomaly").length}
            </span>
          )}
        </button>
      )}

      {/* Expanded Map */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full mb-2 right-0 z-50 w-72 bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-500 to-cyan-400">
              <div className="flex items-center gap-2 text-white">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleNavigate}
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all"
                  title="Buka di Pengawasan"
                >
                  <Maximize2 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Map Area */}
            <div
              onClick={handleNavigate}
              className="relative h-40 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
              style={{
                backgroundImage:
                  "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)",
                backgroundSize: "20% 25%",
              }}
            >
              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-indigo-500/10">
                <span className="text-[9px] font-black text-indigo-700 bg-white/90 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                  Buka Peta Penuh
                </span>
              </div>

              {/* Entities */}
              {entities.map((entity) => {
                const pos = toPercent(entity);
                const isAnom = entity.type === "anomaly";
                return (
                  <div
                    key={entity.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    title={entity.label}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 border-white shadow-md flex items-center justify-center ${
                        isAnom ? "animate-ping absolute" : ""
                      }`}
                      style={{ background: entityColors[entity.type] }}
                    />
                    {isAnom && (
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white shadow-md flex items-center justify-center relative"
                        style={{ background: entityColors[entity.type] }}
                      >
                        <AlertCircle className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                    {!isAnom && entityIcons[entity.type] && (
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white shadow-md flex items-center justify-center absolute top-0 left-0"
                        style={{ background: entityColors[entity.type] }}
                      >
                        <div className="text-white">{entityIcons[entity.type]}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Tooltip if anomaly */}
            {(hasAnomalies || tooltipText) && (
              <div className="px-4 py-2.5 bg-red-50 border-t border-red-100 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                <p className="text-[9px] font-bold text-red-700">
                  {tooltipText || `${entities.filter(e => e.type === "anomaly").length} anomali terdeteksi — klik untuk investigasi`}
                </p>
              </div>
            )}

            {/* Legend */}
            <div className="px-4 py-2 flex items-center gap-3 flex-wrap border-t border-gray-100">
              {(["driver", "anomaly", "delayed", "school"] as const).filter(
                t => entities.some(e => e.type === t)
              ).map(type => (
                <div key={type} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: entityColors[type] }} />
                  <span className="text-[7px] font-black text-gray-400 uppercase capitalize">{
                    { driver: "Supir", anomaly: "Anomali", delayed: "Terlambat", school: "Sekolah", vendor: "Vendor" }[type]
                  }</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
