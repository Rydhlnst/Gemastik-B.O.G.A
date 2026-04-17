"use client"

import { useMemo, memo, useState } from "react"
import { useRouter } from "next/navigation"
import { getComplianceScores, getVendorRanking, type ComplianceCategoryScore } from "@/lib/mbgdummydata"
import { ComplianceModal } from "./ComplianceModal"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"

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
          <circle cx="38" cy="38" r={R} fill="transparent" stroke="#f1f5f9" strokeWidth={6} />
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
        <span className="absolute inset-0 flex items-center justify-center text-[15px] font-black text-slate-800">
          {skor}%
        </span>
      </div>

      {/* Kategori */}
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{kategori}</p>

      {/* Delta anchor */}
      <p className={cn("text-[9px] font-bold flex items-center gap-0.5", trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-500" : "text-slate-400")}>
        {trend === "up" ? <TrendingUp className="w-2.5 h-2.5" aria-hidden /> : trend === "down" ? <TrendingDown className="w-2.5 h-2.5" aria-hidden /> : null}
        {trend !== "stable" && `${trend === "up" ? "+" : "-"}${trendValue}% vs bln lalu`}
      </p>
    </button>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

const RADIAL_COLORS = ["#10b981", "#6366f1", "#06b6d4"]

export const ComplianceRankingPanel = memo(function ComplianceRankingPanel() {
  const router = useRouter()
  const scores = useMemo(() => getComplianceScores(), [])
  const vendors = useMemo(() => getVendorRanking(), [])
  const [modalData, setModalData] = useState<ComplianceCategoryScore | null>(null)

  const maxRate = vendors[vendors.length - 1]?.onTimeRate ?? 100

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 p-5 grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Left — RadialBar compliance */}
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 mb-4">
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
            className="mt-4 w-full py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-100 text-[9px] font-black uppercase tracking-wider text-slate-500 transition-all"
          >
            Lihat Detail Audit
          </button>
        </div>

        {/* Right — Vendor Ranking */}
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 mb-4">
            Ranking Vendor On-Time Rate
            <span className="ml-1.5 text-slate-300 normal-case font-normal">(terendah di atas)</span>
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
                      className="text-[10px] font-bold text-slate-700 hover:text-indigo-600 transition-colors text-left min-w-0 truncate flex-1"
                    >
                      {v.nama}
                    </button>
                    {/* Badge suspend */}
                    {isSuspended && (
                      <span className="text-[8px] font-black text-white bg-red-500 px-1.5 py-0.5 rounded-md" aria-label="Vendor suspended">
                        SUSPEND
                      </span>
                    )}
                    {/* Rate at end of bar (no X axis needed) */}
                    <span
                      className={cn("text-[10px] font-black shrink-0 w-12 text-right", isLow ? "text-red-600" : "text-slate-700")}
                      aria-label={`${v.onTimeRate}%`}
                    >
                      {isLow ? "✕ " : "● "}{v.onTimeRate}%
                    </span>
                    <button
                      onClick={() => router.push(`/goverment/pengajuan?vendor=${v.id}`)}
                      aria-label={`Navigasi ke pengajuan vendor ${v.nama}`}
                      className="w-5 h-5 flex items-center justify-center text-slate-300 hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <ExternalLink className="w-3 h-3" aria-hidden />
                    </button>
                  </div>
                  {/* Bar — no X axis, no gridlines */}
                  <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden" aria-hidden>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barPct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{
                        background: isLow
                          ? "#ef4444"
                          : isSuspended
                          ? "#f59e0b"
                          : "linear-gradient(90deg,#6366f1,#06b6d4)",
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
