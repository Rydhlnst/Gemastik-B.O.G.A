import {
  LayoutDashboard, ShoppingCart, Users,
  Calculator, FileText, CheckCircle
} from "lucide-react";

import { RoleAppSidebar } from "@/components/dashboard/role-app-sidebar";

export function AppSidebar() {
  const items = [
    { label: "Dashboard", href: "/sppg/admin/dashboard", icon: LayoutDashboard },
    { label: "Pembuatan Kontrak", href: "/sppg/admin/tender/create", icon: FileText },
    { label: "Penyusunan Kontrak", href: "/sppg/admin/tender/list", icon: CheckCircle },
  ];

  return (
    <RoleAppSidebar
      roleLabel="SPPG Admin"
      homeHref="/sppg/admin/dashboard"
      items={items}
    />
  );
}
