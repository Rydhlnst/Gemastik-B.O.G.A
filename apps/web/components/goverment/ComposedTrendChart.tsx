"use client"

import { useMemo, memo } from "react"
import { useRouter } from "next/navigation"
import { useDashboardFilter } from "./DashboardFilterContext"
import {
  getDeliveryTrend,
  type TrendDataPoint,
} from "@/lib/mbgdummydata"
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts"

function fmt(v: number) {
  return Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(v)
}
function fmtRp(v: number) {
  return "Rp " + Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(v)
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const d: TrendDataPoint = payload[0]?.payload
  return (
    <div className="bg-white rounded-xl shadow-xl border border-slate-100 px-4 py-3 min-w-[160px]">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-black text-teal-600">{d.porsi.toLocaleString("id-ID")} porsi</p>
      <p className="text-[10px] font-bold text-pink-500 mb-2">{fmtRp(d.pengeluaran)}</p>
      <div className="flex flex-col gap-0.5 border-t border-slate-50 pt-1.5">
        <span className="text-[9px] text-rose-500 font-bold">SD: {d.porsiSD.toLocaleString("id-ID")}</span>
        <span className="text-[9px] text-indigo-500 font-bold">SMP: {d.porsiSMP.toLocaleString("id-ID")}</span>
        <span className="text-[9px] text-slate-500 font-bold">SMA: {d.porsiSMA.toLocaleString("id-ID")}</span>
      </div>
    </div>
  )
}

export const ComposedTrendChart = memo(function ComposedTrendChart() {
  const { filter } = useDashboardFilter()
  const activeJenjang = filter.jenjang.length ? filter.jenjang : undefined
  const { series, avgPrev } = useMemo(
    () => getDeliveryTrend(filter.periode, activeJenjang),
    [filter.periode, filter.jenjang]
  )

  // augment series with avgPrev for reference
  const firstLabel = series[0]?.label
  const lastLabel = series[series.length - 1]?.label

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 mb-0.5">
            Tren Distribusi
          </p>
          <p className="text-xs font-bold text-slate-600">
            Porsi dikirim{" "}
            <span className="text-slate-400 font-normal">vs</span>{" "}
            pengeluaran
          </p>
        </div>
        {avgPrev > 0 && (
          <div className="text-right">
            <p className="text-[9px] text-slate-400 font-bold">Rata-rata periode lalu</p>
            <p className="text-xs font-black text-slate-500">{avgPrev.toLocaleString("id-ID")} porsi/hari</p>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <ComposedChart data={series} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="porsiGrad2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Only show first & last X label */}
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
          <YAxis
            yAxisId="porsi"
            orientation="left"
            tickFormatter={fmt}
            tick={{ fontSize: 9, fontWeight: 700, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <YAxis
            yAxisId="pengeluaran"
            orientation="right"
            tickFormatter={fmtRp}
            tick={{ fontSize: 9, fontWeight: 700, fill: "#f9a8d4" }}
            axisLine={false}
            tickLine={false}
            width={44}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }} />

          {/* Avg prev dashed reference line (area-wide) */}
          {avgPrev > 0 && (
            <ReferenceLine
              yAxisId="porsi"
              y={avgPrev}
              stroke="#94a3b8"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={{
                value: `Avg lalu: ${fmt(avgPrev)}`,
                position: "insideTopLeft" as const,
                fontSize: 8,
              }}
            />
          )}

          {/* Porsi — primary, solid teal, thick */}
          <Area
            yAxisId="porsi"
            type="monotone"
            dataKey="porsi"
            stroke="#14b8a6"
            strokeWidth={2.5}
            fill="url(#porsiGrad2)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: "#14b8a6" }}
          />

          {/* Pengeluaran — secondary, pink dashed, thin */}
          <Line
            yAxisId="pengeluaran"
            type="monotone"
            dataKey="pengeluaran"
            stroke="#f472b6"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0, fill: "#f472b6" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
})
