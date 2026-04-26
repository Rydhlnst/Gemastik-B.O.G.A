"use client";

import React from "react";
import { motion } from "framer-motion";

export interface GlassIconsItem {
  icon: React.ReactNode;
  color: string;
  label: string;
  customClass?: string;
  hideBackground?: boolean;
}

export interface GlassIconsProps {
  items: GlassIconsItem[];
  className?: string;
  showLabel?: boolean;
}

const GlassIcons = ({ items, className, showLabel = true }: GlassIconsProps) => {
  return (
    <div className={`flex gap-4 ${className || ""}`}>
      {items.map((item, index) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.05 }}
          className={`relative group cursor-pointer ${item.customClass || ""}`}
        >
          {/* Glass effect container */}
          <div
            className={`relative overflow-hidden rounded-2xl transition-all ${
              item.hideBackground
                ? "bg-transparent border-none p-0"
                : "border border-white/40 bg-white/25 p-4 backdrop-blur-md group-hover:bg-white/35 shadow-xl shadow-black/10"
            }`}
          >
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="text-white">{item.icon}</div>
              {showLabel && (
                <span className="text-xs font-bold text-slate-800/80 tracking-tight">
                  {item.label}
                </span>
              )}
            </div>

            {/* Background glow (only if background is shown) */}
            {!item.hideBackground && (
              <div
                className="absolute inset-0 -z-10 opacity-20 blur-xl transition-opacity group-hover:opacity-30"
                style={{ backgroundColor: item.color }}
              />
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default GlassIcons;
