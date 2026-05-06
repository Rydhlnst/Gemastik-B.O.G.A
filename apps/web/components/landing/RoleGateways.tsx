"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, animate } from "framer-motion";
import { Landmark, Store, Box, Truck, School, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { SectionHeader } from "./SectionHeader";
import { PrimaryButton } from "./CustomButtons";

function AnimatedNumber({ value }: { value: string }) {
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    const numMatch = value.match(/[\d.,]+/);
    if (!numMatch) {
      setDisplayValue(value);
      return;
    }
    
    const numStrWithCommas = numMatch[0];
    const suffix = value.substring(numMatch.index! + numStrWithCommas.length);
    const prefix = value.substring(0, numMatch.index!);
    
    const cleanNumStr = numStrWithCommas.replace(/,/g, '');
    const target = parseFloat(cleanNumStr);
    const hasDecimals = cleanNumStr.includes('.');
    const hasCommas = numStrWithCommas.includes(',');
    
    const controls = animate(0, target, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (val) => {
        let formattedNum = hasDecimals ? val.toFixed(1) : Math.round(val).toString();
        if (hasCommas) {
           formattedNum = Math.round(val).toLocaleString('en-US');
        }
        setDisplayValue(`${prefix}${formattedNum}${suffix}`);
      }
    });
    
    return controls.stop;
  }, [value]);

  return <>{displayValue}</>;
}

const roleThemes = {
  blue: {
    iconBg: "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800",
    iconColor: "text-blue-500",
    activeBorder: "border-blue-400",
    cardStyle: "border-blue-200 shadow-[0_16px_40px_-12px_rgba(59,130,246,0.15)]",
    indicator: "after:bg-blue-500",
    badge: "bg-blue-50 text-blue-600",
    progress: "bg-blue-500",
    btn: "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white",
    hoverBorder: "hover:border-blue-500/30",
  },
  amber: {
    iconBg: "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-800",
    iconColor: "text-amber-500",
    activeBorder: "border-amber-400",
    cardStyle: "border-amber-200 shadow-[0_16px_40px_-12px_rgba(245,158,11,0.15)]",
    indicator: "after:bg-amber-500",
    badge: "bg-amber-50 text-amber-600",
    progress: "bg-amber-500",
    btn: "bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white",
    hoverBorder: "hover:border-amber-500/30",
  },
  emerald: {
    iconBg: "bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-800",
    iconColor: "text-emerald-500",
    activeBorder: "border-emerald-400",
    cardStyle: "border-emerald-200 shadow-[0_16px_40px_-12px_rgba(16,185,129,0.15)]",
    indicator: "after:bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-600",
    progress: "bg-emerald-500",
    btn: "bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white",
    hoverBorder: "hover:border-emerald-500/30",
  },
  cyan: {
    iconBg: "bg-gradient-to-br from-cyan-100 to-cyan-200 text-cyan-800",
    iconColor: "text-cyan-500",
    activeBorder: "border-cyan-400",
    cardStyle: "border-cyan-200 shadow-[0_16px_40px_-12px_rgba(6,182,212,0.15)]",
    indicator: "after:bg-cyan-500",
    badge: "bg-cyan-50 text-cyan-600",
    progress: "bg-cyan-500",
    btn: "bg-cyan-50 text-cyan-600 hover:bg-cyan-500 hover:text-white",
    hoverBorder: "hover:border-cyan-500/30",
  },
  violet: {
    iconBg: "bg-gradient-to-br from-violet-100 to-violet-200 text-violet-800",
    iconColor: "text-violet-500",
    activeBorder: "border-violet-400",
    cardStyle: "border-violet-200 shadow-[0_16px_40px_-12px_rgba(139,92,246,0.15)]",
    indicator: "after:bg-violet-500",
    badge: "bg-violet-50 text-violet-600",
    progress: "bg-violet-500",
    btn: "bg-violet-50 text-violet-600 hover:bg-violet-500 hover:text-white",
    hoverBorder: "hover:border-violet-500/30",
  },
  pink: {
    iconBg: "bg-gradient-to-br from-pink-100 to-pink-200 text-pink-800",
    iconColor: "text-pink-500",
    activeBorder: "border-pink-400",
    cardStyle: "border-pink-200 shadow-[0_16px_40px_-12px_rgba(236,72,153,0.15)]",
    indicator: "after:bg-pink-500",
    badge: "bg-pink-50 text-pink-600",
    progress: "bg-pink-500",
    btn: "bg-pink-50 text-pink-600 hover:bg-pink-500 hover:text-white",
    hoverBorder: "hover:border-pink-500/30",
  }
};

const roles = [
  { 
    name: "Pemerintah", 
    icon: Landmark, 
    theme: roleThemes.blue, 
    href: "/goverment/dashboard",
    status: "Aktif",
    desc: "Monitoring & evaluasi program pendidikan nasional secara real-time.",
    stats: [{ value: "1,240", label: "Sekolah" }, { value: "98%", label: "Coverage" }],
    progress: "w-[92%]"
  },
  { 
    name: "Vendor", 
    icon: Store, 
    theme: roleThemes.amber, 
    href: "/vendor/dashboard",
    status: "Proses",
    desc: "Pengelolaan pengadaan, distribusi, dan stok logistik pangan.",
    stats: [{ value: "86", label: "Supplier" }, { value: "12.5T", label: "Distribusi" }],
    progress: "w-[78%]"
  },
  { 
    name: "SPPG", 
    icon: Box, 
    theme: roleThemes.emerald, 
    href: "/sppg/dashboard",
    status: "Aktif",
    desc: "Sistem Penjaminan Pangan Gizi untuk program makan bergizi gratis.",
    stats: [{ value: "3.2M", label: "Siswa" }, { value: "85%", label: "Tercover" }],
    progress: "w-[85%]"
  },
  { 
    name: "Logistik", 
    icon: Truck, 
    theme: roleThemes.cyan, 
    href: "/logistik/dashboard",
    status: "Transit",
    desc: "Tracking pengiriman, rute distribusi, dan manajemen gudang.",
    stats: [{ value: "452", label: "Pengiriman" }, { value: "64%", label: "Terkirim" }],
    progress: "w-[64%]"
  },
  { 
    name: "Admin Sekolah", 
    icon: School, 
    theme: roleThemes.violet, 
    href: "/sekolah/admin",
    status: "Aktif",
    desc: "Verifikasi data siswa, pelaporan harian, dan koordinasi program.",
    stats: [{ value: "48", label: "Kelas" }, { value: "1,205", label: "Siswa" }],
    progress: "w-[88%]"
  },
  { 
    name: "Siswa", 
    icon: Users, 
    theme: roleThemes.pink, 
    href: "/sekolah/siswa",
    status: "Online",
    desc: "Akses jadwal makan, laporan gizi, dan informasi program.",
    stats: [{ value: "5/5", label: "Hari Aktif" }, { value: "96%", label: "Kehadiran" }],
    progress: "w-[96%]"
  },
];

export function RoleGateways() {
  const [activeRoleName, setActiveRoleName] = useState(roles[0].name);
  const activeRole = roles.find(r => r.name === activeRoleName) || roles[0];

  return (
    <section id="roles" className="pt-[clamp(40px,6vh,80px)] pb-[clamp(100px,12vh,180px)] px-[clamp(1.5rem,5vw,4rem)] bg-[#FAFAF7]">
      <div className="max-w-[1280px] mx-auto">
        <SectionHeader 
          label="ROLE GATEWAYS" 
          headline="Akses Tersegmentasi, Kolaborasi Tersinkronisasi." 
          centered 
          className="mb-6 lg:mb-8 [&_h2]:text-[clamp(1.3rem,4vw,3.5rem)]" 
        />
        <p className="hidden lg:block text-slate-500 text-lg leading-relaxed text-center max-w-[700px] mx-auto mb-8">Setiap peran memiliki ruang kerja spesifik yang dirancang untuk menjaga integritas data dan efisiensi alur operasional B.O.G.A secara menyeluruh.</p>
        
        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-3 mb-8 pb-4 pt-2 justify-center">
          {roles.map((role) => {
            const isActive = role.name === activeRoleName;
            return (
              <button
                key={role.name}
                onClick={() => setActiveRoleName(role.name)}
                className={`flex items-center justify-center ${isActive ? 'gap-2.5 px-5' : 'px-4'} py-3.5 rounded-2xl transition-all duration-300 flex-shrink-0 border-2 ${
                  isActive 
                    ? `${role.theme.iconBg} ${role.theme.activeBorder} shadow-sm` 
                    : 'bg-white border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
                style={!isActive ? { border: '2px solid transparent' } : undefined}
              >
                <role.icon className={`w-5 h-5 ${isActive ? '' : role.theme.iconColor}`} />
                <AnimatePresence mode="popLayout">
                  {isActive && (
                    <motion.span 
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="font-semibold text-[15px] whitespace-nowrap text-slate-900 overflow-hidden origin-left"
                    >
                      {role.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            )
          })}
        </div>

        {/* Full Width Content Card */}
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRole.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={`bg-white border rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 lg:p-12 w-full transition-colors duration-500 ${activeRole.theme.cardStyle}`}
            >
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                {/* Left Column */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-5 sm:mb-6">
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-[20px] flex items-center justify-center relative ${activeRole.theme.iconBg} after:content-[''] after:absolute after:-top-1 after:-right-1 after:w-3.5 after:h-3.5 sm:after:w-4 sm:after:h-4 after:rounded-full after:border-[2.5px] sm:after:border-[3px] after:border-white ${activeRole.theme.indicator}`}>
                      <activeRole.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <span className={`text-[11px] sm:text-[13px] font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full tracking-wide ${activeRole.theme.badge}`}>
                      Status: {activeRole.status}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4 tracking-tight">{activeRole.name} Portal</h3>
                  <p className="text-[14px] sm:text-[15px] lg:text-[17px] text-slate-500 font-medium leading-relaxed max-w-lg mb-6 lg:mb-0">
                    {activeRole.desc}
                  </p>
                </div>

                {/* Right Column */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-4 sm:gap-6 py-5 px-5 sm:py-6 sm:px-8 bg-slate-50 rounded-2xl sm:rounded-[24px] mb-6 sm:mb-8 border border-slate-100">
                    <div className="flex flex-col flex-1">
                      <span className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-none mb-1.5 sm:mb-2 tracking-tight">
                        <AnimatedNumber value={activeRole.stats[0].value} />
                      </span>
                      <span className="text-[11px] sm:text-[13px] text-slate-500 font-bold uppercase tracking-wider">{activeRole.stats[0].label}</span>
                    </div>
                    <div className="w-px h-12 sm:h-16 bg-slate-200" />
                    <div className="flex flex-col flex-1 pl-2 sm:pl-4">
                      <span className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-none mb-1.5 sm:mb-2 tracking-tight">
                        <AnimatedNumber value={activeRole.stats[1].value} />
                      </span>
                      <span className="text-[11px] sm:text-[13px] text-slate-500 font-bold uppercase tracking-wider">{activeRole.stats[1].label}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-2.5 sm:mb-3">
                      <span className="text-[11px] sm:text-[13px] font-bold text-slate-400 uppercase tracking-wider">Capaian Operasional</span>
                      <span className={`text-base sm:text-lg font-extrabold text-slate-900`}>
                        <AnimatedNumber value={activeRole.progress.replace('w-[','').replace(']','')} />
                      </span>
                    </div>
                    <div className="h-3 sm:h-3.5 rounded-full mb-6 sm:mb-8 overflow-hidden bg-slate-100 shadow-inner relative">
                      <motion.div 
                        key={`bar-${activeRole.name}`}
                        initial={{ width: 0 }}
                        animate={{ width: activeRole.progress.replace('w-[','').replace(']','') }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`h-full rounded-full ${activeRole.theme.progress} absolute top-0 left-0`} 
                      />
                    </div>
                    <Link href={activeRole.href} className={`flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5 rounded-2xl sm:rounded-[20px] text-[14px] sm:text-[15px] font-bold transition-all duration-300 group shadow-sm ${activeRole.theme.btn}`}>
                      <span>Akses Dashboard</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1 sm:group-hover:translate-x-2" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
