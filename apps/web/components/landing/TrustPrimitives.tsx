import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Shield, MapPin, Fingerprint } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

const primitives = [
  { icon: Lock, title: "Escrow", description: "Dana ditahan sampai kondisi terpenuhi, bukan asumsi.", accent: "amber", featured: true },
  { icon: Shield, title: "Multi-Sig", description: "Keputusan penting butuh 3 peran, bukan satu klik.", accent: "teal", featured: false },
  { icon: MapPin, title: "Geofencing", description: "Scan hanya valid pada radius lokasi yang benar.", accent: "emerald", featured: false },
  { icon: Fingerprint, title: "SBT", description: "Reputasi terikat identitas — persisten, audit-friendly.", accent: "violet", featured: false },
];

const accentColors: Record<string, { bg: string; border: string; glow: string; tint: string }> = {
  amber: { bg: "bg-amber-500/15", border: "hover:border-amber-500/50", glow: "hover:shadow-[0_8px_30px_rgba(245,158,11,0.15)]", tint: "text-amber-500" },
  teal: { bg: "bg-teal-500/15", border: "hover:border-teal-500/50", glow: "hover:shadow-[0_8px_30px_rgba(13,148,136,0.15)]", tint: "text-teal-500" },
  emerald: { bg: "bg-emerald-500/15", border: "hover:border-emerald-500/50", glow: "hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)]", tint: "text-emerald-500" },
  violet: { bg: "bg-violet-500/15", border: "hover:border-violet-500/50", glow: "hover:shadow-[0_8px_30px_rgba(139,92,246,0.15)]", tint: "text-violet-500" },
};

function EscrowDiagram() {
  return (
    <div className="mt-auto pt-6">
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
            <span className="text-[10px] font-bold text-slate-400">PO</span>
          </div>
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Create</span>
        </div>
        
        <div className="flex-1 h-px bg-slate-700 relative">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[4px] border-l-slate-700 border-y-[3px] border-y-transparent" />
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <motion.div 
            animate={{ 
              scale: [1, 1.05, 1],
              boxShadow: [
                "0 0 15px rgba(245,158,11,0.15)",
                "0 0 25px rgba(245,158,11,0.3)",
                "0 0 15px rgba(245,158,11,0.15)"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center"
          >
            <Lock className="w-5 h-5 text-amber-500" />
          </motion.div>
          <span className="text-[9px] text-amber-500 font-black uppercase tracking-widest">Lock</span>
        </div>
        
        <div className="flex-1 h-px bg-slate-700 relative">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[4px] border-l-slate-700 border-y-[3px] border-y-transparent" />
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
            <span className="text-[10px] font-bold text-slate-400">Rel</span>
          </div>
          <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Release</span>
        </div>
      </div>
    </div>
  );
}

/* ── Shared Card renderer ── */
function PrimitiveCard({ primitive, compact = false }: { primitive: typeof primitives[number]; compact?: boolean }) {
  const colors = accentColors[primitive.accent];
  return (
    <div
      className={`landing-glass-dark rounded-2xl border border-[#334155] transition-all duration-300 w-full ${colors.border} ${colors.glow} ${
        primitive.featured && !compact
          ? "p-6 lg:p-8 flex flex-col h-full"
          : "p-5 lg:p-6 flex flex-col justify-center"
      }`}
    >
      <div className={primitive.featured && !compact ? "" : "flex items-start gap-4"}>
        <div className={`shrink-0 rounded-xl ${colors.bg} flex items-center justify-center ${
          primitive.featured && !compact ? "w-12 h-12 mb-5" : "w-10 h-10"
        }`}>
          <primitive.icon className={`w-5 h-5 ${colors.tint}`} />
        </div>
        <div>
          <h3 className={`font-semibold text-white ${primitive.featured && !compact ? "text-xl mb-2" : "text-[17px] mb-1"}`}>{primitive.title}</h3>
          <p className={`text-slate-400 ${primitive.featured && !compact ? "text-[14px] leading-relaxed" : "text-[13px] leading-normal"}`}>{primitive.description}</p>
        </div>
      </div>
      {primitive.featured && !compact && <EscrowDiagram />}
    </div>
  );
}

/* ── Mobile carousel (2 slides) ── */
function MobileCarousel() {
  const [active, setActive] = useState(0);
  const touchRef = useRef<number | null>(null);
  const pausedRef = useRef(false);

  const escrow = primitives.find((p) => p.featured)!;
  const others = primitives.filter((p) => !p.featured);

  const goTo = useCallback((idx: number) => setActive(idx), []);

  // auto-slide
  useEffect(() => {
    const id = setInterval(() => {
      if (!pausedRef.current) setActive((prev) => (prev === 0 ? 1 : 0));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchRef.current = e.touches[0].clientX;
    pausedRef.current = true;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchRef.current === null) return;
    const diff = e.changedTouches[0].clientX - touchRef.current;
    if (Math.abs(diff) > 50) setActive(diff < 0 ? 1 : 0);
    touchRef.current = null;
    setTimeout(() => { pausedRef.current = false; }, 4000);
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <div className="lg:hidden">
      <div
        className="relative overflow-hidden min-h-[320px]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait" custom={active}>
          <motion.div
            key={active}
            custom={active}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="w-full"
          >
            {active === 0 ? (
              <PrimitiveCard primitive={escrow} />
            ) : (
              <div className="flex flex-col gap-3">
                {others.map((p) => (
                  <PrimitiveCard key={p.title} primitive={p} compact />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-5">
        {[0, 1].map((i) => (
          <button
            key={i}
            onClick={() => { goTo(i); pausedRef.current = false; }}
            className={`h-2 rounded-full transition-all duration-300 ${
              active === i ? "w-6 bg-amber-500" : "w-2 bg-slate-600"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Desktop grid ── */
function DesktopGrid() {
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const cardVariants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } } };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="hidden lg:grid lg:grid-cols-3 gap-5"
    >
      {primitives.map((primitive) => {
        const colors = accentColors[primitive.accent];
        return (
          <motion.div
            key={primitive.title}
            variants={cardVariants}
            className={`landing-glass-dark rounded-2xl border border-[#334155] transition-all duration-300 w-full ${colors.border} ${colors.glow} ${
              primitive.featured
                ? "lg:col-span-2 lg:row-span-3 p-6 lg:p-8 flex flex-col"
                : "p-5 lg:p-6 flex flex-col justify-center h-full"
            }`}
          >
            <div className={primitive.featured ? "" : "flex items-start gap-4"}>
              <div className={`shrink-0 w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center ${primitive.featured ? "w-12 h-12 mb-5" : ""}`}>
                <primitive.icon className={`w-5 h-5 ${colors.tint}`} />
              </div>
              <div>
                <h3 className={`font-semibold text-white ${primitive.featured ? "text-xl mb-2" : "text-[17px] mb-1"}`}>{primitive.title}</h3>
                <p className={`text-slate-400 ${primitive.featured ? "text-[14px] leading-relaxed" : "text-[13px] leading-normal"}`}>{primitive.description}</p>
              </div>
            </div>
            {primitive.featured && <EscrowDiagram />}
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export function TrustPrimitives() {
  return (
    <section id="primitives" className="py-[clamp(60px,8vh,100px)] px-[clamp(1.5rem,5vw,4rem)] bg-[#1A1A1A]">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col items-center text-center lg:flex-row lg:items-end lg:justify-between lg:text-left gap-4 lg:gap-6 mb-10 lg:mb-12">
          <SectionHeader label="TRUST PRIMITIVES" headline="Keamanan bawaan, bukan sekadar tambahan." dark className="[&_h2]:text-[clamp(1.4rem,5vw,3.5rem)]" />
          <p className="text-slate-400 text-[13px] lg:text-lg max-w-[400px] lg:text-right leading-relaxed">Eksekusi tanpa celah. Dana aman, keputusan kolektif, dan lokasi tervalidasi.</p>
        </div>

        {/* Mobile: 2-slide carousel */}
        <MobileCarousel />

        {/* Desktop: original grid */}
        <DesktopGrid />
      </div>
    </section>
  );
}
