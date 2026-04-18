"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { useDashboardFilter } from "./DashboardFilterContext"
import { sppgList } from "@/lib/mbgdummydata"
import type { DashboardPeriode, JenjangFilter } from "@/lib/mbgdummydata"
import { cn } from "@/lib/utils"
import { LayoutDashboard, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const ANCHOR_DATE = "2025-04-03"
const ANCHOR_FORMATTED = "3 Apr 2025, 08.43"
const REFRESH_LABEL = "diperbarui 3 menit lalu"

const PERIODES: { label: string; value: DashboardPeriode }[] = [
  { label: "1 Hari", value: "1H" },
  { label: "7 Hari", value: "7H" },
  { label: "30 Hari", value: "30H" },
]

const JENJANGS: JenjangFilter[] = ["SD", "SMP", "SMA"]

export function DashboardHeader() {
  const { filter, setPeriode, setSppgId, toggleJenjang } = useDashboardFilter()
  const router = useRouter()

  const activeSppg = useMemo(
    () => sppgList.find((s) => s.id === filter.sppgId) ?? null,
    [filter.sppgId]
  )

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between pb-4">
      {/* Left — title + timestamp */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg,#6366f1,#06b6d4)" }}
        >
          <LayoutDashboard className="w-5 h-5 text-white" aria-hidden />
        </div>
        <div>
          <h1 className="text-lg font-extrabold text-gray-900 tracking-tight leading-none">
            Dashboard Pemerintah
          </h1>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Data per{" "}
            <span className="font-semibold text-gray-600">{ANCHOR_FORMATTED}</span>
            {" — "}
            <span className="text-indigo-500">{REFRESH_LABEL}</span>
          </p>
        </div>
      </div>

      {/* Right — filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Periode toggle */}
        <div className="flex items-center gap-0.5 bg-slate-100 rounded-xl p-0.5" role="group" aria-label="Filter periode">
          {PERIODES.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriode(p.value)}
              aria-pressed={filter.periode === p.value}
              className={cn(
                "px-3 py-1.5 text-[10px] font-black rounded-lg transition-all",
                filter.periode === p.value
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-slate-200"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* SPPG dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all text-[10px] font-black text-gray-600"
              aria-label="Filter SPPG"
            >
              <span>{activeSppg ? activeSppg.nama : "Semua SPPG"}</span>
              <ChevronDown className="w-3 h-3" aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="text-xs">
            <DropdownMenuItem
              onClick={() => setSppgId(null)}
              className={cn("font-semibold", !filter.sppgId && "text-indigo-600")}
            >
              Semua SPPG
            </DropdownMenuItem>
            {sppgList.map((s) => (
              <DropdownMenuItem
                key={s.id}
                onClick={() => setSppgId(s.id)}
                className={cn("font-semibold", filter.sppgId === s.id && "text-indigo-600")}
              >
                {s.nama}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Jenjang multi-select pills */}
        <div className="flex items-center gap-1" role="group" aria-label="Filter jenjang">
          {/* Semua — active when no jenjang selected */}
          <button
            onClick={() => {
              // Clear all jenjang selections by toggling off each active one
              filter.jenjang.forEach((j) => toggleJenjang(j))
            }}
            aria-pressed={filter.jenjang.length === 0}
            className={cn(
              "px-3 py-1.5 text-[10px] font-black rounded-xl border transition-all",
              filter.jenjang.length === 0
                ? "bg-slate-700 border-slate-700 text-white"
                : "bg-white border-slate-200 text-gray-500 hover:border-slate-400"
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
                  "px-3 py-1.5 text-[10px] font-black rounded-xl border transition-all",
                  active
                    ? j === "SD"
                      ? "bg-rose-600 border-rose-600 text-white"
                      : j === "SMP"
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "bg-slate-600 border-slate-600 text-white"
                    : "bg-white border-slate-200 text-gray-500 hover:border-slate-400"
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
