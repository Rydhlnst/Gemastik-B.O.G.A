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
  driver: "hsl(var(--role-primary))",
  anomaly: "hsl(var(--status-danger))",
  delayed: "hsl(var(--status-warning))",
  school: "hsl(var(--status-success))",
  vendor: "hsl(var(--status-info))",
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
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-widest transition-colors ${
            hasAnomalies
              ? "bg-status-danger-bg border border-status-danger/25 text-status-danger hover:bg-status-danger-bg/80"
              : "bg-surface-raised border border-border text-role-primary hover:bg-muted/30"
          }`}
        >
          <MapPin className={`w-3 h-3 ${hasAnomalies ? "animate-pulse" : ""}`} />
          {label}
          {hasAnomalies && (
            <span className="w-5 h-5 rounded-full bg-status-danger text-white text-xs flex items-center justify-center">
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
            className="absolute bottom-full mb-2 right-0 z-50 w-72 bg-surface rounded-[var(--radius-lg)] border border-border shadow-elevated overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-role-primary">
              <div className="flex items-center gap-2 text-white">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold uppercase tracking-widest">{label}</span>
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
              className="relative h-40 bg-surface-raised cursor-pointer hover:bg-muted/30 transition-colors"
              style={{
                backgroundImage:
                  "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
                backgroundSize: "20% 25%",
              }}
            >
              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-muted/20">
                <span className="text-xs font-semibold text-role-primary bg-surface/90 px-3 py-1.5 rounded-[var(--radius-md)] uppercase tracking-widest">
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
                      className={`w-4 h-4 rounded-full border-2 border-surface shadow-md flex items-center justify-center ${
                        isAnom ? "animate-ping absolute" : ""
                      }`}
                      style={{ background: entityColors[entity.type] }}
                    />
                    {isAnom && (
                      <div
                        className="w-4 h-4 rounded-full border-2 border-surface shadow-md flex items-center justify-center relative"
                        style={{ background: entityColors[entity.type] }}
                      >
                        <AlertCircle className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                    {!isAnom && entityIcons[entity.type] && (
                      <div
                        className="w-4 h-4 rounded-full border-2 border-surface shadow-md flex items-center justify-center absolute top-0 left-0"
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
              <div className="px-4 py-2.5 bg-status-danger-bg border-t border-status-danger/25 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-status-danger flex-shrink-0" />
                <p className="text-xs font-semibold text-status-danger">
                  {tooltipText || `${entities.filter(e => e.type === "anomaly").length} anomali terdeteksi — klik untuk investigasi`}
                </p>
              </div>
            )}

            {/* Legend */}
            <div className="px-4 py-2 flex items-center gap-3 flex-wrap border-t border-border">
              {(["driver", "anomaly", "delayed", "school"] as const).filter(
                t => entities.some(e => e.type === t)
              ).map(type => (
                <div key={type} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: entityColors[type] }} />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest capitalize">{
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
