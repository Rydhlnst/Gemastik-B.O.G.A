import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  label: string
  headline: string
  subheadline?: string
  dark?: boolean
  centered?: boolean
  className?: string
}

export function SectionHeader({ label, headline, subheadline, dark = false, centered = false, className }: SectionHeaderProps) {
  return (
    <div className={cn(
      'max-w-[700px]',
      centered && 'mx-auto text-center',
      className
    )}>
      <p className={cn(
        'text-xs font-medium tracking-[0.12em] uppercase mb-5',
        dark ? 'text-teal-400' : 'text-teal-600'
      )}>
        {label}
      </p>
      <h2 className={cn(
        'text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[1.1] tracking-[-0.02em]',
        dark ? 'text-white' : 'text-slate-800'
      )}>
        {headline}
      </h2>
      {subheadline && (
        <p className={cn(
          'mt-5 text-lg leading-relaxed',
          dark ? 'text-slate-400' : 'text-slate-500'
        )}>
          {subheadline}
        </p>
      )}
    </div>
  )
}
