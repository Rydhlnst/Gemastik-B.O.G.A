"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { Truck, Zap, Package, ArrowRight, ShieldCheck, Map as MapIcon, BarChart3, Clock, HelpCircle, Camera, X, Maximize } from "lucide-react";
import { type Sekolah } from "@/lib/mbgdummydata";
import { GlassCard } from "@/components/ui/GlassCard";
import { AmbientBlobs } from "@/components/ui/AmbientBlobs";
import { LogistikNavbar } from "@/components/ui/LogistikNavbar";
import { AnalyticsModule } from "@/components/ui/AnalyticsModule";
import { HistorySection } from "@/components/ui/HistorySection";
import { SupportSection } from "@/components/ui/SupportSection";
import GlassIcons from "@/components/ui/GlassIcons";
import { WaveChart, ProgressRing, MiniBarChart, GaugeChart } from "@/components/ui/MiniCharts";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { deliveryList, vendorSekolahList, vendorList, sekolahList } from "@/lib/mbgdummydata";

const MapLibreLogistik = dynamic(() => import("@/components/ui/MapLibreLogistik"), {
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-white animate-pulse rounded-3xl" />
});

// ─── Data ────────────────────────────────────────────────────────────────────

const STATS = [
  {
    label: "Truk Beroperasi",
    val: "142",
    unit: "Unit",
    sub: "↑ Aktif di Jalan",
    Icon: Truck,
    color: "green",
  },
  {
    label: "Rasio Ketepatan Waktu",
    val: "99.2",
    unit: "%",
    sub: "✓ Sesuai SLA",
    Icon: Zap,
    color: "blue",
  },
  {
    label: "Paket Terdistribusi",
    val: "2,400",
    unit: "",
    sub: "Hari ini",
    Icon: Package,
    color: "purple",
  },
];

// Static mapping removed, now dynamic via mbgdummydata

const iconBg: Record<string, string> = {
  green: "bg-emerald-400/15 border border-emerald-400/30 shadow-[0_0_15px_rgba(0,229,122,0.1)]",
  blue: "bg-sky-400/15 border border-sky-400/30 shadow-[0_0_15px_rgba(0,200,255,0.1)]",
  purple: "bg-violet-400/15 border border-violet-400/30 shadow-[0_0_15px_rgba(112,64,224,0.1)]",
  amber: "bg-amber-400/15 border border-amber-400/30 shadow-[0_0_15px_rgba(251,191,36,0.1)]",
};

const iconColor: Record<string, string> = {
  green: "text-emerald-400",
  blue: "text-sky-400",
  purple: "text-violet-400",
  amber: "text-amber-400",
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function UnifiedLogistikDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isMobile, setIsMobile] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<Sekolah | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Section Refs for Desktop Scrolling
  const sectionRefs = {
    Dashboard: useRef<HTMLElement>(null),
    Armada: useRef<HTMLElement>(null),
    Rute: useRef<HTMLElement>(null),
    Laporan: useRef<HTMLElement>(null),
    Bantuan: useRef<HTMLElement>(null),
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        setCameraError(null);
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setCameraError("Akses kamera ditolak.");
      }
    };
    if (isScannerOpen) startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [isScannerOpen]);

  useEffect(() => {
    if (isMobile) return;

    const observerOptions = {
      root: null,
      rootMargin: "-150px 0px -70% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = Object.keys(sectionRefs).find(
            (key) => sectionRefs[key as keyof typeof sectionRefs].current === entry.target
          );
          if (id) setActiveTab(id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    Object.values(sectionRefs).forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, [isMobile]);

  const dynamicFleetPreview = useMemo(() => {
    // Show all relevant deliveries
    return deliveryList.map(delivery => {
      const vs = vendorSekolahList.find(vs => vs.id === delivery.vendor_sekolah_id);
      const vendor = vendorList.find(v => v.id === vs?.vendor_id);
      const sekolah = sekolahList.find(s => s.id === vs?.sekolah_id);
      
      const jenjang = sekolah?.jenjang;
      const themeColor = jenjang === 'SD' ? 'red' : 
                         jenjang === 'SMP' ? 'blue' : 
                         jenjang === 'SMA' ? 'gray' : 'blue';
      
      const statusLabel = delivery.status === 'delivered' ? 'Tepat' : 
                          delivery.status === 'on_transit' ? 'Di Jalan' : 
                          delivery.status === 'pending' ? 'Tertunda' : 'Masalah';

      return {
        id: `TRK-${String(delivery.id).padStart(3, '0')}`,
        route: `${vendor?.nama.split(' ')[0]} → ${sekolah?.nama.split(' ')[0]}`,
        fullName: `${vendor?.nama} → ${sekolah?.nama}`,
        status: statusLabel,
        color: themeColor
      };
    });
  }, []);

  const handleNavigate = (target: string) => {
    setActiveTab(target);
    if (!isMobile) {
      const ref = sectionRefs[target as keyof typeof sectionRefs];
      if (ref?.current) {
        window.scrollTo({
          top: ref.current.offsetTop - 100,
          behavior: "smooth"
        });
      }
    }
  };

  return (
    <div
      className="logistik-page min-h-screen w-full relative font-sans overflow-x-hidden"
      style={{
        background: "linear-gradient(to bottom, #2c6e49 0%, #060b0e 100%)"
      }}
    >
      <AmbientBlobs />
      <LogistikNavbar onNavigate={handleNavigate} activeTab={activeTab} />

      <style jsx global>{`
        @keyframes scan-vertical {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(260px); opacity: 1; }
        }
        .animate-scan-vertical {
          animation: scan-vertical 3s ease-in-out infinite;
        }
      `}</style>

      <header
        ref={sectionRefs.Dashboard}
        className="relative z-10 px-[clamp(1rem,4vw,3rem)] pt-20 md:pt-28 pb-8 md:pb-12"
      >

        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[0.85] animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Logistic<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">Control.</span>
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-white/70 max-w-xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
            Real-time tracking for end-to-end distribution. Monitor fleet movement,
            route efficiency, and delivery timeframes across all active zones.
          </p>
        </div>
      </header>

      {/* ── BODY SECTION ── */}
      <main className="relative z-20 bg-slate-50/95 rounded-t-[40px] md:rounded-t-[60px] border-t border-white/20 shadow-2xl min-h-screen overflow-hidden">
        {/* Ambient Glow Blobs */}
        <div className="absolute top-[10%] -left-[10%] w-[40%] h-[30%] bg-emerald-100 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[30%] bg-sky-100 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[10%] left-[20%] w-[30%] h-[20%] bg-indigo-100 blur-[120px] rounded-full pointer-events-none" />

        <div className="fluid-padding py-12 md:py-20 space-y-24 relative z-10">

          {/* Module: Dashboard & Overview */}
          <section
            style={{ display: isMobile && activeTab !== "Dashboard" ? "none" : "block" }}
            className="space-y-12"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Side: Overview Text & 2x2 Metrics */}
              <div className="lg:col-span-7 space-y-10">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-10 bg-gradient-to-b from-amber-400 via-emerald-400 to-cyan-400 rounded-full shadow-[0_20px_40px_rgba(52,211,153,0.3)]" />
                    <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter">Overview</h2>
                  </div>
                  <p className="text-sm lg:text-base text-slate-600 font-medium leading-relaxed max-w-xl">
                    Pantau performa distribusi harian secara makro. Data di bawah ini disinkronkan secara otomatis dari setiap unit armada yang 
                    sedang beroperasi.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  {isLoading ? (
                    <>
                      <div className="h-32 bg-slate-200 animate-pulse rounded-3xl" />
                      <div className="h-32 bg-slate-200 animate-pulse rounded-3xl" />
                      <div className="h-32 bg-slate-200 animate-pulse rounded-3xl" />
                      <div className="h-32 bg-slate-200 animate-pulse rounded-3xl" />
                    </>
                  ) : (
                    <>
                      {/* Metric 1: Avg Time */}
                      <div className="p-4 lg:p-5 rounded-3xl bg-white border border-white/80 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.06)] hover:bg-white transition-all group/metric flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5 leading-none">Avg Time</p>
                        <p className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter leading-none">14.2 Min</p>
                      </div>
                    </div>
                    <div className="pt-1.5 opacity-80 group-hover/metric:opacity-100 transition-opacity scale-90 origin-right">
                      <WaveChart />
                    </div>
                  </div>

                  {/* Metric 2: Capacity */}
                  <div className="p-4 lg:p-5 rounded-3xl bg-white border border-white/80 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.06)] hover:bg-white transition-all group/metric flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5 leading-none">Capacity</p>
                        <p className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter leading-none">87%</p>
                      </div>
                    </div>
                    <div className="pt-0.5 scale-90 origin-right">
                      <ProgressRing percentage={87} />
                    </div>
                  </div>

                  {/* Metric 3: Truk Beroperasi */}
                  <div className="p-4 lg:p-5 rounded-3xl bg-white border border-white/80 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.06)] hover:bg-white transition-all group/metric">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5 leading-none">Truk Beroperasi</p>
                          <div className="flex items-baseline gap-1">
                            <p className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter leading-none">142</p>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Unit</span>
                          </div>
                        </div>
                      </div>
                      <div className="pt-0.5 scale-90 origin-right">
                        <MiniBarChart />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5">
                      <ArrowRight className="w-2.5 h-2.5 text-emerald-600 rotate-[-90deg] stroke-[3]" />
                      <p className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter transition-all group-hover/metric:tracking-normal">Aktif di Jalan</p>
                      <ArrowRight className="w-3 h-3 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Metric 4: Rasio Ketepatan Waktu */}
                  <div className="p-4 lg:p-5 rounded-3xl bg-white border border-white/80 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.06)] hover:bg-white transition-all group/metric">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600">
                          <Zap className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5 leading-none">Rasio Ketepatan Waktu</p>
                          <p className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter leading-none">99.2%</p>
                        </div>
                      </div>
                      <div className="pt-0.5 scale-90 origin-right">
                        <GaugeChart />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter group-hover/metric:tracking-normal">Sesuai SLA</p>
                        <ArrowRight className="w-3 h-3 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

              {/* Right Side: Fleet Preview Carousel */}
              <div className="lg:col-span-5 bg-white/50 backdrop-blur-md rounded-[44px] p-6 lg:p-8 border border-white/80 shadow-[0_60px_120px_-30px_rgba(0,0,0,0.08)] mt-8 lg:mt-0 h-fit self-start overflow-hidden">
                <Carousel orientation="vertical" opts={{ align: "start", slidesToScroll: 3, loop: true }} className="w-full">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Fleet Preview</h3>
                    <div className="flex gap-2 relative">
                      <CarouselPrevious className="static translate-y-0 translate-x-0 h-8 w-8 bg-white border-slate-200 text-slate-400 hover:text-emerald-500 hover:border-emerald-500 transition-all rounded-xl" />
                      <CarouselNext className="static translate-y-0 translate-x-0 h-8 w-8 bg-white border-slate-200 text-slate-400 hover:text-emerald-500 hover:border-emerald-500 transition-all rounded-xl" />
                    </div>
                  </div>
                  
                  <CarouselContent className="-mt-3 h-[360px] pb-4">
                    {isLoading ? (
                      [1, 2, 3].map(i => (
                        <CarouselItem key={i} className="pt-3 basis-1/3">
                          <div className="h-full bg-slate-200/50 animate-pulse rounded-[24px] border border-slate-100" />
                        </CarouselItem>
                      ))
                    ) : (
                      dynamicFleetPreview.map(f => (
                        <CarouselItem key={f.id} className="pt-3 basis-1/3">
                          <div 
                            onClick={() => handleNavigate("Armada")}
                            className="relative flex items-center gap-3 p-3 lg:p-4 bg-[#52b788]/90 rounded-[24px] border border-[#52b788]/40 shadow-[0_0_15px_rgba(82,183,136,0.3)] hover:shadow-[0_0_25px_rgba(82,183,136,0.5)] transition-all group cursor-pointer h-full"
                          >
                            {/* Left Accent Bar - Mapped by School Category */}
                            <div className={`absolute left-0 top-[25%] bottom-[25%] w-1 rounded-r-full shadow-lg ${
                              f.color === 'red' ? 'bg-red-500 shadow-red-500/50' : 
                              f.color === 'blue' ? 'bg-blue-500 shadow-blue-500/50' : 
                              'bg-slate-400 shadow-slate-400/50'
                            }`} />
                            
                            {/* Area GlassIcons */}
                            <div className="flex-shrink-0 text-[10px] pointer-events-none pl-5">
                              <GlassIcons 
                                items={[{ 
                                  icon: <Truck className="w-8 h-8 text-white" />, 
                                  color: f.color,
                                  label: '' 
                                }]} 
                              />
                            </div>

                            {/* Teks ID dan Route */}
                            <div className="flex-1 min-w-0">
                              <p className="text-base font-black text-white leading-none mb-1 truncate">{f.id}</p>
                              <p className="text-[9px] text-white/70 font-bold uppercase tracking-tight truncate">{f.route}</p>
                            </div>

                            <ArrowRight className="w-4 h-4 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0 ml-auto" />
                          </div>
                        </CarouselItem>
                      ))
                    )}
                  </CarouselContent>
                </Carousel>
              </div>
            </div>
          </section>

          {/* Module: Armada (MAP) */}
          <section
            ref={sectionRefs.Armada}
            style={{ display: isMobile && activeTab !== "Armada" ? "none" : "block" }}
            className="space-y-6"
          >
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <MapIcon className="w-8 h-8 text-emerald-400" />
                  <h2 className="text-2xl lg:text-4xl font-black text-black tracking-tighter">Real-Time Tracker</h2>
                </div>
                <p className="text-xs lg:text-sm text-black/40 font-bold">Klik vendor untuk mengaktifkan animasi "Live Tracking"</p>
              </div>
            </div>
            <div className="w-full h-auto rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
              <MapLibreLogistik />
            </div>
          </section>

          {/* Module: Rute (Riwayat) */}
          <section
            ref={sectionRefs.Rute}
            style={{ display: isMobile && activeTab !== "Rute" ? "none" : "block" }}
          >
            <HistorySection isLoading={isLoading} />
          </section>

          {/* Module: Laporan (Analytics) */}
          <section
            ref={sectionRefs.Laporan}
            style={{ display: isMobile && activeTab !== "Laporan" ? "none" : "block" }}
          >
            <AnalyticsModule isLoading={isLoading} />
          </section>

          {/* Module: Bantuan (Support) */}
          <section
            ref={sectionRefs.Bantuan}
            style={{ display: isMobile && activeTab !== "Bantuan" ? "none" : "block" }}
            className="pb-20"
          >
            <SupportSection />
          </section>

        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 py-12 border-t border-white/5 bg-[#060b0e]">
        <div className="fluid-padding flex flex-col md:flex-row items-center justify-between gap-6 opacity-40">
          <p className="text-[10px] font-bold text-white uppercase tracking-widest">&copy; 2025 B.O.G.A Logistic Systems</p>
          <div className="flex gap-8">
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Privacy</span>
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Terms</span>
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Network Status: Online</span>
          </div>
        </div>
      </footer>

      {/* ── MOBILE CAMERA BUBBLE ── */}
      <button
        onClick={() => setIsScannerOpen(true)}
        className="fixed bottom-6 right-6 z-[100] md:hidden w-16 h-16 rounded-full bg-emerald-500/90 backdrop-blur-xl border border-white/30 shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center justify-center text-white active:scale-95 transition-all animate-bounce"
        aria-label="Open Camera"
      >
        <div className="absolute inset-0 rounded-full animate-ping bg-emerald-400/20" />
        <Camera className="w-8 h-8 relative z-10" />
      </button>

      {/* ── CAMERA SCANNER OVERLAY ── */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="absolute top-6 right-6">
            <button 
              onClick={() => setIsScannerOpen(false)}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all transform hover:rotate-90"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          <div className="relative w-72 h-72 lg:w-96 lg:h-96">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-emerald-400 rounded-tl-3xl" />
            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-emerald-400 rounded-tr-3xl" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-emerald-400 rounded-bl-3xl" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-emerald-400 rounded-br-3xl" />
            
            {/* Scanning Line */}
            <div className="absolute top-0 left-4 right-4 h-1 bg-emerald-400/50 shadow-[0_0_15px_rgba(52,211,153,0.8)] rounded-full animate-scan-vertical" />
            
            {/* Live Camera Feed */}
            <div className="absolute inset-4 rounded-2xl bg-black border border-white/10 overflow-hidden flex items-center justify-center">
              {cameraError ? (
                <div className="text-center p-6 space-y-3">
                  <HelpCircle className="w-10 h-10 text-red-400 mx-auto" />
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-widest leading-relaxed">
                    {cameraError}
                  </p>
                </div>
              ) : (
                <>
                  <video 
                    ref={videoRef}
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center space-y-4">
                      <Maximize className="w-12 h-12 text-emerald-400/20 mx-auto animate-pulse" />
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Positioning...</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-12 text-center space-y-2">
            <h4 className="text-xl font-black text-white tracking-tight">Camera Scanner</h4>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Arahkan ke QR Code atau Label Pengiriman</p>
          </div>

          <div className="absolute bottom-12 flex gap-8">
            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50">
              <Zap className="w-6 h-6" />
            </div>
            <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-emerald-400 flex items-center justify-center shadow-[0_0_30px_rgba(52,211,153,0.4)]">
              <div className="w-16 h-16 rounded-full bg-white" />
            </div>
            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50">
              <Maximize className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}