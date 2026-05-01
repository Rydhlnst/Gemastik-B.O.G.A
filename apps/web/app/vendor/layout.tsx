"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/vendor/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AlertCircle, Lock, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [status, setStatus] = useState<string>("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      try {
        const vendorId = document.cookie.split("; ").find(row => row.startsWith("boga_vendor_id="))?.split("=")[1];
        if (!vendorId) {
          setLoading(false);
          return;
        }

        const res = await fetch(`http://localhost:3001/api/vendors/${vendorId}`);
        const json = await res.json();

        if (json.status === "success") {
          const dbStatus = json.data.status;
          const mappedStatus = dbStatus === "APPROVED" ? "approved" : "pending";
          setStatus(mappedStatus);
          // Sync cookie for other components
          document.cookie = `boga_vendor_status=${mappedStatus}; path=/`;
        }
      } catch (err) {
        console.error("Failed to fetch vendor status:", err);
      } finally {
        setLoading(false);
      }
    }
    checkStatus();
  }, []);

  const isPending = status === "pending";
  const isProfilePage = pathname === "/vendor/profil";
  const isRestricted = isPending && !isProfilePage && !loading;

  return (
    <div data-role="vendor" className="role-vendor min-h-svh bg-background text-foreground">
      <SidebarProvider>
        <AppSidebar status={status} loading={loading} />
        <SidebarInset>
          {/* Mobile-only top bar */}
          <div className="sticky top-0 z-20 flex h-12 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:hidden">
            <SidebarTrigger />
            <div className="text-sm font-semibold text-foreground">B.O.G.A · Vendor</div>
          </div>
          
          <div className="flex-1 h-full min-h-0 overflow-y-auto">
            {loading ? (
              <div className="flex h-full min-h-[80vh] items-center justify-center">
                <Loader2 size={32} className="animate-spin text-[#065F46]" />
              </div>
            ) : isRestricted ? (
              <div className="flex h-full min-h-[80vh] flex-col items-center justify-center p-6 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-500 shadow-sm border border-amber-100">
                  <Lock size={32} />
                </div>
                <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">Akses Terbatas</h2>
                <p className="mb-8 max-w-md text-muted-foreground">
                  Akun Anda sedang dalam tahap verifikasi oleh tim administrasi B.O.G.A. 
                  Silakan lengkapi profil Anda atau tunggu proses verifikasi selesai (estimasi 1x24 jam).
                </p>
                <Link 
                  href="/vendor/profil" 
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#065F46] px-8 text-sm font-bold text-white shadow-lg shadow-emerald-200 hover:opacity-90 transition-all active:scale-95"
                >
                  Lihat Profil & Status
                </Link>
              </div>
            ) : (
              children
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

