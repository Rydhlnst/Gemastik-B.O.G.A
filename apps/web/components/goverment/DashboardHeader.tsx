"use client"

import { useMemo } from "react"
import { ChevronDown, LayoutDashboard } from "lucide-react"

import { sppgList } from "@/lib/mbgdummydata"
import type { DashboardPeriode, JenjangFilter } from "@/lib/mbgdummydata"
import { cn } from "@/lib/utils"
import { useDashboardFilter } from "./DashboardFilterContext"
import { PageHeader } from "@/components/ui/page-header"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const ANCHOR_FORMATTED = "3 Apr 2025, 08.43"
const REFRESH_LABEL = "Diperbarui 3 menit lalu"

const PERIODES: { label: string; value: DashboardPeriode }[] = [
  { label: "1 Hari", value: "1H" },
  { label: "7 Hari", value: "7H" },
  { label: "30 Hari", value: "30H" },
]

const JENJANGS: JenjangFilter[] = ["SD", "SMP", "SMA"]

export function DashboardHeader() {
  const { filter, setPeriode, setSppgId, toggleJenjang } = useDashboardFilter()

  const activeSppg = useMemo(
    () => sppgList.find((s) => s.id === filter.sppgId) ?? null,
    [filter.sppgId]
  )

  return (
    <div className="space-y-4">
      <PageHeader
        title={
          <span className="inline-flex items-center gap-2">
            <span className="inline-flex size-9 items-center justify-center rounded-xl bg-role-primary text-white">
              <LayoutDashboard className="size-5" aria-hidden />
            </span>
            <span>Dashboard Pemerintah</span>
          </span>
        }
        subtitle={
          <span>
            Data per <span className="font-medium text-foreground">{ANCHOR_FORMATTED}</span>{" "}
            <span className="text-muted-foreground">•</span>{" "}
            <span className="text-muted-foreground">{REFRESH_LABEL}</span>
          </span>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div
          className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-1.5 py-1"
          role="group"
          aria-label="Filter periode"
        >
          {PERIODES.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriode(p.value)}
              aria-pressed={filter.periode === p.value}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                filter.periode === p.value
                  ? "bg-role-primary text-white"
                  : "text-muted-foreground hover:bg-surface-raised hover:text-foreground"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-raised transition-colors"
              aria-label="Filter SPPG"
            >
              <span className="max-w-[220px] truncate">
                {activeSppg ? activeSppg.nama : "Semua SPPG"}
              </span>
              <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="text-sm">
            <DropdownMenuItem
              onClick={() => setSppgId(null)}
              className={cn(!filter.sppgId && "font-semibold")}
            >
              Semua SPPG
            </DropdownMenuItem>
            {sppgList.map((s) => (
              <DropdownMenuItem
                key={s.id}
                onClick={() => setSppgId(s.id)}
                className={cn(filter.sppgId === s.id && "font-semibold")}
              >
                {s.nama}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter jenjang">
          <button
            onClick={() => {
              filter.jenjang.forEach((j) => toggleJenjang(j))
            }}
            aria-pressed={filter.jenjang.length === 0}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              filter.jenjang.length === 0
                ? "border-role-primary bg-role-accent text-foreground"
                : "border-border bg-surface text-muted-foreground hover:bg-surface-raised hover:text-foreground"
            )}
          >
            Semua
          </button>

          {JENJANGS.map((j) => {
            const active = filter.jenjang.includes(j)
            return (
              <button
                key={j}
                onClick={() => toggleJenjang(j)}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "border-role-primary bg-role-accent text-foreground"
                    : "border-border bg-surface text-muted-foreground hover:bg-surface-raised hover:text-foreground"
                )}
              >
                {j}
              </button>
            )
          })}
        </div>
      </div>

    </div>
  )
}
