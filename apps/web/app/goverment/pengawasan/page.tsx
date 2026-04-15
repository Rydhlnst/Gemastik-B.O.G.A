"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { 
  Activity, 
  Search, 
  Map as MapIcon, 
  Filter, 
  Truck, 
  ArrowRight,
  ChevronRight,
  Wifi,
  Radio,
  Clock
} from "lucide-react";
import { 
  deliveryList, 
  vendorSekolahList, 
  vendorList, 
  sekolahList 
} from "@/lib/mbgdummydata";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion, AnimatePresence } from "framer-motion";

const MapSupervision = dynamic(() => import("@/components/goverment/MapSupervision"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-100 animate-pulse rounded-[40px]" />
});

export default function PengawasanPage() {
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDrivers, setActiveDrivers] = useState<any[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Initial Data & Simulation Loop
  useEffect(() => {
    // Initial data load
    const initial = deliveryList
      .filter(d => d.status === 'on_transit')
      .map(delivery => {
        const vs = vendorSekolahList.find(vs => vs.id === delivery.vendor_sekolah_id);
        const vendor = vendorList.find(v => v.id === vs?.vendor_id);
        const sekolah = sekolahList.find(s => s.id === vs?.sekolah_id);
        
        return {
          id: `TRK-${String(delivery.id).padStart(3, '0')}`,
          name: `Driver ${delivery.id}`,
          vendorId: vendor?.id || 1,
          sekolahId: sekolah?.id || 1,
          status: "Moving",
          manifest: "680 Porsi Nasi Box",
          lat: (vendor?.lat || -6.8850) + (Math.random() - 0.5) * 0.02,
          lng: (vendor?.lng || 107.6130) + (Math.random() - 0.5) * 0.02,
          eta: "14:45",
          vendorName: vendor?.nama || "Unknown Vendor",
          schoolName: sekolah?.nama || "Unknown School"
        };
      });
    setActiveDrivers(initial);

    // Simulation Loop: Move markers slightly every 2 seconds
    const interval = setInterval(() => {
      setActiveDrivers(prev => prev.map(d => ({
        ...d,
        lat: d.lat + (Math.random() - 0.5) * 0.0005,
        lng: d.lng + (Math.random() - 0.5) * 0.0005,
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const filteredDrivers = activeDrivers.filter(d => 
    d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.schoolName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-2rem)] w-full gap-4 p-4 bg-[#f8faff] overflow-hidden relative">
      {/* Sidebar: Unit Monitoring */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isSidebarCollapsed ? "80px" : "20%",
          minWidth: isSidebarCollapsed ? "80px" : "300px" 
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex flex-col gap-4 relative z-20"
      >
        <GlassCard className="p-4 h-full flex flex-col gap-6 overflow-hidden relative transition-all duration-500">
          {/* Header */}
          <div className={`space-y-4 ${isSidebarCollapsed ? 'items-center' : ''} flex flex-col`}>
            <div className={`flex items-center ${isSidebarCollapsed ? 'flex-col gap-4' : 'justify-between'} w-full`}>
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50/50 flex items-center justify-center text-indigo-600 border border-indigo-100 flex-shrink-0">
                    <Activity className="w-5 h-5 animate-pulse" />
                  </div>
                  {!isSidebarCollapsed && (
                    <motion.h2 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-xl font-black text-slate-800 tracking-tighter uppercase"
                    >
                      Monitoring
                    </motion.h2>
                  )}
               </div>
               
               <button 
                 onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                 className={`p-2 rounded-xl bg-slate-100 hover:bg-indigo-500 hover:text-white text-slate-400 transition-all ${isSidebarCollapsed ? 'mt-2' : ''}`}
                 title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
               >
                 {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 rotate-180" />}
               </button>
            </div>

            {!isSidebarCollapsed && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative group w-full"
              >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari armada..." 
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </motion.div>
            )}
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3 custom-scrollbar flex flex-col items-center">
             {!isSidebarCollapsed && (
                <div className="flex items-center justify-between w-full px-2 mb-3">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Active • {filteredDrivers.length}</p>
                   <Filter className="w-3 h-3 text-slate-400 cursor-pointer hover:text-indigo-500 transition-colors" />
                </div>
             )}

             <div className="space-y-3 pb-4 w-full">
                {filteredDrivers.map((driver) => (
                  <motion.div
                    key={driver.id}
                    layoutId={driver.id}
                    onClick={() => setSelectedDriverId(driver.id)}
                    className={`group relative rounded-3xl border transition-all cursor-pointer overflow-hidden ${
                      isSidebarCollapsed ? 'p-2' : 'p-4'
                    } ${
                      selectedDriverId === driver.id 
                        ? 'bg-white border-indigo-200 shadow-xl shadow-indigo-500/10' 
                        : 'bg-white/50 border-slate-100 hover:border-indigo-100 hover:bg-white'
                    }`}
                  >
                    <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} ${!isSidebarCollapsed && 'mb-3'}`}>
                       <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 ${
                            selectedDriverId === driver.id ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'
                          }`}>
                            <Truck className="w-5 h-5" />
                          </div>
                          {!isSidebarCollapsed && (
                            <div>
                              <p className={`text-base font-black tracking-tighter leading-none mb-1 ${selectedDriverId === driver.id ? 'text-slate-900' : 'text-slate-700'}`}>{driver.id}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{driver.vendorName.split(' ')[0]}</p>
                            </div>
                          )}
                       </div>
                       {!isSidebarCollapsed && (
                          <div className="text-right">
                             <p className="text-[10px] font-black text-emerald-500">{driver.eta}</p>
                             <p className="text-[8px] font-bold text-slate-300 uppercase">ETA</p>
                          </div>
                       )}
                    </div>

                    {!isSidebarCollapsed && (
                      <>
                        <div className="flex items-center gap-2 p-2 bg-slate-50/50 rounded-xl border border-slate-100/50">
                           <Radio className="w-3 h-3 text-indigo-400" />
                           <div className="flex-1 overflow-hidden">
                              <p className="text-[9px] font-black text-slate-600 truncate uppercase tracking-tight">{driver.schoolName}</p>
                           </div>
                           <ChevronRight className={`w-3 h-3 text-slate-300 transition-transform ${selectedDriverId === driver.id ? 'translate-x-1 text-indigo-500' : ''}`} />
                        </div>

                        {selectedDriverId === driver.id && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-3 pt-3 border-t border-slate-100 space-y-2"
                          >
                             <div className="flex items-center justify-between text-[9px] font-bold">
                                <span className="text-slate-400 uppercase tracking-widest">Signal</span>
                                <div className="flex gap-0.5">
                                   {[1,2,3,4].map(i => <div key={i} className={`w-1 h-2 rounded-full ${i <= 3 ? 'bg-indigo-500' : 'bg-slate-200'}`} />)}
                                </div>
                             </div>
                          </motion.div>
                        )}
                      </>
                    )}
                  </motion.div>
                ))}
             </div>
          </div>

          {/* Footer Stats */}
          {!isSidebarCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pt-4 border-t border-slate-100 flex items-center justify-around"
            >
               <div className="text-center">
                  <p className="text-xl font-black text-slate-800 leading-none">99%</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Uptime</p>
               </div>
               <div className="w-[1px] h-8 bg-slate-100" />
               <div className="text-center">
                  <p className="text-xl font-black text-emerald-500 leading-none">Stable</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Net</p>
               </div>
            </motion.div>
          )}
        </GlassCard>
      </motion.aside>

      {/* Main Map View (Dynamic Width) */}
      <motion.main 
        layout
        className="flex-1 relative animate-in zoom-in-95 duration-1000 overflow-hidden"
      >
        <MapSupervision 
          activeDrivers={activeDrivers} 
          selectedDriverId={selectedDriverId}
          onSelectDriver={setSelectedDriverId}
          onExit={() => setSelectedDriverId(null)}
        />
        
        {/* Floating Mini Overlay for Map Stats */}
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
                    <p className="text-sm font-black text-slate-800 whitespace-nowrap">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} WIB</p>
                  </div>
               </div>
            </GlassCard>
          </div>
        )}
      </motion.main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
