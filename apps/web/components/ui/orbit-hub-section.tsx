"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, X, ExternalLink } from "lucide-react";
import { EcosystemConstellation } from "./ecosystem-constellation";
import { AtmosphericCanvas } from "./atmospheric-canvas";

const SATELLITE_INSIGHTS = [
  {
    label: "Schools",
    title: "The Beneficiary",
    insight: "Melayani ribuan siswa di seluruh wilayah dengan pemantauan real-time dan sistem umpan balik instan."
  },
  {
    label: "Logistics",
    title: "The Backbone",
    insight: "Jaringan distribusi presisi tinggi dengan pelacakan GPS dan monitor rantai dingin demi pengiriman 100% tepat waktu."
  },
  {
    label: "SPPG",
    title: "The Provider",
    insight: "Setiap porsi makanan dijamin memenuhi standar kesehatan, nutrisi, dan kebersihan nasional secara konsisten."
  },
  {
    label: "Governance",
    title: "The Ledger",
    insight: "Sistem transparansi digital berbasis ledger. Setiap transaksi tercatat secara permanen untuk integritas rantai pasok."
  },
];

export const OrbitHubSection = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [insightIndex, setInsightIndex] = useState<number | null>(null);

  // Auto-rotate insights for demo if expanded? No, keep it manual.

  return (
    <div className="w-full">
      <motion.div
        animate={{
          height: isExpanded ? 580 : 160,
          backgroundColor: isExpanded ? "#e2f2f7" : "#ffffff",
        }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        className="relative overflow-hidden border-y border-slate-100/80 w-full flex items-center justify-center group"
      >
        {/* Layer 0: Background Canvas */}
        <AtmosphericCanvas className={isExpanded ? "opacity-100" : "opacity-30"} />

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10"
            >
              <EcosystemConstellation 
                accentColor="#6366f1"
                onSelectSatellite={(idx) => setInsightIndex(idx)}
              />
            </motion.div>
          )}
        </AnimatePresence>


        {/* Layer 3: Central HUB Button */}
        <div className="relative z-40 flex items-center justify-center">
          <motion.button
            onClick={() => {
              setIsExpanded(!isExpanded);
              setInsightIndex(null);
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              rotate: isExpanded ? 180 : 0,
              backgroundColor: isExpanded ? "rgba(99, 102, 241, 0.15)" : "rgba(99, 102, 241, 0.05)",
            }}
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: isExpanded ? "0 0 40px rgba(99, 102, 241, 0.2)" : "none",
            }}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <motion.div
                animate={{ opacity: isExpanded ? 0 : 1 }}
                transition={{ duration: 0.15 }}
                className="absolute"
              >
                <Network className="w-6 h-6 text-indigo-600" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isExpanded ? 1 : 0 }}
                transition={{ duration: 0.15, delay: 0.15 }}
                className="absolute"
              >
                <X className="w-6 h-6 text-indigo-600" />
              </motion.div>
            </div>
            {/* Ping effect */}
            {!isExpanded && (
              <div className="absolute -inset-4 bg-indigo-500/10 rounded-full animate-ping pointer-events-none" />
            )}
          </motion.button>
        </div>


        {/* Layer 5: Insight Popup Overlay */}
        <AnimatePresence>
          {isExpanded && insightIndex !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className="absolute right-8 top-8 w-[280px] z-[100]"
            >
              <div 
                className="bg-white/98 backdrop-blur-2xl border border-indigo-50 rounded-3xl p-6 shadow-2xl shadow-indigo-100/30 relative overflow-hidden"
              >
                {/* Accent glow top right */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/20 blur-2xl rounded-full -mr-12 -mt-12" />
                
                <h4 className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                  {SATELLITE_INSIGHTS[insightIndex].title}
                </h4>
                <h3 className="text-slate-900 text-xl font-black mb-4">
                  {SATELLITE_INSIGHTS[insightIndex].label}
                </h3>
                <p className="text-slate-700 text-[11px] leading-relaxed mb-6 font-medium">
                  {SATELLITE_INSIGHTS[insightIndex].insight}
                </p>
                <button
                  onClick={() => setInsightIndex(null)}
                  className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:text-slate-900 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> Close Detail
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
