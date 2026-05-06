import { motion } from 'framer-motion'
import { Lock, Shield, MapPin, Fingerprint } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'

const primitives = [
  {
    icon: Lock,
    title: 'Escrow',
    description: 'Dana ditahan sampai kondisi terpenuhi, bukan asumsi.',
    accent: 'amber',
    featured: true,
  },
  {
    icon: Shield,
    title: 'Multi-Sig',
    description: 'Keputusan penting butuh 3 peran, bukan satu klik.',
    accent: 'teal',
    featured: false,
  },
  {
    icon: MapPin,
    title: 'Geofencing',
    description: 'Scan hanya valid pada radius lokasi yang benar.',
    accent: 'emerald',
    featured: false,
  },
  {
    icon: Fingerprint,
    title: 'SBT',
    description: 'Reputasi terikat identitas — persisten, audit-friendly.',
    accent: 'violet',
    featured: false,
  },
]

const accentColors: Record<string, { bg: string; border: string; glow: string; tint: string }> = {
  amber: {
    bg: 'bg-amber-500/15',
    border: 'hover:border-amber-500/50',
    glow: 'hover:shadow-[0_8px_30px_rgba(245,158,11,0.15)]',
    tint: 'text-amber-500',
  },
  teal: {
    bg: 'bg-teal-500/15',
    border: 'hover:border-teal-500/50',
    glow: 'hover:shadow-[0_8px_30px_rgba(13,148,136,0.15)]',
    tint: 'text-teal-500',
  },
  emerald: {
    bg: 'bg-emerald-500/15',
    border: 'hover:border-emerald-500/50',
    glow: 'hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)]',
    tint: 'text-emerald-500',
  },
  violet: {
    bg: 'bg-violet-500/15',
    border: 'hover:border-violet-500/50',
    glow: 'hover:shadow-[0_8px_30px_rgba(139,92,246,0.15)]',
    tint: 'text-violet-500',
  },
}

function EscrowDiagram() {
  return (
    <div className="mt-6 flex items-center gap-3">
      <div className="flex flex-col items-center gap-1.5">
        <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
          <span className="text-[10px] font-semibold text-slate-300">PO</span>
        </div>
        <span className="text-[10px] text-slate-500">Create</span>
      </div>
      <div className="flex-1 h-px bg-slate-600 relative">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[5px] border-l-slate-600 border-y-[3px] border-y-transparent" />
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
          <Lock className="w-4 h-4 text-amber-500" />
        </div>
        <span className="text-[10px] text-amber-500 font-medium">Lock</span>
      </div>
      <div className="flex-1 h-px bg-slate-600 relative">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[5px] border-l-slate-600 border-y-[3px] border-y-transparent" />
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
          <span className="text-[10px] font-semibold text-slate-300">Rel</span>
        </div>
        <span className="text-[10px] text-slate-500">Release</span>
      </div>
    </div>
  )
}

export function TrustPrimitives() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  }

  return (
    <section id="primitives" className="py-[clamp(80px,10vh,140px)] px-[clamp(1.5rem,5vw,4rem)] bg-[#1A1A1A]">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
          <SectionHeader
            label="TRUST PRIMITIVES"
            headline="Guardrail yang terasa di operasi harian."
            dark
          />
          <p className="text-slate-400 text-lg max-w-[400px] lg:text-right">
            Dibuat untuk operator: status jelas, aksi jelas, log jelas.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {primitives.map((primitive) => {
            const colors = accentColors[primitive.accent]
            return (
              <motion.div
                key={primitive.title}
                variants={cardVariants}
                className={`glass-dark rounded-2xl p-8 border border-[#334155] transition-all duration-300 ${colors.border} ${colors.glow} ${
                  primitive.featured ? 'md:col-span-2 lg:col-span-2 lg:row-span-2' : ''
                }`}
              >
                <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center mb-5`}>
                  <primitive.icon className={`w-5 h-5 ${colors.tint}`} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {primitive.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {primitive.description}
                </p>
                {primitive.featured && <EscrowDiagram />}
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
