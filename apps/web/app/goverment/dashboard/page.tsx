"use client"

import { DashboardFilterProvider, SchoolSearchProvider } from "@/components/goverment/DashboardFilterContext"
import { DashboardHeader } from "@/components/goverment/DashboardHeader"
import { AlertBanner, type AlertItem } from "@/components/goverment/AlertBanner"
import { KPIBar } from "@/components/goverment/KPIBar"
import { ComposedTrendChart } from "@/components/goverment/ComposedTrendChart"
import { OnTimeRateChart } from "@/components/goverment/OnTimeRateChart"
import { StatusPerJenjangChart } from "@/components/goverment/StatusPerJenjangChart"
import { ComplianceRankingPanel } from "@/components/goverment/ComplianceRankingPanel"
import { SchoolStatusPanel } from "@/components/goverment/SchoolStatusPanel"
import { DeliveryHeatmap } from "@/components/goverment/DeliveryHeatmap"

// ─── Static alerts (in production: derive from getActivityLog or API) ─────────
const ALERTS: AlertItem[] = [
  {
    id: "a1",
    severity: "warning",
    message: "3 pengiriman hari ini belum terkonfirmasi — batas waktu 14.00 WIB",
    anchor: "lebih tinggi dari rata-rata 7 hari lalu (biasanya 1)",
    actionLabel: "Lihat Detail",
    actionHref: "/goverment/verifikasi",
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GovermentDashboard() {
  return (
    /**
     * Layout DAL:
     * [1] Header + Filter
     * [2] Alert Banner
     * [3] KPI Bar
     * [4] ComposedChart (Porsi + Pengeluaran)
     * [5] On-Time Rate Chart
     * [6] Status per Jenjang
     * [7] Compliance + Vendor Ranking
     * [8] School Status + Log Aktivitas
     * [+] Delivery Heatmap (bonus analitik)
     *
     * DashboardFilterProvider: shares periode/SPPG/jenjang to all charts
     * SchoolSearchProvider:    isolated to table only — prevents chart re-renders on typing
     */
    <DashboardFilterProvider>
      <SchoolSearchProvider>
        <div className="p-5 space-y-4 min-h-full bg-slate-50/40">

          {/* [1] Header & Filter Global */}
          <DashboardHeader />

          {/* [2] Alert Banner */}
          <AlertBanner alerts={ALERTS} />

          {/* [3] KPI Bar */}
          <KPIBar />

          {/* [4] + [5] Trend + On-Time side by side */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <ComposedTrendChart />
            <OnTimeRateChart />
          </div>

          {/* [6] Status per Jenjang */}
          <StatusPerJenjangChart />

          {/* [7] Compliance + Vendor Ranking */}
          <ComplianceRankingPanel />

          {/* [8] School Status + Log Aktivitas */}
          <SchoolStatusPanel />

          {/* [+] Delivery Heatmap */}
          <DeliveryHeatmap />

        </div>
      </SchoolSearchProvider>
    </DashboardFilterProvider>
  )
}
