"use client";

import { AppSidebar } from "@/components/sppg/admin/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function SppgAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    // Menggunakan data-role="government" untuk mendapatkan tema Dark Navy / Royal Blue
    <div data-role="government" className="role-goverment min-h-svh bg-background text-foreground">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* Mobile-only top bar */}
          <div className="sticky top-0 z-20 flex h-12 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:hidden">
            <SidebarTrigger />
            <div className="text-sm font-semibold text-foreground">B.O.G.A · SPPG Admin</div>
          </div>
          
          <div className="flex-1 h-full min-h-0 overflow-y-auto bg-slate-50">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
