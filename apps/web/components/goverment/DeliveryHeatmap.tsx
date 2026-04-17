"use client"

import { useMemo, memo } from "react"
import { getDeliveryHeatmap } from "@/lib/mbgdummydata"

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

function lerp(t: number): string {
  // 0 → slate-50, 1 → teal-600
  const r = Math.round(240 + (13 - 240) * t)
  const g = Math.round(244 + (148 - 244) * t)
  const b = Math.round(248 + (100 - 248) * t)
  return `rgb(${r},${g},${b})`
}

export const DeliveryHeatmap = memo(function DeliveryHeatmap() {
  const { cells, avgPerHour } = useMemo(() => getDeliveryHeatmap(), [])

  const maxVol = Math.max(...cells.map((c) => c.volume), 1)
  const maxAvg = Math.max(...avgPerHour, 1)

  // group cells by day
  const byDay: Record<number, { hour: number; volume: number }[]> = {}
  cells.forEach((c) => {
    if (!byDay[c.day]) byDay[c.day] = []
    byDay[c.day].push({ hour: c.hour, volume: c.volume })
  })

  // active days (skip Sunday)
  const activeDays = [1, 2, 3, 4, 5, 6]

  // peak/trough hours from avg
  const peakHour = avgPerHour.indexOf(Math.max(...avgPerHour))
  const troughHour = avgPerHour.slice(6, 21).indexOf(Math.min(...avgPerHour.slice(6, 21))) + 6

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5" role="region" aria-label="Heatmap jam pengiriman">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 mb-0.5">
            Pola Jam Pengiriman
          </p>
          <p className="text-xs font-bold text-slate-600">Volume porsi per jam · 7 hari</p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-1.5" aria-label="Legenda intensitas">
          <span className="text-[8px] text-slate-400 font-bold">Rendah</span>
          <div className="flex gap-0.5">
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map((t) => (
              <div key={t} className="w-4 h-3 rounded-sm" style={{ background: lerp(t) }} aria-hidden />
            ))}
          </div>
          <span className="text-[8px] text-slate-400 font-bold">Tinggi</span>
        </div>
      </div>

      {/* Hour axis labels — only at peak & trough & 0 & 23 */}
      <div className="flex">
        <div className="w-9 shrink-0" aria-hidden /> {/* day label spacer */}
        <div className="flex-1 relative h-4" aria-hidden>
          {[0, peakHour, troughHour, 23].filter((v, i, a) => a.indexOf(v) === i).map((h) => (
            <span
              key={h}
              className="absolute text-[8px] font-bold text-slate-400 transform -translate-x-1/2"
              style={{ left: `${(h / 23) * 100}%` }}
            >
              {String(h).padStart(2, "0")}
            </span>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex flex-col gap-0.5 mt-1" role="img" aria-label="Grid heatmap pengiriman per jam per hari">
        {activeDays.map((day) => {
          const hours = byDay[day] ?? []
          return (
            <div key={day} className="flex items-center gap-0.5">
              {/* Day label */}
              <span className="w-9 shrink-0 text-[8px] font-black text-slate-500 text-right pr-2" aria-label={DAY_NAMES[day]}>
                {DAY_NAMES[day]}
              </span>
              {/* 24 cells */}
              <div className="flex flex-1 gap-0.5">
                {Array.from({ length: 24 }, (_, h) => {
                  const cell = hours.find((c) => c.hour === h)
                  const vol = cell?.volume ?? 0
                  const t = vol / maxVol
                  const title = `${DAY_NAMES[day]} ${String(h).padStart(2, "0")}:00 — ${vol.toLocaleString("id-ID")} porsi`
                  return (
                    <div
                      key={h}
                      className="flex-1 h-5 rounded-sm"
                      style={{ background: lerp(t) }}
                      title={title}
                      aria-label={vol > 0 ? title : undefined}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Sparkline average */}
      <div className="flex mt-2 gap-0.5 items-end" aria-label="Rata-rata volume per jam">
        <div className="w-9 shrink-0 text-[7px] text-slate-400 text-right pr-2">Avg</div>
        <div className="flex flex-1 gap-0.5 items-end h-6">
          {avgPerHour.map((v, h) => {
            const pct = (v / maxAvg) * 100
            return (
              <div
                key={h}
                className="flex-1 rounded-sm"
                style={{ height: `${Math.max(pct, 4)}%`, background: "#14b8a6", opacity: 0.7 }}
                title={`Rata-rata jam ${h}: ${v.toLocaleString("id-ID")} porsi`}
                aria-hidden
              />
            )
          })}
        </div>
      </div>
      <p className="text-[8px] text-slate-400 mt-1.5 text-center">
        ↑ Rata-rata volume per jam sebagai referensi komparasi hari-hari di grid
      </p>
    </div>
  )
})
