"use client"

import { useMemo, memo } from "react"
import { useRouter } from "next/navigation"
import { useDashboardFilter } from "./DashboardFilterContext"
import { getKPISummary } from "@/lib/mbgdummydata"
import { cn } from "@/lib/utils"
import { AlertCircle, Clock, TrendingDown, TrendingUp, Package, Wallet } from "lucide-react"
import { motion } from "framer-motion"

// ── Inline SVG Sparkline (no external dep) ────────────────────────────────────

function Sparkline({
  data,
  color,
  targetLine,
  height = 28,
}: {
  data: number[]
  color: string
  targetLine?: number   // value in data-space to draw reference line
  height?: number
}) {
  if (!data.length) return null
  const W = 100
  const H = height
  const max = Math.max(...data, 0.001)
  const min = Math.min(...data)
  const range = max - min || 1

  const toY = (v: number) => H - ((v - min) / range) * (H - 4) - 2

  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * W},${toY(v)}`)
    .join(" ")

  const targetY = targetLine !== undefined ? toY(targetLine) : null

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      preserveAspectRatio="none"
      aria-hidden
    >
      {targetY !== null && (
        <line
          x1="0" y1={targetY} x2={W} y2={targetY}
          stroke="#94a3b8"
          strokeWidth="1"
          strokeDasharray="3 2"
        />
      )}
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Last point dot */}
      <circle
        cx={(data.length - 1) / (data.length - 1) * W}
        cy={toY(data[data.length - 1])}
        r="2"
        fill={color}
      />
    </svg>
  )
}

// ── Delta Badge ───────────────────────────────────────────────────────────────

function DeltaBadge({
  curr, prev, invert = false,
}: {
  curr: number; prev: number; invert?: boolean
}) {
  if (prev === 0) return null
  const pct = ((curr - prev) / Math.max(Math.abs(prev), 0.001)) * 100
  const up = pct >= 0
  const isGood = invert ? !up : up
  return (
    <span
      className={cn(
        "flex items-center gap-0.5 text-[9px] font-black",
        isGood ? "text-emerald-600" : "text-red-600"
      )}
      aria-label={`${up ? "Naik" : "Turun"} ${Math.abs(pct).toFixed(1)}% vs periode lalu`}
    >
      {up
        ? <TrendingUp className="w-2.5 h-2.5" aria-hidden />
        : <TrendingDown className="w-2.5 h-2.5" aria-hidden />}
      {up ? "+" : ""}{pct.toFixed(1)}% vs lalu
    </span>
  )
}

// ── Sparkline builder ─────────────────────────────────────────────────────────
// Uses a seeded deterministic PRNG (mulberry32) to avoid SSR/CSR hydration mismatch.
// Math.random() produces different values on server vs client, causing React warnings.

function seededRandom(seed: number) {
  let s = seed >>> 0
  return () => {
    s += 0x6d2b79f5
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t)
    return ((t ^ (t >>> 14)) >>> 0) / 0xffffffff
  }
}

function buildSparkline(endpoint: number, noise = 0.15): number[] {
  const rand = seededRandom(Math.round(endpoint * 1000))
  const pts: number[] = []
  for (let i = 6; i >= 1; i--) {
    const jitter = (rand() - 0.5) * 2 * noise * endpoint * (i * 0.4)
    pts.push(Math.max(0, endpoint + jitter))
  }
  pts.push(endpoint) // last point is always real value
  return pts
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

interface KPICardProps {
  label: string
  value: string
  sub: string
  delta: React.ReactNode
  sparkData: number[]
  sparkColor: string
  targetLine?: number
  icon: React.ReactNode
  iconBg: string
  onClick?: () => void
  urgent?: boolean
  borderClass: string
  ariaLabel: string
}

const KPICard = memo(function KPICard({
  label, value, sub, delta, sparkData, sparkColor, targetLine,
  icon, iconBg, onClick, urgent, borderClass, ariaLabel,
}: KPICardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={!onClick}
      className={cn(
        "flex-1 min-w-[160px] bg-white rounded-2xl border p-4 text-left flex flex-col gap-2 transition-all hover:shadow-lg",
        borderClass,
        onClick ? "cursor-pointer" : "cursor-default"
      )}
    >
      {/* Label */}
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>

      {/* Value + icon */}
      <div className="flex items-center gap-2">
        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", iconBg)} aria-hidden>
          {icon}
        </div>
        <p className={cn("text-xl font-black tracking-tighter leading-none", urgent ? "text-red-600" : "text-gray-900")}>
          {value}
        </p>
      </div>

      {/* Sparkline */}
      <div className="w-full">
        <Sparkline data={sparkData} color={sparkColor} targetLine={targetLine} height={28} />
      </div>

      {/* Sub + delta */}
      <div className="flex flex-col gap-0.5">
        <p className="text-[9px] text-slate-400 truncate">{sub}</p>
        {delta}
      </div>
    </motion.button>
  )
})

// ── Main KPIBar ───────────────────────────────────────────────────────────────

export const KPIBar = memo(function KPIBar() {
  const { filter } = useDashboardFilter()
  const router = useRouter()
  const kpi = useMemo(() => getKPISummary(filter.periode), [filter.periode])

  // sparklines — useMemo to avoid rebuild on unrelated renders
  const sengketaSpark  = useMemo(() => buildSparkline(kpi.sengketaAktif,    0.5),  [kpi.sengketaAktif])
  const vendorSpark    = useMemo(() => buildSparkline(kpi.vendorPending,     0.3),  [kpi.vendorPending])
  const onTimeSpark    = useMemo(() => buildSparkline(kpi.onTimeRate,        0.04), [kpi.onTimeRate])
  const porsiSpark     = useMemo(() => buildSparkline(kpi.totalPorsi,        0.1),  [kpi.totalPorsi])
  const pengeluaranSpark = useMemo(() => buildSparkline(kpi.totalPengeluaran, 0.08), [kpi.totalPengeluaran])

  return (
    <div className="flex gap-3 overflow-x-auto pb-1" role="region" aria-label="KPI ringkasan eksekutif">

      {/* 1 — Sengketa Aktif (paling kiri = paling urgent) */}
      <KPICard
        label="Sengketa Aktif"
        value={String(kpi.sengketaAktif)}
        sub="kasus perlu keputusan BGN"
        ariaLabel={`${kpi.sengketaAktif} sengketa aktif — klik untuk lihat verifikasi`}
        delta={<DeltaBadge curr={kpi.sengketaAktif} prev={kpi.sengketaAktifPrev} invert />}
        sparkData={sengketaSpark}
        sparkColor={kpi.sengketaAktif > 0 ? "#ef4444" : "#10b981"}
        icon={<AlertCircle className="w-4 h-4 text-white" aria-hidden />}
        iconBg={kpi.sengketaAktif > 0 ? "bg-red-500" : "bg-emerald-500"}
        onClick={() => router.push("/goverment/verifikasi")}
        urgent={kpi.sengketaAktif > 0}
        borderClass={kpi.sengketaAktif > 0 ? "border-red-200 ring-1 ring-red-50 hover:border-red-300" : "border-emerald-200 ring-1 ring-emerald-50 hover:border-emerald-300"}
      />

      {/* 2 — Vendor Pending */}
      <KPICard
        label="Vendor Pending"
        value={String(kpi.vendorPending)}
        sub="menunggu verifikasi SBT"
        ariaLabel={`${kpi.vendorPending} vendor pending — klik untuk lihat verifikasi`}
        delta={<DeltaBadge curr={kpi.vendorPending} prev={1} invert />}
        sparkData={vendorSpark}
        sparkColor={kpi.vendorPending > 0 ? "#f59e0b" : "#10b981"}
        icon={<Clock className="w-4 h-4 text-white" aria-hidden />}
        iconBg={kpi.vendorPending > 0 ? "bg-amber-500" : "bg-slate-400"}
        onClick={() => router.push("/goverment/verifikasi")}
        urgent={kpi.vendorPending > 0}
        borderClass={kpi.vendorPending > 0 ? "border-amber-200 ring-1 ring-amber-50 hover:border-amber-300" : "border-slate-200 ring-1 ring-slate-50 hover:border-slate-300"}
      />

      {/* 3 — On-Time Rate */}
      <KPICard
        label="On-Time Rate"
        value={`${kpi.onTimeRate}%`}
        sub={`target ≥ 95% · lalu ${kpi.onTimeRatePrev}%`}
        ariaLabel={`On-time rate ${kpi.onTimeRate}%, target 95%`}
        delta={<DeltaBadge curr={kpi.onTimeRate} prev={kpi.onTimeRatePrev} />}
        sparkData={onTimeSpark}
        sparkColor={kpi.onTimeRate >= 95 ? "#14b8a6" : "#f59e0b"}
        targetLine={95}
        icon={<TrendingUp className="w-4 h-4 text-white" aria-hidden />}
        iconBg={kpi.onTimeRate >= 95 ? "bg-teal-500" : "bg-amber-500"}
        urgent={kpi.onTimeRate < 95}
        borderClass={kpi.onTimeRate < 95 ? "border-red-200 ring-1 ring-red-50 hover:border-red-300" : "border-teal-200 ring-1 ring-teal-50 hover:border-teal-300"}
      />

      {/* 4 — Total Porsi */}
      <KPICard
        label="Total Porsi"
        value={kpi.totalPorsi > 0
          ? Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(kpi.totalPorsi)
          : "—"}
        sub="porsi terkirim periode ini"
        ariaLabel={`Total porsi: ${kpi.totalPorsi.toLocaleString("id-ID")}`}
        delta={<DeltaBadge curr={kpi.totalPorsi} prev={kpi.totalPorsiPrev} />}
        sparkData={porsiSpark}
        sparkColor="#6366f1"
        icon={<Package className="w-4 h-4 text-white" aria-hidden />}
        iconBg="bg-indigo-500"
        borderClass="border-indigo-200 ring-1 ring-indigo-50 hover:border-indigo-300"
      />

      {/* 5 — Total Pengeluaran */}
      <KPICard
        label="Total Pengeluaran"
        value={"Rp " + Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(kpi.totalPengeluaran)}
        sub="anggaran terpakai periode ini"
        ariaLabel={`Total pengeluaran: Rp ${kpi.totalPengeluaran.toLocaleString("id-ID")}`}
        delta={<DeltaBadge curr={kpi.totalPengeluaran} prev={kpi.totalPengeluaranPrev} />}
        sparkData={pengeluaranSpark}
        sparkColor="#f472b6"
        icon={<Wallet className="w-4 h-4 text-white" aria-hidden />}
        iconBg="bg-pink-500"
        borderClass="border-pink-200 ring-1 ring-pink-50 hover:border-pink-300"
      />

    </div>
  )
})
