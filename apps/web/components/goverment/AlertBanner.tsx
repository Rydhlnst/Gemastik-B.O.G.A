"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, XCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";

export type AlertSeverity = "warning" | "critical";

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}

interface AlertBannerProps {
  alerts: AlertItem[];
}

export function AlertBanner({ alerts }: AlertBannerProps) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visibleAlerts = alerts.filter((a) => !dismissed.has(a.id));

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="space-y-2 px-6 pt-4">
      <AnimatePresence>
        {visibleAlerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: -12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-semibold ${
              alert.severity === "critical"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-amber-50 border-amber-200 text-amber-800"
            }`}
          >
            {/* Icon */}
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
                alert.severity === "critical"
                  ? "bg-red-100 text-red-600"
                  : "bg-amber-100 text-amber-600"
              }`}
            >
              {alert.severity === "critical" ? (
                <XCircle className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
            </div>

            {/* Message */}
            <p className="flex-1 text-[12px] leading-snug">{alert.message}</p>

            {/* Action */}
            {alert.actionLabel && alert.actionHref && (
              <button
                onClick={() => router.push(alert.actionHref!)}
                className={`flex-shrink-0 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all ${
                  alert.severity === "critical"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-amber-600 text-white hover:bg-amber-700"
                }`}
              >
                {alert.actionLabel}
              </button>
            )}

            {/* Dismiss */}
            <button
              onClick={() =>
                setDismissed((prev) => new Set([...prev, alert.id]))
              }
              className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                alert.severity === "critical"
                  ? "hover:bg-red-100 text-red-400 hover:text-red-600"
                  : "hover:bg-amber-100 text-amber-400 hover:text-amber-600"
              }`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
