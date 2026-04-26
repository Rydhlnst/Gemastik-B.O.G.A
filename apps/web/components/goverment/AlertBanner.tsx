"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, CheckCircle2, X } from "lucide-react"

import { cn } from "@/lib/utils"

export interface AlertItem {
  id: string
  severity: "error" | "warning" | "info"
  message: string
  anchor?: string
  actionLabel?: string
  actionHref?: string
}

interface AlertBannerProps {
  alerts: AlertItem[]
}

function severityClasses(severity: AlertItem["severity"]) {
  if (severity === "error") {
    return {
      wrap: "border-status-danger/25 bg-status-danger-bg text-status-danger",
      strip: "bg-status-danger",
      cta: "bg-status-danger text-white hover:bg-status-danger/90",
    }
  }
  if (severity === "warning") {
    return {
      wrap: "border-status-warning/25 bg-status-warning-bg text-status-warning",
      strip: "bg-status-warning",
      cta: "bg-status-warning text-white hover:bg-status-warning/90",
    }
  }
  return {
    wrap: "border-status-info/25 bg-status-info-bg text-status-info",
    strip: "bg-status-info",
    cta: "bg-status-info text-white hover:bg-status-info/90",
  }
}

export function AlertBanner({ alerts }: AlertBannerProps) {
  const router = useRouter()
  const [dismissed, setDismissed] = useState<string[]>([])

  const visible = alerts.filter((a) => !dismissed.includes(a.id))

  if (visible.length === 0) {
    return (
      <div
        className="flex items-center gap-2 rounded-xl border border-status-success/25 bg-status-success-bg px-4 py-3 text-status-success"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="size-4 shrink-0" aria-hidden />
        <p className="text-sm font-medium">
          Semua pengiriman berjalan normal — tidak ada alert aktif.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3" role="alert" aria-live="assertive">
      <AnimatePresence>
        {visible.map((alert) => {
          const cfg = severityClasses(alert.severity)
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.18 }}
              className={cn("overflow-hidden rounded-xl border", cfg.wrap)}
            >
              <div className="flex items-start gap-3 px-4 py-3">
                <div className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", cfg.strip)} aria-hidden />

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-relaxed">
                    {alert.message}
                    {alert.anchor ? (
                      <span className="ml-1 opacity-80">— {alert.anchor}</span>
                    ) : null}
                  </p>
                </div>

                {alert.actionHref ? (
                  <button
                    onClick={() => router.push(alert.actionHref!)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors",
                      cfg.cta
                    )}
                    aria-label={alert.actionLabel ?? "Lihat detail"}
                  >
                    <span>{alert.actionLabel ?? "Lihat detail"}</span>
                    <ArrowRight className="size-4" aria-hidden />
                  </button>
                ) : null}

                <button
                  onClick={() => setDismissed((prev) => [...prev, alert.id])}
                  className="inline-flex size-9 items-center justify-center rounded-full text-current/60 hover:bg-surface-raised hover:text-current transition-colors"
                  aria-label="Tutup alert"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

