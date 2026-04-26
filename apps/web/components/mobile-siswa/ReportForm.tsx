"use client";

import { useState } from "react";
import { Send, Zap, HelpCircle, MapPin, Smile } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const ReportForm = () => {
  const [priority, setPriority] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="px-6 py-6 pb-12 relative z-10">
      <h3 className="text-xl font-black tracking-tight text-slate-800 mb-6 drop-shadow-sm">Pusat Bantuan 🆘</h3>
      
      {/* Quick Action Tiles */}
      <div className="flex gap-3 mb-8 overflow-x-auto snap-x scrollbar-hide">
         <button className="min-w-[120px] bg-sky-100 p-4 rounded-3xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform snap-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">
               💡
            </div>
            <span className="text-[10px] font-black text-sky-700">Tanya Admin</span>
         </button>
         <button className="min-w-[120px] bg-rose-100 p-4 rounded-3xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform snap-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">
               🚨
            </div>
            <span className="text-[10px] font-black text-rose-700">Lapor Darurat</span>
         </button>
         <button className="min-w-[120px] bg-purple-100 p-4 rounded-3xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform snap-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">
               🍲
            </div>
            <span className="text-[10px] font-black text-purple-700">Menu Hari Ini</span>
         </button>
      </div>



    </div>
  );
};
