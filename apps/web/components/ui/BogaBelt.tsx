"use client";
import React from "react";
import { motion } from "framer-motion";
import { MapPin, Zap, Link2, BarChart3, Globe, Shield, Sun } from "lucide-react";

const items = [
  { icon: MapPin,   label: "Location",  color: "#818cf8" },
  { icon: Zap,      label: "Speed",     color: "#22d3ee" },
  { icon: Link2,    label: "Connect",   color: "#a5b4fc" },
  { icon: BarChart3,label: "Analytics", color: "#38bdf8" },
  { icon: Globe,    label: "Global",    color: "#f472b6" },
  { icon: Shield,   label: "Security",  color: "#34d399" },
  { icon: Sun,      label: "Insights",  color: "#fb923c" },
];

const belt = Array(8).fill(items).flat();

export const BogaBelt = () => {
  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-gradient-to-r from-indigo-600 to-cyan-500 shadow-2xl mt-2">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 40, ease: "linear", repeat: Infinity }}
        className="flex gap-1 w-max py-0.5 px-2"
      >
        {belt.map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
            className="flex items-center gap-1 cursor-pointer rounded-md border border-white/15 px-2 py-0.5 my-1 transition-all"
            style={{ background: "rgba(255,255,255,0.1)", whiteSpace: "nowrap" }}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                duration: 3 + Math.random(), 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            >
              <item.icon size={10} color={item.color} />
            </motion.div>
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/90">{item.label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-black/60 to-transparent" />
    </div>
  );
};
