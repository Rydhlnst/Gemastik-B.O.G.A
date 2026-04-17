"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Zap, Link2, BarChart3, Activity, ShieldCheck, School, ChevronRight, Phone, MessageSquare, Mail, AlertTriangle, Send } from "lucide-react";
import CountUp from "@/components/ui/CountUp";
import { type Sekolah, getVendorsBySekolah } from "@/lib/mbgdummydata";
import { SchoolDetailPanel } from "@/components/ui/SchoolDetailPanel";
import VendorRanking from "@/components/ui/vendorranking";
import { MobileSiswaLayout } from "@/components/mobile-siswa/MobileSiswaLayout";

const MapLibreMap = dynamic(() => import("@/components/ui/MapLibreMap"), { ssr: false });

const DesktopViewSiswa = () => {
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<Sekolah | null>(null);
  const [showRanking, setShowRanking] = useState(false);

  const features = [
    { title: "Visibilitas Real-Time", subtitle: "Pantau setiap aliran distribusi.", icon: MapPin, desc: "Lacak posisi armada dan status pengiriman sekolah." },
    { title: "ETA Berbasis AI", subtitle: "Prediksi keterlambatan pintar.", icon: Zap, desc: "AI meninjau pola lalu lintas untuk estimasi akurat." },
    { title: "Kontrol End-to-End", subtitle: "Satu platform terintegrasi.", icon: Link2, desc: "Ekosistem kohesif dapur pusat ke titik kirim." },
    { title: "Laporan Transparan", subtitle: "Akses data terbuka.", icon: BarChart3, desc: "Log serah terima tersimpan permanen." },
  ];

  return (
    <div className="w-full min-h-screen bg-[#f8faff] text-slate-900 font-sans selection:bg-indigo-100 pb-0 pt-0">
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="boga-icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <main className="max-w-7xl mx-auto px-6 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-3">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-8 bg-white rounded-[1.25rem] p-4 md:p-5 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-center min-h-[120px]">
            <div className="relative z-10">
              <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tighter mb-0.5">
                Akses <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Siswa</span>
              </h1>
              <p className="text-slate-400 font-bold tracking-[0.3em] uppercase text-[8px] mb-3">Distribusi MBG · Pengecekan</p>
              <div className="flex gap-2">
                <span className="bg-[#f0fdf4] text-[#16a34a] border border-emerald-50 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Portal Penerima</span>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50/30 blur-[80px] rounded-full -mr-16 -mt-16" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-4 bg-gradient-to-br from-[#4f46e5] via-[#0ea5e9] to-[#22d3ee] rounded-[1.25rem] p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-xl shadow-blue-100 min-h-[120px]">
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex gap-0.5">
                {"SISWA".split("").map((letter, i) => (
                  <motion.span key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + (i * 0.1), duration: 0.5, repeat: Infinity, repeatType: "reverse", repeatDelay: 2 }} className="text-3xl md:text-5xl font-black tracking-widest text-white drop-shadow-lg">{letter}</motion.span>
                ))}
              </div>
            </div>
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
            </div>
          </motion.div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-3">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-9 bg-white rounded-[1.25rem] p-4 border border-slate-100 shadow-sm relative flex flex-col min-h-[440px]">
            <div className="flex flex-col mb-3">
              <h2 className="text-indigo-600 font-black text-[8px] uppercase tracking-[0.3em] mb-0.5">Peta Distribusi & Pantauan Sekolah</h2>
              <p className="text-slate-400 text-[9px] font-medium">Klik sekolah untuk melihat info penjemputan.</p>
            </div>
            <div className="flex-1 rounded-[1.25rem] overflow-hidden border border-slate-50 relative bg-slate-50">
              <MapLibreMap selectedSchool={selectedSchool} onSchoolSelect={setSelectedSchool} />
            </div>
          </motion.div>
          <div className="lg:col-span-3 flex flex-col h-full">
            <AnimatePresence mode="wait">
              {selectedSchool ? (
                <SchoolDetailPanel key="school-details" school={selectedSchool} vendors={getVendorsBySekolah(selectedSchool.id)} onClose={() => setSelectedSchool(null)} />
              ) : (
                <motion.div key="feature-stack" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-1.5 h-full">
                  {features.map((f, i) => (
                    <motion.div key={f.title} onClick={() => setSelectedFeature(selectedFeature === i ? null : i)} className={`group bg-white rounded-[1.25rem] p-3.5 border transition-all duration-300 cursor-pointer flex flex-col justify-center flex-1 ${selectedFeature === i ? 'bg-gradient-to-br from-indigo-600 to-cyan-500 border-transparent text-white shadow-xl shadow-indigo-100' : 'border-slate-100 hover:bg-gradient-to-br hover:from-indigo-600 hover:to-cyan-500 hover:border-transparent hover:text-white shadow-sm'}`}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <h3 className={`text-[13px] font-black tracking-tight leading-none mb-1 transition-colors ${selectedFeature === i ? 'text-white' : 'text-slate-900 group-hover:text-white'}`}>{f.title}</h3>
                          <p className={`text-[9px] font-bold transition-colors ${selectedFeature === i ? 'text-indigo-100' : 'text-slate-400 group-hover:text-indigo-100'}`}>{f.subtitle}</p>
                        </div>
                        <div className={`p-2.5 rounded-xl transition-all ${selectedFeature === i ? 'bg-white/20 text-white' : 'bg-slate-50 group-hover:bg-white/20'}`}>
                          <f.icon className="w-4 h-4" style={{ stroke: selectedFeature === i ? 'white' : 'url(#boga-icon-gradient)' }} />
                        </div>
                      </div>
                      <AnimatePresence>
                        {selectedFeature === i && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t border-white/20 flex-1 overflow-y-auto">
                            <p className={`text-[11px] font-medium leading-relaxed ${selectedFeature === i ? 'text-white/80' : 'text-slate-500'}`}>{f.desc}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-4 md:pb-8">
          {[
            { label: "Sekolah Aktif", value: 6, unit: "unit", icon: School },
            { label: "Penerima Makan", value: 2693, unit: "0/hari", icon: Activity },
            { label: "Gudang Penyalur", value: 4, unit: "0 titik", icon: ShieldCheck },
            { label: "Mitra Terafiliasi", value: 5, unit: "0 vendor", icon: ChevronRight }
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + (i * 0.1) }} className="bg-white rounded-[1.25rem] p-4 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-all group">
              <h3 className="text-[13px] font-black text-slate-900 tracking-tight mb-1.5 group-hover:text-indigo-600 transition-colors">{stat.label}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-slate-800 tabular-nums"><CountUp to={stat.value} /></span>
                <span className="text-[9px] font-bold text-slate-400">{stat.unit}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
      <section id="vendor" className="relative px-6 pb-2 pt-16 bg-slate-50 flex justify-center border-t border-slate-200 overflow-hidden min-h-[60vh]">
        <BackgroundParticles />
        <div className="w-full max-w-3xl flex flex-col items-center z-10">
          <button onClick={() => setShowRanking(!showRanking)} className="group flex flex-col items-center gap-2 mb-6">
            <h2 className="text-3xl font-black text-slate-900 text-center tracking-tight group-hover:text-indigo-600 transition-colors">Top Performance Tracker</h2>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-indigo-500 transition-colors">
              <span>{showRanking ? "Hide Ranking" : "View Vendor Ranking"}</span>
              <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${showRanking ? "rotate-90" : ""}`} />
            </div>
          </button>
          <AnimatePresence>
            {showRanking && (
              <motion.div initial={{ height: 0, opacity: 0, scale: 0.95 }} animate={{ height: "auto", opacity: 1, scale: 1 }} exit={{ height: 0, opacity: 0, scale: 0.95 }} className="w-full overflow-hidden">
                <div className="pt-6 border-t border-slate-200">
                  <VendorRanking />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
      <section id="contact" className="relative px-6 pt-2 pb-12 bg-slate-100 flex justify-center z-10">
        <div className="w-full max-w-[1400px]">
          <WebsiteSupportSection />
        </div>
      </section>
    </div>
  );
};

export default function SiswaPage() {
  return (
    <main>
      {/* Target Layar Desktop - Legacy UI */}
      <div className="hidden md:block">
        <DesktopViewSiswa />
      </div>

      {/* Target Layar Mobile (Responsive) - Gen Z UI */}
      <div className="block md:hidden">
        <MobileSiswaLayout />
      </div>
    </main>
  );
}

const BackgroundParticles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 shadow-inner">
    <motion.div className="absolute" style={{ left: '-10%', top: '-20%', width: '600px', height: '600px' }} animate={{ rotate: 360, y: [0, 40, 0] }} transition={{ rotate: { duration: 60, repeat: Infinity, ease: "linear" }, y: { duration: 15, repeat: Infinity, ease: "easeInOut" } }}>
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-indigo-200/40 fill-none" style={{ strokeWidth: 0.8 }}><polygon points="50,5 89,27.5 89,72.5 50,95 11,72.5 11,27.5" /><polygon points="50,15 80.3,32.5 80.3,67.5 50,85 19.7,67.5 19.7,32.5" className="stroke-indigo-200/20" style={{ strokeWidth: 0.4 }} /></svg>
    </motion.div>
    <motion.div className="absolute" style={{ right: '-5%', bottom: '-30%', width: '500px', height: '500px' }} animate={{ rotate: -360, y: [0, -30, 0] }} transition={{ rotate: { duration: 50, repeat: Infinity, ease: "linear" }, y: { duration: 12, repeat: Infinity, ease: "easeInOut" } }}>
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-cyan-200/40 fill-none" style={{ strokeWidth: 1 }}><polygon points="50,5 95,50 50,95 5,50" /><polygon points="50,18 82,50 50,82 18,50" className="stroke-cyan-200/20" style={{ strokeWidth: 0.5 }} /></svg>
    </motion.div>
  </div>
);

const WebsiteSupportSection = () => (
  <div className="module-reveal pt-4 space-y-8 z-10 relative">
    <div>
      <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Pusat Bantuan & Pengaduan</h2>
      <p className="text-xs text-slate-500 font-medium italic tracking-[0.05em]">Laporan kendala teknis sistem atau laporan keamanan aplikasi</p>
    </div>
    <div className="grid grid-cols-1 gap-8 max-w-xl mx-auto">
      <div className="space-y-6">
        <div className="bg-white/45 backdrop-blur-[40px] rounded-[32px] p-8 border border-white/60 border-t-white/80 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.25)]">
          <h3 className="text-lg font-black text-slate-900 mb-8 tracking-tight">Hubungi Tim Sekolah</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-5 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/30 transition-all shadow-sm">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/10"><Phone className="w-6 h-6 text-emerald-600" /></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Call Center</p><p className="text-base font-black text-slate-900">1-500-BOGA-WEB</p></div>
            </div>
            <div className="flex items-center gap-5 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/30 transition-all shadow-sm">
              <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center border border-sky-500/10"><MessageSquare className="w-6 h-6 text-sky-600" /></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Live Chat Admin</p><p className="text-base font-black text-slate-900">+62 811 2345 6789</p></div>
            </div>
            <div className="flex items-center gap-5 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/30 transition-all shadow-sm">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/10"><Mail className="w-6 h-6 text-indigo-600" /></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Email Bantuan Teknis</p><p className="text-base font-black text-slate-900">support@boga.id</p></div>
            </div>
          </div>
        </div>
        <div className="bg-rose-500/10 backdrop-blur-[40px] border border-white/60 border-t-white/80 rounded-[32px] p-8 relative overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.25)]">
          <div className="absolute top-0 right-0 p-6 opacity-10"><AlertTriangle className="w-16 h-16 text-rose-600" /></div>
          <h4 className="text-[10px] font-black text-rose-600 mb-3 flex items-center gap-2 uppercase tracking-[0.2em]"><ShieldCheck className="w-4 h-4" /> Kendala Keamanan</h4>
          <p className="text-xs text-slate-600 leading-relaxed font-bold">Untuk indikasi terjadinya pelanggaran sistem atau akses mencurigakan, hubungi admin jaringan sekolah segera.</p>
        </div>
      </div>
    </div>
  </div>
);
