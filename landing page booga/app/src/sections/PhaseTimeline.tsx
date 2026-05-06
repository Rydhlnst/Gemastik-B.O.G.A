import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'

const phases = [
  {
    phase: 'PHASE 0',
    title: 'Onboarding & Verifikasi',
    description: 'Pilih role, login, lalu proses verifikasi & approval (demo).',
    side: 'left' as const,
  },
  {
    phase: 'PHASE 1',
    title: 'Pengadaan & Escrow Lock',
    description: 'SPPG buat PO + bidding vendor, lalu lock escrow (simulasi).',
    side: 'right' as const,
  },
  {
    phase: 'PHASE 2',
    title: 'Logistik & Validasi',
    description: 'Pantau rute + scan QR manifest di proses pickup/delivery (demo).',
    side: 'left' as const,
  },
  {
    phase: 'PHASE 3',
    title: 'Penerimaan Sekolah',
    description: 'Sekolah scan manifest untuk konfirmasi penerimaan (demo).',
    side: 'right' as const,
  },
  {
    phase: 'PHASE 4',
    title: 'Evaluasi & Reputasi',
    description: 'Ranking, performa, dan feedback siswa untuk reputasi vendor/SPPG.',
    side: 'left' as const,
  },
]

export function PhaseTimeline() {
  return (
    <section id="how-it-works" className="py-[clamp(80px,10vh,140px)] px-[clamp(1.5rem,5vw,4rem)] bg-[#FAFAF7]">
      <SectionHeader
        label="HOW IT WORKS"
        headline="Phase-based, bukan 'dashboard penuh kartu'."
        subheadline="Setiap phase punya satu tujuan, satu bukti, dan satu status yang mudah dibaca."
        centered
        className="mb-20"
      />

      <div className="max-w-[1000px] mx-auto relative">
        {/* Center line - desktop */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#E2E8F0] -translate-x-1/2" />
        
        {/* Left line - mobile */}
        <div className="md:hidden absolute left-4 top-0 bottom-0 w-0.5 bg-[#E2E8F0]" />

        <div className="space-y-12 md:space-y-16">
          {phases.map((phase) => (
            <motion.div
              key={phase.phase}
              initial={{ opacity: 0, x: phase.side === 'left' ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className={`relative flex items-start ${
                phase.side === 'left' 
                  ? 'md:flex-row' 
                  : 'md:flex-row-reverse'
              }`}
            >
              {/* Node on timeline */}
              <div className={`absolute z-10 w-4 h-4 rounded-full bg-teal-600 border-4 border-[#FAFAF7] shadow-sm ${
                phase.side === 'left'
                  ? 'left-4 md:left-1/2 md:-translate-x-1/2'
                  : 'left-4 md:left-1/2 md:-translate-x-1/2'
              }`} />

              {/* Card */}
              <div className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${
                phase.side === 'left' ? 'md:mr-auto md:pr-0' : 'md:ml-auto md:pl-0'
              }`}>
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 md:p-8 border-l-[3px] border-l-teal-600 hover:-translate-y-1 hover:shadow-glass-lg transition-all duration-300">
                  <p className="text-xs font-medium tracking-wider text-slate-400 uppercase mb-3">
                    {phase.phase}
                  </p>
                  <h3 className="text-lg md:text-xl font-semibold text-slate-800 mb-3">
                    {phase.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed mb-5">
                    {phase.description}
                  </p>
                  <button className="inline-flex items-center gap-2 text-teal-600 font-medium text-sm hover:underline group">
                    Buka modul
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>

              {/* Spacer for opposite side */}
              <div className="hidden md:block md:w-[calc(50%-2rem)]" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
