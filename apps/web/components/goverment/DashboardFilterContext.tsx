"use client"

import React, { createContext, useContext, useState, useMemo } from "react"
import type { DashboardPeriode, JenjangFilter } from "@/lib/mbgdummydata"
import { sppgList } from "@/lib/mbgdummydata"

// ── Filter Context (periode, SPPG, jenjang) ──────────────────────────────────
// Intentionally SEPARATE from SchoolSearchContext to prevent chart re-renders
// when user types in the search box.

export interface DashboardFilter {
  periode: DashboardPeriode
  sppgId: number | null   // null = semua SPPG
  jenjang: JenjangFilter[] // empty array = semua jenjang
}

interface DashboardFilterContextValue {
  filter: DashboardFilter
  setPeriode: (p: DashboardPeriode) => void
  setSppgId: (id: number | null) => void
  toggleJenjang: (j: JenjangFilter) => void
}

const DashboardFilterContext = createContext<DashboardFilterContextValue | null>(null)

export function DashboardFilterProvider({ children }: { children: React.ReactNode }) {
  const [filter, setFilter] = useState<DashboardFilter>({
    periode: "7H",
    sppgId: null,
    jenjang: [],
  })

  const setPeriode = (p: DashboardPeriode) => setFilter((prev) => ({ ...prev, periode: p }))
  const setSppgId = (id: number | null) => setFilter((prev) => ({ ...prev, sppgId: id }))
  const toggleJenjang = (j: JenjangFilter) =>
    setFilter((prev) => ({
      ...prev,
      jenjang: prev.jenjang.includes(j)
        ? prev.jenjang.filter((x) => x !== j)
        : [...prev.jenjang, j],
    }))

  const value = useMemo(
    () => ({ filter, setPeriode, setSppgId, toggleJenjang }),
    [filter]
  )

  return (
    <DashboardFilterContext.Provider value={value}>
      {children}
    </DashboardFilterContext.Provider>
  )
}

export function useDashboardFilter() {
  const ctx = useContext(DashboardFilterContext)
  if (!ctx) throw new Error("useDashboardFilter must be used within DashboardFilterProvider")
  return ctx
}

// ── School Search Context (isolated so typing doesn't re-render charts) ───────

interface SchoolSearchContextValue {
  query: string
  setQuery: (q: string) => void
}

const SchoolSearchContext = createContext<SchoolSearchContextValue | null>(null)

export function SchoolSearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState("")
  const value = useMemo(() => ({ query, setQuery }), [query])
  return <SchoolSearchContext.Provider value={value}>{children}</SchoolSearchContext.Provider>
}

export function useSchoolSearch() {
  const ctx = useContext(SchoolSearchContext)
  if (!ctx) throw new Error("useSchoolSearch must be used within SchoolSearchProvider")
  return ctx
}
