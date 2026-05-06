"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { LogOut } from "lucide-react";

import { cn } from "@/lib/utils";
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
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

type RoleNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  match?: "exact" | "prefix";
};

function isActivePath(pathname: string, href: string, match: RoleNavItem["match"]) {
  if (match === "exact") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

function RoleMark({ text }: { text: string }) {
  const letter = text.trim().slice(0, 1).toUpperCase() || "B";
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] bg-role-accent text-role-primary text-xs font-semibold shadow-card border border-border">
      {letter}
    </div>
  );
}

export function RoleAppSidebar({
  appName = "B.O.G.A",
  roleLabel,
  homeHref,
  items,
}: {
  appName?: string;
  roleLabel: string;
  homeHref: string;
  items: RoleNavItem[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleSidebar, state } = useSidebar();

  const clearCookie = (name: string) => {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("boga_is_auth");
      localStorage.removeItem("boga_user_role");
      clearCookie("boga_is_auth");
      clearCookie("boga_user_role");
    }
    router.push("/auth/login");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="gap-2">
        <div className="flex items-center justify-between px-2">
          {state === "expanded" ? (
            <>
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-[var(--radius-md)] shrink-0 transition-opacity hover:opacity-80"
                  aria-label="Toggle Sidebar"
                >
                  <RoleMark text={appName} />
                </button>
                <Link
                  href={homeHref}
                  className="min-w-0 leading-tight rounded-[var(--radius-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <div className="text-sm font-semibold text-sidebar-foreground truncate hover:text-sidebar-foreground/80 transition-colors">
                    {appName}
                  </div>
                  <div className="text-xs text-sidebar-foreground/70 truncate">
                    {roleLabel}
                  </div>
                </Link>
              </div>
              <SidebarTrigger className="text-sidebar-foreground/70 hover:text-sidebar-foreground" />
            </>
          ) : (
            <div className="flex items-center justify-center w-full">
              <SidebarTrigger className="text-sidebar-foreground/70 hover:text-sidebar-foreground" />
            </div>
          )}
        </div>

        <SidebarSeparator />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigasi</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = isActivePath(pathname, item.href, item.match);
                return (
                  <SidebarMenuItem key={item.href} className="group/menu-item">
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                      className={cn(
                        "transition-colors border-l-2 border-transparent text-sidebar-foreground/80",
                        "group-hover/menu-item:bg-sidebar-accent group-hover/menu-item:text-sidebar-accent-foreground",
                        "data-[active=true]:bg-white data-[active=true]:text-[#213555] data-[active=true]:border-white data-[active=true]:shadow-sm"
                      )}
                    >
                      <Link href={item.href} className="min-w-0">
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Button
          type="button"
          variant="ghost"
          onClick={handleLogout}
          className="justify-start gap-2 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <LogOut className="h-4 w-4" />
          <span className="group-data-[collapsible=icon]:hidden">Keluar</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
