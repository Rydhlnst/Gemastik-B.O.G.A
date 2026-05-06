import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wallet, Users, ShoppingCart, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function SppgAdminDashboard() {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      
      {/* ── HEADER ── */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "#213555" }}>
            Dashboard Eksekutif
          </h1>
          <p className="mt-1" style={{ color: "#3E5879" }}>
            Satuan Pelayanan Pangan Gizi - Wilayah Jawa Barat
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="h-10 rounded-xl font-semibold"
            style={{ borderColor: "#D8C4B6", color: "#3E5879" }}
          >
            Unduh Laporan Bulanan
          </Button>
          <Button 
            className="h-10 rounded-xl font-bold text-white shadow-lg"
            style={{ backgroundColor: "#213555" }}
          >
            Buat PO Baru
          </Button>
        </div>
      </div>

      {/* ── QUICK STATS (GRID 4 KOLOM) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Anggaran */}
        <Card className="rounded-2xl border shadow-sm" style={{ backgroundColor: "#F5EFE7", borderColor: "#D8C4B6" }}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider" style={{ color: "#3E5879" }}>Anggaran Tersisa</p>
                <h3 className="text-2xl font-black mt-1" style={{ color: "#213555" }}>Rp 12.5 M</h3>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "#F5EFE7", color: "#3E5879" }}>
                <Wallet size={24} />
              </div>
            </div>
            <p className="text-xs font-semibold mt-4 flex items-center gap-1 text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Aman hingga Q3
            </p>
          </CardContent>
        </Card>

        {/* Vendor */}
        <Card className="rounded-2xl border shadow-sm" style={{ backgroundColor: "#F5EFE7", borderColor: "#D8C4B6" }}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider" style={{ color: "#3E5879" }}>Vendor Aktif</p>
                <h3 className="text-2xl font-black mt-1" style={{ color: "#213555" }}>
                  42 <span className="text-sm font-medium" style={{ color: "#3E5879" }}>Mitra</span>
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "#F5EFE7", color: "#3E5879" }}>
                <Users size={24} />
              </div>
            </div>
            <p className="text-xs font-semibold text-amber-500 mt-4 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              3 Menunggu Verifikasi
            </p>
          </CardContent>
        </Card>

        {/* PO Berjalan */}
        <Card className="rounded-2xl border shadow-sm" style={{ backgroundColor: "#F5EFE7", borderColor: "#D8C4B6" }}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider" style={{ color: "#3E5879" }}>PO Berjalan</p>
                <h3 className="text-2xl font-black mt-1" style={{ color: "#213555" }}>
                  128 <span className="text-sm font-medium" style={{ color: "#3E5879" }}>Pesanan</span>
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "#F5EFE7", color: "#3E5879" }}>
                <ShoppingCart size={24} />
              </div>
            </div>
            <p className="text-xs font-semibold mt-4 flex items-center gap-1" style={{ color: "#3E5879" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              Bulan ini
            </p>
          </CardContent>
        </Card>

        {/* Anomali */}
        <Card className="rounded-2xl border shadow-sm" style={{ backgroundColor: "#F5EFE7", borderColor: "#D8C4B6" }}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider" style={{ color: "#3E5879" }}>Anomali QC</p>
                <h3 className="text-2xl font-black text-red-600 mt-1">
                  2 <span className="text-sm font-medium text-red-400">Laporan</span>
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                <AlertTriangle size={24} />
              </div>
            </div>
            <p className="text-xs font-semibold text-red-600 mt-4 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
              Perlu tindakan segera
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── AREA BAWAH ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Kiri */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border shadow-sm h-full" style={{ backgroundColor: "#F5EFE7", borderColor: "#D8C4B6" }}>
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between" style={{ borderColor: "#D8C4B6" }}>
              <div>
                <CardTitle className="text-lg font-bold" style={{ color: "#213555" }}>Menunggu Persetujuan</CardTitle>
                <CardDescription style={{ color: "#3E5879" }}>Dokumen dan vendor yang butuh tanda tangan Anda.</CardDescription>
              </div>
              <Link href="/sppg/admin/approvals" className="text-sm font-bold flex items-center gap-1 hover:underline" style={{ color: "#3E5879" }}>
                Lihat Semua <ArrowRight size={16} />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y" style={{ borderColor: "#F5EFE7" }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 flex items-center justify-between transition-colors cursor-pointer hover:bg-[#F5EFE7]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold" style={{ backgroundColor: "#F5EFE7", color: "#3E5879" }}>
                        P{i}
                      </div>
                      <div>
                        <p className="font-bold text-sm" style={{ color: "#213555" }}>PO-3273-000{i}</p>
                        <p className="text-xs" style={{ color: "#3E5879" }}>PT. Pangan Nusantara • Tagihan Pelunasan</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase" style={{ backgroundColor: "#F5EFE7", color: "#3E5879", border: "1px solid #D8C4B6" }}>
                        Pending Sign
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan */}
        <div className="space-y-6">
          <Card className="rounded-2xl border shadow-sm" style={{ backgroundColor: "#F5EFE7", borderColor: "#D8C4B6" }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold" style={{ color: "#213555" }}>Status Node B.O.G.A</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span className="text-sm font-semibold" style={{ color: "#213555" }}>D1 Database Sync</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-500">14ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span className="text-sm font-semibold" style={{ color: "#213555" }}>Smart Contract</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-500">Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                    <span className="text-sm font-semibold" style={{ color: "#213555" }}>Audit Trail IPFS</span>
                  </div>
                  <span className="text-xs font-bold text-amber-500">Syncing...</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
