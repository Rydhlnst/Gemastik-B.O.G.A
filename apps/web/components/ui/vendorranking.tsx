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
    <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-2xl p-5 w-full font-sans">

      {/* Header */}
      <div className="flex justify-between items-end mb-4 px-1">
        <div>
          <p className="text-[10px] font-medium tracking-widest uppercase text-white/28">
            Ranking Vendor MBG
          </p>
          <p className="text-[10px] text-white/15 tracking-wide mt-0.5">
            Berdasarkan total pengiriman
          </p>
        </div>
        <p className="text-[10px] text-white/18">
          {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </div>

      {/* Column labels */}
      <div className="grid gap-2 px-2 pb-2 border-b border-[#1e1e1e] mb-1.5 text-[9px] font-medium tracking-widest uppercase text-white/18"
        style={{ gridTemplateColumns: "24px 36px 1fr 90px 60px 60px" }}>
        <span>#</span>
        <span></span>
        <span>Vendor</span>
        <span className="text-center">Pengiriman</span>
        <span className="text-center">On-Time</span>
        <span className="text-right">Rating</span>
      </div>

      {/* Rows */}
      <div ref={containerRef}>
        {sorted.map((v, i) => {
          const pct = Math.round((v.total_pengiriman / max) * 100);
          const isFirst = i === 0;
          const isSuspend = v.status === "suspend";
          const rankSymbol = i === 0 ? "◆" : i === 1 ? "◇" : i === 2 ? "◇" : i + 1;

          return (
            <div
              key={v.id}
              className={`grid gap-2 items-center px-2 py-2.5 rounded-xl mb-1 border transition-all
                ${isFirst ? "bg-white/6 border-[#3a3a3a]" : "bg-white/[0.025] border-transparent hover:bg-white/5 hover:border-[#2a2a2a]"}
                ${isSuspend ? "opacity-45" : ""}`}
              style={{ gridTemplateColumns: "24px 36px 1fr 90px 60px 60px" }}
            >
              {/* Rank */}
              <div className={`text-center text-xs font-medium ${i < 3 ? "text-white/85" : "text-white/28"}`}>
                {rankSymbol}
              </div>

              {/* Avatar */}
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-medium border flex-shrink-0
                ${isFirst ? "bg-white text-black border-white" : "bg-[#161616] text-white/50 border-[#2e2e2e]"}`}>
                {getInitials(v.nama)}
              </div>

              {/* Info */}
              <div className="overflow-hidden">
                <p className={`text-xs font-medium truncate ${isFirst ? "text-white" : "text-white/78"}`}>
                  {v.nama}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-white/25">{KATEGORI_LABEL[v.kategori]}</span>
                  {isSuspend && (
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#1e1010] text-red-400 border border-[#3a1a1a]">
                      SUSPEND
                    </span>
                  )}
                </div>
              </div>

              {/* Bar + count */}
              <div className="flex flex-col gap-1">
                <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-[width] duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] w-0 ${barOpacity(i)}`}
                    data-pct={pct}
                  />
                </div>
                <span className="text-[9px] text-white/25 tabular-nums">
                  {v.total_pengiriman} pengiriman
                </span>
              </div>

              {/* On-time */}
              <div className={`text-[11px] font-medium text-center tabular-nums ${onTimeColor(v.on_time_rate)}`}>
                {v.on_time_rate}%
              </div>

              {/* Rating */}
              <div className="text-[11px] font-medium text-white/45 text-right flex items-center justify-end gap-1">
                <Star className="w-3 h-3 fill-white/45 text-white/45" />
                {v.rating.toFixed(1)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-[#1a1a1a] flex justify-between items-center">
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5 text-[9px] text-white/20">
            <div className="w-1.5 h-1.5 rounded-sm bg-white" />
            Aktif
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-white/20">
            <div className="w-1.5 h-1.5 rounded-sm bg-[#3a1a1a] border border-red-900" />
            Suspend
          </div>
        </div>
        <span className="text-[9px] text-white/18 tracking-wide">mbgdummydata.ts</span>
      </div>
    </div>
  );
}