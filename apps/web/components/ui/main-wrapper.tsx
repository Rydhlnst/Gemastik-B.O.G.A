"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

// Route yang punya sidebar sendiri — tidak perlu Navbar, Footer, maupun padding top
const SIDEBAR_ROUTES = ["/goverment", "/supplier", "/vendor"];

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/sekolah/mitra", label: "Mitra" },
  { href: "/sekolah/about", label: "About Us" },
  { href: "/sekolah/contact", label: "Contact" },
];

function Footer() {
  return (
    <footer style={{ background: "#0a0e28" }} className="text-white/50 py-8 px-6 md:px-16 flex flex-col md:flex-row justify-between items-center text-sm gap-6 md:gap-0 mt-auto">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold"
          style={{ background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)" }}>B</div>
        <span className="font-bold text-white">B.O.G.A</span>
      </div>
      <div className="flex flex-wrap justify-center gap-4 md:gap-8">
        {NAV_LINKS.map(({ href, label }) => (
          <Link key={href} href={href} className="no-underline text-white/40 hover:text-white/70 transition-colors w-full sm:w-auto text-center">{label}</Link>
        ))}
      </div>
      <span className="text-center">© 2026 B.O.G.A Logistics. All rights reserved.</span>
    </footer>
  );
}

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hasSidebar = SIDEBAR_ROUTES.some((r) => pathname.startsWith(r));
  const isLogistik = pathname.startsWith("/logistik");
  
  if (hasSidebar) {
    // Halaman dashboard: full screen, tanpa padding, tanpa footer
    return <main className="flex-1 w-full h-screen overflow-hidden">{children}</main>;
  }

  return (
    <>
      <main className={`flex-1 w-full ${isLogistik ? "pt-0" : "pt-[100px]"}`}>{children}</main>
      {!isLogistik && <Footer />}
    </>
  );
}
