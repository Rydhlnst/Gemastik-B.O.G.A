"use client"

import { useState, useMemo, useEffect } from "react"
import { cn } from "@/lib/utils"
import { LayoutDashboard, TrendingUp, Users, Package, CheckCircle, AlertCircle, Clock, ChevronDown, Search, Filter } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ExpandingSearchDock } from "@/components/ui/ExpandingSearchDock"
import { CustomPagination } from "@/components/ui/CustomPagination"
import { SimplePagination } from "@/components/ui/SimplePagination"

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, AreaChart, Area, RadialBarChart, RadialBar, PieChart, Pie
} from "recharts"

const PORSI_TREND = [
  { day: "Sen", porsi: 4200 },
  { day: "Sel", porsi: 4800 },
  { day: "Rab", porsi: 4500 },
  { day: "Kam", porsi: 5100 },
  { day: "Jum", porsi: 5420 },
  { day: "Sab", porsi: 4900 },
  { day: "Min", porsi: 5200 },
]

const SCHOOL_DIST = [
  { name: "SD", count: 8, color: "#fb7185" },
  { name: "SMP", count: 4, color: "#818cf8" },
  { name: "SMA", count: 2, color: "#64748b" },
]

const VERIFICATION_STATS = [
  { name: "Vendor", value: 100, color: "#10b981" },
  { name: "Sekolah", value: 85, color: "#6366f1" },
  { name: "Logistik", value: 92, color: "#06b6d4" },
]

const RECENT_ACTIVITY = [
  { type: "success", msg: "Pengiriman ke SDN Menteng 01 selesai", time: "2 menit lalu" },
  { type: "warning", msg: "Stok daging ayam vendor Berkah Jaya menipis", time: "15 menit lalu" },
  { type: "success", msg: "Verifikasi vendor Segar Alami disetujui", time: "1 jam lalu" },
  { type: "info", msg: "Laporan distribusi Minggu ke-14 tersedia", time: "3 jam lalu" },
  { type: "success", msg: "SMPN 12 Jakarta: penerimaan MBG terkonfirmasi", time: "5 jam lalu" },
  { type: "success", msg: "SDN Kebayoran 03: distribusi makan siang selesai", time: "6 jam lalu" },
  { type: "info", msg: "Penambahan 3 sekolah baru di wilayah Jakarta Timur", time: "8 jam lalu" },
  { type: "warning", msg: "Keterlambatan pengiriman di SMAN 4 Jakarta", time: "10 jam lalu" },
  { type: "success", msg: "Audit vendor Dapur Harmoni selesai", time: "1 hari lalu" },
  { type: "info", msg: "Update menu mingguan untuk periode April", time: "1 hari lalu" },
]

const SCHOOL_STATUS = [
  { nama: "SDN Menteng 01", kota: "Jakarta Pusat", porsi: 450, status: "Aktif" },
  { nama: "SMPN 12 Jakarta", kota: "Jakarta Selatan", porsi: 620, status: "Aktif" },
  { nama: "SDN Kebayoran 03", kota: "Jakarta Selatan", porsi: 380, status: "Aktif" },
  { nama: "SMAN 4 Jakarta", kota: "Jakarta Timur", porsi: 710, status: "Aktif" },
  { nama: "SDN Grogol 02", kota: "Jakarta Barat", porsi: 290, status: "Aktif" },
  { nama: "SMKN 1 Jakarta", kota: "Jakarta Utara", porsi: 243, status: "Aktif" },
  { nama: "SDN Tebet 05", kota: "Jakarta Selatan", porsi: 310, status: "Aktif" },
  { nama: "SMPN 1 Jakarta", kota: "Jakarta Pusat", porsi: 580, status: "Aktif" },
  { nama: "SDN Gambir 01", kota: "Jakarta Pusat", porsi: 200, status: "Aktif" },
  { nama: "SMA 3 Jakarta", kota: "Jakarta Selatan", porsi: 850, status: "Aktif" },
  { nama: "SDN Palmerah 03", kota: "Jakarta Barat", porsi: 420, status: "Aktif" },
  { nama: "SMPN 2 Jakarta", kota: "Jakarta Pusat", porsi: 530, status: "Aktif" },
]


const ITEMS_PER_PAGE = 6

export default function GovermentDashboard() {
  const [isSchoolsOpen, setIsSchoolsOpen] = useState(false)
  const [isActivityOpen, setIsActivityOpen] = useState(false)

  // States for Filter & Search
  const [searchQuery, setSearchQuery] = useState("")
  const [filterLevel, setFilterLevel] = useState("SEMUA")

  // Pagination States
  const [schoolPage, setSchoolPage] = useState(1)
  const [activityPage, setActivityPage] = useState(1)

  // Reset school page when filter/search changes
  useEffect(() => {
    setSchoolPage(1)
  }, [searchQuery, filterLevel])

  const filteredSchools = useMemo(() => {
    return SCHOOL_STATUS.filter(school => {
      const matchesSearch = school.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.kota.toLowerCase().includes(searchQuery.toLowerCase())

      if (filterLevel === "SEMUA") return matchesSearch
      if (filterLevel === "SD") return matchesSearch && school.nama.startsWith("SD")
      if (filterLevel === "SMP") return matchesSearch && school.nama.startsWith("SMP")
      if (filterLevel === "SMA") return matchesSearch && (school.nama.startsWith("SMA") || school.nama.startsWith("SMK"))
      return matchesSearch
    })
  }, [searchQuery, filterLevel])

  const paginatedSchools = useMemo(() => {
    const start = (schoolPage - 1) * ITEMS_PER_PAGE
    return filteredSchools.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredSchools, schoolPage])

  const paginatedActivities = useMemo(() => {
    const start = (activityPage - 1) * ITEMS_PER_PAGE
    return RECENT_ACTIVITY.slice(start, start + ITEMS_PER_PAGE)
  }, [activityPage])

  return (
    <div className="p-6 space-y-4 min-h-full bg-slate-50/50">

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

      {/* Redesigned Stats Grid (Based on Reference Image Shapes - 2x2 Layout) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">

        {/* Card 1: Total Porsi Trend (Area Chart) */}
        <div className="col-span-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex flex-col hover:shadow-lg transition-all group overflow-hidden relative min-h-[200px]">
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
            <span className="text-[8px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">+12.4%</span>
          </div>

          <div className="flex-1 mt-auto -mx-5 -mb-5 h-[90px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PORSI_TREND}>
                <defs>
                  <linearGradient id="porsiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="porsi"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#porsiGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: Status Sekolah (Vertical Bar Chart) */}
        <div className="col-span-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex flex-col hover:shadow-lg transition-all min-h-[200px]">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 mb-0.5">Distribusi</p>
              <h3 className="text-xl font-black text-gray-900 tracking-tighter">14 unit</h3>
            </div>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SCHOOL_DIST}>
                <XAxis dataKey="name" hide />
                <YAxis hide domain={[0, 10]} />
                <Bar dataKey="count" radius={[5, 5, 5, 5]} barSize={16}>
                  {SCHOOL_DIST.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-2">
            {SCHOOL_DIST.map((s) => (
              <div key={s.name} className="flex flex-col items-center">
                <span className="text-[7px] font-black text-gray-400 uppercase">{s.name}</span>
                <span className="text-[9px] font-bold text-gray-700">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Performance (Linear / Gauge-like Bar) */}
        <div className="col-span-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex flex-col hover:shadow-lg transition-all min-h-[200px]">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 mb-0.5">On-Time Rate</p>
              <h3 className="text-xl font-black text-indigo-600 tracking-tighter">98.8%</h3>
            </div>
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-50">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-2">
            <div className="space-y-1">
              <div className="flex justify-between text-[8px] font-black uppercase text-gray-400 tracking-wider">
                <span>Distribusi</span>
                <span className="text-gray-900">99.5%</span>
              </div>
              <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-50">
                <motion.div initial={{ width: 0 }} animate={{ width: "99.5%" }} className="h-full bg-indigo-500 rounded-full" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[8px] font-black uppercase text-gray-400 tracking-wider">
                <span>Konfirmasi</span>
                <span className="text-gray-900">97.2%</span>
              </div>
              <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-50">
                <motion.div initial={{ width: 0 }} animate={{ width: "97.2%" }} className="h-full bg-cyan-400 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Verification (Circular Progress Style) */}
        <div className="col-span-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-5 hover:shadow-lg transition-all min-h-[200px] flex flex-col">
          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Kepatuhan Sistem</p>
          <div className="flex-1 flex justify-around items-center gap-4">
            {VERIFICATION_STATS.map((stat) => (
              <div key={stat.name} className="flex flex-col items-center gap-2 group">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="50%" cy="50%" r="40%" fill="transparent" stroke="#f3f4f6" strokeWidth="4" />
                    <motion.circle
                      cx="50%" cy="50%" r="40%"
                      fill="transparent"
                      stroke={stat.color}
                      strokeWidth="4"
                      strokeDasharray="100 100"
                      initial={{ strokeDashoffset: 100 }}
                      animate={{ strokeDashoffset: 100 - stat.value }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-black text-gray-900">{stat.value}%</span>
                </div>
                <span className="text-[7px] font-black text-gray-400 uppercase tracking-tighter">{stat.name}</span>
              </div>
            ))}
          </div>
          <button className="mt-auto w-full py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-[8px] font-black uppercase tracking-wider hover:bg-gray-100 transition-all">Audit Details</button>
        </div>

      </div>

      {/* Unified Dashboard Card: Log (Left - Horizontal) & Schools (Right - Vertical) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col lg:flex-row transition-all">

        {/* LEFT COLUMN: Log Aktivitas (Horizontal Expand) */}
        <motion.div
          initial={false}
          animate={{ width: isActivityOpen ? 320 : 64 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="bg-gray-50/20 border-r border-gray-100 flex flex-col relative overflow-hidden shrink-0"
        >
          {/* Collapse/Expand Toggle (Always visible icon) */}
          <button
            onClick={() => {
              const newState = !isActivityOpen;
              setIsActivityOpen(newState);
              if (newState) setIsSchoolsOpen(true);
            }}
            className={cn(
              "w-full h-14 flex items-center justify-center transition-all group relative shrink-0 overflow-hidden",
              isActivityOpen
                ? "px-5 justify-between bg-gradient-to-r from-indigo-500 to-cyan-400 text-white"
                : "justify-center bg-gray-50/20 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-cyan-400 hover:text-white"
            )}
          >
            <div className="flex items-center gap-2.5">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                isActivityOpen ? "bg-white/20 text-white" : "bg-amber-100 text-amber-600 group-hover:bg-white/20 group-hover:text-white"
              )}>
                <Clock className="w-4 h-4" />
              </div>
              <AnimatePresence>
                {isActivityOpen && (
                  <motion.h2
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-black text-[10px] uppercase tracking-wider whitespace-nowrap group-hover:text-white"
                  >
                    Log Aktivitas
                  </motion.h2>
                )}
              </AnimatePresence>
            </div>
            {isActivityOpen && <ChevronDown className="w-3.5 h-3.5 text-white/60 rotate-90 shrink-0" />}
          </button>

          {/* Activity Content (Visible only when expanded) */}
          <AnimatePresence>
            {isActivityOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.1 }}
                className="flex-1 flex flex-col min-w-[320px] overflow-hidden border-t border-gray-50"
              >
                <div className="divide-y divide-gray-50 bg-white flex-1">
                  {paginatedActivities.map((a, i) => (
                    <div key={i} className="px-5 py-3 flex flex-col gap-1 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-2">
                        {a.type === "success" && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                        {a.type === "warning" && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                        {a.type === "info" && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{a.time}</span>
                      </div>
                      <p className="text-[10px] text-gray-600 leading-tight font-semibold">{a.msg}</p>
                    </div>
                  ))}
                </div>

                {/* Pagination for Activity */}
                <div className="px-5 py-3 border-t border-gray-50 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.02)] mt-auto">
                  <SimplePagination
                    currentPage={activityPage}
                    totalPages={Math.ceil(RECENT_ACTIVITY.length / ITEMS_PER_PAGE)}
                    onPageChange={setActivityPage}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Peek Indicator (when closed) */}
          {!isActivityOpen && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-10 flex flex-col items-center gap-4 text-gray-300 pointer-events-none">
              <div className="w-0.5 h-20 bg-gradient-to-b from-transparent via-gray-200 to-transparent" />
              <Search className="w-3.5 h-3.5 opacity-20" />
              <div className="w-0.5 h-20 bg-gradient-to-b from-gray-200 via-gray-200 to-transparent" />
            </div>
          )}
        </motion.div>

        {/* RIGHT COLUMN: Status Sekolah (Vertical Popdown) */}
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          <button
            onClick={() => setIsSchoolsOpen(!isSchoolsOpen)}
            className={cn(
              "w-full h-14 px-6 flex items-center justify-between transition-all group header-coordinated overflow-hidden",
              isSchoolsOpen
                ? "bg-gradient-to-r from-indigo-500 to-cyan-400 text-white"
                : "bg-white border-b border-gray-50 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-cyan-400 hover:text-white"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                isSchoolsOpen ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600 group-hover:bg-white/20 group-hover:text-white"
              )}>
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
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300",
                isSchoolsOpen ? "rotate-180 bg-white/10 border-white/20 text-white" : "bg-white border-gray-100 text-gray-400 group-hover:bg-white/10 group-hover:border-white/20 group-hover:text-white"
              )}>
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
                {/* Search & Filter Bar */}
                <div className="px-6 py-4 bg-gray-50/40 border-b border-gray-100 flex items-center justify-between gap-6 shrink-0">
                  <ExpandingSearchDock
                    onSearch={(q) => setSearchQuery(q)}
                    placeholder="Cari sekolah..."
                    initialValue={searchQuery}
                  />

                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                    {["SEMUA", "SD", "SMP", "SMA"].map((level) => (
                      <button
                        key={level}
                        onClick={() => setFilterLevel(level)}
                        className={`px-4 py-1.5 text-[9px] font-black rounded-lg transition-all ${filterLevel === level
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-100 scale-105"
                            : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                          }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Schools List Content */}
                <div className="divide-y divide-gray-50 flex flex-col flex-1">
                  <div className="flex-1">
                    {paginatedSchools.length > 0 ? (
                      paginatedSchools.map((s) => (
                        <div key={s.nama} className="px-6 py-3 flex items-center justify-between hover:bg-gray-100/30 transition-all border-b last:border-0 border-gray-50 group">
                          <div className="flex items-center gap-4">
                            <div className={`w-2.5 h-2.5 rounded-full shadow-xs ring-2 ring-white ${s.nama.startsWith('SD') ? 'bg-rose-400' : s.nama.startsWith('SMP') ? 'bg-indigo-400' : 'bg-slate-500'}`} />
                            <div className="group-hover:translate-x-0.5 transition-transform">
                              <p className="text-sm font-bold text-gray-900">{s.nama}</p>
                              <p className="text-[10px] text-gray-400 font-medium">{s.kota}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-base font-black text-indigo-600 tabular-nums">{s.porsi.toLocaleString()}</p>
                            <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Porsi / Hari</p>
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
                          onClick={() => { setSearchQuery(""); setFilterLevel("SEMUA"); }}
                          className="text-[10px] text-indigo-600 font-bold mt-4 uppercase tracking-wider"
                        >
                          Reset Parameter
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Pagination for Schools */}
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

      </div>
    </div>
  )
}
