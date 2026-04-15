"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Truck, 
  MapPin, 
  Play, 
  Square, 
  Navigation,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { GlassCard } from "./GlassCard";

interface DriverControlPanelProps {
  onToggleTrip: (isActive: boolean) => void;
  isTripActive: boolean;
}

export function DriverControlPanel({ onToggleTrip, isTripActive }: DriverControlPanelProps) {
  const [isGpsEnabled, setIsGpsEnabled] = useState(false);

  return (
    <div className="flex flex-col gap-4 animate-in slide-in-from-right-4 duration-500">
      <div className="p-5 rounded-3xl bg-[#0f2027]/90 backdrop-blur-2xl border border-white/10 shadow-2xl text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black tracking-tight uppercase leading-none mb-1">Menu Sopir</h3>
            <p className="text-[10px] text-white/40 font-medium">Panel Operasional Armada</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* GPS Toggle Simulation */}
          <div className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${isGpsEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-xs font-bold text-white/80">Berbagi GPS</span>
            </div>
            <button 
              onClick={() => setIsGpsEnabled(!isGpsEnabled)}
              className={`w-10 h-5 rounded-full transition-all relative ${isGpsEnabled ? 'bg-emerald-600' : 'bg-white/10'}`}
            >
              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isGpsEnabled ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
             <div className="flex gap-3 mb-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <p className="text-[10px] font-bold text-white uppercase tracking-widest">Rute Aktif</p>
             </div>
             <p className="text-xs font-black text-emerald-100">SDN Cempaka → Dapur A</p>
             <p className="text-[10px] text-white/40 mt-1 italic">Estimasi Tiba: 07:15 WIB</p>
          </div>

          <Button 
            disabled={!isGpsEnabled}
            onClick={() => onToggleTrip(!isTripActive)}
            className={`w-full h-12 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
              isTripActive 
                ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20' 
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20'
            }`}
          >
            {isTripActive ? (
              <><Square className="w-4 h-4 mr-2 fill-current" /> Akhiri Perjalanan</>
            ) : (
              <><Play className="w-4 h-4 mr-2 fill-current" /> Mulai Perjalanan</>
            )}
          </Button>

          {isTripActive && (
            <div className="flex items-center justify-center gap-2 py-2 animate-pulse">
               <Navigation className="w-3 h-3 text-emerald-400" />
               <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em]">Live Tracking Aktif</span>
            </div>
          )}
        </div>
      </div>

      {/* Info Status Cards */}
      <GlassCard className="py-4 border-none bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Status Manifest</p>
            <p className="text-[11px] font-black text-white">Sudah Terverifikasi</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
