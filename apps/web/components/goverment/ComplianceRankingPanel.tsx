"use client"

import { useMemo, memo, useState } from "react"
import { useRouter } from "next/navigation"
import { getComplianceScores, getVendorRanking, type ComplianceCategoryScore } from "@/lib/mbgdummydata"
import { ComplianceModal } from "./ComplianceModal"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"
import { StatusBadge } from "@/components/ui/status-badge"

// ── RadialBar (SVG arc) ───────────────────────────────────────────────────────

function RadialArc({
  skor, skorPrev, kategori, trend, trendValue, color, onClick,
}: Pick<ComplianceCategoryScore, "skor" | "skorPrev" | "kategori" | "trend" | "trendValue"> & { color: string; onClick: () => void }) {
  const R = 30
  const CIRCUMFERENCE = 2 * Math.PI * R
  const offset = CIRCUMFERENCE - (skor / 100) * CIRCUMFERENCE

  return (
    <button
      onClick={onClick}
      aria-label={`Kepatuhan ${kategori}: ${skor}%. Klik untuk lihat detail audit`}
      className="flex flex-col items-center gap-1.5 hover:scale-105 transition-transform group"
    >
      {/* SVG Arc */}
      <div className="relative w-[76px] h-[76px]">
        <svg className="w-full h-full -rotate-90" aria-hidden>
          <circle cx="38" cy="38" r={R} fill="transparent" stroke="hsl(var(--border))" strokeWidth={6} />
          <motion.circle
            cx="38" cy="38" r={R}
            fill="transparent"
            stroke={color}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[15px] font-black text-foreground">
          {skor}%
        </span>
      </div>

      {/* Kategori */}
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{kategori}</p>

      {/* Delta anchor */}
      <p
        className={cn(
          "text-xs font-semibold flex items-center gap-0.5",
          trend === "up"
            ? "text-status-success"
            : trend === "down"
            ? "text-status-danger"
            : "text-status-pending"
        )}
      >
        {trend === "up" ? <TrendingUp className="w-2.5 h-2.5" aria-hidden /> : trend === "down" ? <TrendingDown className="w-2.5 h-2.5" aria-hidden /> : null}
        {trend !== "stable" && `${trend === "up" ? "+" : "-"}${trendValue}% vs bln lalu`}
      </p>
    </button>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

const RADIAL_COLORS = [
  "hsl(var(--status-success))",
  "hsl(var(--role-primary))",
  "hsl(var(--status-info))",
]

export const ComplianceRankingPanel = memo(function ComplianceRankingPanel() {
  const router = useRouter()
  const scores = useMemo(() => getComplianceScores(), [])
  const vendors = useMemo(() => getVendorRanking(), [])
  const [modalData, setModalData] = useState<ComplianceCategoryScore | null>(null)

  const maxRate = vendors[vendors.length - 1]?.onTimeRate ?? 100

  return (
    <>
      <div className="bg-surface rounded-[var(--radius-lg)] border border-border p-5 shadow-card grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Left — RadialBar compliance */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-4">
            Kepatuhan Sistem
          </p>
          <div className="flex justify-around items-start">
            {scores.map((s, i) => (
              <RadialArc
                key={s.kategori}
                {...s}
                color={RADIAL_COLORS[i]}
                onClick={() => setModalData(s)}
              />
            ))}
          </div>
          <button
            onClick={() => setModalData(scores[1])} // default to Sekolah (often below threshold)
            aria-label="Lihat detail audit kepatuhan"
            className="mt-4 w-full py-2 rounded-[var(--radius-md)] bg-surface-raised hover:bg-muted/30 border border-border text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors"
          >
            Lihat Detail Audit
          </button>
        </div>

        {/* Right — Vendor Ranking */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-4">
            Ranking Vendor On-Time Rate
            <span className="ml-1.5 text-muted-foreground/60 normal-case font-normal">(terendah di atas)</span>
          </p>

          <div className="flex flex-col gap-2" role="list" aria-label="Ranking vendor berdasarkan on-time rate">
            {vendors.map((v) => {
              const barPct = (v.onTimeRate / 100) * 100
              const isLow = v.onTimeRate < 80
              const isSuspended = v.status === "suspend"

              return (
                <div key={v.id} className="group" role="listitem">
                  <div className="flex items-center gap-2 mb-0.5">
                    {/* Vendor name */}
                    <button
                      onClick={() => router.push(`/goverment/pengajuan?vendor=${v.id}`)}
                      aria-label={`Lihat detail vendor ${v.nama} di halaman pengajuan`}
                      className="text-sm font-semibold text-foreground hover:text-role-primary transition-colors text-left min-w-0 truncate flex-1"
                    >
                      {v.nama}
                    </button>
                    {/* Badge suspend */}
                    {isSuspended && (
                      <StatusBadge status="SUSPEND" />
                    )}
                    {/* Rate at end of bar (no X axis needed) */}
                    <span
                      className={cn("text-xs font-semibold shrink-0 w-16 text-right tabular-nums", isLow ? "text-status-danger" : "text-foreground")}
                      aria-label={`${v.onTimeRate}%`}
                    >
                      {isLow ? "✕ " : "● "}{v.onTimeRate}%
                    </span>
                    <button
                      onClick={() => router.push(`/goverment/pengajuan?vendor=${v.id}`)}
                      aria-label={`Navigasi ke pengajuan vendor ${v.nama}`}
                      className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-role-primary transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <ExternalLink className="w-3 h-3" aria-hidden />
                    </button>
                  </div>
                  {/* Bar — no X axis, no gridlines */}
                  <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden" aria-hidden>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barPct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{
                        background: isLow
                          ? "hsl(var(--status-danger))"
                          : isSuspended
                          ? "hsl(var(--status-warning))"
                          : "linear-gradient(90deg,hsl(var(--role-primary)),hsl(var(--status-info)))",
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Compliance Modal — in-place popup */}
      <ComplianceModal
        isOpen={!!modalData}
        onClose={() => setModalData(null)}
        data={
          modalData
            ? {
                kategori: modalData.kategori,
                skor: modalData.skor,
                trend: modalData.trend,
                trendValue: modalData.trendValue,
                entities: modalData.entities,
              }
            : null
        }
      />
    </>
  )
})
