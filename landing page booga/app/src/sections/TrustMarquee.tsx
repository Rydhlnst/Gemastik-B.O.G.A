import { Shield, CheckCircle, BarChart3, Lock, Zap, ScanLine } from 'lucide-react'

const badges = [
  { icon: Shield, label: 'Transparansi' },
  { icon: CheckCircle, label: 'Audit trail dari PO sampai delivery' },
  { icon: BarChart3, label: 'Ketertiban Proses' },
  { icon: Lock, label: 'Gate + role-based verification' },
  { icon: Zap, label: 'Keputusan Cepat' },
  { icon: ScanLine, label: 'Signal operasional yang ringkas' },
]

function BadgeItem({ icon: Icon, label }: { icon: typeof Shield; label: string }) {
  return (
    <div className="flex items-center gap-2.5 bg-white border border-[#E2E8F0] rounded-full px-5 py-2.5 shrink-0">
      <Icon className="w-4 h-4 text-teal-600" />
      <span className="text-sm font-medium text-slate-700 whitespace-nowrap">{label}</span>
    </div>
  )
}

function MarqueeRow({ reverse = false }: { reverse?: boolean }) {
  const items = [...badges, ...badges, ...badges, ...badges]
  return (
    <div className={`marquee-container overflow-hidden ${reverse ? 'mt-3' : ''}`}>
      <div
        className={`marquee-track flex gap-4 ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}
        style={{ width: 'max-content' }}
      >
        {items.map((badge, i) => (
          <BadgeItem key={`${badge.label}-${i}`} icon={badge.icon} label={badge.label} />
        ))}
      </div>
    </div>
  )
}

export function TrustMarquee() {
  return (
    <section className="py-12 md:py-16 bg-[#FAFAF7] border-y border-[#E2E8F0]">
      <MarqueeRow />
      <MarqueeRow reverse />
    </section>
  )
}
