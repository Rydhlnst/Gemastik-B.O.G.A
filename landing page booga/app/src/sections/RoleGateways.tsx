import { motion } from 'framer-motion'
import { Landmark, Store, Box, Truck, School, ArrowRight } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { PrimaryButton } from '@/components/ui/CustomButtons'

const roles = [
  {
    name: 'Pemerintah',
    icon: Landmark,
    color: '#0D9488',
    colorClass: 'bg-teal-600',
    textClass: 'text-teal-600',
    hoverClass: 'hover:border-teal-600/40',
    shadowClass: 'hover:shadow-[0_8px_30px_rgba(13,148,136,0.1)]',
  },
  {
    name: 'Vendor',
    icon: Store,
    color: '#F59E0B',
    colorClass: 'bg-amber-500',
    textClass: 'text-amber-500',
    hoverClass: 'hover:border-amber-500/40',
    shadowClass: 'hover:shadow-[0_8px_30px_rgba(245,158,11,0.1)]',
  },
  {
    name: 'SPPG',
    icon: Box,
    color: '#10B981',
    colorClass: 'bg-emerald-500',
    textClass: 'text-emerald-500',
    hoverClass: 'hover:border-emerald-500/40',
    shadowClass: 'hover:shadow-[0_8px_30px_rgba(16,185,129,0.1)]',
  },
  {
    name: 'Logistik',
    icon: Truck,
    color: '#3B82F6',
    colorClass: 'bg-blue-500',
    textClass: 'text-blue-500',
    hoverClass: 'hover:border-blue-500/40',
    shadowClass: 'hover:shadow-[0_8px_30px_rgba(59,130,246,0.1)]',
  },
  {
    name: 'Sekolah',
    icon: School,
    color: '#8B5CF6',
    colorClass: 'bg-violet-500',
    textClass: 'text-violet-500',
    hoverClass: 'hover:border-violet-500/40',
    shadowClass: 'hover:shadow-[0_8px_30px_rgba(139,92,246,0.1)]',
  },
]

export function RoleGateways() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  }

  return (
    <section id="roles" className="py-[clamp(80px,10vh,140px)] px-[clamp(1.5rem,5vw,4rem)] bg-[#FAFAF7]">
      <div className="max-w-[1200px] mx-auto">
        <SectionHeader
          label="ROLE GATEWAYS"
          headline="Masuk sesuai peran, kerja sesuai SOP."
          subheadline="Tiap portal punya tone dan aksen sendiri, tapi pola layout sama: orientasi → status → aksi."
          centered
          className="mb-16"
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {roles.map((role) => (
            <motion.div
              key={role.name}
              variants={cardVariants}
              className={`bg-white border border-[#E2E8F0] rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 ${role.hoverClass} ${role.shadowClass} ${
                role.name === 'Logistik' || role.name === 'Sekolah'
                  ? 'lg:translate-y-8'
                  : ''
              }`}
            >
              <div className={`h-1 ${role.colorClass}`} />
              <div className="p-8">
                <div className={`w-11 h-11 rounded-xl ${role.colorClass}/10 flex items-center justify-center mb-5`}>
                  <role.icon className={`w-5 h-5 ${role.textClass}`} />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  {role.name}
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                  Buka dashboard
                </p>
                <button className={`inline-flex items-center gap-2 text-sm font-medium ${role.textClass} group`}>
                  Mulai
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 max-w-[900px] mx-auto"
        >
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Perlu akses demo cepat?
              </h3>
              <p className="text-slate-500">
                Login sebagai role yang tersedia, lalu eksplor dashboard berdasarkan alur phase.
              </p>
            </div>
            <PrimaryButton className="shrink-0" icon={false}>
              Masuk sekarang
            </PrimaryButton>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
