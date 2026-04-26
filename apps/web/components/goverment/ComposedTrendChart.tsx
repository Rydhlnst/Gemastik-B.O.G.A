"use client"

import { useMemo, memo } from "react"
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
    <div className="min-w-[190px] rounded-xl border border-border bg-surface px-4 py-3 shadow-[var(--shadow-md)]">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{d.porsi.toLocaleString("id-ID")} porsi</p>
      <p className="mb-2 text-sm font-medium text-muted-foreground">{fmtRp(d.pengeluaran)}</p>
      <div className="flex flex-col gap-1 border-t border-border pt-2">
        <span className="text-xs text-foreground">SD: {d.porsiSD.toLocaleString("id-ID")}</span>
        <span className="text-xs text-foreground">SMP: {d.porsiSMP.toLocaleString("id-ID")}</span>
        <span className="text-xs text-foreground">SMA: {d.porsiSMA.toLocaleString("id-ID")}</span>
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
    <div className="rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Tren Distribusi
          </p>
          <p className="text-sm text-muted-foreground">
            Porsi dikirim{" "}
            <span className="text-muted-foreground">vs</span>{" "}
            pengeluaran
          </p>
        </div>
        {avgPrev > 0 && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Rata-rata periode lalu</p>
            <p className="text-sm font-semibold text-foreground tabular-nums">
              {avgPrev.toLocaleString("id-ID")} porsi/hari
            </p>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <ComposedChart data={series} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="porsiGrad2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--status-info))" stopOpacity={0.16} />
              <stop offset="95%" stopColor="hsl(var(--status-info))" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Only show first & last X label */}
          <XAxis
            dataKey="label"
            tick={({ x, y, payload }) => {
              if (payload.value !== firstLabel && payload.value !== lastLabel) return <g />
              return (
                <text
                  x={Number(x)}
                  y={Number(y) + 14}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight={500}
                  fill="hsl(var(--muted-foreground))"
                >
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
            tick={{ fontSize: 12, fontWeight: 500, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <YAxis
            yAxisId="pengeluaran"
            orientation="right"
            tickFormatter={fmtRp}
            tick={{ fontSize: 12, fontWeight: 500, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            width={44}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }} />

          {/* Avg prev dashed reference line (area-wide) */}
          {avgPrev > 0 && (
            <ReferenceLine
              yAxisId="porsi"
              y={avgPrev}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={{
                value: `Avg lalu: ${fmt(avgPrev)}`,
                position: "insideTopLeft" as const,
                fontSize: 12,
                fill: "hsl(var(--muted-foreground))",
              }}
            />
          )}

          {/* Porsi — primary, solid teal, thick */}
          <Area
            yAxisId="porsi"
            type="monotone"
            dataKey="porsi"
            stroke="hsl(var(--status-info))"
            strokeWidth={2.5}
            fill="url(#porsiGrad2)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: "hsl(var(--status-info))" }}
          />

          {/* Pengeluaran — secondary, pink dashed, thin */}
          <Line
            yAxisId="pengeluaran"
            type="monotone"
            dataKey="pengeluaran"
            stroke="hsl(var(--role-badge))"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0, fill: "hsl(var(--role-badge))" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
})
