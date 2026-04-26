"use client";

import { Home, Map as MapIcon, Utensils, MessageSquare, Menu } from "lucide-react";

interface FloatingBottomNavProps {
  activeTab: "home" | "map" | "rate" | "messages" | "menu";
  onTabChange: (tab: "home" | "map" | "rate" | "messages" | "menu") => void;
}

export const FloatingBottomNav = ({ activeTab, onTabChange }: FloatingBottomNavProps) => {
  return (
    <div className="fixed bottom-6 left-0 w-full px-6 z-[60] pointer-events-none">
      <div className="w-full max-w-sm mx-auto bg-white/90 backdrop-blur-xl rounded-[2rem] p-2 flex items-center justify-between shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 pointer-events-auto">
        <button 
          onClick={() => onTabChange("home")}
          className={`p-4 transition-colors ${activeTab === "home" ? "text-indigo-600" : "text-slate-400 hover:text-indigo-600"}`} 
          aria-label="Home"
        >
          <Home className="w-6 h-6" />
        </button>
        <button 
          onClick={() => onTabChange("map")}
          className={`p-4 transition-colors ${activeTab === "map" ? "text-indigo-600" : "text-slate-400 hover:text-indigo-600"}`} 
          aria-label="Map"
        >
          <MapIcon className="w-6 h-6" />
        </button>
        
        {/* Central Rate Action Button */}
        <button 
          onClick={() => onTabChange("rate")}
          className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center shadow-lg transition-all ${activeTab === "rate" ? "bg-indigo-600 scale-105 shadow-indigo-200" : "bg-[#1A1C29] active:scale-95 text-white"}`} 
          aria-label="Rate Food"
        >
          <Utensils className={`w-6 h-6 transition-transform ${activeTab === "rate" ? "scale-110" : ""}`} strokeWidth={3} />
        </button>

        <button 
          onClick={() => onTabChange("messages")}
          className={`p-4 transition-colors relative ${activeTab === "messages" ? "text-indigo-600" : "text-slate-400 hover:text-indigo-600"}`} 
          aria-label="Messages"
        >
          <MessageSquare className="w-6 h-6" />
          <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></div>
        </button>
        <button 
          onClick={() => onTabChange("menu")}
          className={`p-4 transition-colors ${activeTab === "menu" ? "text-indigo-600" : "text-slate-400 hover:text-indigo-600"}`} 
          aria-label="Menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
