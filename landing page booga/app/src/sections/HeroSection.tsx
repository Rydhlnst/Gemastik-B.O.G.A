import { motion } from 'framer-motion'
import { CheckCircle, Zap, Users, ScanLine, ChevronDown } from 'lucide-react'
import { PrimaryButton, SecondaryButton } from '@/components/ui/CustomButtons'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut" as const,
    },
  },
}

const floatingCards = [
  { icon: CheckCircle, label: 'Audit Trail', sub: 'PO → Delivery', position: 'top-[18%] left-[10%] lg:left-[15%]', delay: '0s' },
  { icon: Zap, label: 'Real-time', sub: 'Signal operasional', position: 'top-[15%] right-[10%] lg:right-[18%]', delay: '1s' },
  { icon: Users, label: '6 Peran', sub: 'Lintas aktor', position: 'bottom-[22%] left-[8%] lg:left-[12%]', delay: '2s' },
  { icon: ScanLine, label: '5 Phase', sub: 'End-to-end', position: 'bottom-[25%] right-[8%] lg:right-[15%]', delay: '3s' },
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-mesh">
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-teal-600/30 blur-[100px] animate-blob-float"
          style={{ animationDelay: '0s' }}
        />
        <div
          className="absolute top-[40%] right-[15%] w-[400px] h-[400px] rounded-full bg-emerald-500/25 blur-[90px] animate-blob-float-2"
          style={{ animationDelay: '-5s' }}
        />
        <div
          className="absolute bottom-[10%] left-[30%] w-[450px] h-[450px] rounded-full bg-amber-500/20 blur-[100px] animate-blob-float-3"
          style={{ animationDelay: '-10s' }}
        />
        <div
          className="absolute top-[60%] left-[50%] w-[300px] h-[300px] rounded-full bg-teal-400/15 blur-[80px] animate-blob-float"
          style={{ animationDelay: '-15s' }}
        />
      </div>

      {/* Floating metric cards (desktop only) */}
      {floatingCards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 + i * 0.2, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className={`hidden md:block absolute ${card.position} z-10`}
        >
          <div
            className="glass rounded-2xl px-5 py-4 shadow-glass hover:shadow-glass-lg transition-all duration-300 hover:scale-105 cursor-default"
            style={{ animationDelay: card.delay }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
                <card.icon className="w-4.5 h-4.5 text-teal-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">{card.label}</p>
                <p className="text-[11px] text-slate-500">{card.sub}</p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Main content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-20 text-center px-6 max-w-[900px] mx-auto"
      >
        <motion.p
          variants={itemVariants}
          className="text-xs md:text-sm font-medium tracking-[0.12em] uppercase text-slate-400 mb-6"
        >
          B.O.G.A • MBG OPERATIONS LEDGER
        </motion.p>

        <motion.h1
          variants={itemVariants}
          className="text-[clamp(2.5rem,6vw,5.5rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-white"
          style={{ textShadow: '0 2px 40px rgba(0,0,0,0.3)' }}
        >
          Distribusi MBG yang rapi, terukur, dan siap diaudit.
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mt-6 text-base md:text-lg text-white/80 leading-relaxed max-w-[600px] mx-auto"
        >
          Satu alur operasional lintas peran: pengadaan, escrow, logistik, penerimaan sekolah, hingga evaluasi — semua dengan guardrail yang jelas.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <PrimaryButton>Masuk</PrimaryButton>
          <SecondaryButton dark>Lihat alur</SecondaryButton>
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
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-5 h-5 animate-bounce-slow" />
        </div>
      </motion.div>
    </section>
  )
}
