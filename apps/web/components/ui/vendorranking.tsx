// components/ui/VendorRanking.tsx
"use client";

import { useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Building2, Package, MapPin, CheckCircle } from "lucide-react";
import { 
  vendorList, 
  sppgList, 
  getVendorRanking, 
  getSPPGPerformanceRanking 
} from "@/lib/mbgdummydata";

const KATEGORI_LABEL = {
  katering: "Katering",
  logistik: "Logistik",
  supplier_bahan: "Supplier Bahan",
};

function getInitials(nama: string) {
  return nama.split(" ").map((w) => w[0]).slice(0, 2).join("");
}

interface PerformanceRankingProps {
  type: "vendor" | "sppg";
  selectedId?: number;
  onSelectVendor?: (id: number) => void;
  highlightedIds?: number[];
}

export default function PerformanceRanking({ type, selectedId, onSelectVendor, highlightedIds = [] }: PerformanceRankingProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const data = useMemo(() => {
    if (type === "vendor") {
      const sorted = [...vendorList].sort((a, b) => b.total_pengiriman - a.total_pengiriman);
      const max = sorted[0]?.total_pengiriman || 1;
      return sorted.map((v, i) => ({
        id: v.id,
        nama: v.nama,
        subtext: KATEGORI_LABEL[v.kategori],
        metricBar: { value: v.total_pengiriman, max, label: "kargo" },
        onTime: v.on_time_rate,
        rating: v.rating,
        status: v.status,
        isSuspend: v.status === "suspend",
        rankSymbol: i === 0 ? "◆" : i === 1 ? "◇" : i === 2 ? "◇" : i + 1,
        extra: null
      }));
    } else {
      const sorted = [...getSPPGPerformanceRanking()];
      return sorted.map((s, i) => ({
        id: s.id,
        nama: s.nama,
        subtext: s.kecamatan,
        metricBar: { value: s.kapasitas, max: 1500, label: "porsi" },
        onTime: s.onTimeRate,
        rating: s.rating,
        status: "aktif",
        isSuspend: false,
        rankSymbol: i === 0 ? "◆" : i === 1 ? "◇" : i === 2 ? "◇" : i + 1,
        extra: s.kecamatan
      }));
    }
  }, [type]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      containerRef.current?.querySelectorAll<HTMLDivElement>("[data-pct]").forEach((el) => {
        el.style.width = el.dataset.pct + "%";
      });
    }, 120);
    return () => clearTimeout(timeout);
  }, [type, selectedId]);

  return (
    <div className="bg-white relative shadow-sm border border-slate-100 rounded-[2rem] px-2 py-4 sm:p-6 w-full font-sans min-w-[700px]">
      
      {/* Header Info */}
      <div className="relative z-10 flex justify-between items-end mb-6 px-2">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">
            Peringkat Performa {type === "vendor" ? "Vendor" : "Unit Pelayanan (SPPG)"}
          </h3>
          <p className="text-[11px] font-bold text-slate-400 tracking-wide mt-1 uppercase">
            Berdasarkan {type === "vendor" ? "Total Pengiriman & Loyalitas" : "Kualitas Layanan & Kapasitas"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full inline-block">
            {new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Table Headers */}
      <div className="relative z-10 grid gap-4 px-4 pb-4 border-b border-slate-50 mb-4 text-[10px] font-black tracking-widest uppercase text-slate-400 items-center grid-cols-[30px_45px_1fr_120px_100px_80px_60px]">
        <span className="text-center">#</span>
        <span className="text-center">Profil</span>
        <span>{type === "vendor" ? "Nama Perusahaan" : "Nama Unit"}</span>
        <span className="text-center">{type === "vendor" ? "Volume Kirim" : "Kapasitas Unit"}</span>
        {type === "sppg" ? <span className="text-center">Kecamatan</span> : <span className="text-center">Kategori</span>}
        <span className="text-center">On-Time</span>
        <span className="text-right">Rating</span>
      </div>

      {/* Rows Container */}
      <div ref={containerRef} className="relative z-10 space-y-2">
        {data.map((item, i) => {
          const pct = Math.round((item.metricBar.value / item.metricBar.max) * 100);
          const isSelected = selectedId === item.id;
          const isHighlighted = highlightedIds.includes(item.id);
          const perfColorBg = "bg-indigo-600";
          const perfColorText = item.rating >= 4.5 ? "text-indigo-600" : item.rating >= 3.5 ? "text-amber-500" : "text-rose-500";

          return (
            <motion.div
              layout
              key={item.id}
              onClick={() => onSelectVendor?.(item.id)}
              className={`grid gap-4 items-center px-4 py-4 rounded-2xl border transition-all duration-300 grid-cols-[30px_45px_1fr_120px_100px_80px_60px]
                ${isHighlighted
                  ? "bg-white border-slate-100 hover:bg-slate-50 border-b-[3px] border-b-blue-500 shadow-sm cursor-pointer"
                  : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-100 cursor-pointer"
                }
                ${item.isSuspend ? "opacity-60 grayscale-[0.5]" : ""}`}
            >
              <div className={`text-center text-sm font-black ${perfColorText}`}>
                {item.rankSymbol}
              </div>

              {/* Avatar */}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-[11px] font-black border shadow-sm transition-transform bg-slate-50 text-slate-400 border-slate-100`}>
                {getInitials(item.nama)}
              </div>

              {/* Main Info */}
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-black truncate tracking-tight text-slate-800">
                    {item.nama}
                  </p>
                  {isHighlighted && (
                    <span className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm shadow-blue-500/20 px-1.5 py-0.5 rounded-[4px] text-[7px] font-black uppercase tracking-widest leading-none pointer-events-none">
                      {type === "vendor" ? "Vendor Anda" : "SPPG Anda"}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-bold text-slate-400">
                    {item.subtext}
                  </span>
                  {item.isSuspend && (
                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-rose-500 text-white border border-rose-400">
                      SUSPENDED
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar Column */}
              <div className="flex flex-col gap-2">
                <div className={`h-1.5 rounded-full overflow-hidden bg-slate-100`}>
                  <div
                    className={`h-full rounded-full transition-[width] duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] w-0 ${perfColorBg}`}
                    data-pct={pct}
                  />
                </div>
                <p className={`text-[10px] font-black tabular-nums transition-colors text-slate-500`}>
                  {item.metricBar.value.toLocaleString()} <span className="opacity-60 uppercase text-[8px] tracking-widest">{item.metricBar.label}</span>
                </p>
              </div>

              {/* Extra Logic for SPPG (Location) */}
              <div className={`text-center transition-colors text-slate-600 flex items-center justify-center`}>
                {type === "sppg" ? (
                  <span className="text-[11px] font-bold flex items-center justify-center gap-1">
                    <MapPin className="w-3 h-3 opacity-50" />
                    {item.extra}
                  </span>
                ) : (
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-80 bg-slate-100 px-2 py-0.5 rounded-full">
                    {item.subtext}
                  </span>
                )}
              </div>

              {/* On-Time (or redundant for SPPG, so we use it for something else or just show OTP) */}
              <div className="flex items-center justify-center gap-1.5">
                {type === "sppg" ? (
                   <span className={`text-[11px] font-bold text-slate-600`}>
                     {item.onTime}% 
                   </span>
                ) : (
                  <div className={`flex items-center gap-1 transition-colors ${item.onTime >= 95 ? "text-emerald-500" : item.onTime >= 90 ? "text-amber-500" : "text-rose-500"}`}>
                    <CheckCircle className="w-3 h-3" />
                    <span className="text-[11px] font-black">{item.onTime}%</span>
                  </div>
                )}
              </div>

              {/* Final Rating */}
              <div className="flex items-center justify-end gap-1.5">
                <Star className={`w-3.5 h-3.5 text-amber-400 fill-amber-400`} />
                <span className={`text-sm font-black text-slate-800`}>
                  {item.rating.toFixed(1)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Indicators */}
      <div className="relative z-10 mt-8 pt-5 border-t border-slate-100 flex justify-between items-center px-2">
        <div className="flex gap-6">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <div className="w-2.5 h-2.5 rounded-sm bg-indigo-600 shadow-sm" />
            Luar Biasa
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <div className="w-2.5 h-2.5 rounded-sm bg-amber-400 shadow-sm" />
            Standar
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <div className="w-2.5 h-2.5 rounded-sm bg-rose-400 shadow-sm" />
            Di Bawah Target
          </div>
        </div>
        <p className="text-[10px] font-bold text-slate-300 italic">B.O.G.A Live Audit Engine v2.1</p>
      </div>
    </div>
  );
}