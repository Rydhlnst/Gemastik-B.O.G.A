"use client";

import { useState } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, AreaChart, Area
} from "recharts";
import { ChevronDown, TrendingUp, Package, Activity } from "lucide-react";
import { GlassCard } from "./GlassCard";

const WEEKLY_DATA = [
  { day: "Mon", deliveries: 210, efficiency: 98 },
  { day: "Tue", deliveries: 235, efficiency: 99 },
  { day: "Wed", deliveries: 190, efficiency: 97 },
  { day: "Thu", deliveries: 250, efficiency: 99.2 },
  { day: "Fri", deliveries: 215, efficiency: 98.5 },
];

const MONTHLY_DATA = [
  { day: "Week 1", deliveries: 1050, efficiency: 98 },
  { day: "Week 2", deliveries: 1120, efficiency: 98.4 },
  { day: "Week 3", deliveries: 980, efficiency: 97.8 },
  { day: "Week 4", deliveries: 1200, efficiency: 99.1 },
];

const ZONE_DATA = [
  { name: "Jak-Ut", value: 92, color: "#00e57a" },
  { name: "Jak-Sel", value: 88, color: "#00c8ff" },
  { name: "Jak-Bar", value: 74, color: "#7040e0" },
  { name: "Jak-Pas", value: 68, color: "#ffb020" },
];

export function AnalyticsModule() {
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly">("weekly");
  const data = timeframe === "weekly" ? WEEKLY_DATA : MONTHLY_DATA;

  return (
    <div className="space-y-6 module-reveal pt-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Laporan Analitik
          </h2>
          <p className="text-xs text-slate-500 font-medium tracking-wide">Insight operasional distribusi harian</p>
        </div>

        {/* Timeframe Toggle Dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/60 border-t-white/80 bg-white/30 backdrop-blur-md text-xs font-bold text-slate-800 hover:bg-white/50 transition-all shadow-sm">
            {timeframe === "weekly" ? "Minggu Ini" : "Bulan Ini"}
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
          <div className="absolute right-0 top-full mt-2 w-40 bg-white/10 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
            <button 
              onClick={() => setTimeframe("weekly")}
              className="w-full text-left px-4 py-3 text-xs font-semibold hover:bg-white/10 text-white/50 hover:text-white transition-all"
            >
              Minggu Ini
            </button>
            <button 
              onClick={() => setTimeframe("monthly")}
              className="w-full text-left px-4 py-3 text-xs font-semibold hover:bg-white/10 text-white/50 hover:text-white transition-all"
            >
              Bulan Ini
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Delivery Trend Chart */}
        <div className="lg:col-span-2 bg-white/45 backdrop-blur-[40px] rounded-3xl p-8 border border-white/60 border-t-white/80 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.25)] overflow-hidden relative">
          <div className="flex items-center gap-2 mb-8">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Tren Pengiriman</h3>
          </div>
          <div className="h-[280px] min-h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorDeliv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'rgba(15, 23, 42, 0.4)', fontSize: 10, fontWeight: 700}} 
                />
                <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{fill: 'rgba(15, 23, 42, 0.4)', fontSize: 10}}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.7)', 
                    borderRadius: '16px', 
                    border: '1px solid rgba(255,255,255,0.5)', 
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)' 
                  }}
                  itemStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#0f172a' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="deliveries" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorDeliv)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Performance Stats */}
        <div className="space-y-6">
          <div className="bg-white/45 backdrop-blur-[40px] rounded-3xl p-8 border border-white/60 border-t-white/80 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.25)] h-full flex flex-col">
            <div className="flex items-center gap-2 mb-8">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Activity className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">SLA Efisiensi</h3>
            </div>
            
            <div className="space-y-6 flex-1">
              {ZONE_DATA.map((z) => (
                <div key={z.name} className="group/stat">
                  <div className="flex justify-between mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{z.name}</span>
                    <span className="text-[10px] font-black text-slate-900">{z.value}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${z.value}%`, backgroundColor: z.color, opacity: 0.9 }} 
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-slate-100 -mx-8 -mb-8 p-8 rounded-b-3xl bg-white/40 backdrop-blur-md">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-emerald-600 border border-white/40 shadow-sm">
                    <Package className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Target Tercapai</p>
                    <p className="text-3xl font-black text-slate-900 leading-none tracking-tighter">94.2%</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
