const productLinks = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Primitives', href: '#primitives' },
  { label: 'Roles', href: '#roles' },
  { label: 'Portals', href: '#' },
]

const resourceLinks = [
  { label: 'Dokumentasi', href: '#' },
  { label: 'API Reference', href: '#' },
  { label: 'Changelog', href: '#' },
  { label: 'Status', href: '#' },
]

const accountLinks = [
  { label: 'Masuk', href: '#' },
  { label: 'Dashboard', href: '#' },
  { label: 'Support', href: '#' },
]

export function Footer() {
  return (
    <footer className="bg-[#1A1A1A] pt-20 pb-10 px-[clamp(1.5rem,5vw,4rem)]">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-teal-600 rounded-[10px] flex items-center justify-center text-white font-bold text-sm">
                B
              </div>
              <span className="font-semibold text-white text-sm tracking-[-0.01em]">
                B.O.G.A
              </span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Operational supply-chain platform
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5">
              Product
            </h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-slate-500 text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5">
              Resources
            </h4>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-slate-500 text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5">
              Account
            </h4>
            <ul className="space-y-3">
              {accountLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-slate-500 text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#334155] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            (c) 2024 B.O.G.A. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <a href="#" className="text-slate-500 hover:text-white transition-colors">
              Privacy
            </a>
            <span className="text-slate-600">•</span>
            <a href="#" className="text-slate-500 hover:text-white transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
