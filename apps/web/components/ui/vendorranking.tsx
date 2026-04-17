// components/ui/VendorRanking.tsx
"use client";

import { useEffect, useRef } from "react";
import { Star } from "lucide-react";
import { vendorList, type Vendor } from "@/lib/mbgdummydata";

const KATEGORI_LABEL = {
  katering: "Katering",
  logistik: "Logistik",
  supplier_bahan: "Supplier Bahan",
};

function getInitials(nama: string) {
  return nama.split(" ").map((w) => w[0]).slice(0, 2).join("");
}

function onTimeColor(rate: number) {
  if (rate >= 96) return "text-white/85";
  if (rate >= 90) return "text-white/55";
  return "text-red-400";
}

function barOpacity(i: number) {
  return ["bg-white", "bg-white/65", "bg-white/50", "bg-white/35", "bg-white/25", "bg-white/15"][i] ?? "bg-white/10";
}

export default function VendorRanking() {
  const containerRef = useRef<HTMLDivElement>(null);

  const sorted = [...vendorList].sort((a, b) => b.total_pengiriman - a.total_pengiriman);
  const max = sorted[0]?.total_pengiriman || 1;

  useEffect(() => {
    const timeout = setTimeout(() => {
      containerRef.current?.querySelectorAll<HTMLDivElement>("[data-pct]").forEach((el) => {
        el.style.width = el.dataset.pct + "%";
      });
    }, 120);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-cyan-500 relative overflow-hidden shadow-[0_20px_50px_-12px_rgba(99,102,241,0.5)] border border-white/20 rounded-3xl p-3 sm:p-6 w-full font-sans">
      
      {/* Decorative Bevel overlay */}
      <div className="absolute inset-1.5 bg-white/5 rounded-[1.4rem] shadow-[inset_0_4px_10px_rgba(255,255,255,0.1)] ring-1 ring-white/10 pointer-events-none"></div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-end mb-5 px-1">
        <div>
          <p className="text-[11px] font-black tracking-widest uppercase text-white/90 shadow-sm">
            Ranking Vendor MBG
          </p>
          <p className="text-[10px] font-medium text-white/70 tracking-wide mt-1">
            Berdasarkan total pengiriman sukses
          </p>
        </div>
        <p className="text-[10px] font-bold text-white/80">
          {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </div>

      {/* Column labels */}
      <div className="relative z-10 grid gap-1 sm:gap-2 px-1 sm:px-2 pb-2 border-b border-white/20 mb-2 text-[8px] sm:text-[10px] font-bold tracking-tight sm:tracking-widest uppercase text-white/80 grid-cols-[16px_28px_1fr_60px_40px_35px] sm:grid-cols-[24px_36px_1fr_90px_60px_60px]">
        <span>#</span>
        <span></span>
        <span>Vendor</span>
        <span className="text-center">Kirim</span>
        <span className="text-center">Tepat</span>
        <span className="text-right">Nilai</span>
      </div>

      {/* Rows */}
      <div ref={containerRef} className="relative z-10">
        {sorted.map((v, i) => {
          const pct = Math.round((v.total_pengiriman / max) * 100);
          const isFirst = i === 0;
          const isSuspend = v.status === "suspend";
          const rankSymbol = i === 0 ? "◆" : i === 1 ? "◇" : i === 2 ? "◇" : i + 1;

          return (
            <div
              key={v.id}
              className={`grid gap-1 sm:gap-2 items-center px-1 sm:px-2 py-2 sm:py-3 rounded-xl mb-1 border transition-all duration-300 grid-cols-[16px_28px_1fr_60px_40px_35px] sm:grid-cols-[24px_36px_1fr_90px_60px_60px]
                ${isFirst ? "bg-white/20 border-white/40 shadow-lg shadow-black/5" : "bg-white/5 border-transparent hover:bg-white/20 hover:border-white/30 backdrop-blur-sm"}
                ${isSuspend ? "opacity-50" : ""}`}
            >
              {/* Rank */}
              <div className={`text-center text-xs font-black drop-shadow-md ${i < 3 ? "text-white" : "text-white/60"}`}>
                {rankSymbol}
              </div>

              {/* Avatar */}
              <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-[9px] sm:text-[11px] font-black border flex-shrink-0 shadow-sm
                ${isFirst ? "bg-white text-indigo-600 border-white" : "bg-white/10 text-white border-white/20"}`}>
                {getInitials(v.nama)}
              </div>

              {/* Info */}
              <div className="overflow-hidden">
                <p className={`text-[10px] sm:text-xs font-bold truncate drop-shadow-sm ${isFirst ? "text-white" : "text-white/90"}`}>
                  {v.nama}
                </p>
                <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5">
                  <span className="text-[8px] sm:text-[10px] font-medium text-white/70 truncate">{KATEGORI_LABEL[v.kategori]}</span>
                  {isSuspend && (
                     <span className="text-[7px] sm:text-[8px] font-black px-1 sm:px-1.5 py-0.5 rounded bg-white/20 text-rose-100 border border-white/30 shadow-sm">
                       SUSPEND
                     </span>
                  )}
                </div>
              </div>

              {/* Bar + count */}
              <div className="flex flex-col gap-1 sm:gap-1.5 px-0.5 sm:px-1">
                <div className="h-1 sm:h-1.5 bg-black/10 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full transition-[width] duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] w-0 bg-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]`}
                    data-pct={pct}
                  />
                </div>
                <span className="text-[8px] sm:text-[10px] font-medium text-white/80 tabular-nums">
                  {v.total_pengiriman} <span className="hidden sm:inline">kargo</span>
                </span>
              </div>

              {/* On-time */}
              <div className={`text-[10px] sm:text-[12px] font-black text-center tabular-nums drop-shadow-sm ${v.on_time_rate >= 90 ? "text-white" : "text-rose-100"}`}>
                {v.on_time_rate}%
              </div>

              <div className="text-[10px] sm:text-[12px] font-bold text-white/90 text-right">
                {v.rating.toFixed(1)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-4 pt-3 border-t border-white/20 flex justify-between items-center">
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/80">
            <div className="w-2 h-2 rounded-sm bg-white shadow-sm" />
            Aktif
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/80">
            <div className="w-2 h-2 rounded-sm bg-white/20 border border-rose-300" />
            Suspend
          </div>
        </div>
        <span className="text-[10px] font-medium text-white/60 tracking-wider hidden sm:block">B.O.G.A Live Ledger</span>
      </div>
    </div>
  );
}