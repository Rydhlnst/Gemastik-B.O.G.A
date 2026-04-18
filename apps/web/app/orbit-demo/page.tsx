"use client";

import { OrbitHubSection } from "@/components/ui/orbit-hub-section";

export default function OrbitHubDemo() {
  return (
    <div className="flex w-full min-h-screen items-center justify-center bg-slate-950 p-10 font-['Plus_Jakarta_Sans']">
      <div className="w-full max-w-[1200px] flex flex-col gap-12">
        <div className="text-center">
          <h1 className="text-white text-5xl font-black tracking-tighter mb-4">
            B.O.G.A <span className="text-indigo-500">Orbit Hub</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            High-fidelity interactive ecosystem visualization using Remotion interpolation 
            logic and high-performance mirrored canvas particles.
          </p>
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 ring-1 ring-slate-100">
          <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h2 className="text-slate-900 font-bold">Ecosystem Interactive</h2>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Version 2.0 • Remotion Driven</p>
            </div>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
          </div>
          
          <OrbitHubSection />

          <div className="p-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
             <div className="space-y-3">
               <h4 className="text-slate-900 font-black text-[11px] uppercase tracking-widest">01. Dynamic Height</h4>
               <p className="text-slate-500 text-xs leading-relaxed">
                 Container transisi secara halus dari 160px ke 420px menggunakan premium ease-in-out easing
                 untuk memberikan ruang bagi visualisasi ekosistem.
               </p>
             </div>
             <div className="space-y-3">
               <h4 className="text-slate-900 font-black text-[11px] uppercase tracking-widest">02. Staggered Launch</h4>
               <p className="text-slate-500 text-xs leading-relaxed">
                 Satelit dilemparkan dari hub pusat dengan delay bertahap (stagger) menggunakan 
                 Remotion Spring physics untuk kesan taktil.
               </p>
             </div>
             <div className="space-y-3">
               <h4 className="text-slate-900 font-black text-[11px] uppercase tracking-widest">03. Mirrored Canvas</h4>
               <p className="text-slate-500 text-xs leading-relaxed">
                 Latar belakang menggunakan 4-way symmetry geometric particles yang 
                 dirender melalui HTML5 Canvas untuk performa maksimal.
               </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
