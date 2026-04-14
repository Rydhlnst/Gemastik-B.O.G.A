"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, TrendingUp, TrendingDown, Users, Package,
  CheckCircle, AlertCircle, Clock, ChevronDown, Calendar,
  MapPin, ExternalLink, HelpCircle, CheckCircle2
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ExpandingSearchDock } from "@/components/ui/ExpandingSearchDock"
import { SimplePagination } from "@/components/ui/SimplePagination"
import { AlertBanner, type AlertItem } from "@/components/goverment/AlertBanner"
import { DailyBriefing } from "@/components/goverment/DailyBriefing"
import { ActivityFeed, type FeedItem } from "@/components/goverment/ActivityFeed"
import { ComplianceModal } from "@/components/goverment/ComplianceModal"

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, AreaChart, Area,
  ReferenceLine
} from "recharts"

// ─── Data ────────────────────────────────────────────────────────────────────

const PORSI_DATA: Record<string, { day: string; porsi: number; date: string }[]> = {
  "7H": [
    { day: "Sen", porsi: 4200, date: "07 Apr" },
    { day: "Sel", porsi: 4800, date: "08 Apr" },
    { day: "Rab", porsi: 2900, date: "09 Apr" }, // anomaly
    { day: "Kam", porsi: 5100, date: "10 Apr" },
    { day: "Jum", porsi: 5420, date: "11 Apr" },
    { day: "Sab", porsi: 4900, date: "12 Apr" },
    { day: "Min", porsi: 5200, date: "13 Apr" },
  ],
  "30H": [
    { day: "M1", porsi: 31000, date: "Minggu 1" },
    { day: "M2", porsi: 34200, date: "Minggu 2" },
    { day: "M3", porsi: 28500, date: "Minggu 3" }, // anomaly
    { day: "M4", porsi: 36800, date: "Minggu 4" },
  ],
  "3B": [
    { day: "Feb", porsi: 132000, date: "Februari 2025" },
    { day: "Mar", porsi: 145000, date: "Maret 2025" },
    { day: "Apr", porsi: 98000, date: "April 2025" },
  ],
}

const SCHOOL_DIST = [
  { name: "SD", count: 8, kapasitas: 10, aktual: 8, color: "#fb7185" },
  { name: "SMP", count: 4, kapasitas: 5, aktual: 4, color: "#818cf8" },
  { name: "SMA", count: 2, kapasitas: 3, aktual: 2, color: "#64748b" },
]

const ON_TIME_RATE = 94.2 // Below 95 threshold → gateway shows
const ON_TIME_LAST_WEEK = 97.8
const KONFIRMASI_RATE = 97.2
const KONFIRMASI_LAST_WEEK = 96.5

const VERIFICATION_STATS = [
  {
    name: "Vendor",
    value: 100,
    color: "#10b981",
    trend: "up" as const,
    trendValue: 3,
    entities: [
      { nama: "CV Katering Bandung Juara", status: "patuh" as const, skor: 100 },
      { nama: "PT Gizi Priangan Utama", status: "patuh" as const, skor: 100 },
      { nama: "Logistik Parahyangan", status: "patuh" as const, skor: 100 },
      { nama: "Agro Lembang Segar", status: "patuh" as const, skor: 100 },
      { nama: "Katering Pasundan Berkah", status: "patuh" as const, skor: 100 },
      { nama: "CV Food Hub Jabar", status: "tidak_patuh" as const, skor: 0 },
    ],
  },
  {
    name: "Sekolah",
    value: 85,
    color: "#6366f1",
    trend: "down" as const,
    trendValue: 4,
    entities: [
      { nama: "SMAN 3 Bandung", status: "patuh" as const, skor: 95 },
      { nama: "SMPN 2 Bandung", status: "patuh" as const, skor: 90 },
      { nama: "SDN 061 Cirengel", status: "perhatian" as const, skor: 78 },
      { nama: "SMPN 5 Bandung", status: "patuh" as const, skor: 88 },
      { nama: "SDN 164 Karang Pawulang", status: "tidak_patuh" as const, skor: 62 },
      { nama: "SMAN 20 Bandung", status: "perhatian" as const, skor: 81 },
    ],
  },
  {
    name: "Logistik",
    value: 92,
    color: "#06b6d4",
    trend: "up" as const,
    trendValue: 1,
    entities: [
      { nama: "Armada 1 – Bandung Utara", status: "patuh" as const, skor: 98 },
      { nama: "Armada 2 – Bandung Selatan", status: "patuh" as const, skor: 94 },
      { nama: "Armada 3 – Lembang", status: "perhatian" as const, skor: 82 },
      { nama: "Armada 4 – Coblong", status: "patuh" as const, skor: 96 },
    ],
  },
]

type SchoolStatus = "ontime" | "terlambat" | "belum_konfirmasi" | "sengketa"
const SCHOOL_STATUS: {
  id: number; nama: string; kota: string; porsi: number;
  status: SchoolStatus; lat: number; lng: number
}[] = [
  { id: 1, nama: "SMAN 3 Bandung", kota: "Bandung", porsi: 920, status: "ontime", lat: -6.9135, lng: 107.6186 },
  { id: 2, nama: "SMPN 2 Bandung", kota: "Bandung", porsi: 750, status: "ontime", lat: -6.9104, lng: 107.6141 },
  { id: 3, nama: "SDN 061 Cirengel", kota: "Bandung", porsi: 410, status: "belum_konfirmasi", lat: -6.9015, lng: 107.6112 },
  { id: 4, nama: "SMPN 5 Bandung", kota: "Bandung", porsi: 810, status: "terlambat", lat: -6.9112, lng: 107.6125 },
  { id: 5, nama: "SDN 164 Karang Pawulang", kota: "Bandung", porsi: 460, status: "sengketa", lat: -6.9247, lng: 107.6321 },
  { id: 6, nama: "SMAN 20 Bandung", kota: "Bandung", porsi: 880, status: "ontime", lat: -6.9078, lng: 107.6212 },
  { id: 7, nama: "SDN Coblong 01", kota: "Bandung", porsi: 320, status: "ontime", lat: -6.8950, lng: 107.6100 },
  { id: 8, nama: "SMPN 7 Bandung", kota: "Bandung", porsi: 650, status: "terlambat", lat: -6.9200, lng: 107.6050 },
  { id: 9, nama: "SDN Dago 02", kota: "Bandung", porsi: 280, status: "belum_konfirmasi", lat: -6.8900, lng: 107.6200 },
  { id: 10, nama: "SMA 8 Bandung", kota: "Bandung", porsi: 940, status: "ontime", lat: -6.9300, lng: 107.6150 },
  { id: 11, nama: "SDN Merdeka 01", kota: "Bandung", porsi: 380, status: "ontime", lat: -6.9130, lng: 107.6080 },
  { id: 12, nama: "SMPN 3 Bandung", kota: "Bandung", porsi: 590, status: "ontime", lat: -6.9080, lng: 107.6250 },
]

const ALERTS: AlertItem[] = [
  {
    id: "a1",
    severity: "warning",
    message: "3 pengiriman hari ini belum terkonfirmasi — batas waktu 14.00 WIB",
    actionLabel: "Lihat Detail",
    actionHref: "/goverment/verifikasi",
  },
]

const ACTIVITY_FEED: FeedItem[] = [
  { id: "f1", type: "success", message: "Vendor CV Katering Bandung Juara disetujui SBT-nya", time: "5 menit lalu", href: "/goverment/pengajuan" },
  { id: "f2", type: "warning", message: "Pengiriman ke SDN 164 Karang Pawulang terlambat 2 jam", time: "12 menit lalu", href: "/goverment/pengawasan" },
  { id: "f3", type: "refund", message: "Refund Rp 4.200.000 dieksekusi ke kas negara", time: "1 jam lalu", href: "/goverment/verifikasi" },
  { id: "f4", type: "info", message: "Laporan distribusi Minggu ke-14 tersedia", time: "3 jam lalu", href: "/goverment/riwayat" },
  { id: "f5", type: "success", message: "SMPN 2 Bandung: penerimaan MBG terkonfirmasi", time: "5 jam lalu", href: "/goverment/pengawasan" },
  { id: "f6", type: "warning", message: "Stok bahan baku vendor Agro Lembang Segar menipis", time: "8 jam lalu", href: "/goverment/pengajuan" },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function SchoolStatusBadge({ status }: { status: SchoolStatus }) {
  const cfg = {
    ontime: { icon: CheckCircle2, color: "text-emerald-500", dot: "bg-emerald-500", label: "On-time" },
    terlambat: { icon: Clock, color: "text-amber-500", dot: "bg-amber-500", label: "Terlambat" },
    belum_konfirmasi: { icon: HelpCircle, color: "text-blue-400", dot: "bg-blue-400", label: "Belum Konfirmasi" },
    sengketa: { icon: AlertCircle, color: "text-red-500", dot: "bg-red-500 animate-pulse", label: "Sengketa" },
  }[status]
  const Icon = cfg.icon
  return (
    <span className={`flex items-center gap-1 text-[9px] font-black ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  )
}

// CSS Dot Minimap (static, lightweight)
function DotMinimap({ filter, onNavigate }: { filter: string | null; onNavigate: () => void }) {
  // Map Bandung bounding box approximate → normalize coords to 100%x100% container
  const LAT_MIN = -6.96, LAT_MAX = -6.88
  const LNG_MIN = 107.58, LNG_MAX = 107.64

  const schoolDots = SCHOOL_STATUS.filter(s => {
    if (!filter) return true
    if (filter === "SD") return s.nama.startsWith("SD")
    if (filter === "SMP") return s.nama.startsWith("SMP")
    if (filter === "SMA") return s.nama.startsWith("SMA") || s.nama.startsWith("SMK")
    return true
  }).map(s => ({
    ...s,
    x: ((s.lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 100,
    y: ((s.lat - LAT_MAX) / (LAT_MIN - LAT_MAX)) * 100,
  }))

  const dotColors: Record<SchoolStatus, string> = {
    ontime: "#10b981",
    terlambat: "#f59e0b",
    belum_konfirmasi: "#60a5fa",
    sengketa: "#ef4444",
  }

  return (
    <div
      onClick={onNavigate}
      className="relative h-28 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
    >
      {/* Grid lines */}
      <div className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)",
          backgroundSize: "25% 25%"
        }}
      />
      {/* Label */}
      <div className="absolute top-2 left-2 text-[8px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
        <MapPin className="w-2.5 h-2.5" /> Bandung
      </div>
      {/* Open button */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-black text-indigo-500 flex items-center gap-0.5">
        <ExternalLink className="w-2.5 h-2.5" /> Buka Peta
      </div>
      {/* Dots */}
      {schoolDots.map(s => (
        <div
          key={s.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-white shadow-sm"
          style={{ left: `${s.x}%`, top: `${s.y}%`, background: dotColors[s.status] }}
          title={s.nama}
        />
      ))}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 px-4 py-3">
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{payload[0]?.payload?.date || label}</p>
        <p className="text-base font-black text-gray-900 tabular-nums">
          {payload[0]?.value?.toLocaleString("id-ID")} porsi
        </p>
      </div>
    )
  }
  return null
}

// ─── Main Component ───────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 6

export default function GovermentDashboard() {
  const router = useRouter()
  const [isSchoolsOpen, setIsSchoolsOpen] = useState(false)
  const [isActivityOpen, setIsActivityOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterLevel, setFilterLevel] = useState("SEMUA")
  const [schoolPage, setSchoolPage] = useState(1)
  const [activityPage, setActivityPage] = useState(1)
  const [timeRange, setTimeRange] = useState<"7H" | "30H" | "3B">("7H")
  const [distFilter, setDistFilter] = useState<string | null>(null)
  const [showMinimap, setShowMinimap] = useState(false)
  const [complianceModal, setComplianceModal] = useState<typeof VERIFICATION_STATS[0] | null>(null)

  useEffect(() => { setSchoolPage(1) }, [searchQuery, filterLevel])

  const porsiData = PORSI_DATA[timeRange]
  const anomalyIndex = useMemo(() => {
    const values = porsiData.map(d => d.porsi)
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    return porsiData.findIndex(d => d.porsi < avg * 0.8)
  }, [porsiData])

  const filteredSchools = useMemo(() => {
    return SCHOOL_STATUS.filter(s => {
      const m = s.nama.toLowerCase().includes(searchQuery.toLowerCase()) || s.kota.toLowerCase().includes(searchQuery.toLowerCase())
      if (filterLevel === "SEMUA") return m
      if (filterLevel === "SD") return m && s.nama.startsWith("SD")
      if (filterLevel === "SMP") return m && s.nama.startsWith("SMP")
      if (filterLevel === "SMA") return m && (s.nama.startsWith("SMA") || s.nama.startsWith("SMK"))
      return m
    })
  }, [searchQuery, filterLevel])

  const paginatedSchools = useMemo(() => {
    const start = (schoolPage - 1) * ITEMS_PER_PAGE
    return filteredSchools.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredSchools, schoolPage])

  const paginatedActivities = useMemo(() => {
    const start = (activityPage - 1) * ITEMS_PER_PAGE
    return ACTIVITY_FEED.slice(start, start + ITEMS_PER_PAGE)
  }, [activityPage])

  const isOnTimeBelowThreshold = ON_TIME_RATE < 95

  const handleBarClick = useCallback((bar: any) => {
    if (!bar) return
    const name = bar.name as string
    setDistFilter(prev => prev === name ? null : name)
    setShowMinimap(true)
  }, [])

  return (
    <div className="p-6 space-y-4 min-h-full bg-slate-50/50">

      {/* Alert Banner */}
      <AlertBanner alerts={ALERTS} />

      {/* Daily Briefing */}
      <DailyBriefing
        data={{
          porsiHariIni: 5420,
          sengketaAktif: 2,
          vendorMenunggu: 1,
          urgentHref: "/goverment/verifikasi",
        }}
      />

      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#06b6d4)" }}>
          <LayoutDashboard className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Dashboard Pemerintah</h1>
          <p className="text-xs text-gray-400">Pusat pemantauan logistik & operasional nasional</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">

        {/* Card 1: Porsi / Hari */}
        <div className="col-span-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex flex-col hover:shadow-lg transition-all group overflow-hidden relative min-h-[220px]">
          <div className="flex justify-between items-start mb-2 relative z-10">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 mb-0.5">Total Porsi / Hari</p>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-50 group-hover:scale-110 transition-transform">
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-black text-gray-900 tracking-tighter">5.420</h3>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-xl p-0.5">
              {(["7H", "30H", "3B"] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={cn(
                    "px-2.5 py-1 text-[9px] font-black rounded-lg uppercase transition-all",
                    timeRange === r
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-700"
                  )}
                >
                  {r}
                </button>
              ))}
              <div className="w-5 h-5 flex items-center justify-center text-gray-300">
                <Calendar className="w-3 h-3" />
              </div>
            </div>
          </div>

          <div className="flex-1 mt-auto -mx-5 -mb-5 h-[100px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={porsiData}>
                <defs>
                  <linearGradient id="porsiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip content={<CustomTooltip />} />
                {anomalyIndex >= 0 && (
                  <ReferenceLine
                    x={porsiData[anomalyIndex]?.day}
                    stroke="#f59e0b"
                    strokeDasharray="3 3"
                    label={{
                      value: "Pengiriman Tertunda",
                      position: "top",
                      fontSize: 8,
                      fill: "#d97706",
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
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#porsiGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#10b981", stroke: "white", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: Distribusi Unit + Dot Minimap */}
        <div className="col-span-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex flex-col hover:shadow-lg transition-all min-h-[220px]">
          <div className="flex justify-between items-start mb-1">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 mb-0.5">Distribusi</p>
              <h3 className="text-xl font-black text-gray-900 tracking-tighter">14 unit</h3>
            </div>
            <div className="flex items-center gap-2">
              {distFilter && (
                <button
                  onClick={() => { setDistFilter(null) }}
                  className="text-[8px] font-black text-indigo-500 hover:text-red-500 uppercase px-2 py-1 rounded-lg bg-indigo-50 hover:bg-red-50 transition-all"
                >
                  Reset filter
                </button>
              )}
              <button
                onClick={() => setShowMinimap(p => !p)}
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                  showMinimap ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-500 hover:bg-indigo-100"
                )}
                title="Toggle Minimap"
              >
                <MapPin className="w-4 h-4" />
              </button>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                <Users className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={SCHOOL_DIST} onClick={(data) => data?.activePayload && handleBarClick(data.activePayload[0]?.payload)}>
                <XAxis dataKey="name" hide />
                <YAxis hide domain={[0, 12]} />
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2">
                        <p className="text-[9px] font-black text-gray-400 uppercase">{payload[0]?.payload?.name}</p>
                        <p className="text-sm font-black text-gray-900">Aktual: {payload[0]?.payload?.aktual}</p>
                        <p className="text-[9px] text-gray-400">Kapasitas: {payload[0]?.payload?.kapasitas}</p>
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="aktual" radius={[5, 5, 5, 5]} barSize={20} cursor="pointer">
                  {SCHOOL_DIST.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={distFilter && distFilter !== entry.name ? "#e2e8f0" : entry.color}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between mb-2">
            {SCHOOL_DIST.map((s) => (
              <div key={s.name} className="flex flex-col items-center">
                <span className="text-[7px] font-black text-gray-400 uppercase">{s.name}</span>
                <span className="text-[10px] font-black text-gray-700">{s.aktual}/{s.kapasitas}</span>
              </div>
            ))}
          </div>

          {/* Dot Minimap */}
          <AnimatePresence>
            {showMinimap && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
                  Persebaran Geografis {distFilter ? `— ${distFilter}` : "Semua"}
                </p>
                <DotMinimap
                  filter={distFilter}
                  onNavigate={() => router.push(`/goverment/pengawasan${distFilter ? `?filter=${distFilter}` : ""}`)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Card 3: On-Time Rate */}
        <div
          className={cn(
            "col-span-1 bg-white rounded-3xl border shadow-sm p-5 flex flex-col hover:shadow-lg transition-all min-h-[200px]",
            isOnTimeBelowThreshold ? "border-amber-200 ring-1 ring-amber-100" : "border-gray-100"
          )}
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 mb-0.5">On-Time Rate</p>
              <h3 className={cn("text-xl font-black tracking-tighter", isOnTimeBelowThreshold ? "text-amber-600" : "text-indigo-600")}>
                {ON_TIME_RATE}%
              </h3>
            </div>
            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-md", isOnTimeBelowThreshold ? "bg-amber-500" : "bg-indigo-600")}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-3">
            {/* Distribusi */}
            <div className="space-y-1">
              <div className="flex justify-between text-[8px] font-black uppercase text-gray-400 tracking-wider">
                <span>Distribusi</span>
                <span className="text-gray-900">{ON_TIME_RATE}%</span>
              </div>
              <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100 relative">
                {/* Baseline (last week) */}
                <div
                  className="absolute top-0 h-full w-0.5 bg-gray-400/40 z-10"
                  style={{ left: `${ON_TIME_LAST_WEEK}%` }}
                  title={`Minggu lalu: ${ON_TIME_LAST_WEEK}%`}
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${ON_TIME_RATE}%` }}
                  className={cn("h-full rounded-full", isOnTimeBelowThreshold ? "bg-amber-500" : "bg-indigo-500")}
                />
              </div>
              <p className="text-[7px] text-gray-400 font-medium">
                Minggu lalu: {ON_TIME_LAST_WEEK}%
                {ON_TIME_RATE < ON_TIME_LAST_WEEK
                  ? <span className="text-red-400 ml-1">▼ {(ON_TIME_LAST_WEEK - ON_TIME_RATE).toFixed(1)}%</span>
                  : <span className="text-emerald-400 ml-1">▲ {(ON_TIME_RATE - ON_TIME_LAST_WEEK).toFixed(1)}%</span>
                }
              </p>
            </div>

            {/* Konfirmasi */}
            <div className="space-y-1">
              <div className="flex justify-between text-[8px] font-black uppercase text-gray-400 tracking-wider">
                <span>Konfirmasi</span>
                <span className="text-gray-900">{KONFIRMASI_RATE}%</span>
              </div>
              <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100 relative">
                <div
                  className="absolute top-0 h-full w-0.5 bg-gray-400/40 z-10"
                  style={{ left: `${KONFIRMASI_LAST_WEEK}%` }}
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${KONFIRMASI_RATE}%` }}
                  className="h-full bg-cyan-400 rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Conditional Gateway */}
          {isOnTimeBelowThreshold && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => router.push("/goverment/verifikasi")}
              className="mt-3 flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-[9px] font-black uppercase tracking-wider hover:bg-amber-100 transition-all"
            >
              <ExternalLink className="w-3 h-3" />
              Lihat keterlambatan aktif
            </motion.button>
          )}
        </div>

        {/* Card 4: Kepatuhan Sistem */}
        <div className="col-span-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-5 hover:shadow-lg transition-all min-h-[200px] flex flex-col">
          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Kepatuhan Sistem</p>
          <div className="flex-1 flex justify-around items-center gap-4">
            {VERIFICATION_STATS.map((stat) => (
              <button
                key={stat.name}
                onClick={() => setComplianceModal(stat)}
                className="flex flex-col items-center gap-2 group hover:scale-105 transition-transform"
              >
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="50%" cy="50%" r="40%" fill="transparent" stroke="#f3f4f6" strokeWidth="5" />
                    <motion.circle
                      cx="50%" cy="50%" r="40%"
                      fill="transparent"
                      stroke={stat.color}
                      strokeWidth="5"
                      strokeDasharray="100 100"
                      initial={{ strokeDashoffset: 100 }}
                      animate={{ strokeDashoffset: 100 - stat.value }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-black text-gray-900">{stat.value}%</span>
                </div>
                <span className="text-[7px] font-black text-gray-400 uppercase tracking-tighter">{stat.name}</span>

                {/* Trend indicator */}
                <span className={cn(
                  "flex items-center gap-0.5 text-[8px] font-black",
                  stat.trend === "up" ? "text-emerald-500" : stat.trend === "down" ? "text-red-400" : "text-gray-400"
                )}>
                  {stat.trend === "up"
                    ? <TrendingUp className="w-2.5 h-2.5" />
                    : stat.trend === "down"
                    ? <TrendingDown className="w-2.5 h-2.5" />
                    : null
                  }
                  {stat.trend !== "stable" && `${stat.trend === "up" ? "+" : "-"}${stat.trendValue}%`}
                </span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setComplianceModal(VERIFICATION_STATS[1])} // Default to Sekolah yang di bawah threshold
            className="mt-auto w-full py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-[8px] font-black uppercase tracking-wider hover:bg-gray-100 transition-all"
          >
            Audit Details
          </button>
        </div>

      </div>

      {/* Card: Status Sekolah MBG */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <button
          onClick={() => setIsSchoolsOpen(!isSchoolsOpen)}
          className={cn(
            "w-full h-14 px-6 flex items-center justify-between transition-all group overflow-hidden",
            isSchoolsOpen
              ? "bg-gradient-to-r from-indigo-500 to-cyan-400 text-white"
              : "bg-white border-b border-gray-50 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-cyan-400 hover:text-white"
          )}
        >
          <div className="flex items-center gap-4">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center transition-all", isSchoolsOpen ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600 group-hover:bg-white/20 group-hover:text-white")}>
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className={cn("font-bold text-sm transition-colors", isSchoolsOpen ? "text-white" : "text-gray-900 group-hover:text-white")}>Status Sekolah MBG</h2>
              <p className={cn("text-[9px] font-bold uppercase tracking-widest mt-0.5 transition-colors", isSchoolsOpen ? "text-white/70" : "text-gray-400 group-hover:text-white/70")}>Pemantauan distribusi nasional</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex flex-col items-end">
              <span className={cn("text-base font-black leading-none transition-colors", isSchoolsOpen ? "text-white" : "text-gray-900 group-hover:text-white")}>{filteredSchools.length}</span>
              <span className={cn("text-[8px] font-black uppercase tracking-tighter transition-colors", isSchoolsOpen ? "text-white/80" : "text-emerald-500 group-hover:text-white/80")}>Lokasi Aktif</span>
            </div>
            <div className={cn("w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300", isSchoolsOpen ? "rotate-180 bg-white/10 border-white/20 text-white" : "bg-white border-gray-100 text-gray-400 group-hover:bg-white/10 group-hover:border-white/20 group-hover:text-white")}>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </button>

        <AnimatePresence>
          {isSchoolsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden flex-1 flex flex-col"
            >
              {/* Search & Filter */}
              <div className="px-6 py-4 bg-gray-50/40 border-b border-gray-100 flex items-center justify-between gap-6 shrink-0">
                <ExpandingSearchDock onSearch={(q) => setSearchQuery(q)} placeholder="Cari sekolah..." initialValue={searchQuery} />
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                  {["SEMUA", "SD", "SMP", "SMA"].map((level) => (
                    <button
                      key={level}
                      onClick={() => setFilterLevel(level)}
                      className={`px-4 py-1.5 text-[9px] font-black rounded-lg transition-all ${filterLevel === level ? "bg-indigo-600 text-white shadow-md shadow-indigo-100 scale-105" : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Schools List */}
              <div className="divide-y divide-gray-50 flex flex-col flex-1">
                <div className="flex-1">
                  {paginatedSchools.length > 0 ? (
                    paginatedSchools.map((s) => (
                      <div
                        key={s.id}
                        className="px-6 py-3 flex items-center justify-between hover:bg-gray-100/30 transition-all border-b last:border-0 border-gray-50 group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-2.5 h-2.5 rounded-full ring-2 ring-white flex-shrink-0 ${s.nama.startsWith("SD") ? "bg-rose-400" : s.nama.startsWith("SMP") ? "bg-indigo-400" : "bg-slate-500"}`} />
                          <div className="group-hover:translate-x-0.5 transition-transform">
                            <p className="text-sm font-bold text-gray-900">{s.nama}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-[10px] text-gray-400 font-medium">{s.kota}</p>
                              <SchoolStatusBadge status={s.status} />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-base font-black text-indigo-600 tabular-nums">{s.porsi.toLocaleString()}</p>
                            <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Porsi / Hari</p>
                          </div>
                          {/* MapPin Gateway */}
                          <button
                            onClick={() => router.push(`/goverment/pengawasan?school=${s.id}`)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                            title={`Lihat ${s.nama} di peta`}
                          >
                            <MapPin className="w-4 h-4" />
                          </button>
                          {/* Sengketa Gateway */}
                          {s.status === "sengketa" && (
                            <button
                              onClick={() => router.push(`/goverment/verifikasi?case=${s.id}`)}
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-all animate-pulse"
                              title="Ada sengketa aktif"
                            >
                              <AlertCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-16 text-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-sm font-bold text-gray-800">Tidak ada sekolah ditemukan</p>
                      <button
                        onClick={() => { setSearchQuery(""); setFilterLevel("SEMUA") }}
                        className="text-[10px] text-indigo-600 font-bold mt-4 uppercase tracking-wider"
                      >
                        Reset Parameter
                      </button>
                    </div>
                  )}
                </div>
                <div className="px-6 py-4 border-t border-gray-50 mt-auto flex justify-center bg-gray-50/10">
                  <SimplePagination
                    currentPage={schoolPage}
                    totalPages={Math.ceil(filteredSchools.length / ITEMS_PER_PAGE)}
                    onPageChange={setSchoolPage}
                    className="max-w-xs"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Activity Feed */}
      <ActivityFeed items={ACTIVITY_FEED} />

      {/* Compliance Modal */}
      <ComplianceModal
        isOpen={!!complianceModal}
        onClose={() => setComplianceModal(null)}
        data={complianceModal
          ? {
              kategori: complianceModal.name,
              skor: complianceModal.value,
              trend: complianceModal.trend,
              trendValue: complianceModal.trendValue,
              entities: complianceModal.entities,
            }
          : null
        }
      />
    </div>
  )
}
