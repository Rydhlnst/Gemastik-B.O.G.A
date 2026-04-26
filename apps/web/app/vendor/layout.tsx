"use client";

import { AppSidebar } from "@/components/vendor/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-role="vendor" className="role-vendor min-h-svh bg-background text-foreground">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="sticky top-0 z-20 flex h-12 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:hidden">
            <SidebarTrigger />
            <div className="text-sm font-semibold text-foreground">B.O.G.A</div>
          </div>
          <div className="flex-1 h-full min-h-0 overflow-y-auto">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
