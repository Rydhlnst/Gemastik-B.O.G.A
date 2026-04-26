"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, TrendingDown, TrendingUp } from "lucide-react";

interface ComplianceEntity {
  nama: string;
  status: "patuh" | "tidak_patuh" | "perhatian";
  skor: number;
}

interface ComplianceBreakdown {
  kategori: string;
  skor: number;
  trend: "up" | "down" | "stable";
  trendValue: number;
  entities: ComplianceEntity[];
}

interface ComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ComplianceBreakdown | null;
}

const statusStyles = {
  patuh: "text-status-success bg-status-success-bg border-status-success/20",
  tidak_patuh: "text-status-danger bg-status-danger-bg border-status-danger/20",
  perhatian: "text-status-warning bg-status-warning-bg border-status-warning/20",
};

const statusLabels = {
  patuh: "Patuh",
  tidak_patuh: "Tidak Patuh",
  perhatian: "Perhatian",
};

export function ComplianceModal({ isOpen, onClose, data }: ComplianceModalProps) {
  return (
    <AnimatePresence>
      {isOpen && data && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-lg bg-surface rounded-[var(--radius-xl)] shadow-lg border border-border pointer-events-auto overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-0.5">
                    Audit Detail
                  </p>
                  <h3 className="text-base font-semibold text-foreground">
                    Kepatuhan {data.kategori}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  {/* Trend */}
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold border ${
                      data.trend === "up"
                        ? "bg-status-success-bg text-status-success border-status-success/20"
                        : data.trend === "down"
                        ? "bg-status-danger-bg text-status-danger border-status-danger/20"
                        : "bg-muted-bg text-muted border-border"
                    }`}
                  >
                    {data.trend === "up" ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : data.trend === "down" ? (
                      <TrendingDown className="w-3 h-3" />
                    ) : null}
                    {data.trend === "up" ? "+" : data.trend === "down" ? "-" : ""}
                    {data.trendValue}% vs minggu lalu
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center text-muted hover:text-foreground hover:bg-muted-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Skor Utama */}
              <div className="px-6 pt-5 pb-4 flex items-center gap-4">
                <div className="text-4xl font-semibold text-foreground tabular-nums">
                  {data.skor}%
                </div>
                <div className="h-2 flex-1 bg-muted-bg rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${data.skor}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      data.skor >= 90
                        ? "bg-status-success"
                        : data.skor >= 75
                        ? "bg-status-warning"
                        : "bg-status-danger"
                    }`}
                  />
                </div>
              </div>

              {/* Entity Breakdown */}
              <div className="px-6 pb-6 space-y-2 max-h-64 overflow-y-auto">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                  Breakdown Entitas
                </p>
                {data.entities.map((entity) => (
                  <div
                    key={entity.nama}
                    className="flex items-center justify-between py-2.5 px-4 bg-surface-raised/60 rounded-[var(--radius-lg)] border border-border"
                  >
                    <div className="flex items-center gap-3">
                      {entity.status === "tidak_patuh" && (
                        <AlertCircle className="w-4 h-4 text-status-danger flex-shrink-0" />
                      )}
                      <span className="text-sm font-medium text-foreground">
                        {entity.nama}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-foreground tabular-nums">
                        {entity.skor}%
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                          statusStyles[entity.status]
                        }`}
                      >
                        {statusLabels[entity.status]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-muted-bg/40 border-t border-border">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-[var(--radius-md)] text-xs font-semibold uppercase tracking-wider text-muted hover:text-foreground hover:bg-muted-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Tutup
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
