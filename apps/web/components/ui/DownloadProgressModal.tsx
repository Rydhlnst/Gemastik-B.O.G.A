"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  FileText, 
  Check, 
  Download, 
  Loader2, 
  FileCheck,
  ShieldCheck,
  Sparkles
} from "lucide-react";

interface DownloadProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
}

export const DownloadProgressModal = ({ isOpen, onClose, fileName }: DownloadProgressModalProps) => {
  const [progress, setProgress] = useState(0);
  const [state, setState] = useState<"processing" | "generating" | "downloading" | "complete">("processing");

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setState("processing");
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setState("complete");
          // Auto close after success? or stay open? 
          // Let's stay open for 2s then close if it's auto
          return 100;
        }
        
        const next = prev + Math.random() * 15;
        if (next > 30 && next < 70) setState("generating");
        if (next >= 70 && next < 100) setState("downloading");
        
        return Math.min(next, 100);
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isOpen]);

  const stateConfig = {
    processing: { text: "Memproses Permintaan...", icon: ShieldCheck, color: "text-indigo-500" },
    generating: { text: "Menyusun Dokumen PDF...", icon: FileText, color: "text-blue-500" },
    downloading: { text: "Menyiapkan Unduhan...", icon: Download, color: "text-emerald-500" },
    complete: { text: "Berhasil Diunduh!", icon: Check, color: "text-emerald-500" },
  };

  const CurrentIcon = stateConfig[state].icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={state === "complete" ? onClose : undefined}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
          >
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <FileCheck className="w-32 h-32 text-indigo-500" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              {state === "complete" ? (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-200"
                >
                  <Check className="w-10 h-10" />
                </motion.div>
              ) : (
                <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="44"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-slate-100"
                    />
                    <motion.circle
                      cx="48"
                      cy="48"
                      r="44"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={276}
                      animate={{ strokeDashoffset: 276 - (276 * progress) / 100 }}
                      className="text-indigo-600"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CurrentIcon className={`w-8 h-8 ${stateConfig[state].color}`} />
                  </div>
                </div>
              )}

              <h3 className="text-xl font-black text-slate-900 mb-2">
                {stateConfig[state].text}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed px-4">
                {fileName}
              </p>

              <div className="w-full mt-8 border-t border-slate-50 pt-8">
                {state === "complete" ? (
                  <button
                    onClick={onClose}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                  >
                    Selesai
                  </button>
                ) : (
                  <div className="flex items-center justify-between text-[11px] font-black text-slate-800 tabular-nums">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                      MOHON TUNGGU
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Subtle bottom accent */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500 opacity-20" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
