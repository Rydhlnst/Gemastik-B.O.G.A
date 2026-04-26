"use client";

import {
  Activity,
  Bell,
  CheckCircle,
  FileText,
  History,
  LayoutDashboard,
  PieChart,
  Settings,
} from "lucide-react";

import { RoleAppSidebar } from "@/components/dashboard/role-app-sidebar";

export function AppSidebar() {
  return (
    <RoleAppSidebar
      roleLabel="Portal Pemerintah"
      homeHref="/goverment/dashboard"
      items={[
        { label: "Dashboard", href: "/goverment/dashboard", icon: LayoutDashboard },
        { label: "Pengajuan", href: "/goverment/pengajuan", icon: FileText },
        { label: "Pengawasan", href: "/goverment/pengawasan", icon: Activity },
        { label: "Verifikasi", href: "/goverment/verifikasi", icon: CheckCircle },
        {
          label: "Verifikasi Selesai",
          href: "/goverment/verifikasi/selesai",
          icon: CheckCircle,
          match: "exact",
        },
        { label: "Statistik", href: "/goverment/statistik", icon: PieChart },
        { label: "Riwayat", href: "/goverment/riwayat", icon: History },
        { label: "Notifikasi", href: "/goverment/notifikasi", icon: Bell },
        { label: "Pengaturan", href: "/goverment/settings", icon: Settings },
      ]}
    />
  );
}

