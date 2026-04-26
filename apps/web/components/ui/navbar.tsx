"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import Image from "next/image";
import { LayoutDashboard, LogOut, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { authClient } from "@/lib/auth-browser-client";

const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#how", label: "How it works" },
  { href: "#primitives", label: "Primitives" },
  { href: "#roles", label: "Roles" },
];

const ROLE_PORTALS = [
  {
    id: "goverment",
    label: "Pemerintah",
    desc: "Verifikasi & pengawasan program",
    accent: "#B45309",
    imageSrc: "/mbg1.png",
    href: "/goverment/dashboard",
    links: [
      { label: "Dashboard", href: "/goverment/dashboard" },
      { label: "Verifikasi", href: "/goverment/verifikasi" },
      { label: "Statistik", href: "/goverment/statistik" },
    ],
  },
  {
    id: "sppg",
    label: "SPPG",
    desc: "Buat tender & pilih vendor",
    accent: "#9A3412",
    imageSrc: "/mbg4.png",
    href: "/sppg/dashboard",
    links: [
      { label: "Dashboard", href: "/sppg/dashboard" },
      { label: "Bidding Vendor", href: "/sppg/bidding" },
      { label: "Buat Tender", href: "/sppg/bidding" },
    ],
  },
  {
    id: "vendor",
    label: "Vendor",
    desc: "Ajukan penawaran & pantau tender",
    accent: "#065F46",
    imageSrc: "/mbg1.png",
    href: "/vendor/dashboard",
    links: [
      { label: "Dashboard", href: "/vendor/dashboard" },
      { label: "Tender", href: "/vendor/tender" },
      { label: "Bids", href: "/vendor/bidding" },
    ],
  },
  {
    id: "logistik",
    label: "Logistik",
    desc: "Pantau distribusi & rute",
    accent: "#155E75",
    imageSrc: "/mbg2.png",
    href: "/logistik/dashboard",
    links: [
      { label: "Dashboard", href: "/logistik/dashboard" },
      { label: "Pantau", href: "/logistik/pantau" },
      { label: "Riwayat", href: "/logistik/riwayat" },
    ],
  },
  {
    id: "sekolah",
    label: "Sekolah",
    desc: "Penerimaan & evaluasi",
    accent: "#1E3A8A",
    imageSrc: "/mbg3.png",
    href: "/sekolah/admin",
    links: [
      { label: "Admin", href: "/sekolah/admin" },
      { label: "Siswa", href: "/sekolah/siswa" },
      { label: "Dashboard", href: "/sekolah/admin" },
    ],
  },
] as const;

function dashboardHrefByRole(role: string) {
  if (role === "admin") return "/goverment/dashboard";
  if (role === "sppg") return "/sppg/dashboard";
  if (role === "logistik") return "/logistik/dashboard";
  if (role === "sekolah") return "/sekolah/admin";
  if (role === "vendor") return "/vendor/dashboard";
  return "/";
}

export default function Navbar() {
  const pathname = usePathname();

  const isHomePage = pathname === "/";
  const isAuthPage = pathname.startsWith("/auth");
  const isAppRoute = ["/goverment", "/sppg", "/supplier", "/vendor", "/logistik", "/sekolah"].some((r) =>
    pathname.startsWith(r)
  );

  const sessionState = authClient.useSession();
  const session = sessionState.data;
  const userRole = (session?.user as { appRole?: string } | undefined)?.appRole ?? "";
  const dashboardHref = dashboardHrefByRole(userRole);

  const mobileLinks = useMemo(() => {
    if (!isHomePage) return [{ href: "/", label: "Home" }];
    return NAV_LINKS;
  }, [isHomePage]);

  const handleLogout = () => {
    void authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/";
        },
      },
    });
  };

  if (isAuthPage || isAppRoute) return null;

  return (
    <header
      className={
        isHomePage
          ? "absolute inset-x-0 top-0 z-50"
          : "sticky top-0 z-50 border-b bg-background/80 backdrop-blur"
      }
    >
      <div
        className={
          "mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 md:px-6"
        }
      >
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span
              className={
                isHomePage
                  ? "inline-flex size-8 items-center justify-center rounded-lg bg-white/10 text-xs font-semibold text-white ring-1 ring-white/15 backdrop-blur"
                  : "inline-flex size-8 items-center justify-center rounded-lg bg-foreground text-xs font-semibold text-background"
              }
            >
              B
            </span>
            <span
              className={
                isHomePage
                  ? "text-sm font-semibold tracking-tight text-white"
                  : "text-sm font-semibold tracking-tight text-foreground"
              }
            >
              B.O.G.A
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={isHomePage ? item.href : "/"}
                className={
                  isHomePage
                    ? "rounded-md px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
                    : "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                }
              >
                {item.label}
              </Link>
            ))}

            <NavigationMenu className="ml-1">
              <NavigationMenuList className="space-x-1">
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={
                      isHomePage
                        ? "h-auto bg-transparent px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white data-[state=open]:bg-white/10 data-[state=open]:text-white"
                        : "h-auto bg-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground focus:bg-muted/40 focus:text-foreground data-[state=open]:bg-muted/40 data-[state=open]:text-foreground"
                    }
                  >
                    Portals
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="md:w-[760px]">
                    <div className="grid gap-4 p-4 md:grid-cols-[260px_1fr] md:p-5">
                      <div className="overflow-hidden rounded-3xl bg-slate-950 text-white ring-1 ring-white/10">
                        <div className="relative h-28">
                          <Image
                            src="/mbg3.png"
                            alt=""
                            fill
                            sizes="260px"
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />
                          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#1D4ED8] via-[#1E40AF] to-transparent" />
                          <div className="absolute bottom-3 left-4 right-4">
                            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/70">
                              Role preview
                            </p>
                            <p className="mt-1 text-base font-extrabold tracking-tight">
                              Buka portal sesuai peran
                            </p>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-white/70">
                            Lihat fitur inti tiap role: bidding, logistik, penerimaan sekolah, dan pengawasan.
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Link
                              href="/auth/login"
                              className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-white/90"
                            >
                              Pilih role & masuk
                            </Link>
                            <Link
                              href={isHomePage ? "#how" : "/#how"}
                              className="inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15"
                            >
                              Lihat flow phase
                            </Link>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        {ROLE_PORTALS.map((role) => (
                          <div
                            key={role.id}
                            className="rounded-3xl bg-white/70 backdrop-blur ring-1 ring-black/5 p-3 shadow-sm shadow-black/5"
                          >
                            <div className="flex items-start gap-3">
                              <div className="relative h-12 w-12 overflow-hidden rounded-2xl ring-1 ring-black/5">
                                <Image
                                  src={role.imageSrc}
                                  alt=""
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                                <div className="absolute inset-x-0 top-0 h-1" style={{ background: role.accent }} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="truncate text-sm font-extrabold tracking-tight text-slate-900">
                                    {role.label}
                                  </p>
                                  <Link
                                    href={role.href}
                                    className="shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ring-1 transition"
                                    style={{
                                      color: role.accent,
                                      borderColor: `${role.accent}26`,
                                      background: `${role.accent}0D`,
                                    }}
                                  >
                                    Buka portal
                                  </Link>
                                </div>
                                <p className="mt-0.5 text-xs text-slate-600">
                                  {role.desc}
                                </p>

                                <div className="mt-2 flex flex-wrap gap-2">
                                  {role.links.map((l) => (
                                    <Link
                                      key={l.href}
                                      href={l.href}
                                      className="text-xs font-semibold text-slate-700 transition hover:text-slate-900 hover:underline underline-offset-4"
                                    >
                                      {l.label}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Menu className="size-4" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-4 grid gap-2">
                  {mobileLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={isHomePage ? item.href : item.href}
                      className="rounded-xl border bg-background px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/40"
                    >
                      {item.label}
                    </Link>
                  ))}

                  <div className="pt-2">
                    <p className="px-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-muted-foreground">
                      Portal roles
                    </p>
                    <div className="mt-2 grid gap-2">
                      {ROLE_PORTALS.map((r) => (
                        <Link
                          key={r.id}
                          href={r.href}
                          className="flex items-center gap-3 rounded-2xl border bg-background px-4 py-3 text-left hover:bg-muted/40"
                        >
                          <div className="relative h-10 w-10 overflow-hidden rounded-xl ring-1 ring-black/5">
                            <Image src={r.imageSrc} alt="" fill sizes="40px" className="object-cover" />
                            <div className="absolute inset-x-0 top-0 h-1" style={{ background: r.accent }} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-transparent" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">{r.label}</p>
                            <p className="truncate text-xs text-muted-foreground">{r.desc}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {session?.user ? (
                    <>
                      <Link
                        href={dashboardHref}
                        className="rounded-xl border bg-background px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/40"
                      >
                        Dashboard
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded-xl border bg-background px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted/40"
                      >
                        Keluar
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/auth/login"
                      className="rounded-xl border bg-background px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/40"
                    >
                      Masuk
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
                >
                  <span className="inline-flex size-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                    {(session.user.name || "U").slice(0, 1).toUpperCase()}
                  </span>
                  <span className="hidden max-w-[140px] truncate md:block">{session.user.name || "Akun"}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                <div className="px-2 py-1.5">
                  <p className="text-xs font-semibold text-foreground">Signed in</p>
                  <p className="text-xs text-muted-foreground capitalize">{userRole || "user"}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={dashboardHref}>
                    <LayoutDashboard className="size-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut className="size-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              asChild
              className={
                isHomePage
                  ? "hidden rounded-full bg-white text-slate-900 hover:bg-white/90 md:inline-flex"
                  : "hidden rounded-full md:inline-flex"
              }
              variant={isHomePage ? "secondary" : "default"}
            >
              <Link href="/auth/login">Masuk</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
