"use client";

import { Sun } from "lucide-react";

export const TopHeader = () => {
  return (
    <div className="flex items-center justify-between px-6 pt-8 pb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-black text-lg relative shadow-md shadow-indigo-200">
          R
          <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></div>
        </div>
        <h1 className="text-xl font-black text-slate-800 tracking-tight">
          B.O.G.A
        </h1>
      </div>
      <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-amber-500 hover:bg-slate-200 transition-colors" aria-label="Toggle Theme">
        <Sun className="w-5 h-5" />
      </button>
    </div>
  );
};
