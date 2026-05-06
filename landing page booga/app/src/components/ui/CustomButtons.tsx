import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PrimaryButtonProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  icon?: boolean
}

export function PrimaryButton({ children, className, onClick, icon = true }: PrimaryButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center gap-2 px-7 py-3.5',
        'bg-teal-600 text-white font-semibold text-[0.9375rem]',
        'rounded-xl transition-all duration-250 ease-out',
        'hover:scale-[1.03] hover:shadow-teal-glow hover:brightness-110',
        'active:scale-[0.98]',
        className
      )}
    >
      {children}
      {icon && <ArrowRight className="w-4 h-4" />}
    </button>
  )
}

interface SecondaryButtonProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  dark?: boolean
}

export function SecondaryButton({ children, className, onClick, dark = false }: SecondaryButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center gap-2 px-7 py-3.5',
        'font-semibold text-[0.9375rem] rounded-xl',
        'border-[1.5px] transition-all duration-250 ease-out',
        'hover:bg-teal-50 hover:border-teal-600 hover:text-teal-700',
        dark
          ? 'border-white/60 text-white hover:bg-white/10 hover:border-white'
          : 'border-slate-300 text-slate-700',
        className
      )}
    >
      {children}
    </button>
  )
}
