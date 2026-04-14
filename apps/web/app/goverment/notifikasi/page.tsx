"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, BellOff, FileCheck, AlertCircle, Banknote,
  Truck, Settings, CheckCheck, Clock, ChevronRight, Filter
} from "lucide-react";

// ─── Types & Data ─────────────────────────────────────────────────────────

type NotifCategory = "pengajuan" | "sengketa" | "keuangan" | "logistik" | "sistem";

interface Notif {
  id: string;
  kategori: NotifCategory;
  judul: string;
  isi: string;
  waktu: string;
  dibaca: boolean;
  urgent: boolean;
  href: string;
}

const INITIAL_NOTIFS: Notif[] = [
  { id: "n1", kategori: "sengketa", judul: "Batas Arbitrase Mendekati", isi: "Kasus ARB-002 — CV Food Hub Jabar hanya tersisa 8 jam sebelum batas waktu BGN.", waktu: "5 menit lalu", dibaca: false, urgent: true, href: "/goverment/verifikasi" },
  { id: "n2", kategori: "pengajuan", judul: "Vendor Menunggu Verifikasi SBT", isi: "PT Nusantara Katering Prima menunggu persetujuan penerbitan SBT.", waktu: "22 menit lalu", dibaca: false, urgent: false, href: "/goverment/pengajuan" },
  { id: "n3", kategori: "logistik", judul: "Pengiriman Terlambat", isi: "Pengiriman ke SDN 164 Karang Pawulang terlambat 2 jam dari jadwal.", waktu: "42 menit lalu", dibaca: false, urgent: false, href: "/goverment/pengawasan" },
  { id: "n4", kategori: "keuangan", judul: "Refund Berhasil Dieksekusi", isi: "Refund Rp 4.200.000 dari CV Food Hub Jabar berhasil dikembalikan ke kas negara.", waktu: "1 jam lalu", dibaca: false, urgent: false, href: "/goverment/verifikasi" },
  { id: "n5", kategori: "sengketa", judul: "Kasus Baru Dilaporkan", isi: "Sengketa ARB-001 dilaporkan oleh SPPG Bandung Utara — menunggu respons vendor.", waktu: "2 jam lalu", dibaca: true, urgent: false, href: "/goverment/verifikasi" },
  { id: "n6", kategori: "sistem", judul: "Filter HET Diperbarui", isi: "PIHPS Nasional memperbarui harga referensi komoditas beras menjadi Rp 16.000/kg.", waktu: "3 jam lalu", dibaca: true, urgent: false, href: "/goverment/pengajuan" },
  { id: "n7", kategori: "pengajuan", judul: "CV Berkah Logistik Jabar Mendaftar", isi: "Vendor baru mengajukan pendaftaran SBT untuk kategori Logistik.", waktu: "5 jam lalu", dibaca: true, urgent: false, href: "/goverment/pengajuan" },
  { id: "n8", kategori: "logistik", judul: "Armada 3 Berhenti Lama", isi: "Supir Armada 3 – Lembang tidak bergerak selama 45 menit. Periksa kondisi.", waktu: "6 jam lalu", dibaca: true, urgent: false, href: "/goverment/pengawasan" },
  { id: "n9", kategori: "keuangan", judul: "Pencairan Dana Batch April", isi: "Pencairan batch hari ini: 4 berhasil, 1 gagal (CV Food Hub Jabar — Rp 6.900.000).", waktu: "8 jam lalu", dibaca: true, urgent: false, href: "/goverment/riwayat" },
  { id: "n10", kategori: "sistem", judul: "Laporan Mingguan Tersedia", isi: "Laporan distribusi Minggu ke-14 sudah bisa diunduh di modul Statistik.", waktu: "1 hari lalu", dibaca: true, urgent: false, href: "/goverment/statistik" },
];

const KATEGORI_CONFIG: Record<NotifCategory, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  pengajuan: { icon: <FileCheck className="w-4 h-4" />, color: "text-indigo-600", bg: "bg-indigo-50", label: "Pengajuan" },
  sengketa: { icon: <AlertCircle className="w-4 h-4" />, color: "text-red-600", bg: "bg-red-50", label: "Sengketa" },
  keuangan: { icon: <Banknote className="w-4 h-4" />, color: "text-emerald-600", bg: "bg-emerald-50", label: "Keuangan" },
  logistik: { icon: <Truck className="w-4 h-4" />, color: "text-amber-600", bg: "bg-amber-50", label: "Logistik" },
  sistem: { icon: <Settings className="w-4 h-4" />, color: "text-slate-600", bg: "bg-slate-50", label: "Sistem" },
};

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function NotifikasiPage() {
  const router = useRouter();
  const [notifs, setNotifs] = useState(INITIAL_NOTIFS);
  const [activeTab, setActiveTab] = useState<"belum" | "semua">("belum");
  const [filterKategori, setFilterKategori] = useState<NotifCategory | "semua">("semua");

  const unreadCount = notifs.filter(n => !n.dibaca).length;

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, dibaca: true })));

  const markRead = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, dibaca: true } : n));

  const handleClick = (notif: Notif) => {
    markRead(notif.id);
    router.push(notif.href);
  };

  const filtered = useMemo(() => {
    let list = activeTab === "belum" ? notifs.filter(n => !n.dibaca) : notifs;
    if (filterKategori !== "semua") list = list.filter(n => n.kategori === filterKategori);
    return list;
  }, [notifs, activeTab, filterKategori]);

  return (
    <div className="p-6 space-y-5 min-h-full bg-slate-50/50">

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-violet-500 to-indigo-600">
              <Bell className="w-5 h-5 text-white" />
            </div>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Notifikasi</h1>
            <p className="text-xs text-gray-400">Pusat komando pasif — semua aktivitas sistem</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 text-[9px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl transition-all"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Tandai Semua Dibaca
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab("belum")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === "belum" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
          >
            Belum Dibaca
            {unreadCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center">{unreadCount}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("semua")}
            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === "semua" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
          >
            Semua Riwayat
          </button>
        </div>

        {/* Filter Kategori */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {([
              { key: "semua", label: "Semua" },
              ...Object.entries(KATEGORI_CONFIG).map(([k, v]) => ({ key: k as NotifCategory, label: v.label }))
            ]).map(f => (
              <button
                key={f.key}
                onClick={() => setFilterKategori(f.key as any)}
                className={`px-3 py-1 text-[8px] font-black rounded-lg transition-all uppercase ${filterKategori === f.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center py-20 gap-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                <BellOff className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-sm font-black text-gray-400">Tidak ada notifikasi baru</p>
              <p className="text-[10px] text-gray-300 font-medium">Semua sudah terbaca atau tidak ada aktivitas</p>
            </motion.div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((notif, i) => {
                const cfg = KATEGORI_CONFIG[notif.kategori];
                return (
                  <motion.button
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => handleClick(notif)}
                    className={`w-full flex items-start gap-4 px-6 py-4 text-left hover:bg-gray-50/60 transition-all group ${
                      notif.urgent ? "border-l-2 border-red-400 bg-red-50/30" : !notif.dibaca ? "bg-indigo-50/20" : ""
                    }`}
                  >
                    {/* Unread dot */}
                    <div className="flex-shrink-0 mt-1.5">
                      {!notif.dibaca ? (
                        <div className={`w-2 h-2 rounded-full ${notif.urgent ? "bg-red-500 animate-pulse" : "bg-indigo-500"}`} />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-gray-200" />
                      )}
                    </div>

                    {/* Icon */}
                    <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${cfg.bg} ${cfg.color}`}>
                      {cfg.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className={`text-xs font-black truncate ${!notif.dibaca ? "text-gray-900" : "text-gray-600"}`}>
                          {notif.judul}
                        </p>
                        {notif.urgent && (
                          <span className="flex-shrink-0 text-[7px] font-black px-1.5 py-0.5 bg-red-100 text-red-600 rounded-md uppercase">
                            Urgent
                          </span>
                        )}
                        <span className={`flex-shrink-0 text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2">{notif.isi}</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <Clock className="w-2.5 h-2.5 text-gray-300" />
                        <span className="text-[8px] font-bold text-gray-300">{notif.waktu}</span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="flex-shrink-0 w-4 h-4 text-gray-200 group-hover:text-indigo-400 transition-colors mt-2.5" />
                  </motion.button>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
