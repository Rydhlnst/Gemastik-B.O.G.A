"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Menu, X, LayoutDashboard, ClipboardList, Activity, BarChart3, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

const NAV_ITEMS = ["Dashboard", "Pengajuan", "Progress", "Laporan", "Riwayat"];

interface VendorNavbarProps {
  onNavigate?: (target: string) => void;
  activeTab?: string;
  variant?: "dark" | "light";
}

export function VendorNavbar({ onNavigate, activeTab = "Dashboard", variant = "dark" }: VendorNavbarProps) {
  const isLight = variant === "light";
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (item: string) => {
    if (onNavigate) {
      onNavigate(item);
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav 
        className={`
          fixed top-0 inset-x-0 z-[60] flex items-center justify-between px-8 py-3 
          transition-all duration-300
          ${(scrolled || mobileMenuOpen) ? "bg-[#0b1217]/80 backdrop-blur-xl border-b border-white/5 py-2 shadow-2xl" : "bg-transparent"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm shadow-[0_0_15px_rgba(120,53,15,0.3)]"
            style={{
              background: "linear-gradient(135deg, #78350f, #b45309)",
              color: "#fff",
            }}
          >
            B
          </div>
          <div className={(scrolled || mobileMenuOpen) ? "hidden lg:block transition-all" : "block transition-all"}>
            <p className={`text-sm font-bold leading-none transition-colors ${isLight && !scrolled && !mobileMenuOpen ? "text-amber-950" : "text-white"}`}>B.O.G.A.</p>
            <p className={`text-[10px] mt-0.5 uppercase tracking-widest font-black transition-colors ${isLight && !scrolled && !mobileMenuOpen ? "text-amber-900/40" : "text-white/40"}`}>Vendor Portal</p>
          </div>
        </div>

        {/* Desktop Nav pills */}
        <div
          className="hidden md:flex gap-1 rounded-full px-1 py-1 border border-white/20 shadow-lg backdrop-blur-md transition-all"
          style={{ background: "rgba(255,255,255,0.12)" }}
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              onClick={() => handleNavClick(item)}
              className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full transition-all ${
                activeTab === item
                  ? "bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.3)] border border-amber-500/50"
                  : isLight && !scrolled && !mobileMenuOpen
                    ? "text-amber-900/60 hover:text-amber-900"
                    : "text-white/45 hover:text-white/70"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-2">
          <Link href="/" className="hidden sm:block">
            <button className={`
              flex items-center gap-1 text-[11px] font-bold transition-all px-3 py-1.5 rounded-full border shadow-sm
              ${isLight && !scrolled && !mobileMenuOpen 
                ? "text-amber-900/60 border-amber-900/20 bg-amber-900/5 hover:bg-amber-900/10" 
                : "text-white/50 border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10"
              }
            `}>
              Keluar
            </button>
          </Link>
          
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ring-2 ring-white/10"
            style={{
              background: "linear-gradient(135deg, #78350f, #b45309)",
              color: "#fff",
            }}
          >
            VP
          </div>

          {/* Mobile Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#0b1217] md:hidden flex flex-col"
          >
            {/* Mobile Header in Full Screen */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center font-black text-white">V</div>
                <span className="text-sm font-bold text-white tracking-widest uppercase">Navigation</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white transition-all hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 flex flex-col justify-center px-10 gap-2">
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mb-4">Main Menu</p>
              {NAV_ITEMS.map((item, idx) => {
                const isActive = activeTab === item;
                return (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <button
                      onClick={() => handleNavClick(item)}
                      className={`block text-3xl font-black uppercase tracking-tighter py-3 transition-all ${
                        isActive ? "text-amber-500" : "text-white/40 hover:text-white"
                      }`}
                    >
                      {item}
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom Section */}
            <div className="p-10 border-t border-white/5 space-y-6">
              <Link 
                href="/" 
                className="flex items-center justify-between group"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div>
                   <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Exit Portal</p>
                   <p className="text-sm font-bold text-white group-hover:text-amber-500 transition-colors">Back to Home</p>
                </div>
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 group-hover:border-amber-500 group-hover:text-amber-500 transition-all">
                   <ChevronRight className="w-5 h-5" />
                </div>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
