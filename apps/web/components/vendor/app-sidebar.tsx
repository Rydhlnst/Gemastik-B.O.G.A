"use client";

import { Gavel, LayoutDashboard, ScrollText } from "lucide-react";

import { RoleAppSidebar } from "@/components/dashboard/role-app-sidebar";

export function AppSidebar() {
  return (
    <RoleAppSidebar
      roleLabel="Portal Vendor"
      homeHref="/vendor/dashboard"
      items={[
        { label: "Dashboard", href: "/vendor/dashboard", icon: LayoutDashboard },
        { label: "Tender", href: "/vendor/tender", icon: ScrollText },
        { label: "Bidding", href: "/vendor/bidding", icon: Gavel },
      ]}
    />
  );
}

