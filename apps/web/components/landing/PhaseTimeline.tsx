"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { ArrowRight, Info } from "lucide-react";
import Link from "next/link";
import { SectionHeader } from "./SectionHeader";

const phases = [
  { 
    phase: "PHASE 0", 
    title: "Onboarding & Verifikasi", 
    description: "Pilih role, login, lalu proses verifikasi & approval (demo).", 
    fullDescription: "Tahap awal ekosistem B.O.G.A. Setiap pengguna (Pemerintah, SPPG, Vendor, Logistik, Sekolah) mendaftar dan diverifikasi identitasnya. Proses ini memastikan bahwa hanya pihak yang berwenang yang dapat mengakses portal sesuai dengan perannya masing-masing.",
    side: "left" as const, 
    href: "/auth/login" 
  },
  { 
    phase: "PHASE 1", 
    title: "Pengadaan & Escrow Lock", 
    description: "SPPG buat PO + bidding vendor, lalu lock escrow (simulasi).", 
    fullDescription: "SPPG (Satuan Pelayanan Program Gizi) membuat Purchase Order dan melakukan proses bidding. Setelah vendor terpilih, dana akan dikunci (lock escrow) menggunakan smart contract untuk menjamin keamanan transaksi hingga makanan diterima.",
    side: "right" as const, 
    href: "/sppg/dashboard" 
  },
  { 
    phase: "PHASE 2", 
    title: "Logistik & Validasi", 
    description: "Pantau rute + scan QR manifest di proses pickup/delivery (demo).", 
    fullDescription: "Tim logistik menjemput makanan dari vendor dan mengirimkannya ke sekolah. Terdapat sistem pelacakan rute (geofencing) dan pemindaian QR Code pada manifest pengiriman untuk memastikan makanan berada di jalur yang benar dan tepat waktu.",
    side: "left" as const, 
    href: "/logistik/dashboard" 
  },
  { 
    phase: "PHASE 3", 
    title: "Penerimaan Sekolah", 
    description: "Sekolah scan manifest untuk konfirmasi penerimaan (demo).", 
    fullDescription: "Pihak sekolah menerima pengiriman makanan dan memindai QR Code manifest sebagai bukti serah terima (Proof of Delivery). Setelah divalidasi, sistem akan mengizinkan pelepasan dana (escrow release) ke vendor.",
    side: "right" as const, 
    href: "/sekolah/admin" 
  },
  { 
    phase: "PHASE 4", 
    title: "Evaluasi & Reputasi", 
    description: "Ranking, performa, dan feedback siswa untuk reputasi vendor/SPPG.", 
    fullDescription: "Siswa memberikan penilaian (rating & feedback) terhadap kualitas makanan. Data ini diagregasi menjadi skor reputasi bagi vendor dan SPPG, yang nantinya akan mempengaruhi peluang mereka pada proses pengadaan selanjutnya (SBT/Reputasi).",
    side: "left" as const, 
    href: "/sekolah/siswa" 
  },
];

export function PhaseTimeline() {
  const [activePhase, setActivePhase] = useState<string | null>(null);
  const [passedDots, setPassedDots] = useState<boolean[]>(new Array(phases.length).fill(false));
  const timelineRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 0.8", "end 0.4"],
  });

  const lineScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Track which dots the line has passed
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const newPassed = phases.map((_, i) => {
      const threshold = i / (phases.length - 1) * 0.85 + 0.05;
      return latest >= threshold;
    });
    setPassedDots((prev) => {
      if (prev.every((v, i) => v === newPassed[i])) return prev;
      return newPassed;
    });
  });

  return (
    <section id="how-it-works" className="pt-[clamp(40px,5vh,60px)] pb-[clamp(40px,6vh,80px)] px-[clamp(1.5rem,5vw,4rem)] bg-[#FAFAF7]">
      <SectionHeader 
        label="HOW IT WORKS" 
        headline="Workflow Operasional Berbasis Fase." 
        centered 
        className="mb-6 md:mb-10 [&_h2]:text-[clamp(1.3rem,4vw,3.5rem)]" 
      />
      <p className="hidden md:block text-slate-500 text-lg leading-relaxed text-center max-w-[700px] mx-auto -mt-6 md:-mt-8 mb-12 md:mb-16">Setiap tahapan dikunci oleh satu tujuan spesifik, satu bukti otentik, dan satu status yang terdokumentasi secara sistematis.</p>
      <div ref={timelineRef} className="max-w-[1000px] mx-auto relative">
        {/* Desktop: background gray line */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#E2E8F0] -translate-x-1/2" />
        {/* Desktop: scroll-filling dark line */}
        <motion.div
          style={{ scaleY: lineScaleY }}
          className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-indigo-600 -translate-x-1/2 origin-top"
        />

        {/* Mobile: background gray line */}
        <div className="md:hidden absolute left-4 top-0 bottom-0 w-0.5 bg-[#E2E8F0]" />
        {/* Mobile: scroll-filling dark line */}
        <motion.div
          style={{ scaleY: lineScaleY }}
          className="md:hidden absolute left-4 top-0 bottom-0 w-0.5 bg-indigo-600 origin-top"
        />

        <div className="space-y-12 md:space-y-16">
          {phases.map((phase, index) => (
            <motion.div 
              key={phase.phase} 
              initial={{ opacity: 0, y: 50 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: false, margin: "-50px" }} 
              transition={{ duration: 0.6, delay: index * 0.15, ease: [0.4, 0, 0.2, 1] }} 
              className={`relative flex items-center ${phase.side === "left" ? "md:flex-row" : "md:flex-row-reverse"}`}
            >
              {/* Timeline dot with glow */}
              <div className="absolute z-10 left-4 md:left-1/2 md:-translate-x-1/2">
                <motion.div
                  animate={passedDots[index] ? {
                    boxShadow: [
                      "0 0 0px rgba(67,56,202,0.3)",
                      "0 0 12px rgba(67,56,202,0.6)",
                      "0 0 6px rgba(67,56,202,0.4)",
                    ],
                    scale: [1, 1.3, 1.15],
                  } : {
                    boxShadow: "0 0 0px rgba(67,56,202,0)",
                    scale: 1,
                  }}
                  transition={passedDots[index] ? { duration: 0.6, ease: "easeOut" } : { duration: 0.3 }}
                  className={`w-4 h-4 rounded-full border-4 border-[#FAFAF7] transition-colors duration-300 ${
                    passedDots[index] ? "bg-indigo-500" : "bg-indigo-600/40"
                  }`}
                />
              </div>
              
              <div className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${phase.side === "left" ? "md:mr-auto md:pr-0" : "md:ml-auto md:pl-0"}`}>
                <div 
                  onClick={() => {
                    if (window.innerWidth >= 768) {
                      setActivePhase(activePhase === phase.phase ? null : phase.phase);
                    }
                  }}
                  className={`bg-white border ${activePhase === phase.phase ? 'md:border-indigo-600 md:shadow-md md:scale-[1.02]' : 'border-[#E2E8F0]'} rounded-2xl p-5 md:p-8 border-l-[3px] border-l-indigo-600 transition-all duration-300 md:cursor-pointer group md:hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] md:hover:-translate-y-1 relative`}
                >
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                    <Info className="w-5 h-5 text-indigo-400" />
                  </div>
                  <p className="text-xs font-medium tracking-wider text-slate-400 uppercase mb-2 md:mb-3">{phase.phase}</p>
                  <h3 className="text-base md:text-xl font-semibold text-slate-800 mb-2 md:mb-3">{phase.title}</h3>
                  <p className="text-slate-500 text-sm md:text-base leading-relaxed md:mb-5">{phase.description}</p>
                  <div className="hidden md:flex items-center justify-between">
                    <Link href={phase.href} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-2 text-indigo-600 font-medium text-sm hover:underline group/link">
                      Buka modul <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="hidden md:flex md:w-[calc(50%-2rem)] items-center p-6 min-h-[160px]">
                <AnimatePresence mode="wait">
                  {activePhase === phase.phase && (
                    <motion.div
                      initial={{ opacity: 0, x: phase.side === "left" ? -20 : 20, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: phase.side === "left" ? -20 : 20, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className={`bg-white/80 backdrop-blur-md border border-[#E2E8F0] rounded-2xl p-6 shadow-sm w-full relative ${phase.side === "left" ? "mr-auto" : "ml-auto"}`}
                    >
                      <div className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-y border-[#E2E8F0] rotate-45 ${phase.side === "left" ? "-left-1.5 border-l" : "-right-1.5 border-r"}`} />
                      <h4 className="text-sm font-bold text-slate-800 mb-2">Lebih Lanjut:</h4>
                      <p className="text-slate-600 text-sm leading-relaxed">{phase.fullDescription}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile description that appears below the card instead of on the side */}
              <AnimatePresence>
                {activePhase === phase.phase && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="md:hidden ml-12 overflow-hidden w-full mt-3"
                  >
                    <div className="bg-slate-50 border border-[#E2E8F0] rounded-xl p-4 shadow-inner">
                      <p className="text-slate-600 text-sm leading-relaxed">{phase.fullDescription}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

