import {
  LayoutDashboard, Package, ShoppingBag,
  ArrowDownToLine, History, UserCircle, Loader2, Truck,
} from "lucide-react";

import { RoleAppSidebar } from "@/components/dashboard/role-app-sidebar";

interface AppSidebarProps {
  status?: string;
  loading?: boolean;
}

export function AppSidebar({ status = "pending", loading = false }: AppSidebarProps) {
  const allItems = [
    { label: "Dashboard",      href: "/vendor/dashboard", icon: LayoutDashboard },
    { label: "Katalog Saya",   href: "/vendor/katalog",   icon: Package },
    { label: "Pesanan Masuk",  href: "/vendor/pesanan",   icon: ShoppingBag },
    { label: "Inbound Stok",   href: "/vendor/inbound",   icon: ArrowDownToLine },
    { label: "Outbound Stok",  href: "/vendor/outbound",  icon: Truck },
    { label: "Riwayat",        href: "/vendor/riwayat",   icon: History },
    { label: "Profil Saya",    href: "/vendor/profil",    icon: UserCircle },
  ];

  // Filter items if pending
  const visibleItems = (status === "pending" || loading)
    ? allItems.filter(item => item.href === "/vendor/profil")
    : allItems;

  return (
    <RoleAppSidebar
      roleLabel="Portal Vendor"
      homeHref="/vendor/dashboard"
      items={visibleItems}
    />
  );
}
