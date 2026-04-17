"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Activity,
  Search,
  Filter,
  Truck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Wifi,
  Radio,
  Clock,
  School,
  Warehouse,
  ArrowRight,
  X,
} from "lucide-react";
import {
  deliveryList,
  vendorSekolahList,
  vendorList,
  sekolahList,
  sppgList,
  sppgSekolahList,
  type ArahPengiriman,
} from "@/lib/mbgdummydata";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion, AnimatePresence } from "framer-motion";

const MapSupervision = dynamic(() => import("@/components/goverment/MapSupervision"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-100 animate-pulse rounded-[40px]" />,
});

// ─── Types ──────────────────────────────────────────────────────────────────

type JenjangFilter = "SEMUA" | "SD" | "SMP" | "SMA";
type ArahFilter = "SEMUA" | ArahPengiriman;

interface ActiveDriver {
  id: string;
  name: string;
  vendorId: number;
  sekolahId: number;
  sppgId?: number;
  arah: ArahPengiriman;
  status: string;
  manifest: string;
  lat: number;
  lng: number;
  eta: string;
  vendorName: string;
  schoolName: string;
  jenjang: "SD" | "SMP" | "SMA";
}

// ─── Jenjang Badge ───────────────────────────────────────────────────────────

const JENJANG_COLOR: Record<string, string> = {
  SD:  "bg-sky-100  text-sky-600  border-sky-100",
  SMP: "bg-violet-100 text-violet-600 border-violet-100",
  SMA: "bg-rose-100 text-rose-600  border-rose-100",
};

const ARAH_COLOR: Record<ArahPengiriman, string> = {
  vendor_ke_sppg:  "bg-amber-50 text-amber-600 border-amber-100",
  sppg_ke_sekolah: "bg-emerald-50 text-emerald-600 border-emerald-100",
};

const ARAH_LABEL: Record<ArahPengiriman, string> = {
  vendor_ke_sppg:  "Vendor → SPPG",
  sppg_ke_sekolah: "SPPG → Sekolah",
};

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function PengawasanPage() {
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDrivers, setActiveDrivers] = useState<ActiveDriver[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Filters
  const [jenjangFilter, setJenjangFilter] = useState<JenjangFilter>("SEMUA");
  const [arahFilter, setArahFilter] = useState<ArahFilter>("SEMUA");

  // Pagination
  const PAGE_SIZE = 4;
  const [page, setPage] = useState(0);

  // ── Initial Data & Simulation Loop ──────────────────────────────────────
  useEffect(() => {
    // Build driver list from on_transit deliveries
    const initial: ActiveDriver[] = deliveryList
      .filter((d) => d.status === "on_transit")
      .map((delivery) => {
        const vs = vendorSekolahList.find((vs) => vs.id === delivery.vendor_sekolah_id);
        const vendor = vendorList.find((v) => v.id === vs?.vendor_id);
        const sekolah = sekolahList.find((s) => s.id === vs?.sekolah_id);

        // Determine which SPPG serves this school
        const sppgRel = sppgSekolahList.find((ss) => ss.sekolah_id === vs?.sekolah_id);
        const sppg = sppgList.find((sp) => sp.id === sppgRel?.sppg_id);

        // Logistik vendors do sppg_ke_sekolah; supplier_bahan/katering typically vendor_ke_sppg
        // Here: vs.is_primary && katering → sppg_ke_sekolah; logistik/supplier → vendor_ke_sppg
        const arah: ArahPengiriman =
          vendor?.kategori === "logistik" ? "sppg_ke_sekolah" : "vendor_ke_sppg";

        return {
          id: `TRK-${String(delivery.id).padStart(3, "0")}`,
          name: `Driver ${delivery.id}`,
          vendorId: vendor?.id || 1,
          sekolahId: sekolah?.id || 1,
          sppgId: sppg?.id,
          arah,
          status: "Moving",
          manifest: `${delivery.porsi_dikirim} Porsi Nasi Box`,
          lat: (vendor?.lat || -6.8850) + (Math.random() - 0.5) * 0.02,
          lng: (vendor?.lng || 107.6130) + (Math.random() - 0.5) * 0.02,
          eta: "14:45",
          vendorName: vendor?.nama || "Unknown Vendor",
          schoolName: sekolah?.nama || "Unknown School",
          jenjang: sekolah?.jenjang || "SD",
        };
      });

    // Add extra synthetic sppg_ke_sekolah drivers (from SPPG to sekolah via logistik vendor)
    const sppgDrivers: ActiveDriver[] = sppgSekolahList.slice(0, 4).map((rel, i) => {
      const sppg = sppgList.find((sp) => sp.id === rel.sppg_id)!;
      const sekolah = sekolahList.find((s) => s.id === rel.sekolah_id)!;
      return {
        id: `SPG-${String(i + 1).padStart(3, "0")}`,
        name: `Kurir SPPG ${i + 1}`,
        vendorId: sppg.vendor_id,
        sekolahId: sekolah.id,
        sppgId: sppg.id,
        arah: "sppg_ke_sekolah" as ArahPengiriman,
        status: "Moving",
        manifest: `${rel.porsi_per_hari} Porsi — ${sppg.nama}`,
        lat: sppg.lat + (Math.random() - 0.5) * 0.015,
        lng: sppg.lng + (Math.random() - 0.5) * 0.015,
        eta: "07:15",
        vendorName: sppg.nama,
        schoolName: sekolah.nama,
        jenjang: sekolah.jenjang,
      };
    });

    setActiveDrivers([...initial, ...sppgDrivers]);

    // Simulation: jitter positions every 2s
    const interval = setInterval(() => {
      setActiveDrivers((prev) =>
        prev.map((d) => ({
          ...d,
          lat: d.lat + (Math.random() - 0.5) * 0.0005,
          lng: d.lng + (Math.random() - 0.5) * 0.0005,
        }))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // ── Filtering ────────────────────────────────────────────────────────────

  const filteredDrivers = activeDrivers.filter((d) => {
    const matchSearch =
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchJenjang = jenjangFilter === "SEMUA" || d.jenjang === jenjangFilter;
    const matchArah = arahFilter === "SEMUA" || d.arah === arahFilter;
    return matchSearch && matchJenjang && matchArah;
  });

  const totalPages = Math.ceil(filteredDrivers.length / PAGE_SIZE);
  const pagedDrivers = filteredDrivers.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const hasActiveFilters = jenjangFilter !== "SEMUA" || arahFilter !== "SEMUA";

  const resetFilters = () => {
    setJenjangFilter("SEMUA");
    setArahFilter("SEMUA");
    setPage(0);
  };

  // Reset to page 0 whenever filters/search change
  useEffect(() => { setPage(0); }, [jenjangFilter, arahFilter, searchQuery]);

  const countByJenjang = (j: JenjangFilter) =>
    activeDrivers.filter((d) => j === "SEMUA" || d.jenjang === j).length;

  return (
    <div className="flex h-full w-full gap-4 p-4 bg-[#f8faff] overflow-hidden relative">

      {/* ── Sidebar: Unit Monitoring ── */}
      <motion.aside
        initial={false}
        animate={{
          width: isSidebarCollapsed ? "80px" : "320px",
          minWidth: isSidebarCollapsed ? "80px" : "320px",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex flex-col gap-4 relative z-20"
      >
        <GlassCard className="p-4 h-full flex flex-col gap-4 overflow-hidden relative transition-all duration-500">

          {/* Header */}
          <div className={`flex items-center ${isSidebarCollapsed ? "flex-col gap-4" : "justify-between"} w-full`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50/50 flex items-center justify-center text-indigo-600 border border-indigo-100 flex-shrink-0">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              {!isSidebarCollapsed && (
                <motion.h2
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-lg font-black text-slate-800 tracking-tighter uppercase"
                >
                  Monitoring
                </motion.h2>
              )}
            </div>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`p-2 rounded-xl bg-slate-100 hover:bg-indigo-500 hover:text-white text-slate-400 transition-all ${isSidebarCollapsed ? "mt-2" : ""}`}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 rotate-180" />}
            </button>
          </div>

          {!isSidebarCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">

              {/* Search */}
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari armada / sekolah..."
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-xl py-2.5 pl-9 pr-3 text-xs font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </div>

              {/* ── Filter: Jenjang ── */}
              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <School className="w-3 h-3" /> Jenjang Sekolah
                </label>
                <div className="relative">
                  <select
                    value={jenjangFilter}
                    onChange={(e) => setJenjangFilter(e.target.value as JenjangFilter)}
                    className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-xl py-2 pl-3 pr-8 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition-all cursor-pointer"
                  >
                    <option value="SEMUA">Semua Jenjang ({activeDrivers.length})</option>
                    <option value="SD">SD ({countByJenjang("SD")})</option>
                    <option value="SMP">SMP ({countByJenjang("SMP")})</option>
                    <option value="SMA">SMA ({countByJenjang("SMA")})</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* ── Filter: Arah Pengiriman ── */}
              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <ArrowRight className="w-3 h-3" /> Arah Pengiriman
                </label>
                <div className="relative">
                  <select
                    value={arahFilter}
                    onChange={(e) => setArahFilter(e.target.value as ArahFilter)}
                    className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-xl py-2 pl-3 pr-8 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition-all cursor-pointer"
                  >
                    <option value="SEMUA">Semua Rute</option>
                    <option value="vendor_ke_sppg">Vendor → SPPG</option>
                    <option value="sppg_ke_sekolah">SPPG → Sekolah</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Active filter badge + reset */}
              <AnimatePresence>
                {hasActiveFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-between px-3 py-2 bg-indigo-50 rounded-xl border border-indigo-100"
                  >
                    <span className="text-[9px] font-black text-indigo-600">
                      {filteredDrivers.length} dari {activeDrivers.length} armada
                    </span>
                    <button
                      onClick={resetFilters}
                      className="flex items-center gap-1 text-[8px] font-black text-indigo-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" /> Reset
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Count label */}
              <div className="flex items-center justify-between px-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                  Active • {filteredDrivers.length}
                </p>
                <Filter className="w-3 h-3 text-slate-300" />
              </div>
            </motion.div>
          )}

          {/* ── Driver List ── */}
          <div className="flex-1 overflow-hidden flex flex-col gap-2">
            <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-2 custom-scrollbar">
              {filteredDrivers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <Truck className="w-8 h-8 text-slate-200" />
                  <p className="text-[10px] text-slate-400 font-bold text-center">Tidak ada armada<br />sesuai filter</p>
                </div>
              ) : (
                pagedDrivers.map((driver) => (
                  <motion.div
                    key={driver.id}
                    layoutId={driver.id}
                    onClick={() => setSelectedDriverId(driver.id)}
                    className={`group relative rounded-2xl border transition-all cursor-pointer overflow-hidden ${
                      isSidebarCollapsed ? "p-2" : "p-3.5"
                    } ${
                      selectedDriverId === driver.id
                        ? "bg-white border-indigo-200 shadow-xl shadow-indigo-500/10"
                        : "bg-white/50 border-slate-100 hover:border-indigo-100 hover:bg-white"
                    }`}
                  >
                    <div className={`flex items-center ${isSidebarCollapsed ? "justify-center" : "justify-between"} mb-2`}>
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                          selectedDriverId === driver.id
                            ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                            : "bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500"
                        }`}>
                          <Truck className="w-4 h-4" />
                        </div>
                        {!isSidebarCollapsed && (
                          <div>
                            <p className={`text-sm font-black tracking-tighter leading-none mb-0.5 ${selectedDriverId === driver.id ? "text-slate-900" : "text-slate-700"}`}>
                              {driver.id}
                            </p>
                            <div className="flex items-center gap-1">
                              <span className={`text-[7px] font-black px-1.5 py-0.5 rounded border ${JENJANG_COLOR[driver.jenjang] || ""}`}>
                                {driver.jenjang}
                              </span>
                              <span className={`text-[7px] font-black px-1.5 py-0.5 rounded border ${ARAH_COLOR[driver.arah]}`}>
                                {driver.arah === "vendor_ke_sppg" ? "V→S" : "S→K"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      {!isSidebarCollapsed && (
                        <div className="text-right">
                          <p className="text-[10px] font-black text-emerald-500">{driver.eta}</p>
                          <p className="text-[7px] font-bold text-slate-300 uppercase">ETA</p>
                        </div>
                      )}
                    </div>

                    {!isSidebarCollapsed && (
                      <>
                        <div className="flex items-center gap-2 p-2 bg-slate-50/50 rounded-xl border border-slate-100/50">
                          <Radio className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                          <div className="flex-1 overflow-hidden">
                            <p className="text-[9px] font-black text-slate-600 truncate">{driver.schoolName}</p>
                            <p className="text-[8px] text-slate-400 truncate">{driver.vendorName.split(" ")[0]}</p>
                          </div>
                          <ChevronRight className={`w-3 h-3 text-slate-300 flex-shrink-0 transition-transform ${selectedDriverId === driver.id ? "translate-x-0.5 text-indigo-400" : ""}`} />
                        </div>

                        {selectedDriverId === driver.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-2 pt-2 border-t border-slate-100"
                          >
                            <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border ${ARAH_COLOR[driver.arah]}`}>
                              {driver.arah === "vendor_ke_sppg"
                                ? <Warehouse className="w-3 h-3" />
                                : <School className="w-3 h-3" />}
                              <span className="text-[9px] font-black">{ARAH_LABEL[driver.arah]}</span>
                            </div>
                            <div className="flex items-center justify-between text-[9px] font-bold mt-2">
                              <span className="text-slate-400 uppercase tracking-widest">Signal</span>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4].map((i) => (
                                  <div key={i} className={`w-1 h-2 rounded-full ${i <= 3 ? "bg-indigo-500" : "bg-slate-200"}`} />
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </>
                    )}
                  </motion.div>
                ))
              )}
            </div>

            {/* ── Pagination ── */}
            {!isSidebarCollapsed && totalPages > 1 && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`w-6 h-6 rounded-lg text-[9px] font-black transition-all ${
                        i === page
                          ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30"
                          : "text-slate-400 hover:bg-slate-100"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Footer Stats */}
          {!isSidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2"
            >
              {[
                { label: "SD", count: activeDrivers.filter((d) => d.jenjang === "SD").length, color: "text-sky-600" },
                { label: "SMP", count: activeDrivers.filter((d) => d.jenjang === "SMP").length, color: "text-violet-600" },
                { label: "SMA", count: activeDrivers.filter((d) => d.jenjang === "SMA").length, color: "text-rose-600" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className={`text-base font-black leading-none ${s.color}`}>{s.count}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{s.label}</p>
                </div>
              ))}
            </motion.div>
          )}
        </GlassCard>
      </motion.aside>

      {/* ── Main Map View ── */}
      <motion.main layout className="flex-1 relative animate-in zoom-in-95 duration-1000 overflow-hidden">
        <MapSupervision
          activeDrivers={activeDrivers}
          selectedDriverId={selectedDriverId}
          onSelectDriver={setSelectedDriverId}
          onExit={() => setSelectedDriverId(null)}
        />

        {/* Floating Stats Overlay */}
        {!selectedDriverId && (
          <div className="absolute bottom-10 right-10 flex gap-4 pointer-events-none">
            <GlassCard className="px-6 py-4 flex items-center gap-6 pointer-events-auto shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                  <Wifi className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Connection</p>
                  <p className="text-sm font-black text-slate-800">100% Satlink</p>
                </div>
              </div>
              <div className="w-[1px] h-8 bg-slate-100" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">System Time</p>
                  <p className="text-sm font-black text-slate-800 whitespace-nowrap">
                    {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} WIB
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </motion.main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 9999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}
