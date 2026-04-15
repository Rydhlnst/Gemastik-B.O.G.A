"use client"

import { LayoutDashboard, TrendingUp, Users, Package, CheckCircle, AlertCircle, Clock } from "lucide-react"

const STATS = [
  { label: "Total Sekolah", value: "6", sub: "Aktif MBG", icon: Users, color: "text-indigo-500", bg: "bg-indigo-50" },
  { label: "Total Porsi/Hari", value: "2.693", sub: "+3.2% minggu ini", icon: Package, color: "text-emerald-500", bg: "bg-emerald-50" },
  { label: "On-Time Rate", value: "99%", sub: "30 hari terakhir", icon: TrendingUp, color: "text-cyan-500", bg: "bg-cyan-50" },
  { label: "Terverifikasi", value: "100%", sub: "Semua vendor aktif", icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
]

const RECENT_ACTIVITY = [
  { type: "success", msg: "Pengiriman ke SDN Menteng 01 selesai", time: "2 menit lalu" },
  { type: "warning", msg: "Stok daging ayam vendor Berkah Jaya menipis", time: "15 menit lalu" },
  { type: "success", msg: "Verifikasi vendor Segar Alami disetujui", time: "1 jam lalu" },
  { type: "info", msg: "Laporan distribusi Minggu ke-14 tersedia", time: "3 jam lalu" },
  { type: "success", msg: "SMPN 12 Jakarta: penerimaan MBG terkonfirmasi", time: "5 jam lalu" },
]

const SCHOOL_STATUS = [
  { nama: "SDN Menteng 01", kota: "Jakarta Pusat", porsi: 450, status: "Aktif" },
  { nama: "SMPN 12 Jakarta", kota: "Jakarta Selatan", porsi: 620, status: "Aktif" },
  { nama: "SDN Kebayoran 03", kota: "Jakarta Selatan", porsi: 380, status: "Aktif" },
  { nama: "SMAN 4 Jakarta", kota: "Jakarta Timur", porsi: 710, status: "Aktif" },
  { nama: "SDN Grogol 02", kota: "Jakarta Barat", porsi: 290, status: "Aktif" },
  { nama: "SMKN 1 Jakarta", kota: "Jakarta Utara", porsi: 243, status: "Aktif" },
]

export default function GovermentDashboard() {
  return (
    <div className="p-6 space-y-6 min-h-full">

      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#06b6d4)" }}>
          <LayoutDashboard className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Dashboard Pemerintah</h1>
          <p className="text-xs text-gray-400">Pantau distribusi MBG secara real-time</p>
        </div>
        <div className="ml-auto text-xs text-gray-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
          Live · Diperbarui baru saja
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-gray-900 leading-tight">{s.value}</p>
              <p className="text-xs font-semibold text-gray-600">{s.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main 2-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Tabel Sekolah */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 text-sm">Status Sekolah MBG</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{SCHOOL_STATUS.length} Sekolah</span>
          </div>
          <div className="divide-y divide-gray-50">
            {SCHOOL_STATUS.map((s) => (
              <div key={s.nama} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{s.nama}</p>
                  <p className="text-[11px] text-gray-400">{s.kota}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-indigo-600">{s.porsi.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400">porsi/hari</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Aktivitas Terbaru */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-sm">Aktivitas Terbaru</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {RECENT_ACTIVITY.map((a, i) => (
              <div key={i} className="px-5 py-3.5 flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {a.type === "success" && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                  {a.type === "warning" && <AlertCircle className="w-4 h-4 text-amber-500" />}
                  {a.type === "info" && <Clock className="w-4 h-4 text-indigo-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-gray-700 leading-snug">{a.msg}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
