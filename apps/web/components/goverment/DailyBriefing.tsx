"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, X, ArrowRight, AlertCircle, BadgeCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface BriefingData {
  porsiHariIni: number;
  sengketaAktif: number;
  vendorMenunggu: number;
  urgentHref: string;
}

const SESSION_KEY = "boga_daily_briefing_dismissed";

export function DailyBriefing({ data }: { data: BriefingData }) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    const isDismissed = sessionStorage.getItem(SESSION_KEY) === "true";
    // Show only in the morning (before noon) and if not dismissed this session
    if (hour < 12 && !isDismissed) {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem(SESSION_KEY, "true");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -16, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -12, height: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="px-6 pt-4"
        >
          <div className="flex items-center gap-4 px-5 py-4 bg-gradient-to-r from-indigo-50 to-cyan-50 border border-indigo-100 rounded-2xl">
            {/* Icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Sun className="w-5 h-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-0.5">
                Briefing Pagi
              </p>
              <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                Hari ini:{" "}
                <span className="font-black text-slate-900">
                  {data.porsiHariIni.toLocaleString("id-ID")} porsi
                </span>{" "}
                dijadwalkan —{" "}
                {data.sengketaAktif > 0 ? (
                  <span className="inline-flex items-center gap-1 font-black text-red-600">
                    <AlertCircle className="w-3 h-3" />
                    {data.sengketaAktif} sengketa menunggu keputusan BGN
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-black text-emerald-600">
                    <BadgeCheck className="w-3 h-3" />
                    Tidak ada sengketa aktif
                  </span>
                )}{" "}
                —{" "}
                <span className="font-black text-amber-600">
                  {data.vendorMenunggu} vendor baru menunggu verifikasi SBT
                </span>
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={() => router.push(data.urgentHref)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-500/20"
            >
              Mulai Review
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Dismiss */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
