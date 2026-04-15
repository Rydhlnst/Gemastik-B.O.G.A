"use client";

import { useState } from "react";
import { AnimatedScene } from "@/components/ui/animatedbg";
import dynamic from "next/dynamic";
import { type Sekolah } from "@/lib/mbgdummydata";

const MapLibreMap = dynamic(() => import("@/components/ui/MapLibreMap"), { ssr: false });

export default function PantauRutePage() {
  const [selectedSchool, setSelectedSchool] = useState<Sekolah | null>(null);
  return (
    <div className="w-full min-h-screen bg-[#f8fafc] font-sans pb-20">
      
      <div className="w-full h-[280px] relative overflow-hidden bg-white border-b" style={{borderColor: 'rgba(44,110,73,0.12)'}}>
        <div className="absolute inset-0 opacity-40"><AnimatedScene /></div>
        <div className="absolute inset-0 logistik-hero-gradient" />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-32 pb-12 flex flex-col justify-end h-full">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full animate-pulse bg-white/80" />
            <span className="text-xs font-bold tracking-widest uppercase text-white/90">
              Live Monitoring
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Pantau Rute Kendaraan
          </h1>
          <p className="text-sm text-white/70 mt-3 max-w-2xl">
            Peta interaktif pergerakan suplai. Silakan klik salah satu stasiun tujuan (Sekolah) pada peta untuk mengisolasi pandangan Anda kepada rute vendor dan armada mana saja yang menuju ke titik tersebut secara mendetail.
          </p>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto pt-10 px-6">
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 h-[600px]">
          <MapLibreMap 
            selectedSchool={selectedSchool}
            onSchoolSelect={setSelectedSchool}
          />
        </div>
      </div>

    </div>
  );
}
