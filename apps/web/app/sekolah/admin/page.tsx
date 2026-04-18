"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Zap, Link2, BarChart3, Search, Activity, ShieldCheck, School, ChevronRight, Phone, MessageSquare, Mail, AlertTriangle, Send } from "lucide-react";
import CountUp from "@/components/ui/CountUp";
import { type Sekolah, getVendorsBySekolah, sekolahList, getSPPGBySekolah, deliveryList } from "@/lib/mbgdummydata";
import { SchoolDetailPanel } from "@/components/ui/SchoolDetailPanel";
import VendorRanking from "@/components/ui/vendorranking";
import VendorPerformanceDashboard from "@/components/ui/VendorPerformanceDashboard";

const MapLibreMap = dynamic(() => import("@/components/ui/MapLibreMap"), { ssr: false });

export default function SekolahAdminPage() {
  const [viewMode, setViewMode] = useState<"school" | "aggregate">("school");
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<Sekolah | null>(null);
  const [showRanking, setShowRanking] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState<number>(1);

  const loggedInSchool = sekolahList.find(s => s.id === 1);
  const availableVendors = loggedInSchool ? getVendorsBySekolah(loggedInSchool.id) : [];
  const availableSPPG = loggedInSchool ? getSPPGBySekolah(loggedInSchool.id) : null;
  
  // Fetch latest delivery for the primary vendor relation
  const primaryRelation = availableVendors.find(v => v.is_primary);
  const latestDelivery = primaryRelation 
    ? deliveryList.filter(d => d.vendor_sekolah_id === primaryRelation.id).sort((a,b) => b.id - a.id)[0] 
    : null;

  // Fase 2: Sidebar Repurposing - Operational Identity Panels
  const identityPanels = [
    {
      title: "Status Batch Terakhir",
      subtitle: "Monitoring real-time produksi.",
      icon: Activity,
      content: latestDelivery ? `${latestDelivery.status === 'on_transit' ? 'On Transit' : latestDelivery.status === 'delivered' ? 'Selesai' : 'Pending'}` : "Memuat status...",
      detail: latestDelivery ? `Batch #${latestDelivery.id + 8800} pada ${latestDelivery.tanggal}. Porsi: ${latestDelivery.porsi_dikirim} box.` : "Tidak ada data batch."
    },
    {
      title: "Jadwal Pengiriman",
      subtitle: "Window penerimaan harian.",
      icon: Zap,
      content: `Target: ${latestDelivery?.jam_target || "07:00"} WIB`,
      detail: latestDelivery?.jam_tiba !== "--" ? `Tiba pukul ${latestDelivery.jam_tiba} WIB.` : "Armada sedang dalam perjalanan."
    },
    {
      title: "Mitra Vendor Pelaksana",
      subtitle: "Penyaji gizi utama.",
      icon: ShieldCheck,
      content: primaryRelation?.vendor.nama || "Memuat vendor...",
      detail: `PIC: ${primaryRelation?.vendor.kontak_pic} (${primaryRelation?.vendor.no_telp})`
    },
    {
      title: "Dapur SPPG Penanggung Jawab",
      subtitle: "Pusat verifikasi & pengolahan.",
      icon: MapPin,
      content: availableSPPG?.nama || "Dapur belum terhubung",
      detail: `${availableSPPG?.kota || ''} · Rating ${availableSPPG?.rating || 0} ★ · Kapasitas ${availableSPPG?.kapasitas_porsi || 0}/hari`
    },
  ];

  // Stats logic based on viewMode
  const stats = viewMode === "school" && loggedInSchool ? [
    { label: "Total Siswa", value: loggedInSchool.total_siswa, unit: "jiwa", icon: School },
    { label: "Penerima Makan", value: loggedInSchool.total_siswa, unit: "porsi", icon: Activity },
    { label: "Gudang Penyalur", value: 1, unit: "unit", icon: ShieldCheck },
    { label: "Mitra Terafiliasi", value: availableVendors.length, unit: "vendor", icon: ChevronRight }
  ] : [
    { label: "Sekolah Aktif", value: sekolahList.length, unit: "unit", icon: School },
    { label: "Penerima Makan", value: 2693, unit: "0/hari", icon: Activity },
    { label: "Gudang Penyalur", value: 4, unit: "0 titik", icon: ShieldCheck },
    { label: "Mitra Terafiliasi", value: 5, unit: "0 vendor", icon: ChevronRight }
  ];

  return (
    <>
      <div className="w-full min-h-screen bg-[#f8faff] text-slate-900 font-sans selection:bg-indigo-100 pb-0 pt-0 opacity-100 scale-100">
        {/* SVG Gradient Definitions for Lucide Icons */}
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient id="boga-icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>

        <main className="max-w-7xl mx-auto px-6 pt-6">
          {/* TOP ROW: HERO & BOGA CARD */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-3">
            {/* HERO CARD */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-8 bg-white rounded-[1.25rem] p-4 md:p-5 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-center min-h-[120px]"
            >
              <div className="relative z-10">
                <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tighter mb-1">
                  Ruang Kerja Admin: <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">{loggedInSchool?.nama || "Sekolah Mitra"}</span>
                </h1>
                <p className="text-slate-400 font-bold tracking-[0.3em] uppercase text-[9px] mb-4">
                  Portal Pengawasan & Pencatatan Audit B.O.G.A
                </p>
                <div className="flex gap-2">
                  <span className="bg-[#f0fdf4] text-[#16a34a] border border-emerald-50 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                    Portal Pengawas
                  </span>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50/30 blur-[80px] rounded-full -mr-16 -mt-16" />
            </motion.div>

            {/* ADMIN GRADIENT CARD */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-4 bg-gradient-to-br from-[#4f46e5] via-[#0ea5e9] to-[#22d3ee] rounded-[1.25rem] p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-xl shadow-blue-100 min-h-[120px]"
            >
              <div className="relative z-10 flex flex-col items-center">
                <div className="flex gap-0.5">
                  {"ADMIN".split("").map((letter, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.5 + (i * 0.1),
                        duration: 0.5,
                        repeat: Infinity,
                        repeatType: "reverse",
                        repeatDelay: 2
                      }}
                      className="text-3xl md:text-5xl font-black tracking-widest text-white drop-shadow-lg"
                    >
                      {letter}
                    </motion.span>
                  ))}
                </div>
              </div>
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
              </div>
            </motion.div>
          </div>

          {/* MIDDLE ROW: MAP & FEATURE STACK */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-3">
            {/* MAP CARD */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-9 bg-white rounded-[1.25rem] p-4 border border-slate-100 shadow-sm relative flex flex-col min-h-[440px]"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-2">
                <div>
                  <h2 className="text-indigo-600 font-black text-[8px] uppercase tracking-[0.3em] mb-0.5">
                    Peta Distribusi & Pantauan Sekolah
                  </h2>
                  <p className="text-slate-400 text-[9px] font-medium">
                    Klik sekolah untuk melihat info penjemputan data makan bergizi.
                  </p>
                </div>
                
                {/* viewMode Toggle Escape Hatch */}
                <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-100">
                  <button 
                    onClick={() => setViewMode("school")}
                    className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${
                      viewMode === "school" ? "bg-white text-indigo-600 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    Konteks Sekolah
                  </button>
                  <button 
                    onClick={() => setViewMode("aggregate")}
                    className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${
                      viewMode === "aggregate" ? "bg-white text-indigo-600 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    Agregat Sistem
                  </button>
                </div>
              </div>

              <div className="flex-1 rounded-[1.25rem] overflow-hidden border border-slate-50 relative bg-slate-50">
                <MapLibreMap
                  selectedSchool={selectedSchool}
                  onSchoolSelect={setSelectedSchool}
                  userSchoolId={loggedInSchool?.id}
                />
              </div>
            </motion.div>

            {/* SIDEBAR: FEATURE STACK OR SCHOOL DETAILS */}
            <div className="lg:col-span-3 flex flex-col h-full">
              <AnimatePresence mode="wait">
                {selectedSchool ? (
                  <SchoolDetailPanel
                    key="school-details"
                    school={selectedSchool}
                    vendors={getVendorsBySekolah(selectedSchool.id)}
                    onClose={() => setSelectedSchool(null)}
                    readOnly={selectedSchool.id !== 1} // asumsikan admin login sebagai sekolah ID 1
                  />
                ) : (
                  <motion.div
                    key="identity-panels"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex flex-col gap-1.5 h-full"
                  >
                    {identityPanels.map((p, i) => (
                      <motion.div
                        key={p.title}
                        onClick={() => setSelectedFeature(selectedFeature === i ? null : i)}
                        className={`group bg-white rounded-[1.25rem] p-3.5 border transition-all duration-300 cursor-pointer flex flex-col justify-center flex-1 ${selectedFeature === i
                            ? 'bg-gradient-to-br from-[#f59e0b] to-[#fbbf24] border-transparent text-white shadow-xl shadow-orange-100'
                            : 'border-slate-100 hover:border-slate-200 shadow-sm'
                          }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1">
                            <h3 className={`text-[13px] font-black tracking-tight leading-none mb-1 transition-colors ${selectedFeature === i ? 'text-white' : 'text-slate-900 group-hover:text-indigo-600'
                              }`}>
                              {p.title}
                            </h3>
                            <p className={`text-[10px] font-black transition-colors mb-0.5 ${selectedFeature === i ? 'text-orange-50' : 'text-slate-600'
                              }`}>
                              {p.content}
                            </p>
                            <p className={`text-[8px] font-bold transition-colors ${selectedFeature === i ? 'text-orange-100/80' : 'text-slate-400 group-hover:text-slate-500'
                              }`}>
                              {p.subtitle}
                            </p>
                          </div>
                          <div className={`p-2.5 rounded-xl transition-all ${selectedFeature === i
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-50 group-hover:bg-slate-100'
                            }`}>
                            <p.icon
                              className="w-4 h-4"
                              style={{ stroke: selectedFeature === i ? 'white' : 'url(#boga-icon-gradient)' }}
                            />
                          </div>
                        </div>

                        <AnimatePresence>
                          {selectedFeature === i && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 pt-3 border-t border-white/20 flex-1 overflow-y-auto"
                            >
                              <p className={`text-[10px] font-medium leading-relaxed ${selectedFeature === i ? 'text-white/90' : 'text-slate-500'
                                }`}>
                                {p.detail}
                              </p>
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

          {/* BOTTOM ROW: STATS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-4 md:pb-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + (i * 0.1) }}
                className="bg-white rounded-[1.25rem] p-4 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-all group"
              >
                <h3 className="text-[13px] font-black text-slate-900 tracking-tight mb-1.5 group-hover:text-indigo-600 transition-colors">
                  {stat.label}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-slate-800 tabular-nums">
                    <CountUp to={stat.value} />
                  </span>
                  <span className="text-[9px] font-bold text-slate-400">
                    {stat.unit}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </main>

        {/* VENDOR RANKING SECTION */}
        <section id="vendor" className="scroll-mt-20 border-t border-slate-100 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Monitoring Performa & Feedback</h2>
              <p className="text-slate-500 max-w-2xl mx-auto font-medium text-sm leading-relaxed">
                Pantau kualitas layanan dari seluruh ekosistem MBG secara real-time melalui audit digital dan feedback langsung dari sekolah.
              </p>
              
              {/* Master Toggle (Removed for solely SPPG Tracking) */}


            </motion.div>

            <button
              onClick={() => setShowRanking(!showRanking)}
              className="group flex flex-col items-center gap-3 mb-10 bg-white px-8 py-3 mt-10 rounded-full border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-indigo-600">
                {showRanking ? "Tutup Peringkat Unit" : "Buka Peringkat Audit Unit SPPG"} <ChevronRight className={`w-4 h-4 text-slate-300 transition-transform duration-300 ${showRanking ? "rotate-90 text-indigo-500" : ""}`} />
              </span>
            </button>

            <AnimatePresence>
              {showRanking && (
                <motion.div
                  initial={{ height: 0, opacity: 0, scale: 0.95 }}
                  animate={{ height: "auto", opacity: 1, scale: 1 }}
                  exit={{ height: 0, opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full overflow-hidden"
                >
                  <div className="pt-6 border-t border-slate-200">
                    <VendorRanking 
                      type="sppg"
                      selectedId={selectedEntityId}
                      onSelectVendor={setSelectedEntityId}
                      highlightedIds={availableSPPG ? [availableSPPG.id] : []}
                    />
                    
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      key={`sppg-${selectedEntityId}`}
                    >
                      <VendorPerformanceDashboard 
                        type="sppg"
                        entityId={selectedEntityId} 
                      />
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* SUPPORT / CONTACT US SECTION */}
        <section id="contact" className="relative px-6 pt-2 pb-12 bg-slate-100 flex justify-center">
          <div className="w-full max-w-[1400px]">
            <WebsiteSupportSection />
          </div>
        </section>
      </div>
    </>
  );
}

const BackgroundParticles = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <motion.div
        className="absolute"
        style={{ left: '-10%', top: '-20%', width: '600px', height: '600px' }}
        animate={{ rotate: 360, y: [0, 40, 0] }}
        transition={{
          rotate: { duration: 60, repeat: Infinity, ease: "linear" },
          y: { duration: 15, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full stroke-indigo-200/40 fill-none" style={{ strokeWidth: 0.8 }}>
          <polygon points="50,5 89,27.5 89,72.5 50,95 11,72.5 11,27.5" />
          <polygon points="50,15 80.3,32.5 80.3,67.5 50,85 19.7,67.5 19.7,32.5" className="stroke-indigo-200/20" style={{ strokeWidth: 0.4 }} />
        </svg>
      </motion.div>

      <motion.div
        className="absolute"
        style={{ right: '-5%', bottom: '-30%', width: '500px', height: '500px' }}
        animate={{ rotate: -360, y: [0, -30, 0] }}
        transition={{
          rotate: { duration: 50, repeat: Infinity, ease: "linear" },
          y: { duration: 12, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full stroke-cyan-200/40 fill-none" style={{ strokeWidth: 1 }}>
          <polygon points="50,5 95,50 50,95 5,50" />
          <polygon points="50,18 82,50 50,82 18,50" className="stroke-cyan-200/20" style={{ strokeWidth: 0.5 }} />
        </svg>
      </motion.div>
    </div>
  );
};

const WebsiteSupportSection = () => {
  return (
    <div className="module-reveal pt-4 space-y-8 z-10 relative">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Pusat Bantuan & Pengaduan
        </h2>
        <p className="text-xs text-slate-500 font-medium italic tracking-[0.05em]">Laporan kendala teknis sistem atau laporan keamanan aplikasi</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white/45 backdrop-blur-[40px] rounded-[32px] p-8 border border-white/60 border-t-white/80 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.25)]">
            <h3 className="text-lg font-black text-slate-900 mb-8 tracking-tight">Hubungi Tim Sistem Admin</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-5 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 hover:border-white/40 transition-all group cursor-pointer shadow-sm">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/10 group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Call Center</p>
                  <p className="text-base font-black text-slate-900">1-500-BOGA-WEB</p>
                </div>
              </div>

              <div className="flex items-center gap-5 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 hover:border-white/40 transition-all group cursor-pointer shadow-sm">
                <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center border border-sky-500/10 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6 text-sky-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Live Chat Admin</p>
                  <p className="text-base font-black text-slate-900">+62 811 2345 6789</p>
                </div>
              </div>

              <div className="flex items-center gap-5 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 hover:border-white/40 transition-all group cursor-pointer shadow-sm">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/10 group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Email Bantuan Teknis</p>
                  <p className="text-base font-black text-slate-900">support@boga.id</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-rose-500/10 backdrop-blur-[40px] border border-white/60 border-t-white/80 rounded-[32px] p-8 relative overflow-hidden group shadow-[0_40px_80px_-20px_rgba(0,0,0,0.25)]">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-transform">
              <AlertTriangle className="w-16 h-16 text-rose-600" />
            </div>
            <h4 className="text-[10px] font-black text-rose-600 mb-3 flex items-center gap-2 uppercase tracking-[0.2em]">
              <ShieldCheck className="w-4 h-4" /> Kendala Keamanan
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-bold">
              Segera hubungi tim cyber / admin server apabila ada percobaan manipulasi data atau celah keamanan.
            </p>
          </div>
        </div>

        <div className="bg-white/45 backdrop-blur-[40px] p-10 rounded-[32px] border border-white/60 border-t-white/80 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.25)]">
          <h3 className="text-lg font-black text-slate-900 mb-8 tracking-tight">Buat Tiket Laporan</h3>
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Judul Kendala Sistem</label>
              <input type="text" placeholder="Contoh: Error saat generate report SPPG" className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500/30 transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300 shadow-inner" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Kategori</label>
                <select className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500/30 transition-all text-sm font-bold text-slate-900 appearance-none cursor-pointer shadow-inner">
                  <option className="bg-white">Database / Data</option>
                  <option className="bg-white">Akses & Modul Biasa</option>
                  <option className="bg-white">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Prioritas</label>
                <select className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500/30 transition-all text-sm font-bold text-slate-900 appearance-none cursor-pointer shadow-inner">
                  <option className="bg-white">Biasa</option>
                  <option className="bg-white">Tinggi</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Detail Laporan</label>
              <textarea rows={4} placeholder="Jelaskan detail laporan Anda secara teknis..." className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500/30 transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300 shadow-inner"></textarea>
            </div>
            <button className="w-full py-5 rounded-2xl text-white font-black text-xs uppercase tracking-[0.2em] bg-emerald-500/80 hover:bg-emerald-500 transition-all shadow-xl shadow-black/40 flex items-center justify-center gap-3 mt-4 group">
              Kirim Tiket Laporan <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
