"use client";

import { AnimatedScene } from "@/components/ui/animatedbg";
import dynamic from "next/dynamic";

const SchoolMap = dynamic(() => import("@/components/ui/SchoolMap"), { ssr: false });

export default function PantauRutePage() {
  return (
    <div className="w-full min-h-screen bg-[#f8fafc] font-sans pb-20">
      
      <div className="w-full h-[280px] relative overflow-hidden bg-white border-b border-green-500/10">
        <div className="absolute inset-0 opacity-40"><AnimatedScene /></div>
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50/50" />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-24 pb-12 flex flex-col justify-end h-full">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase text-emerald-600">
              Live Monitoring
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#0a0e1a] tracking-tight">
            Pantau Rute Kendaraan
          </h1>
          <p className="text-sm text-gray-500 mt-3 max-w-2xl">
            Peta interaktif pergerakan suplai. Silakan klik salah satu stasiun tujuan (Sekolah) pada peta untuk mengisolasi pandangan Anda kepada rute vendor dan armada mana saja yang menuju ke titik tersebut secara mendetail.
          </p>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto pt-10 px-6">
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <SchoolMap />
        </div>
      </div>

    </div>
  );
}
