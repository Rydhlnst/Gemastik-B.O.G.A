"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, ReferenceLine } from "recharts"
import { useRouter } from "next/navigation"
import { deliveryList } from "@/lib/mbgdummydata"

// ── Types ─────────────────────────────────────────────────────────────────────

export type TimeMode = "7H" | "30H" | "3B"

interface PorsiDataPoint {
  label: string
  porsi: number
  anomaly?: boolean
}

interface PorsiStatsResult {
  summaryValue: number
  summaryLabel: string
  series: PorsiDataPoint[]
  anomalyPointLabel?: string
}

// ── Data helpers ──────────────────────────────────────────────────────────────

function totalPorsiByDate(tanggal: string): number {
  return deliveryList
    .filter((d) => d.tanggal === tanggal)
    .reduce((sum, d) => {
      const porsi = d.status === "delivered" ? d.porsi_diterima : d.porsi_dikirim
      return sum + porsi
    }, 0)
}

function totalPorsiInRange(startDate: string, endDate: string): number {
  return deliveryList
    .filter((d) => d.tanggal >= startDate && d.tanggal <= endDate)
    .reduce((sum, d) => {
      const porsi = d.status === "delivered" ? d.porsi_diterima : d.porsi_dikirim
      return sum + porsi
    }, 0)
}

function offsetDate(base: Date, days: number): string {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function detectAnomaly(series: PorsiDataPoint[]): string | undefined {
  const nonZero = series.filter((p) => p.porsi > 0)
  if (nonZero.length === 0) return undefined
  const avg = nonZero.reduce((s, p) => s + p.porsi, 0) / nonZero.length
  const found = series.find((p) => p.porsi > 0 && p.porsi < avg * 0.8)
  return found?.label
}

// ── Compute chart data per mode ───────────────────────────────────────────────

const ANCHOR = deliveryList
  .map((d) => d.tanggal)
  .sort()
  .at(-1)!

function buildSeries(mode: TimeMode): PorsiStatsResult {
  const anchor = new Date(ANCHOR)

  if (mode === "7H") {
    const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]
    const series: PorsiDataPoint[] = []
    for (let i = 6; i >= 0; i--) {
      const date = offsetDate(anchor, -i)
      const dayName = DAY_LABELS[new Date(date).getDay()]
      series.push({ label: dayName, porsi: totalPorsiByDate(date) })
    }
    const anomalyLabel = detectAnomaly(series)
    const summaryValue = Math.max(...series.map((s) => s.porsi))
    return {
      summaryValue,
      summaryLabel: "Porsi tertinggi minggu ini",
      series: series.map((s) => ({ ...s, anomaly: s.label === anomalyLabel })),
      anomalyPointLabel: anomalyLabel,
    }
  }

  if (mode === "30H") {
    const series: PorsiDataPoint[] = []
    for (let i = 29; i >= 0; i--) {
      const date = offsetDate(anchor, -i)
      series.push({ label: date.slice(8, 10), porsi: totalPorsiByDate(date) })
    }
    const anomalyLabel = detectAnomaly(series)
    const summaryValue = Math.max(...series.map((s) => s.porsi))
    return {
      summaryValue,
      summaryLabel: "Porsi tertinggi bulan ini",
      series: series.map((s) => ({ ...s, anomaly: s.label === anomalyLabel })),
      anomalyPointLabel: anomalyLabel,
    }
  }

  // 3B
  const MONTH_SHORT = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agt","Sep","Okt","Nov","Des"]
  const series: PorsiDataPoint[] = []
  const anchorYear  = anchor.getFullYear()
  const anchorMonth = anchor.getMonth()

  for (let m = 2; m >= 0; m--) {
    let month = anchorMonth - m
    let year  = anchorYear
    if (month < 0) { month += 12; year -= 1 }
    const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`
    const lastDay   = new Date(year, month + 1, 0).getDate()
    const endDate   = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`
    series.push({ label: MONTH_SHORT[month], porsi: totalPorsiInRange(startDate, endDate) })
  }

  const anomalyLabel = detectAnomaly(series)
  const summaryValue = Math.max(...series.map((s) => s.porsi))
  return {
    summaryValue,
    summaryLabel: "Porsi tertinggi 3 bulan",
    series: series.map((s) => ({ ...s, anomaly: s.label === anomalyLabel })),
    anomalyPointLabel: anomalyLabel,
  }
}

// ── Formatter ─────────────────────────────────────────────────────────────────

function formatCompact(v: number) {
  return Intl.NumberFormat("id-ID", { notation: "compact" }).format(v)
}

// ── Component ─────────────────────────────────────────────────────────────────

export function StatsChart({ initialMode = "7H" }: { initialMode?: TimeMode }) {
  const router = useRouter()
  const [mode, setMode] = React.useState<TimeMode>(initialMode)
  const data = React.useMemo(() => buildSeries(mode), [mode])

  const chartConfig: ChartConfig = {
    porsi: { label: "Total Porsi", color: "#10b981" },
  }

  const MODES: TimeMode[] = ["7H", "30H", "3B"]

  return (
    <Card className="w-full border-0 shadow-none bg-transparent">
      <CardHeader className="flex flex-row items-start justify-between pb-2 p-0 mb-2">
        <div>
          <CardTitle className="text-[8px] font-black uppercase tracking-[0.2em] text-black mb-0.5">
            Total Porsi / Hari
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-100">
              {/* Package icon inline */}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-xl font-black text-black tracking-tighter">
              {formatCompact(data.summaryValue)}
            </p>
          </div>
          <CardDescription className="text-[8px] text-black mt-0.5">{data.summaryLabel}</CardDescription>
        </div>

        <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-xl p-0.5">
          {MODES.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-2.5 py-1 text-[9px] font-black rounded-lg uppercase transition-all ${
                mode === m
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ChartContainer config={chartConfig} className="h-[120px] w-full">
          <AreaChart
            data={data.series}
            margin={{ left: 0, right: 0, top: 12, bottom: 0 }}
          >
            <defs>
              <linearGradient id="porsiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#f1f5f9" />
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 8, fontWeight: 700, fill: "#000000" }} 
              tickMargin={12}
              axisLine={false}
              tickLine={false}
              padding={{ left: 10, right: 10 }}
              minTickGap={mode === "30H" ? 25 : 0}
            />
            <YAxis
              tickFormatter={(v) => formatCompact(Number(v))}
              tick={{ fontSize: 8, fontWeight: 700, fill: "#000000" }}
              tickMargin={8}
              width={35}
              axisLine={false}
              tickLine={false}
              domain={[0, 'auto']}
            />
            <ChartTooltip
              content={(props) => (
                <ChartTooltipContent
                  {...props}
                  className="backdrop-blur-md bg-white/80 border-slate-100 shadow-2xl"
                  formatter={(value) => [
                    `${Number(value).toLocaleString("id-ID")} porsi`,
                    "Total Porsi",
                  ]}
                />
              )}
            />

            {data.anomalyPointLabel && (
              <ReferenceLine
                x={data.anomalyPointLabel}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: "!",
                  position: "top",
                  fontSize: 10,
                  fill: "#f59e0b",
                  fontWeight: "bold",
                }}
                onClick={() => router.push("/goverment/riwayat")}
                style={{ cursor: "pointer" }}
              />
            )}

            <Area
              type="monotone"
              dataKey="porsi"
              stroke="#10b981"
              strokeWidth={1.5}
              fill="url(#porsiGradient)"
              fillOpacity={1}
              name="Total Porsi"
              dot={{ r: 1.5, stroke: "#000000", strokeWidth: 1, fill: "#000000" }}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default StatsChart
