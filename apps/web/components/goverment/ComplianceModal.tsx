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
  patuh: "text-emerald-600 bg-emerald-50 border-emerald-100",
  tidak_patuh: "text-red-600 bg-red-50 border-red-100",
  perhatian: "text-amber-600 bg-amber-50 border-amber-100",
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
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 pointer-events-auto overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">
                    Audit Detail
                  </p>
                  <h3 className="text-base font-black text-gray-900">
                    Kepatuhan {data.kategori}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  {/* Trend */}
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black ${
                      data.trend === "up"
                        ? "bg-emerald-50 text-emerald-600"
                        : data.trend === "down"
                        ? "bg-red-50 text-red-600"
                        : "bg-gray-50 text-gray-500"
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
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Skor Utama */}
              <div className="px-6 pt-5 pb-4 flex items-center gap-4">
                <div className="text-4xl font-black text-gray-900 tabular-nums">
                  {data.skor}%
                </div>
                <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${data.skor}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      data.skor >= 90
                        ? "bg-emerald-500"
                        : data.skor >= 75
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                  />
                </div>
              </div>

              {/* Entity Breakdown */}
              <div className="px-6 pb-6 space-y-2 max-h-64 overflow-y-auto">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                  Breakdown Entitas
                </p>
                {data.entities.map((entity) => (
                  <div
                    key={entity.nama}
                    className="flex items-center justify-between py-2.5 px-4 bg-gray-50/60 rounded-xl border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      {entity.status === "tidak_patuh" && (
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      )}
                      <span className="text-xs font-semibold text-gray-700">
                        {entity.nama}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-gray-900 tabular-nums">
                        {entity.skor}%
                      </span>
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-lg border ${
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
              <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
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
