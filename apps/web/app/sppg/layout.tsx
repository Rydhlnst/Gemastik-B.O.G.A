"use client";

import { AppSidebar } from "@/components/sppg/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function SppgLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-role="sppg" className="role-sppg min-h-svh bg-background text-foreground">
      <div className="flex-1 h-full min-h-0 overflow-y-auto">{children}</div>
    </div>
  );
}
