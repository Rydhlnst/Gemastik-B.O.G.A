"use client";

import { LayoutDashboard } from "lucide-react";

import { RoleAppSidebar } from "@/components/dashboard/role-app-sidebar";

export function AppSidebar() {
  return (
    <RoleAppSidebar
      roleLabel="Portal Supplier"
      homeHref="/sppg/dashboard"
      items={[{ label: "Dashboard", href: "/sppg/dashboard", icon: LayoutDashboard }]}
    />
  );
}

