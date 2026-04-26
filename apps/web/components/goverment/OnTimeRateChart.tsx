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
        "relative overflow-hidden rounded-xl border bg-surface p-5 shadow-[var(--shadow-card)]",
        isBelowTarget ? "border-status-warning/30" : "border-border"
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-1">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            On-Time Rate
          </p>
          <p className={cn("text-2xl font-semibold tracking-tight tabular-nums", isBelowTarget ? "text-status-warning" : "text-status-success")}>
            {current}%
          </p>
        </div>
        {/* Delta vs prev — anchoring */}
        <div className="flex items-center gap-2 text-sm">
          {isDown
            ? <TrendingDown className="w-4 h-4 text-status-danger" aria-hidden />
            : <TrendingUp className="w-4 h-4 text-status-success" aria-hidden />}
          <span className={cn("font-medium tabular-nums", isDown ? "text-status-danger" : "text-status-success")}>
            {isDown ? "" : "+"}{delta}%
          </span>
          <span className="text-muted-foreground">vs periode lalu ({prev}%)</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={130}>
        <AreaChart data={series} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="onTimeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isBelowTarget ? "hsl(var(--status-warning))" : "hsl(var(--status-success))"} stopOpacity={0.15} />
              <stop offset="95%" stopColor={isBelowTarget ? "hsl(var(--status-warning))" : "hsl(var(--status-success))"} stopOpacity={0} />
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
                fontSize={12}
                fontWeight={500}
                fill={(payload.value as number) === TARGET ? "hsl(var(--status-danger))" : "hsl(var(--muted-foreground))"}
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
                <text x={Number(x)} y={Number(y) + 14} textAnchor="middle" fontSize={12} fontWeight={500} fill="hsl(var(--muted-foreground))">
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
                <div className="rounded-xl border border-border bg-surface px-4 py-3 shadow-[var(--shadow-md)]">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                  <p className={cn("text-sm font-semibold", (payload[0].value as number) < TARGET ? "text-status-warning" : "text-status-success")}>
                    {payload[0].value}%
                  </p>
                </div>
              ) : null
            }
            cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
          />

          {/* Target line — the only gridline */}
          <ReferenceLine
            y={TARGET}
            stroke="hsl(var(--status-danger))"
            strokeWidth={1}
            strokeDasharray="4 4"
            aria-label="Garis target on-time rate 95%"
          />

          <Area
            type="monotone"
            dataKey="rate"
            stroke={isBelowTarget ? "hsl(var(--status-warning))" : "hsl(var(--status-success))"}
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
          className="absolute bottom-5 right-5 flex items-center gap-2 rounded-full border border-status-warning/30 bg-status-warning-bg px-4 py-2 text-sm font-medium text-status-warning hover:bg-status-warning-bg/70 transition-colors"
        >
          <ExternalLink className="w-3 h-3" aria-hidden />
          Lihat keterlambatan aktif
        </button>
      )}
    </div>
  )
})
