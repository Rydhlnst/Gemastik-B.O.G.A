"use client";

import { Truck, Sparkles, Target, ChevronLeft, ChevronRight } from "lucide-react";

export const StoryCarousel = () => {
  const stories = [
    { title: "Distribusi", bg: "bg-emerald-100", text: "text-emerald-700", icon: Truck },
    { title: "Menu Baru", bg: "bg-fuchsia-100", text: "text-fuchsia-700", icon: Sparkles },
    { title: "Target Q3", bg: "bg-blue-100", text: "text-blue-700", icon: Target },
    { title: "Feedback", bg: "bg-amber-100", text: "text-amber-700", icon: Target },
  ];

  return (
    <div className="px-6 py-2">
      {/* Cards Scroll */}
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4">
        {stories.map((s, i) => (
          <div
            key={i}
            className={`min-w-[110px] h-[130px] rounded-[1.5rem] ${s.bg} p-4 flex flex-col justify-between snap-center relative overflow-hidden group`}
          >
            {/* Background floating abstract shapes for Gen Z vibe */}
            <div className={`absolute -right-4 -bottom-4 opacity-20`}>
              <s.icon className={`w-20 h-20 ${s.text}`} />
            </div>
            
            <div className={`w-8 h-8 rounded-full bg-white/60 flex items-center justify-center ${s.text} backdrop-blur-sm`}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className={`font-black text-xs ${s.text} z-10`}>{s.title}</p>
          </div>
        ))}
      </div>

      {/* Custom Scroll Indicator */}
      <div className="flex items-center justify-center gap-3">
        <ChevronLeft className="w-6 h-6 text-slate-300" />
        <div className="w-24 h-2.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="w-1/3 h-full bg-slate-400 rounded-full"></div>
        </div>
        <ChevronRight className="w-6 h-6 text-slate-300" />
      </div>
    </div>
  );
};
