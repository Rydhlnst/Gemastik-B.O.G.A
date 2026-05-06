"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

// App surfaces (dashboard-like): full height, no marketing footer
const APP_SURFACE_ROUTES = ["/goverment", "/sppg", "/supplier", "/vendor", "/logistik", "/sekolah"];

const NAV_LINKS = [
  { href: "/#how", label: "How it works" },
  { href: "/#primitives", label: "Primitives" },
  { href: "/#roles", label: "Roles" },
];

function Footer() {
  return (
    <footer className="mt-auto border-t bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-9 items-center justify-center rounded-xl bg-foreground text-xs font-semibold text-background">
              B
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight text-foreground">B.O.G.A</p>
              <p className="text-xs text-muted-foreground">Operational supply chain platform</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            ))}
            <Link href="/auth/login" className="transition-colors hover:text-foreground">
              Masuk
            </Link>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>(c) 2026 B.O.G.A. All rights reserved.</span>
          <span>Privacy • Terms</span>
        </div>
      </div>
    </footer>
  );
}

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAppSurface = APP_SURFACE_ROUTES.some((r) => pathname.startsWith(r));
  const isAuth = pathname.startsWith("/auth");
  const isHome = pathname === "/";
  const isContact = pathname === "/contact";

  if (isAppSurface) {
    // App surfaces: full screen, tanpa footer marketing
    return <main className="flex-1 w-full h-screen overflow-hidden">{children}</main>;
  }

  return (
    <>
      <main className="flex-1 w-full">{children}</main>
      {!isAuth && !isHome && !isContact && (
        <Footer />
      )}
    </>
  );
}
