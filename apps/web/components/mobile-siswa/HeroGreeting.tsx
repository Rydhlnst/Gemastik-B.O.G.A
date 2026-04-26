"use client";

import { CheckCircle2, Navigation2, Sparkles } from "lucide-react";

interface HeroGreetingProps {
  onViewMap: () => void;
}

export const HeroGreeting = ({ onViewMap }: HeroGreetingProps) => {
  return (
    <div className="px-6 py-6 pb-2 relative z-10">
      <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
        Halo <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-cyan-500">Raenaldi!</span>
        <br />
        2693 penerima
        <br />
        makan hari ini
      </h2>

      <button 
        onClick={onViewMap}
        className="w-full bg-[#1A1C29] text-white py-5 rounded-[1.5rem] font-black text-sm flex items-center justify-center gap-3 shadow-[0_10px_30px_-10px_rgba(26,28,41,0.5)] transform active:scale-95 transition-all relative overflow-hidden group"
      >
        Lihat Peta Sekolah <Navigation2 className="w-4 h-4 rotate-90 ml-1" />
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
      </button>
    </div>
  );
};
