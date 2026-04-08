"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ChevronsUpDown,
  ChevronRight,
  User2,
  LayoutDashboard,
  FileText,
  Activity,
  History,
  PieChart,
  CheckCircle,
  LogOut,
  Settings,
  Bell,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ── Nav items ──────────────────────────────────────────────────────────────
const NAV_MAIN = [
  {
    label: "Dashboard",
    href: "/goverment/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Pengajuan",
    href: "/goverment/pengajuan",
    icon: FileText,
    sub: [
      { label: "Daftar Pengajuan", href: "/goverment/pengajuan" },
      { label: "Buat Pengajuan Baru", href: "/goverment/pengajuan/baru" },
    ],
  },
  {
    label: "Pengawasan",
    href: "/goverment/pengawasan",
    icon: Activity,
  },
  {
    label: "Verifikasi",
    href: "/goverment/verifikasi",
    icon: CheckCircle,
    sub: [
      { label: "Menunggu Verifikasi", href: "/goverment/verifikasi" },
      { label: "Sudah Diverifikasi", href: "/goverment/verifikasi/selesai" },
    ],
  },
  {
    label: "Statistik",
    href: "/goverment/statistik",
    icon: PieChart,
  },
  {
    label: "Riwayat",
    href: "/goverment/riwayat",
    icon: History,
  },
]

const NAV_SECONDARY = [
  { label: "Notifikasi", href: "/goverment/notifikasi", icon: Bell },
  { label: "Pengaturan", href: "/goverment/settings", icon: Settings },
]

// ── Boga Logo SVG ─────────────────────────────────────────────────────────
function BogaLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <defs>
        <linearGradient
          id="boga_sidebar_grad"
          x1="0" y1="0" x2="32" y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#boga_sidebar_grad)" />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fill="white"
        fontSize="17"
        fontFamily="Verdana, Geneva, sans-serif"
        fontWeight="bold"
      >
        B
      </text>
    </svg>
  )
}

// ── Nav Item dengan optional collapsible sub-menu ─────────────────────────
function NavItem({ item }: { item: (typeof NAV_MAIN)[number] }) {
  const pathname = usePathname()
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

  if (item.sub) {
    return (
      <Collapsible defaultOpen={isActive} className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              isActive={isActive}
              tooltip={item.label}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
              <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.sub.map((s) => (
                <SidebarMenuSubItem key={s.href}>
                  <SidebarMenuSubButton asChild isActive={pathname === s.href}>
                    <Link href={s.href}>{s.label}</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    )
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
        <Link href={item.href}>
          <item.icon className="h-4 w-4 shrink-0" />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

// ── Main Sidebar Component ─────────────────────────────────────────────────
export function AppSidebar() {
  const router = useRouter()

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("boga_is_auth")
      localStorage.removeItem("boga_user_role")
    }
    router.push("/auth/login")
  }

  return (
    <Sidebar collapsible="icon">

      {/* ── HEADER — Brand + workspace dropdown ── */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-8"
                >
                  <BogaLogo size={16} />
                  <div className="flex flex-col gap-0.5 leading-none min-w-0">
                    <span className="font-extrabold text-sm bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                      B.O.G.A
                    </span>
                    <span className="text-[11px] text-muted-foreground truncate">
                      Portal Pemerintah
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground shrink-0" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-popper-anchor-width]"
                align="start"
              >
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Instansi
                </DropdownMenuLabel>
                <DropdownMenuItem className="gap-2">
                  <BogaLogo size={20} />
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">B.O.G.A</span>
                    <span className="text-xs text-muted-foreground">Portal Pemerintah</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── CONTENT — Nav scrollable ── */}
      <SidebarContent>
        {/* Nav Utama */}
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_MAIN.map((item) => (
                <NavItem key={item.href} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Nav Sekunder */}
        <SidebarGroup>
          <SidebarGroupLabel>Pengaturan</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_SECONDARY.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── FOOTER — User dropdown (sticky) ── */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center shrink-0">
                    <User2 className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none min-w-0">
                    <span className="font-semibold text-sm truncate">Pengguna</span>
                    <span className="text-xs text-muted-foreground truncate">admin@boga.id</span>
                  </div>
                  <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground shrink-0" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-popper-anchor-width]"
                side="top"
                align="start"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-sm">Pengguna</span>
                    <span className="text-xs text-muted-foreground">admin@boga.id</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/goverment/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Pengaturan Akun
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

    </Sidebar>
  )
}
