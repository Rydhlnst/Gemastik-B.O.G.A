"use client";

import { Gavel, LayoutDashboard } from "lucide-react";

import { RoleAppSidebar } from "@/components/dashboard/role-app-sidebar";

export function AppSidebar() {
  return (
    <RoleAppSidebar
      roleLabel="Portal SPPG"
      homeHref="/sppg/dashboard"
      items={[
        { label: "Dashboard", href: "/sppg/dashboard", icon: LayoutDashboard },
        { label: "Bidding", href: "/sppg/bidding", icon: Gavel },
      ]}
    />
  );
}

