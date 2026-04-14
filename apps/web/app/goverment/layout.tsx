"use client"

import { AppSidebar } from "@/components/goverment/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function GovermentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Konten utama — scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
