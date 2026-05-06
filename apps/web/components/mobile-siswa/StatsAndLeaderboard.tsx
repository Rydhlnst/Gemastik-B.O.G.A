"use client";

import { Crown, Flame, ChevronRight } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VendorRanking from "@/components/ui/vendorranking";

export const StatsAndLeaderboard = () => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);



  return (
    <div className="py-6 space-y-8 relative z-10">
      


      {/* Gamified Leaderboard */}
      <div className="px-6">
        <div className="bg-gradient-to-br from-[#1A1C29] to-slate-900 rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/20 blur-3xl rounded-full"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-6 h-6 text-amber-400" fill="currentColor" />
              <h3 className="text-xl font-black text-white tracking-tight">Battle Leaderboard</h3>
            </div>
            <p className="text-slate-400 text-xs font-medium mb-6">siapa sppg dan vendor top 1 untuk saat ini ?</p>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between mb-4 border border-white/10">
               <div>
                 <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Rank #1 Saat Ini</p>
                 <p className="text-sm font-bold text-white flex items-center gap-2">
                   Boga Utama <Flame className="w-4 h-4 text-orange-500" fill="currentColor" />
                 </p>
               </div>
               <div className="w-10 h-10 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-full shadow-lg shadow-orange-500/30 flex items-center justify-center text-white font-black">
                 1
               </div>
            </div>

            <button 
               onClick={() => setShowLeaderboard(!showLeaderboard)}
               className="w-full bg-white text-slate-900 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              Cek Semua Ranking <ChevronRight className={`w-4 h-4 transition-transform ${showLeaderboard ? 'rotate-90' : ''}`} />
            </button>
          </div>

          <AnimatePresence>
            {showLeaderboard && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-6"
              >
                  {/* Container for Desktop Component injected into Mobile */}
                  <div className="max-h-[60vh] overflow-y-auto overflow-x-auto rounded-3xl -mx-4 px-2">
                     <VendorRanking />
                  </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

    </div>
  );
};
