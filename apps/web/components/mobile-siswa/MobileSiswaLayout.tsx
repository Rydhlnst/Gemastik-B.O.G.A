"use client";

import { useState } from "react";
import { type Sekolah } from "@/lib/mbgdummydata";

import { TopHeader } from "./TopHeader";
import { StoryCarousel } from "./StoryCarousel";
import { HeroGreeting } from "./HeroGreeting";
import { InteractiveMapCard } from "./InteractiveMapCard";
import { StatsAndLeaderboard } from "./StatsAndLeaderboard";
import { ReportForm } from "./ReportForm";
import { TodayMenuCard } from "./TodayMenuCard";
import { FloatingBottomNav } from "./FloatingBottomNav";
import { FoodRatingModal } from "./FoodRatingModal";
import { SchoolDetailPanel } from "@/components/ui/SchoolDetailPanel"; // Existing component
import { getVendorsBySekolah } from "@/lib/mbgdummydata";

export const MobileSiswaLayout = () => {
  const [selectedSchool, setSelectedSchool] = useState<Sekolah | null>(null);
  const [isFoodRatingOpen, setIsFoodRatingOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"home" | "map" | "rate" | "messages" | "menu">("home");

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <>
            <StoryCarousel />
            <HeroGreeting onViewMap={() => setActiveTab("map")} />
            <TodayMenuCard />
            <StatsAndLeaderboard />
          </>
        );
      case "map":
        return (
          <>
            <InteractiveMapCard 
              selectedSchool={selectedSchool} 
              onSchoolSelect={setSelectedSchool} 
              userSchoolId={1}
            />
            {selectedSchool && (
              <div className="px-6 py-4">
                 <SchoolDetailPanel 
                   school={selectedSchool}
                   vendors={getVendorsBySekolah(selectedSchool.id)}
                   onClose={() => setSelectedSchool(null)}
                 />
              </div>
            )}
          </>
        );
      case "rate":
        return (
          <div className="px-6 py-10 flex flex-col items-center text-center justify-center min-h-[60vh]">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-5xl shadow-xl shadow-indigo-100 mb-8 border border-slate-50 animate-bounce">
              🍱
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Rating Makanan</h3>
            <p className="text-sm font-medium text-slate-500 mb-10 px-6">
              Bantu kami meningkatkan kualitas makanan dengan memberikan penilaian jujurmu hari ini!
            </p>
            
            <button 
              onClick={() => setIsFoodRatingOpen(true)}
              className="w-full bg-[#1A1C29] text-white py-5 rounded-[1.5rem] font-black text-sm flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all group"
            >
              Mulai Penilaian <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">→</div>
            </button>

            <div className="mt-8 flex gap-2">
               {["⭐", "⭐", "⭐", "⭐"].map((s, i) => (
                 <span key={i} className="text-amber-400 opacity-40">✦</span>
               ))}
            </div>
          </div>
        );
      case "messages":
        return (
          <div className="px-6 py-8 relative z-10 flex flex-col min-h-[65vh]">
            <h3 className="text-2xl font-black tracking-tight text-slate-800 mb-2 drop-shadow-sm">Pesan 💬</h3>
            <p className="text-xs text-slate-500 font-bold mb-8">Pusat notifikasi dan bantuan langsung.</p>
            
            {/* Empty State */}
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10 mb-6 bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-2xl mb-4 border border-slate-100">📭</div>
              <h3 className="text-sm font-black text-slate-800 tracking-tight">Belum Ada Pesan</h3>
              <p className="text-[10px] text-slate-500 font-bold mt-1 px-4">Kotak masuk kamu kosong untuk saat ini.</p>
            </div>

            {/* CS Chat Option */}
            <button className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white p-5 rounded-[1.5rem] font-black text-sm flex items-center justify-between shadow-lg shadow-indigo-500/25 active:scale-95 transition-transform group">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 text-lg relative">
                    👩‍💻
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-indigo-500 rounded-full"></span>
                  </div>
                  <div className="text-left">
                     <p className="text-white font-black leading-tight text-sm">Chat Customer Service</p>
                     <p className="text-white/80 text-[10px] font-bold">Online · Membalas seketika</p>
                  </div>
               </div>
               <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
               </div>
            </button>
          </div>
        );
      case "menu":
        return (
          <div className="flex flex-col items-center justify-center h-64 text-center px-6 mt-10">
            <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center text-2xl mb-4 border border-slate-100">⚙️</div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Menu Lainnya</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">Pengaturan akun dalam tahap pengembangan.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FAFAFA] font-sans pb-24 max-w-[100vw] overflow-x-hidden md:hidden">
      {/* 1. Header & Navigation (Always visible) */}
      <TopHeader />
      
      {/* 2. Dynamic Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {renderContent()}
      </div>
      
      {/* 3. Persistent Overlays */}
      <FloatingBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <FoodRatingModal isOpen={isFoodRatingOpen} onClose={() => {
        setIsFoodRatingOpen(false);
        setActiveTab("home"); // Return home after submission/close
      }} />
    </div>
  );
};
