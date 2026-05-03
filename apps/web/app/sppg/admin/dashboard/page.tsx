import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wallet, Users, ShoppingCart, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function SppgAdminDashboard() {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      
      {/* ── HEADER DESKTOP ── */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Dashboard Eksekutif
          </h1>
          <p className="text-slate-500 mt-1">
            Satuan Pelayanan Pangan Gizi - Wilayah Jawa Barat
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-10 rounded-xl font-semibold border-slate-200">
            Unduh Laporan Bulanan
          </Button>
          <Button className="h-10 rounded-xl font-bold bg-[#1E3A8A] text-white hover:bg-[#1E3A8A]/90 shadow-lg shadow-blue-900/20">
            Buat PO Baru
          </Button>
        </div>
      </div>

      {/* ── QUICK STATS (GRID 4 KOLOM) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-2xl border-none shadow-md shadow-slate-200/50 bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Anggaran Tersisa</p>
                <h3 className="text-2xl font-black text-slate-800 mt-1">Rp 12.5 M</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Wallet size={24} />
              </div>
            </div>
            <p className="text-xs font-semibold text-emerald-600 mt-4 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Aman hingga Q3
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-md shadow-slate-200/50 bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Vendor Aktif</p>
                <h3 className="text-2xl font-black text-slate-800 mt-1">42 <span className="text-sm text-slate-400 font-medium">Mitra</span></h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Users size={24} />
              </div>
            </div>
            <p className="text-xs font-semibold text-amber-500 mt-4 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              3 Menunggu Verifikasi
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-md shadow-slate-200/50 bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">PO Berjalan</p>
                <h3 className="text-2xl font-black text-slate-800 mt-1">128 <span className="text-sm text-slate-400 font-medium">Pesanan</span></h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <ShoppingCart size={24} />
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-4 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              Bulan ini
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-md shadow-slate-200/50 bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Anomali QC</p>
                <h3 className="text-2xl font-black text-red-600 mt-1">2 <span className="text-sm text-red-400 font-medium">Laporan</span></h3>
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

      {/* ── AREA BAWAH (2 KOLOM DESKTOP) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Kiri (Lebih Lebar) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border-none shadow-md shadow-slate-200/50 bg-white h-full">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-800">Menunggu Persetujuan</CardTitle>
                <CardDescription>Dokumen dan vendor yang butuh tanda tangan Anda.</CardDescription>
              </div>
              <Link href="/sppg/admin/approvals" className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline">
                Lihat Semua <ArrowRight size={16} />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {/* Dummy Table/List */}
              <div className="divide-y divide-slate-100">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                        P{i}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">PO-3273-000{i}</p>
                        <p className="text-xs text-slate-500">PT. Pangan Nusantara • Tagihan Pelunasan</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700 uppercase">
                        Pending Sign
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan (Lebih Kecil) */}
        <div className="space-y-6">
          <Card className="rounded-2xl border-none shadow-md shadow-slate-200/50 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-slate-800">Status Node B.O.G.A</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span className="text-sm font-semibold text-slate-700">D1 Database Sync</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-500">14ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span className="text-sm font-semibold text-slate-700">Smart Contract</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-500">Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                    <span className="text-sm font-semibold text-slate-700">Audit Trail IPFS</span>
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
