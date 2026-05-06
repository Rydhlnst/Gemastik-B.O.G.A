"use client";

import { motion } from "framer-motion";
import { CheckCircle, Zap, Users, ScanLine, ChevronDown } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "./CustomButtons";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" as const },
  },
};

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden landing-gradient-mesh">
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-teal-600/30 blur-[100px] animate-[blobFloat_20s_ease-in-out_infinite_alternate]"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="absolute top-[40%] right-[15%] w-[400px] h-[400px] rounded-full bg-emerald-500/25 blur-[90px] animate-[blobFloat2_25s_ease-in-out_infinite_alternate]"
          style={{ animationDelay: "-5s" }}
        />
        <div
          className="absolute bottom-[10%] left-[30%] w-[450px] h-[450px] rounded-full bg-amber-500/20 blur-[100px] animate-[blobFloat3_22s_ease-in-out_infinite_alternate]"
          style={{ animationDelay: "-10s" }}
        />
        <div
          className="absolute top-[60%] left-[50%] w-[300px] h-[300px] rounded-full bg-teal-400/15 blur-[80px] animate-[blobFloat_20s_ease-in-out_infinite_alternate]"
          style={{ animationDelay: "-15s" }}
        />
      </div>

      {/* Main content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-20 text-center px-5 md:px-6 pt-[88px] md:pt-0 max-w-[1200px] mx-auto"
      >
        <motion.p
          variants={itemVariants}
          className="text-xs md:text-sm font-medium tracking-[0.12em] uppercase text-slate-400 mb-6"
        >
          B.O.G.A
        </motion.p>

        <motion.h1
          variants={itemVariants}
          className="text-[clamp(1.8rem,6vw,5.5rem)] font-extrabold leading-[1.08] tracking-[-0.03em] text-white"
          style={{ textShadow: "0 2px 40px rgba(0,0,0,0.3)" }}
        >
          Distribusi MBG yang rapi, terukur, dan siap diaudit.
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mt-4 md:mt-6 text-sm md:text-lg text-white/80 leading-relaxed max-w-[800px] mx-auto"
        >
          Satu alur operasional lintas peran: pengadaan, escrow, logistik,
          penerimaan sekolah, hingga evaluasi — semua dengan guardrail yang
          jelas.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="mt-8 md:mt-10 flex flex-row items-center justify-center gap-3 md:gap-4"
        >
          <PrimaryButton href="/auth/login">Masuk</PrimaryButton>
          <SecondaryButton href="#how-it-works" dark>
            Lihat alur
          </SecondaryButton>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="flex flex-col items-center gap-2 text-white/50">
          <span className="text-[10px] tracking-widest uppercase hidden md:block">Scroll</span>
          <ChevronDown className="w-5 h-5 animate-[bounceSlow_2s_ease-in-out_infinite]" />
        </div>
      </motion.div>
    </section>
  );
}
