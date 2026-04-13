"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { 
  BarChart3, 
  MapPin, 
  ClipboardList, 
  MessageSquare, 
  ArrowRight, 
  Plus, 
  ChevronRight, 
  ShieldCheck, 
  Zap, 
  Calendar,
  Star,
  Building2,
  FileUp,
  Utensils,
  Check,
  CheckCircle2,
  Clock,
  Award,
  Truck,
  Info,
  Trash2,
  FileText,
  Download,
  MoreVertical,
  Search,
  Filter,
  ArrowUpRight,
  UtensilsCrossed,
  Users,
  UploadCloud,
  X,
  Copy,
  ShieldAlert,
  Fingerprint,
  Cpu,
  Globe
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import LogoLoop from "@/components/ui/LogoLoop";

// Components
import { AmbientBlobs } from "@/components/ui/AmbientBlobs";
import { VendorNavbar } from "@/components/ui/VendorNavbar";
import { MiniBarChart, WaveChart } from "@/components/ui/MiniCharts";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

// Data
import { 
  vendorList, 
  deliveryList, 
  vendorSekolahList, 
  sekolahList 
} from "@/lib/mbgdummydata";

// Dynamic Components
const LocationPickerMapLibre = dynamic(() => import("@/components/ui/LocationPickerMapLibre"), {
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-slate-100 animate-pulse rounded-3xl" />
});

const VendorServiceMapLibre = dynamic(() => import("@/components/ui/VendorServiceMapLibre"), {
  ssr: false,
  loading: () => <div className="w-full h-[200px] bg-slate-100 animate-pulse rounded-2xl" />
});

// ─── Constants ──────────────────────────────────────────────────────────────

const WIZARD_STEPS = [
  { id: 1, label: "Profil Instansi", icon: Building2 },
  { id: 2, label: "Unggah Dokumen", icon: FileUp },
  { id: 3, label: "Lokasi SPPG", icon: MapPin },
  { id: 4, label: "Kapasitas & Higienitas", icon: Utensils },
];

const PROGRESS_TIMELINE = [
  { id: "submitted", title: "Transaction Initialized", desc: "Digital identity & document hash recorded on-chain.", date: "12 Jan 2025", status: "completed", icon: Fingerprint },
  { id: "reviewing", title: "AI Validation", desc: "AI Gatekeeper is analyzing legal forensics & ELA consistency.", date: "Processing...", status: "active", icon: Cpu },
  { id: "site-visit", title: "Oracle Verification", desc: "Multi-party validation for physical facility & hygiene.", date: "TBA", status: "pending", icon: ShieldCheck },
  { id: "final-decision", title: "Smart Contract Active", desc: "Automated disbursement & monitoring protocol activated.", date: "TBA", status: "pending", icon: Award },
];

const ASSESSMENT_CRITERIA = [
  { title: "Kapasitas Distribusi", desc: "Kemampuan armada untuk menjangkau titik sekolah.", icon: Truck, color: "amber" },
  { title: "Higienitas Dapur", desc: "Kesesuaian standar kebersihan area produksi.", icon: Utensils, color: "orange" },
  { title: "Keamanan Pangan", desc: "Sertifikasi bahan baku (Halal/BPOM) dan pengemasan.", icon: ShieldCheck, color: "brown" },
];

// ─── Sub-Components ─────────────────────────────────────────────────────────

function Card({ 
  children, 
  className = "", 
  isActive = false, 
  variant = "light" 
}: { 
  children: React.ReactNode; 
  className?: string; 
  isActive?: boolean;
  variant?: "light" | "dark" | "ultra-dark";
}) {
  const styles = {
    light: "bg-white/60 border-amber-900/10 hover:bg-white/80 shadow-sm",
    dark: "bg-amber-900/5 border-amber-900/10 hover:bg-amber-900/10",
    "ultra-dark": "bg-amber-900/10 border-amber-900/5 shadow-inner"
  };

  return (
    <div className={`
      ${styles[variant]} backdrop-blur-xl rounded-[2rem] border shadow-2xl p-6 md:p-10 transition-all duration-500 relative overflow-hidden
      ${isActive ? 'ring-2 ring-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.25)] scale-[1.01]' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
}

// ─── Visual Decoration Components ──────────────────────────────────────────

function NodeNetwork() {
  return (
    <div className="absolute inset-0 opacity-[0.15] pointer-events-none">
      <svg width="100%" height="100%" className="w-full h-full">
        <pattern id="nodePattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.5" fill="currentColor" className="text-amber-500" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#nodePattern)" />
        <line x1="0" y1="0" x2="100%" y2="100%" stroke="currentColor" strokeWidth="0.5" className="text-amber-500/20" />
        <line x1="100%" y1="0" x2="0" y2="100%" stroke="currentColor" strokeWidth="0.5" className="text-amber-500/20" />
      </svg>
    </div>
  );
}

function LaserPulse() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div 
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50 shadow-[0_0_8px_rgba(249,115,22,0.8)]"
      />
      <div className="absolute inset-0 bg-orange-500/5 animate-pulse" />
    </div>
  );
}


// ─── AI & Web3 Sub-Components ──────────────────────────────────────────────

function TypewriterLog({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <p className="font-mono text-[10px] text-amber-500/80 tracking-tight leading-relaxed">
      <span className="opacity-50 mr-2 text-white/30">system@boga:~$</span> {displayedText}
      <span className="animate-pulse">|</span>
    </p>
  );
}

function SBTBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-md rounded-full border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
      <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
        <ShieldCheck className="w-2.5 h-2.5 text-white" />
      </div>
      <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Verified Supplier SBT</span>
    </div>
  );
}

function WalletDisplay({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/20 rounded-xl border border-white/5 group hover:border-white/10 transition-all cursor-pointer" onClick={handleCopy}>
      <code className="text-[10px] text-white/40 font-mono tracking-tight">{address.slice(0, 6)}...{address.slice(-4)}</code>
      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-white/20 group-hover:text-white/40" />}
    </div>
  );
}

// ─── Main Unified Component ──────────────────────────────────────────────────

export default function UnifiedVendorDashboard() {
  // State
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Wizard State
  const [currentWizardStep, setCurrentWizardStep] = useState(1);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const startAIScan = () => {
    setIsScanning(true);
    setScanComplete(false);
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
      setVerificationSuccess(true);
    }, 4500);
  };

  // Section Refs
  const sectionRefs = {
    Dashboard: useRef<HTMLElement>(null),
    Pengajuan: useRef<HTMLElement>(null),
    Progress: useRef<HTMLElement>(null),
    Laporan: useRef<HTMLElement>(null),
    Riwayat: useRef<HTMLElement>(null),
  };

  // Data
  const currentVendor = useMemo(() => vendorList.find(v => v.id === 1)!, []);
  const myDeliveries = useMemo(() => {
    const myVSIds = vendorSekolahList.filter(vs => vs.vendor_id === currentVendor.id).map(vs => vs.id);
    return deliveryList.filter(d => myVSIds.includes(d.vendor_sekolah_id));
  }, [currentVendor.id]);

  const dashboardStats = useMemo(() => [
    { label: "Titik Layanan Aktif", val: vendorSekolahList.filter(vs => vs.vendor_id === currentVendor.id).length, unit: "Lokasi", sub: "↑ 2 baru bulan ini", icon: MapPin, color: "amber" },
    { label: "Pengajuan Berjalan", val: "4", unit: "Proses", sub: "Target: 2 hari lagi", icon: ClipboardList, color: "orange" },
    { label: "On-Time Rate", val: currentVendor.on_time_rate, unit: "%", sub: "Performansi Sangat Baik", icon: Zap, color: "brown" },
  ], [currentVendor]);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile || !mounted) return;
    const observerOptions = { root: null, rootMargin: "-150px 0px -70% 0px", threshold: 0 };
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = Object.keys(sectionRefs).find(k => sectionRefs[k as keyof typeof sectionRefs].current === entry.target);
          if (id) setActiveTab(id);
        }
      });
    };
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    Object.values(sectionRefs).forEach(ref => { if (ref.current) observer.observe(ref.current); });
    return () => observer.disconnect();
  }, [isMobile, mounted]);

  const handleNavigate = (target: string) => {
    setActiveTab(target);
    if (!isMobile) {
      const ref = sectionRefs[target as keyof typeof sectionRefs];
      if (ref?.current) window.scrollTo({ top: ref.current.offsetTop - 100, behavior: "smooth" });
    }
  };

  if (!mounted) return null;

  return (
    <div className="vendor-page min-h-screen w-full relative font-sans overflow-x-hidden bg-[#7f4f24]">
      {/* Subtle Noise Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      
      <AmbientBlobs />
      <VendorNavbar onNavigate={handleNavigate} activeTab={activeTab} variant="dark" />

      {/* ── HEADER ── */}
      <header ref={sectionRefs.Dashboard} className="relative z-10 px-[clamp(1rem,4vw,3rem)] pt-20 md:pt-28 pb-8 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[0.85] mb-6 md:mb-8">
            Vendor<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500">Excellence.</span>
          </h1>
          <p className="text-sm md:text-lg text-white/70 max-w-xl mx-auto leading-relaxed font-medium px-4 md:px-0">
            Selamat datang kembali, <span className="text-white">{currentVendor.nama}</span>. Kelola operasional dan tingkatkan kualitas gizi nasional.
          </p>
        </motion.div>
      </header>

      {/* ── DYNAMIC BODY: LAYER 1 (CREAM) ── */}
      <main className="relative z-20 rounded-[40px] md:rounded-[60px] bg-[#f5ebe0] shadow-[0_-20px_50px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16">
          
          {/* ──────────────── SECTION: DASHBOARD ──────────────── */}
          <section style={{ display: isMobile && activeTab !== "Dashboard" ? "none" : "block" }} className="space-y-12">
            <div className="w-full">
               {isLoading ? (
                 <div className="flex gap-10 overflow-hidden pb-10">
                   {[1, 2, 3].map((i) => (
                     <div key={i} className="min-w-[320px] h-[180px] bg-amber-900/5 rounded-[2rem] animate-pulse border border-amber-900/10" />
                   ))}
                 </div>
               ) : (
                 <LogoLoop 
                   speed={60}
                   gap={40}
                   fadeOut={true}
                   fadeOutColor="#f5ebe0"
                   logos={dashboardStats.map((stat, i) => ({
                     node: (
                       <Card variant="light" className="group border-amber-900/5 w-[320px] h-[180px] flex flex-col justify-between hover:border-amber-900/20 hover:shadow-[0_20px_40px_rgba(120,53,15,0.05)] bg-white/80">
                         {i === 0 && <NodeNetwork />}
                         {i === 1 && <LaserPulse />}
                         
                         <div className="relative z-10 flex justify-between items-start mb-6">
                           <div className={`p-4 rounded-2xl shadow-lg bg-amber-500/10 text-amber-600 border border-amber-500/20`}>
                             <stat.icon className="w-6 h-6" />
                           </div>
                           <div className="text-right">
                             <p className="text-[10px] font-black text-amber-900/40 uppercase tracking-widest">{stat.label}</p>
                             <div className="flex items-baseline justify-end gap-1">
                               <span className="text-4xl font-black text-slate-900 tracking-tighter">{stat.val}</span>
                               <span className="text-[10px] font-bold text-slate-400 uppercase">{stat.unit}</span>
                             </div>
                           </div>
                         </div>
                         <div className="relative z-10 pt-5 border-t border-amber-900/5 flex items-center justify-between">
                           <p className="text-[10px] font-bold uppercase flex items-center gap-1 text-amber-700"><Zap className="w-3 h-3" /> {stat.sub}</p>
                           <ArrowRight className="w-4 h-4 text-amber-900/20 group-hover:text-amber-900/60 group-hover:translate-x-1 transition-transform" />
                         </div>
                       </Card>
                     )
                   }))} 
                 />
               )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
               <div className="lg:col-span-7">
                  <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative h-full overflow-hidden rounded-[2.5rem] bg-[#78350f] p-10 md:p-12 text-white shadow-2xl group flex flex-col justify-center">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-amber-500/20 rounded-full blur-[100px] group-hover:bg-amber-500/30 transition-all" />
                    <div className="relative z-10 space-y-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                        <Cpu className="w-3 h-3 text-amber-300" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">⭐ SMART BIDDING AKTIF</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">Lelang Pengadaan Cerdas Berbasis Smart Contract.</h2>
                      <p className="text-amber-100/70 max-w-lg text-sm leading-relaxed font-medium">Ajukan penawaran harga bahan pangan Anda. Sistem AI kami menjamin kompetisi yang adil dan transparan, mengunci kesepakatan langsung ke dalam jaringan blockchain.</p>
                      <Link 
                        href="/vendor/tender" 
                        className="w-fit flex items-center gap-2 bg-[#99582a] text-white px-6 py-3.5 rounded-2xl font-bold text-sm hover:bg-[#7f4f24] transition-all shadow-xl"
                      >
                        Akses Papan Tender <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.div>
               </div>
               <div className="lg:col-span-5">
                    <Card variant="light" className="text-center h-full p-10 md:p-12 border-amber-900/5 flex flex-col items-center justify-center">
                      <div className="relative w-24 h-24 mb-6">
                        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 to-amber-200 rounded-[2rem] rotate-12 blur-md group-hover:rotate-45 transition-transform duration-700 opacity-50" />
                        <div className="relative w-full h-full bg-white/40 backdrop-blur-3xl rounded-[1.8rem] flex items-center justify-center shadow-2xl border border-white/60">
                          <Fingerprint className="w-10 h-10 text-amber-600 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                        </div>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">{currentVendor.nama}</h3>
                      <div className="flex flex-col items-center gap-3 mt-4">
                         <SBTBadge />
                         <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-900/5 rounded-xl border border-amber-900/10 group hover:border-amber-900/20 transition-all cursor-pointer" onClick={() => {
                            navigator.clipboard.writeText("0x8A9F2c884c7E1a3D4B5E6F7G8H9I0J1K2L3M4N5O");
                          }}>
                           <code className="text-[10px] text-amber-900/40 font-mono tracking-tight">0x8A9F...4N5O</code>
                           <Copy className="w-3 h-3 text-amber-900/20 group-hover:text-amber-900/40" />
                         </div>
                      </div>
                      <button onClick={() => handleNavigate("Pengajuan")} className="mt-10 w-full relative group overflow-hidden bg-amber-600 p-4.5 rounded-2xl text-white shadow-[0_10px_30px_rgba(180,83,9,0.2)] hover:shadow-[0_15px_40px_rgba(180,83,9,0.3)] transition-all flex items-center justify-between">
                        <div className="relative z-10 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center animate-pulse"><Plus className="w-5 h-5 text-white" /></div>
                          <p className="text-xs font-black uppercase tracking-widest">Daftar Slot Tender</p>
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </button>
                    </Card>
                 </div>
            </div>
          </section>
        </div>
      </main>

      {/* ── DYNAMIC BODY: LAYER 2 (ORIGINAL BROWN BELT) ── */}
      <div className="relative z-10 py-16 md:py-28 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          
          {/* ──────────────── SECTION: PENGAJUAN ──────────────── */}
          <section ref={sectionRefs.Pengajuan} style={{ display: isMobile && activeTab !== "Pengajuan" ? "none" : "block" }} className="space-y-10 md:space-y-14">
            <div className="flex items-center gap-4 mb-2 md:mb-6 pl-1">
               <div className="w-1.5 h-10 bg-amber-500 rounded-full" />
               <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Pendaftaran Titik Layanan Baru</h2>
            </div>
            
            <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-[0_40px_100px_rgba(45,22,6,0.1)] border border-[#2d1606]/5 mt-8">
               {/* ── CARD HEADER: STEP INDICATOR ── */}
               <div className="bg-[#fcf8f4]/80 backdrop-blur-md border-b border-[#2d1606]/5 px-8 md:px-14 py-6 md:py-8 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
                  {WIZARD_STEPS.map(step => {
                    const isActive = currentWizardStep === step.id;
                    const isCompleted = currentWizardStep > step.id;
                    return (
                      <div key={step.id} className="flex items-center gap-3 shrink-0">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] md:text-xs transition-all duration-500 ${isCompleted ? "bg-[#2d1606] text-white" : isActive ? "bg-[#543b2b] text-white shadow-lg" : "bg-[#2d1606]/10 text-[#2d1606]/30"}`}>
                            {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                         </div>
                         <p className={`text-[10px] md:text-xs font-bold whitespace-nowrap tracking-tight transition-colors ${isActive ? "text-[#2d1606]" : "text-[#2d1606]/40"}`}>
                           {step.label}
                         </p>
                         {step.id < 4 && <div className="hidden md:block w-8 h-px bg-[#2d1606]/10 mx-2" />}
                      </div>
                    );
                  })}
               </div>

               {/* ── CARD BODY: SPLIT VIEW ── */}
               <div className="flex flex-col lg:flex-row min-h-[600px] md:min-h-[700px]">
                  {/* Left: Form Area */}
                  <div className="flex-1 p-8 md:p-14 md:pr-14 lg:border-r border-[#2d1606]/5 flex flex-col">
                    <AnimatePresence mode="wait">
                         <motion.div key={currentWizardStep} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="space-y-10">
                            {currentWizardStep === 1 && (
                             <div className="space-y-10">
                                <div className="space-y-2">
                                   <h3 className="text-2xl md:text-3xl font-black text-[#2d1606] tracking-tight">Profil Instansi</h3>
                                   <p className="text-sm md:text-base text-[#2d1606]/50 font-medium leading-relaxed">Masukkan data legalitas instansi Anda untuk proses verifikasi awal.</p>
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                                    <label className="block space-y-2.5"><span className="text-[10px] font-black text-[#543b2b]/40 uppercase tracking-widest pl-1">Nama Instansi</span><input type="text" placeholder="Contoh: CV. Berkah Pangan" className="w-full px-5 py-4 rounded-2xl bg-[#fcf8f4]/50 border border-[#2d1606]/10 outline-none focus:border-[#543b2b] focus:ring-4 focus:ring-[#543b2b]/5 transition-all text-sm font-bold text-[#2d1606] placeholder:text-[#2d1606]/20 shadow-sm" /></label>
                                    <label className="block space-y-2.5"><span className="text-[10px] font-black text-[#543b2b]/40 uppercase tracking-widest pl-1">Tipe Layanan</span><div className="relative"><select className="w-full px-5 py-4 rounded-2xl bg-[#fcf8f4]/50 border border-[#2d1606]/10 outline-none focus:border-[#543b2b] transition-all text-sm font-bold appearance-none cursor-pointer text-[#2d1606] shadow-sm"><option>Catering / Dapur Pusat</option><option>Supplier Distribusi</option></select><ArrowRight className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2d1606]/30 rotate-90" /></div></label>
                                    <label className="block space-y-2.5"><span className="text-[10px] font-black text-[#543b2b]/40 uppercase tracking-widest pl-1">Email Legal</span><input type="email" placeholder="admin@vendor.com" className="w-full px-5 py-4 rounded-2xl bg-[#fcf8f4]/50 border border-[#2d1606]/10 outline-none focus:border-[#543b2b] transition-all text-sm font-bold text-[#2d1606] placeholder:text-[#2d1606]/20 shadow-sm" /></label>
                                    <label className="block space-y-2.5"><span className="text-[10px] font-black text-[#543b2b]/40 uppercase tracking-widest pl-1">Nomor Kontak</span><input type="tel" placeholder="+62 8..." className="w-full px-5 py-4 rounded-2xl bg-[#fcf8f4]/50 border border-[#2d1606]/10 outline-none focus:border-[#543b2b] transition-all text-sm font-bold text-[#2d1606] placeholder:text-[#2d1606]/20 shadow-sm" /></label>
                                 </div>
                              </div>
                            )}
                            {currentWizardStep === 2 && (
                               <div className="space-y-10 py-4">
                                  {!isScanning && !scanComplete ? (
                                     <div onClick={startAIScan} className="p-16 border-2 border-dashed border-[#2d1606]/10 rounded-[3rem] bg-[#fcf8f4] hover:border-[#543b2b]/50 hover:bg-white transition-all cursor-pointer group text-center shadow-inner">
                                        <div className="w-20 h-20 bg-[#543b2b] text-white rounded-3xl shadow-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"><UploadCloud className="w-10 h-10" /></div>
                                        <p className="text-lg font-black text-[#2d1606]">Unggah Dokumen Legalitas</p>
                                        <p className="text-xs text-[#2d1606]/40 mt-2 font-bold uppercase tracking-widest">AI Validation OCR Enabled</p>
                                     </div>
                                  ) : isScanning ? (
                                     <div className="relative p-16 rounded-[3rem] bg-[#fcf8f4] border border-[#2d1606]/10 overflow-hidden flex flex-col items-center justify-center min-h-[350px] shadow-inner">
                                        <motion.div initial={{ top: "0%" }} animate={{ top: "100%" }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="absolute left-0 right-0 h-1 bg-[#543b2b] shadow-[0_0_15px_rgba(84,59,43,0.8)] z-10" />
                                        <div className="w-24 h-24 bg-[#543b2b]/10 rounded-full flex items-center justify-center mb-8 animate-pulse text-[#543b2b]"><Cpu className="w-10 h-10" /></div>
                                        <div className="w-full max-w-md bg-white p-6 rounded-2xl border border-[#2d1606]/5 shadow-sm text-center">
                                           <TypewriterLog text="AI Forensics: Analysing OCR extraction... Cross-check with Government Node #821 active." />
                                        </div>
                                     </div>
                                 ) : (
                                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-16 rounded-[3rem] bg-emerald-500/5 border border-emerald-500/20 text-center space-y-6">
                                       <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl">
                                          <Check className="w-10 h-10" />
                                       </div>
                                       <div className="space-y-2">
                                          <h4 className="text-3xl font-black text-emerald-600">Verification Successful</h4>
                                          <p className="text-sm text-emerald-600/60 font-bold uppercase tracking-widest">Account Status: ACTIVE</p>
                                       </div>
                                    </motion.div>
                                 )}
                              </div>
                            )}
                            {currentWizardStep === 3 && (
                               <div className="space-y-6">
                                  <h3 className="text-2xl font-black text-[#2d1606] tracking-tight leading-none">Lokasi Titik SPPG</h3>
                                  <div className="rounded-[2.5rem] overflow-hidden border border-[#2d1606]/10 shadow-2xl h-[450px]"><LocationPickerMapLibre /></div>
                               </div>
                            )}
                         </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="pt-12 mt-auto flex justify-between items-center">
                       <button onClick={() => setCurrentWizardStep(p => Math.max(1, p-1))} className={`px-8 py-3 rounded-full text-[#2d1606]/40 font-black uppercase tracking-widest hover:text-[#2d1606] transition-colors flex items-center gap-2 ${currentWizardStep === 1 ? 'opacity-0 pointer-events-none' : ''}`}>← Kembali</button>
                       <button onClick={() => setCurrentWizardStep(p => Math.min(4, p+1))} className="px-12 py-4 bg-[#543b2b] text-white rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#543b2b]/30 active:scale-95 transition-all hover:bg-[#2d1606]">{currentWizardStep === 4 ? "Kirim Pengajuan" : "Lanjutkan →"}</button>
                    </div>
                  </div>

                  {/* Right: Guide Area */}
                  <div className="lg:w-[350px] xl:w-[400px] bg-[#281a14] p-8 md:p-14 text-white relative flex flex-col justify-center">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#543b2b]/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    
                    <div className="relative z-10 space-y-12">
                       <h4 className="text-3xl font-black text-white tracking-tight leading-tight">Panduan<br />Pengisian</h4>
                       <div className="space-y-10">
                          <div className="flex gap-4">
                             <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-amber-500 shadow-xl"><ShieldCheck className="w-5 h-5" /></div>
                             <div className="space-y-1">
                                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Automated KYC</p>
                                <p className="text-xs text-white/50 leading-relaxed font-medium">Identitas digital SBT diterbitkan otomatis setelah verifikasi AI.</p>
                             </div>
                          </div>
                          <div className="flex gap-4">
                             <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-amber-500 shadow-xl"><Globe className="w-5 h-5" /></div>
                             <div className="space-y-1">
                                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Smart Oracle</p>
                                <p className="text-xs text-white/50 leading-relaxed font-medium">Validasi rute logistik tersinkronisasi otomatis pada ledger.</p>
                             </div>
                          </div>
                          <div className="flex gap-4">
                             <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-amber-500 shadow-xl"><Zap className="w-5 h-5" /></div>
                             <div className="space-y-1">
                                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Trustless Bidding</p>
                                <p className="text-xs text-white/50 leading-relaxed font-medium">Harga diatur otomatis berdasarkan batas HET AI.</p>
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          </section>
        </div>
      </div>

      {/* ── DYNAMIC BODY: LAYER 3 (CREAM) ── */}
      <div className="relative z-20 rounded-t-[40px] md:rounded-t-[60px] bg-[#f5ebe0] shadow-[0_-20px_50px_rgba(0,0,0,0.05)] pb-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16 space-y-16 md:space-y-28">
          
          {/* ──────────────── SECTION: PROGRESS ──────────────── */}
          <section ref={sectionRefs.Progress} style={{ display: isMobile && activeTab !== "Progress" ? "none" : "block" }} className="space-y-12">
            <div className="flex items-center gap-4 mb-4">
               <div className="w-1.5 h-10 bg-amber-600 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
               <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">Pelacakan Transparan</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
               <div className="lg:col-span-7">
                  <div className="relative pl-2 md:pl-14">
                     <div className="absolute left-[23.5px] md:left-[27px] top-8 bottom-8 w-px bg-amber-900/10" />
                     <div className="space-y-8 md:space-y-12">
                        {PROGRESS_TIMELINE.map((step, i) => {
                          const isCompleted = step.status === 'completed';
                          const isActive = step.status === 'active';
                          return (
                             <motion.div key={step.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className={`relative flex items-start gap-4 md:gap-10 ${!isCompleted && !isActive ? 'opacity-40' : ''}`}>
                               <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl shrink-0 z-10 border-4 border-white shadow-xl flex items-center justify-center transition-all duration-500 ${isCompleted ? 'bg-emerald-500 text-white' : isActive ? 'bg-amber-600 text-white shadow-[0_0_20px_rgba(120,53,15,0.4)] animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                                   <step.icon className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                               <div className={`p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border transition-all flex-1 shadow-sm ${isActive ? 'bg-white border-amber-500/50 shadow-xl scale-[1.02]' : 'bg-slate-50/50 border-slate-200/60 hover:bg-white hover:shadow-md'}`}>
                                   <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">
                                      <h4 className={`text-lg md:text-xl font-black tracking-tight ${isActive ? 'text-amber-600' : 'text-slate-900'}`}>{step.title}</h4>
                                      <span className={`text-[9px] font-black px-3 py-1 md:px-4 md:py-1.5 rounded-full uppercase tracking-widest ${isCompleted ? 'bg-emerald-500/10 text-emerald-600' : isActive ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-100 text-slate-400'}`}>{step.date}</span>
                                   </div>
                                   <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">{step.desc}</p>
                                   {isActive && (
                                     <div className="mt-6 w-full h-1.5 md:h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200"><motion.div initial={{ width: 0 }} animate={{ width: "65%" }} transition={{ duration: 1.5 }} className="h-full bg-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.5)]" /></div>
                                   )}
                                </div>
                             </motion.div>
                          );
                        })}
                     </div>
                  </div>
               </div>
               <div className="lg:col-span-5">
                  <div className="bg-[#0f172a] border border-white/5 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-12 text-white relative overflow-hidden shadow-2xl h-full flex flex-col justify-center gap-8 md:gap-12">
                     <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl opacity-50" />
                     <h3 className="text-2xl font-black tracking-tight relative z-10 text-white">Kriteria Penilaian BGN</h3>
                     <div className="space-y-10 relative z-10">
                        {ASSESSMENT_CRITERIA.map(c => (
                           <div key={c.title} className="flex gap-6 group"><div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 bg-white/5 group-hover:bg-amber-500/10 transition-all"><c.icon className={`w-7 h-7 ${c.color === 'amber' ? 'text-amber-400' : c.color === 'orange' ? 'text-orange-400' : 'text-amber-600'}`} /></div><div className="space-y-1"><p className="text-base font-black tracking-tight uppercase group-hover:text-amber-400 transition-colors">{c.title}</p><p className="text-xs text-white/50 leading-relaxed font-medium">{c.desc}</p></div></div>
                        ))}
                     </div>
                     <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 flex items-center gap-4"><Info className="w-6 h-6 text-amber-500 shrink-0" /><p className="text-xs text-white/50 leading-relaxed font-medium">Siapkan area dapur higienis dan dokumentasi sanitasi untuk tahap Site Visit berikutnya.</p></div>
                  </div>
               </div>
            </div>
          </section>

          {/* ──────────────── SECTION: LAPORAN ──────────────── */}
          <section ref={sectionRefs.Laporan} style={{ display: isMobile && activeTab !== "Laporan" ? "none" : "block" }} className="space-y-10 md:space-y-12">
            <div className="flex items-center gap-4 mb-2 md:mb-4">
               <div className="w-1.5 h-8 md:h-10 bg-amber-600 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
               <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter">Pelaporan Operasional</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 flex flex-col gap-8">
                <Card variant="light" className="flex-1 p-10 md:p-12 space-y-10 border-amber-900/5">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Formulir Laporan Gizi</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <label className="block space-y-2"><span className="text-[10px] font-black text-amber-900/30 uppercase tracking-widest pl-1">Tanggal Distribusi</span><div className="relative group"><Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-900/40 group-focus-within:text-amber-600 transition-colors" /><input type="date" className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white/50 border border-amber-900/10 outline-none focus:ring-4 focus:ring-amber-500/10 transition-all text-sm font-medium text-slate-900" /></div></label>
                       <label className="block space-y-2"><span className="text-[10px] font-black text-amber-900/30 uppercase tracking-widest pl-1">Menu Utama</span><div className="relative group"><UtensilsCrossed className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-900/40 group-focus-within:text-amber-600 transition-colors" /><input type="text" placeholder="Contoh: Nasi, Ayam Bakar" className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white/50 border border-amber-900/10 outline-none focus:ring-4 focus:ring-amber-500/10 transition-all text-sm font-medium text-slate-900 placeholder:text-slate-300" /></div></label>
                    </div>
                    <div className="flex justify-end"><button className="px-12 py-4.5 bg-amber-600 text-white rounded-2xl font-bold text-sm shadow-xl hover:bg-amber-700 transition-all">Submit Laporan</button></div>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <Card variant="light" className="p-10 border-amber-900/5"><div className="flex justify-between items-start mb-6"><div><p className="text-[10px] font-black text-amber-900/40 uppercase tracking-widest mb-1">Efikasi Distribusi</p><h3 className="text-3xl font-black text-slate-900 tracking-tighter">98.2%</h3></div><div className="bg-emerald-500/10 text-emerald-600 p-2.5 rounded-xl border border-emerald-500/20"><ArrowUpRight className="w-5 h-5" /></div></div><div className="h-24 w-full"><WaveChart /></div></Card>
                   <Card variant="light" className="p-10 border-amber-900/5"><div className="flex justify-between items-start mb-6"><div><p className="text-[10px] font-black text-amber-900/40 uppercase tracking-widest mb-1">Volume Mingguan</p><h3 className="text-3xl font-black text-slate-900 tracking-tighter">2.4k</h3></div><div className="bg-amber-500/10 text-amber-600 p-2.5 rounded-xl border border-amber-500/20"><BarChart3 className="w-5 h-5" /></div></div><div className="h-24 w-full"><MiniBarChart /></div></Card>
                </div>
              </div>
              <div className="lg:col-span-4 flex flex-col gap-6">
                 <div className="bg-amber-100/50 rounded-[2rem] p-10 border border-amber-900/10 flex-1 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl opacity-50" />
                    <h4 className="text-xl font-black tracking-tight mb-6 relative z-10 text-amber-700">Batas Pelaporan</h4>
                    <p className="text-sm text-slate-600 leading-relaxed font-bold mb-10 relative z-10">Setiap laporan wajib disubmit sebelum <span className="text-amber-700 underline decoration-amber-500/50 underline-offset-4">pukul 19.00 WIB</span>.</p>
                    <div className="flex items-center gap-4 bg-amber-500/10 p-5 rounded-[1.5rem] relative z-10 border border-amber-500/20"><Clock className="w-6 h-6 text-amber-600 animate-pulse" /><p className="text-xs font-black text-amber-600 uppercase tracking-widest">Deadline: 4h 12m</p></div>
                 </div>
              </div>
            </div>
          </section>

          {/* ──────────────── SECTION: RIWAYAT ──────────────── */}
          <section ref={sectionRefs.Riwayat} style={{ display: isMobile && activeTab !== "Riwayat" ? "none" : "block" }} className="space-y-10 md:space-y-12 pb-10">
            <div className="flex items-center gap-4 mb-2 md:mb-4">
               <div className="w-1.5 h-8 md:h-10 bg-amber-600 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
               <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter">Arsip Digital & Kontrak</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <div className="lg:col-span-8 space-y-4">
                  <div className="flex justify-between items-center mb-6 px-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Log Aktivitas Terakhir</h3>
                    <div className="flex gap-2"><button className="px-4 py-2 bg-amber-900/5 border border-amber-900/10 rounded-xl text-[10px] font-black uppercase text-amber-900/70 hover:bg-amber-900/10 transition-colors">Filter</button><button className="px-4 py-2 bg-amber-900/5 border border-amber-900/10 rounded-xl text-[10px] font-black uppercase text-amber-900/70 hover:bg-amber-900/10 transition-colors">Download CSV</button></div>
                  </div>
                  {myDeliveries.slice(0, 5).map((log, i) => (
                    <motion.div key={log.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="group bg-white/40 border border-amber-900/5 rounded-[2rem] p-8 flex items-center justify-between hover:bg-white/80 hover:shadow-2xl transition-all cursor-pointer">
                       <div className="flex items-center gap-8">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${log.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}><CheckCircle2 className="w-7 h-7" /></div>
                          <div><p className="text-[10px] font-black text-amber-700 uppercase mb-1.5">ID: {log.id.toString().padStart(5,'0')}</p><h4 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">Pengiriman Unit #{log.vendor_sekolah_id}</h4><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{log.tanggal}</p></div>
                       </div>
                       <ChevronRight className="w-5 h-5 text-amber-900/10 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                    </motion.div>
                  ))}
               </div>
               <div className="lg:col-span-4 flex flex-col gap-6">
                  <Card variant="light" className="flex-1 p-10 md:p-12 relative overflow-hidden border-amber-900/5 bg-amber-100/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl opacity-50" />
                    <div className="relative z-10 flex flex-col h-full">
                       <div className="flex items-center gap-4 mb-10"><div className="w-14 h-14 rounded-2xl bg-amber-600 flex items-center justify-center text-white"><FileText className="w-7 h-7" /></div><h3 className="text-2xl font-black tracking-tight text-slate-900">Pusat Dokumen</h3></div>
                       <div className="space-y-4 mb-10">
                          {[{ name: "Kontrak Kerjasama 2025", type: "PDF", size: "2.4MB" }, { name: "SOP Higienitas BGN", type: "PDF", size: "1.2MB" }].map(doc => (
                             <div key={doc.name} className="flex items-center justify-between p-5 bg-white/50 border border-amber-900/10 rounded-2xl group hover:border-amber-600 transition-all shadow-sm"><div className="min-w-0"><p className="text-xs font-bold text-slate-900 truncate uppercase">{doc.name}</p><p className="text-[9px] text-slate-400 font-black mt-0.5">{doc.type} · {doc.size}</p></div><Download className="w-4 h-4 text-amber-900/20 group-hover:text-amber-600" /></div>
                          ))}
                       </div>
                       <div className="pt-6 border-t border-amber-900/5 space-y-4 flex-1 flex flex-col">
                          <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Cakup Layanan Live</p>
                          <div className="flex-1 min-h-[176px] rounded-[1.5rem] overflow-hidden border border-amber-900/10 shadow-inner bg-white/50"><VendorServiceMapLibre type="minimap" onExpand={() => setIsMapModalOpen(true)} /></div>
                       </div>
                    </div>
                  </Card>
               </div>
            </div>
          </section>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="relative z-20 py-16 bg-black text-center">
        <div className="max-w-7xl mx-auto px-4">
           <div className="opacity-30 text-[9px] md:text-[10px] font-black text-white uppercase tracking-[0.5em] leading-loose">
             &copy; 2025 B.O.G.A VENDOR PORTAL <span className="mx-2 md:mx-4 text-amber-500 opacity-50">/</span> TRANSPARENCY PROTOCOL
           </div>
           <div className="mt-8 flex justify-center items-center gap-6 opacity-20">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-white" />
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-white" />
           </div>
        </div>
      </footer>

      {/* ── MODALS ── */}
      <Dialog open={isMapModalOpen} onOpenChange={setIsMapModalOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-7xl h-[85vh] p-0 overflow-hidden border-none rounded-3xl bg-slate-900 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
          <DialogHeader className="p-8 bg-slate-900 border-b border-white/5 absolute top-0 left-0 right-0 z-[1002]"><DialogTitle className="text-2xl font-black text-white tracking-tight">Rute Distribusi Operasional</DialogTitle></DialogHeader>
          <div className="w-full h-full pt-24"><VendorServiceMapLibre type="fullmap" /></div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        ::-webkit-scrollbar { width: 0px; background: transparent; }
        .vendor-page { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
