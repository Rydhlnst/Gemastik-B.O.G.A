"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { X, ArrowRight, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export interface AlertItem {
  id: string
  severity: "error" | "warning" | "info"
  message: string
  anchor?: string // contextual anchor: "vs rata-rata 7 hari lalu (biasanya 1)"
  actionLabel?: string
  actionHref?: string
}

interface AlertBannerProps {
  alerts: AlertItem[]
}

const SEV_CFG = {
  error:   { strip: "bg-red-500",    text: "text-red-800",   bg: "bg-red-50",   border: "border-red-200",   shape: "✕" },
  warning: { strip: "bg-amber-500",  text: "text-amber-800", bg: "bg-amber-50", border: "border-amber-200", shape: "▲" },
  info:    { strip: "bg-blue-400",   text: "text-blue-800",  bg: "bg-blue-50",  border: "border-blue-200",  shape: "—" },
}

export function AlertBanner({ alerts }: AlertBannerProps) {
  const router = useRouter()
  const [dismissed, setDismissed] = useState<string[]>([])

  const visible = alerts.filter((a) => !dismissed.includes(a.id))

  // Prinsip A: "normal" state is meaningful information, not absence of content
  if (visible.length === 0) {
    return (
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden />
        <p className="text-[10px] font-bold">Semua pengiriman berjalan normal — tidak ada alert aktif</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2" role="alert" aria-live="assertive">
      <AnimatePresence>
        {visible.map((alert) => {
          const cfg = SEV_CFG[alert.severity]
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "flex items-center gap-0 rounded-xl border overflow-hidden",
                cfg.bg, cfg.border
              )}
            >
              {/* Color strip — only left border, no icon overkill */}
              <div className={cn("w-1 self-stretch shrink-0 rounded-l-xl", cfg.strip)} aria-hidden />

              <div className="flex items-center gap-3 flex-1 px-4 py-2.5">
                {/* Shape indicator (colorblind-safe) */}
                <span className={cn("text-sm font-black shrink-0", cfg.text)} aria-hidden>
                  {cfg.shape}
                </span>

                {/* Message + anchor */}
                <p className={cn("text-[10px] font-semibold flex-1", cfg.text)}>
                  {alert.message}
                  {alert.anchor && (
                    <span className={cn("ml-1 font-normal opacity-80")}>— {alert.anchor}</span>
                  )}
                </p>

                {/* Action button */}
                {alert.actionHref && (
                  <button
                    onClick={() => router.push(alert.actionHref!)}
                    aria-label={`${alert.actionLabel ?? "Lihat Detail"} — navigasi ke halaman terkait alert`}
                    className={cn(
                      "flex items-center gap-1 text-[9px] font-black px-3 py-1.5 rounded-lg transition-all shrink-0",
                      alert.severity === "error"
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : alert.severity === "warning"
                        ? "bg-amber-600 text-white hover:bg-amber-700"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    )}
                  >
                    {alert.actionLabel ?? "Lihat Detail"}
                    <ArrowRight className="w-3 h-3" aria-hidden />
                  </button>
                )}

                {/* Dismiss */}
                <button
                  onClick={() => setDismissed((p) => [...p, alert.id])}
                  aria-label={`Tutup alert: ${alert.message}`}
                  className={cn("w-6 h-6 rounded-lg flex items-center justify-center shrink-0 opacity-50 hover:opacity-100 transition-opacity", cfg.text)}
                >
                  <X className="w-3.5 h-3.5" aria-hidden />
                </button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
