"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  School,
  Truck,
  ChefHat,
  ShieldCheck,
  Zap,
  Activity,
  Search,
  Network,
  X
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from "@/components/ui/carousel";
import { OrbitHubSection } from "@/components/ui/orbit-hub-section";

export const AboutSection = () => {
  const [isOrbitOpen, setIsOrbitOpen] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [selectedSat, setSelectedSat] = useState<any>(null);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const particlesRef = useRef<any[]>([]);
  const twinklesRef = useRef<HTMLDivElement>(null);

  const satellites = [
    {
      icon: School,
      label: "Schools",
      color: "#6366f1",
      delay: 0,
      radius: 180,
      title: "The Beneficiary",
      desc: "Layanan gizi harian yang melayani ribuan siswa di seluruh wilayah dengan pemantauan real-time dan sistem umpan balik instan."
    },
    {
      icon: Truck,
      label: "Logistics",
      color: "#06b6d4",
      delay: 6,
      radius: 180,
      title: "The Backbone",
      desc: "Jaringan distribusi presisi tinggi dengan pelacakan GPS dan monitor rantai dingin untuk menjamin pengiriman 100% tepat waktu."
    },
    {
      icon: ChefHat,
      label: "SPPG",
      color: "#10b981",
      delay: 12,
      radius: 180,
      title: "The Provider",
      desc: "Satuan Pelayanan Penyelenggaraan Gizi yang menjamin setiap porsi makanan memenuhi standar kesehatan, nutrisi, dan kebersihan nasional."
    },
    {
      icon: ShieldCheck,
      label: "Governance",
      color: "#f59e0b",
      delay: 18,
      radius: 180,
      title: "The Ledger",
      desc: "Sistem transparansi digital berbasis ledger untuk akuntabilitas penuh. Setiap transaksi tercatat secara permanen untuk integritas rantai pasok."
    },
  ];

  const toggleSatellite = (sat: any) => {
    if (selectedSat?.label === sat.label) {
      setSelectedSat(null);
    } else {
      setSelectedSat(sat);
    }
  };

  // High-performance rotation loop
  useEffect(() => {
    let frameId: number;
    const loop = () => {
      if (isOrbitOpen) {
        setRotationAngle(prev => prev + 0.002);
      }
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isOrbitOpen]);

  // --- ATMOSPHERIC PARTICLES LOGIC (Matched to SplashScene High-Fidelity) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const SHAPE_TYPES = ["triangle", "square", "diamond", "hexagon", "pentagon"];

    const drawShapePath = (cx: number, cy: number, rot: number, sz: number, type: string, c: CanvasRenderingContext2D) => {
      c.save();
      c.translate(cx, cy);
      c.rotate(rot);
      c.beginPath();
      if (type === "triangle") {
        c.moveTo(0, -sz); c.lineTo(sz * 0.866, sz * 0.5); c.lineTo(-sz * 0.866, sz * 0.5); c.closePath();
      } else if (type === "square") {
        c.rect(-sz / 2, -sz / 2, sz, sz);
      } else if (type === "diamond") {
        c.moveTo(0, -sz); c.lineTo(sz * 0.6, 0); c.lineTo(0, sz); c.lineTo(-sz * 0.6, 0); c.closePath();
      } else if (type === "hexagon") {
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 180) * (60 * i - 30);
          i === 0 ? c.moveTo(Math.cos(a) * sz, Math.sin(a) * sz) : c.lineTo(Math.cos(a) * sz, Math.sin(a) * sz);
        }
        c.closePath();
      } else if (type === "pentagon") {
        for (let j = 0; j < 5; j++) {
          const a2 = (Math.PI / 180) * (72 * j - 90);
          j === 0 ? c.moveTo(Math.cos(a2) * sz, Math.sin(a2) * sz) : c.lineTo(Math.cos(a2) * sz, Math.sin(a2) * sz);
        }
        c.closePath();
      }
      c.restore();
    };

    const drawMirroredShape = (p: any, c: CanvasRenderingContext2D) => {
      const W = canvas.width;
      const H = canvas.height;
      const a = p.alpha + Math.sin(p.pulse) * 0.035;
      const positions = [
        { x: p.x, y: p.y, r: p.rot, af: 1 },
        { x: W - p.x, y: p.y, r: -p.rot, af: 0.68 },
        { x: p.x, y: H - p.y, r: p.rot, af: 0.68 },
        { x: W - p.x, y: H - p.y, r: -p.rot, af: 0.42 },
      ];
      positions.forEach((pos) => {
        const fa = (a * pos.af).toFixed(3);
        drawShapePath(pos.x, pos.y, pos.r, p.sz, p.type, c);
        c.strokeStyle = p.col + fa + ")";
        c.lineWidth = 1.6;
        c.stroke();
        const fi = (p.innerAlpha * pos.af).toFixed(3);
        drawShapePath(pos.x, pos.y, pos.r + (Math.PI / p.sz) * 8, p.sz * p.innerScale, p.type, c);
        c.strokeStyle = p.col + fi + ")";
        c.lineWidth = 0.8;
        c.stroke();
      });
    };

    const initParticles = () => {
      const W = canvas.width;
      const H = canvas.height;
      const baseSz = Math.max(W, H); // Use max to ensure huge shapes like landing page
      particlesRef.current = [
        { x: W * 0.15, y: H * 0.25, sz: baseSz * 0.22, type: "hexagon", vx: 0.08, vy: 0.05, rot: 0, rotV: 0.002, col: "rgba(99, 102, 241,", pulse: 0, alpha: 0.25, innerAlpha: 0.08, innerScale: 0.65 },
        { x: W * 0.35, y: H * 0.75, sz: baseSz * 0.18, type: "diamond", vx: -0.06, vy: -0.04, rot: Math.PI / 6, rotV: -0.0015, col: "rgba(6, 182, 212,", pulse: 1.6, alpha: 0.22, innerAlpha: 0.07, innerScale: 0.55 }
      ];
    };
    initParticles();

    const loop = () => {
      // Continuously sync canvas size with the animating parent container
      const container = canvas.parentElement;
      if (container && (canvas.width !== container.clientWidth || canvas.height !== container.clientHeight)) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      particlesRef.current.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += p.rotV; p.pulse += 0.006;

        // Relaxed bounds so large shapes can spread and float naturally
        if (p.x < -100) { p.x = -100; p.vx *= -1; }
        if (p.x > W / 2 + 100) { p.x = W / 2 + 100; p.vx *= -1; }
        if (p.y < -100) { p.y = -100; p.vy *= -1; }
        if (p.y > H + 100) { p.y = H + 100; p.vy *= -1; }

        ctx.shadowBlur = 15;

        ctx.shadowColor = 'rgba(255, 250, 229, 0.4)';
        drawMirroredShape(p, ctx);
      });
      ctx.shadowBlur = 0;
      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("resize", resize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // --- TWINKLE PARTICLES LOGIC (Vibrant for #fcefb4) ---
  useEffect(() => {
    if (twinklesRef.current) {
      const container = twinklesRef.current;
      container.innerHTML = "";
      for (let i = 0; i < 60; i++) {
        const p = document.createElement("div");
        p.className = "boga-particle-twinkle";
        const color = Math.random() > 0.5 ? "#6366f1" : "#06b6d4";
        const big = Math.random() > 0.8;
        p.style.cssText = `
          position: absolute;
          left: ${Math.random() * 100}%;
          top: ${Math.random() * 100}%;
          --d: ${3 + Math.random() * 4}s;
          --delay: ${Math.random() * 5}s;
          width: ${big ? 4 : 2}px;
          height: ${big ? 4 : 2}px;
          background: ${color};
          border-radius: 50%;
          opacity: 0;
          box-shadow: 0 0 10px ${color}66;
          animation: bogaTwinkle var(--d, 4s) var(--delay, 0s) ease-in-out infinite;
        `;
        container.appendChild(p);
      }
    }
  }, [isOrbitOpen]);

  return (
    <section id="about" className="relative pt-0 pb-0 px-6 overflow-hidden bg-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-7xl mx-auto">

        <div className="pb-12 border-b border-slate-100/80">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h4 className="text-indigo-600 font-black text-xs uppercase tracking-[0.4em] mb-4">
                Our Story
              </h4>
              <h2 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight tracking-tight mb-8">
                About <br />
                <motion.div
                  className="inline-flex items-center gap-1 md:gap-2 mt-8"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
                    }
                  }}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {["B", ".", "O", ".", "G", ".", "A"].map((char, index) => (
                    <motion.span
                      key={index}
                      variants={{
                        hidden: { opacity: 0, scale: 0.5, y: 20 },
                        visible: { opacity: 1, scale: 1, y: 0 }
                      }}
                      className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#06b6d4] font-black text-6xl md:text-8xl select-none"
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.div>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col gap-6"
            >
              <p className="text-xl md:text-2xl text-slate-600 leading-relaxed font-medium">
                <span className="text-slate-900 font-bold">B.O.G.A</span> dibangun sebagai respon atas rentannya <span className="text-slate-900 font-bold">kebocoran anggaran</span> dan penurunan kualitas pada program gizi nasional.
              </p>
              <p className="text-lg md:text-xl text-slate-500 leading-relaxed">
                Kami menggunakan teknologi blockchain untuk menghadirkan ekosistem yang mengunci <span className="text-slate-900 font-bold">akuntabilitas setiap transaksi</span> — dari pencatatan supplier pertama hingga distribusi logistik terakhir.
              </p>
              <div className="flex gap-4 mt-4">
                <div className="h-px w-12 bg-indigo-200 self-center" />
                <span className="text-indigo-500 font-black text-[10px] uppercase tracking-widest">Est. 2026</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* INTERACTIVE MIDDLE SECTION (ORBIT) */}
        {/* NEW INTERACTIVE ORBIT HUB */}
        <OrbitHubSection />

        {/* SPLIT INTERACTIVE CAROUSEL (BOTTOM SECTION) */}
        <div className="pt-12 pb-0 flex justify-center w-full relative z-20">
          <div className="w-full bg-white/60 backdrop-blur-3xl border border-slate-100 p-8 rounded-[3rem] shadow-2xl shadow-indigo-100/50">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">

              {/* LEFT SIDE: Interactive Icon Slider */}
              <div className="md:col-span-5 relative flex justify-center">
                <Carousel setApi={setApi} className="w-full max-w-[220px]">
                  <CarouselContent>
                    {[
                      {
                        icon: Network,
                        label: "B.O.G.A Network",
                        title: "Intelligence Hub",
                        desc: "Sistem saraf pusat B.O.G.A yang menghubungkan tata kelola, logistik, sekolah, dan penyedia layanan melalui buku besar digital terpadu secara real-time.",
                        color: "#3b82f6",
                        isGradient: true
                      },
                      {
                        icon: ({ className, style }: any) => (
                          <div className="relative flex items-center justify-center w-full h-full">
                            <div className="absolute inset-1.5 bg-white/10 rounded-[1.3rem] shadow-[inset_0_4px_10px_rgba(255,255,255,0.15)] ring-1 ring-white/20"></div>
                            <div className={`font-black flex items-center justify-center leading-none text-white z-10 drop-shadow-md`} style={{ fontSize: "4.5rem", marginTop: "-0.2rem" }}>
                              B
                            </div>
                          </div>
                        ),
                        label: "B.O.G.A Ecosystem",
                        title: "The Platform",
                        desc: "Platform manajemen gizi dan logistik end-to-end yang menjamin akuntabilitas 100% dari tahap pengadaan hingga distribusi ke tangan siswa.",
                        color: "#6366f1",
                        isGradient: true
                      }
                    ].map((sat, index) => (
                      <CarouselItem key={sat.label}>
                        <div className="p-2 flex justify-center">
                          <div
                            className={`shrink-0 w-36 h-36 md:w-44 md:h-44 rounded-[2rem] flex items-center justify-center shadow-xl ${sat.isGradient
                                ? "bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-indigo-200/50 border-none relative"
                                : ""
                              }`}
                            style={!sat.isGradient ? { backgroundColor: `${sat.color}15`, border: `1px solid ${sat.color}40` } : {}}
                          >
                            {typeof sat.icon === 'function' ? (
                              <sat.icon className={`w-20 h-20 ${sat.isGradient ? "text-white" : ""}`} style={!sat.isGradient ? { color: sat.color } : {}} />
                            ) : (
                              <sat.icon className={`w-20 h-20 ${sat.isGradient ? "text-white" : ""}`} style={!sat.isGradient ? { color: sat.color } : {}} />
                            )}
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="hidden md:flex -left-12" />
                  <CarouselNext className="hidden md:flex -right-12" />
                </Carousel>
              </div>

              {/* RIGHT SIDE: Synced Dynamic Content */}
              <div className="md:col-span-7 flex flex-col justify-center text-center md:text-left min-h-[14rem]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-sm font-black uppercase tracking-widest mb-3" style={{
                      color: current === 0 ? "#3b82f6" : "#6366f1"
                    }}>
                      {current === 0 ? "Intelligence Hub" : "The Platform"}
                    </p>
                    <h3 className="text-4xl font-black text-slate-900 mb-5 tracking-tight">
                      {current === 0 ? "B.O.G.A Network" : "B.O.G.A Ecosystem"}
                    </h3>
                    <p className="text-lg text-slate-500 leading-relaxed font-medium">
                      {current === 0
                        ? "Sistem saraf pusat B.O.G.A yang menghubungkan tata kelola, logistik, sekolah, dan penyedia layanan melalui buku besar digital terpadu secara real-time."
                        : "Platform manajemen gizi dan logistik end-to-end yang menjamin akuntabilitas 100% dari tahap pengadaan hingga distribusi ke tangan siswa."}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-slow-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 25s linear infinite;
        }
      `}</style>
    </section>
  );
};
