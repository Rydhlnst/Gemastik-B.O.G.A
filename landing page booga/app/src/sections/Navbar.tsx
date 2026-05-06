import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown } from 'lucide-react'
import { PrimaryButton } from '@/components/ui/CustomButtons'
import { cn } from '@/lib/utils'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Home', href: '#' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Primitives', href: '#primitives' },
    { label: 'Roles', href: '#roles' },
    { label: 'Portals', href: '#', hasDropdown: true },
  ]

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 h-[72px] transition-all duration-300',
        scrolled
          ? 'bg-[rgba(250,250,247,0.85)] backdrop-blur-[16px] border-b border-[#E2E8F0]'
          : 'bg-transparent'
      )}
    >
      <div className="h-full max-w-[1400px] mx-auto px-6 lg:px-10 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-600 rounded-[10px] flex items-center justify-center text-white font-bold text-sm">
            B
          </div>
          <span className={cn(
            'font-semibold text-sm tracking-[-0.01em] transition-colors',
            scrolled ? 'text-slate-800' : 'text-white'
          )}>
            B.O.G.A
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={cn(
                'flex items-center gap-1 text-sm font-medium transition-colors hover:text-teal-600',
                scrolled ? 'text-slate-600' : 'text-white/80 hover:text-white'
              )}
            >
              {link.label}
              {link.hasDropdown && <ChevronDown className="w-3.5 h-3.5" />}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:block">
          <PrimaryButton className="py-2.5 px-5 text-sm" icon={false}>
            Masuk
          </PrimaryButton>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={cn(
            'md:hidden p-2 rounded-lg transition-colors',
            scrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/10'
          )}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="md:hidden bg-[rgba(250,250,247,0.95)] backdrop-blur-[16px] border-b border-[#E2E8F0] overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between py-3 px-4 rounded-xl text-slate-700 font-medium hover:bg-slate-100 transition-colors"
                >
                  {link.label}
                  {link.hasDropdown && <ChevronDown className="w-4 h-4" />}
                </a>
              ))}
              <div className="mt-3">
                <PrimaryButton className="w-full" icon={false}>
                  Masuk
                </PrimaryButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
