"use client"

import { useMemo } from "react"
import { AlertCircle, Package, Timer, Wallet } from "lucide-react"

import {
  DashboardFilterProvider,
  SchoolSearchProvider,
  useDashboardFilter,
} from "@/components/goverment/DashboardFilterContext"
import { DashboardHeader } from "@/components/goverment/DashboardHeader"
import { AlertBanner, type AlertItem } from "@/components/goverment/AlertBanner"
import { ComposedTrendChart } from "@/components/goverment/ComposedTrendChart"
import { OnTimeRateChart } from "@/components/goverment/OnTimeRateChart"
import { StatusPerJenjangChart } from "@/components/goverment/StatusPerJenjangChart"
import { ComplianceRankingPanel } from "@/components/goverment/ComplianceRankingPanel"
import { SchoolStatusPanel } from "@/components/goverment/SchoolStatusPanel"
import { DeliveryHeatmap } from "@/components/goverment/DeliveryHeatmap"
import { KpiCard } from "@/components/ui/kpi-card"
import { getKPISummary } from "@/lib/mbgdummydata"

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

function GovKpiRow() {
  const { filter } = useDashboardFilter()
  const kpi = useMemo(() => getKPISummary(filter.periode), [filter.periode])

  const compact = (value: number) =>
    Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(value)

  const compactRp = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
      notation: "compact",
      compactDisplay: "short",
    }).format(value)

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ringkasan KPI">
      <KpiCard
        title="Anggaran terserap"
        value={compactRp(kpi.totalPengeluaran)}
        trend={`${kpi.totalPengeluaran >= kpi.totalPengeluaranPrev ? "+" : ""}${compactRp(
          kpi.totalPengeluaran - kpi.totalPengeluaranPrev
        )} vs periode lalu`}
        trendDirection={kpi.totalPengeluaran >= kpi.totalPengeluaranPrev ? "up" : "down"}
        icon={<Wallet className="size-4" aria-hidden />}
      />
      <KpiCard
        title="Porsi terdistribusi"
        value={compact(kpi.totalPorsi)}
        unit="porsi"
        trend={`${kpi.totalPorsi >= kpi.totalPorsiPrev ? "+" : ""}${compact(
          kpi.totalPorsi - kpi.totalPorsiPrev
        )} vs periode lalu`}
        trendDirection={kpi.totalPorsi >= kpi.totalPorsiPrev ? "up" : "down"}
        icon={<Package className="size-4" aria-hidden />}
      />
      <KpiCard
        title="On-time rate"
        value={`${kpi.onTimeRate}%`}
        trend={`${kpi.onTimeRate >= kpi.onTimeRatePrev ? "+" : ""}${(
          kpi.onTimeRate - kpi.onTimeRatePrev
        ).toFixed(1)}% vs periode lalu`}
        trendDirection={kpi.onTimeRate >= kpi.onTimeRatePrev ? "up" : "down"}
        icon={<Timer className="size-4" aria-hidden />}
      />
      <KpiCard
        title="Sengketa aktif"
        value={kpi.sengketaAktif}
        trend={kpi.sengketaAktif > 0 ? "Perlu keputusan hari ini" : "Tidak ada sengketa"}
        trendDirection={kpi.sengketaAktif > 0 ? "down" : "flat"}
        icon={<AlertCircle className="size-4" aria-hidden />}
      />
    </section>
  )
}

export default function GovermentDashboard() {
  return (
    <DashboardFilterProvider>
      <SchoolSearchProvider>
        <div className="min-h-full bg-background text-foreground">
          <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
            <DashboardHeader />
            <AlertBanner alerts={ALERTS} />
            <GovKpiRow />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
              <div className="min-w-0 space-y-6 xl:col-span-8">
                <ComposedTrendChart />
                <SchoolStatusPanel />
              </div>
              <div className="min-w-0 space-y-6 xl:col-span-4">
                <OnTimeRateChart />
                <ComplianceRankingPanel />
                <StatusPerJenjangChart />
              </div>
            </div>

            <DeliveryHeatmap />
          </div>
        </div>
      </SchoolSearchProvider>
    </DashboardFilterProvider>
  )
}
