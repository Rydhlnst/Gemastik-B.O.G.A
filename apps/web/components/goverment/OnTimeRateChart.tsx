"use client"

import { useMemo, memo } from "react"
import { useRouter } from "next/navigation"
import { useDashboardFilter } from "./DashboardFilterContext"
import { getOnTimeRateSeries } from "@/lib/mbgdummydata"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts"
import { cn } from "@/lib/utils"
import { ExternalLink, TrendingDown, TrendingUp } from "lucide-react"

const TARGET = 95

export const OnTimeRateChart = memo(function OnTimeRateChart() {
  const { filter } = useDashboardFilter()
  const router = useRouter()
  const activeJenjang = filter.jenjang.length ? filter.jenjang : undefined
  const { series, current, prev } = useMemo(
    () => getOnTimeRateSeries(filter.periode, activeJenjang),
    [filter.periode, filter.jenjang]
  )

  const isBelowTarget = current < TARGET
  const delta = (current - prev).toFixed(1)
  const isDown = current < prev

  const firstLabel = series[0]?.label
  const lastLabel = series[series.length - 1]?.label

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border p-5 relative overflow-hidden",
        isBelowTarget ? "border-amber-200" : "border-slate-100"
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-1">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 mb-0.5">
            On-Time Rate
          </p>
          <p className={cn("text-xl font-black tracking-tighter", isBelowTarget ? "text-amber-600" : "text-teal-600")}>
            {current}%
          </p>
        </div>
        {/* Delta vs prev — anchoring */}
        <div className="flex items-center gap-1 text-[10px] font-bold">
          {isDown
            ? <TrendingDown className="w-3 h-3 text-red-500" aria-hidden />
            : <TrendingUp className="w-3 h-3 text-emerald-500" aria-hidden />}
          <span className={isDown ? "text-red-500" : "text-emerald-500"}>
            {isDown ? "" : "+"}{delta}%
          </span>
          <span className="text-slate-400">vs periode lalu ({prev}%)</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={130}>
        <AreaChart data={series} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="onTimeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isBelowTarget ? "#f59e0b" : "#14b8a6"} stopOpacity={0.15} />
              <stop offset="95%" stopColor={isBelowTarget ? "#f59e0b" : "#14b8a6"} stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Only 3 Y labels: 0, 95, 100 */}
          <YAxis
            domain={[0, 100]}
            ticks={[0, TARGET, 100]}
            tick={({ x, y, payload }) => (
              <text
                x={Number(x) - 4}
                y={Number(y) + 4}
                textAnchor="end"
                fontSize={8}
                fontWeight={700}
                fill={(payload.value as number) === TARGET ? "#ef4444" : "#94a3b8"}
              >
                {payload.value}%
              </text>
            )}
            axisLine={false}
            tickLine={false}
            width={28}
          />

          {/* Only first & last X label */}
          <XAxis
            dataKey="label"
            tick={({ x, y, payload }) => {
              if (payload.value !== firstLabel && payload.value !== lastLabel) return <g />
              return (
                <text x={Number(x)} y={Number(y) + 12} textAnchor="middle" fontSize={9} fontWeight={700} fill="#94a3b8">
                  {payload.value}
                </text>
              )
            }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <div className="bg-white rounded-xl shadow-xl border border-slate-100 px-3 py-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase">{label}</p>
                  <p className={cn("text-sm font-black", (payload[0].value as number) < TARGET ? "text-amber-600" : "text-teal-600")}>
                    {payload[0].value}%
                  </p>
                </div>
              ) : null
            }
            cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
          />

          {/* Target line — the only gridline */}
          <ReferenceLine
            y={TARGET}
            stroke="#ef4444"
            strokeWidth={1}
            strokeDasharray="4 4"
            aria-label="Garis target on-time rate 95%"
          />

          <Area
            type="monotone"
            dataKey="rate"
            stroke={isBelowTarget ? "#f59e0b" : "#14b8a6"}
            strokeWidth={2}
            fill="url(#onTimeGrad)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Conditional action button — INSIDE chart area, not below */}
      {isBelowTarget && (
        <button
          onClick={() => router.push("/goverment/verifikasi")}
          aria-label="Lihat keterlambatan aktif di halaman verifikasi"
          className="absolute bottom-5 right-5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 border border-amber-300 text-amber-800 text-[9px] font-black uppercase tracking-wider hover:bg-amber-200 transition-all"
        >
          <ExternalLink className="w-3 h-3" aria-hidden />
          Lihat keterlambatan aktif
        </button>
      )}
    </div>
  )
})
