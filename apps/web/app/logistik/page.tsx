"use client";

import Link from "next/link";
import { AnimatedScene } from "@/components/ui/animatedbg";
import dynamic from "next/dynamic";
import { Truck, Zap, Package } from "lucide-react";

const LogistikMap = dynamic(() => import("@/components/ui/LogistikMap"), { ssr: false });

export default function LogistikDashboard() {
  return (
    <div className="w-full min-h-screen bg-[#f8fafc] font-sans">
      <div className="w-full h-[300px] relative overflow-hidden bg-white border-b border-green-500/10">
        <div className="absolute inset-0 opacity-40"><AnimatedScene /></div>
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50/50" />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-24 pb-12 flex flex-col justify-end h-full">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase text-green-600">
              Panel Pengiriman
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#0a0e1a] tracking-tight">
            Dashboard Logistik
          </h1>
          <p className="text-sm text-gray-500 mt-3 max-w-xl">
            Sistem Kendali Operasional dan Distribusi B.O.G.A. Lacak armada kirim, rute optimasi harian, dan indikator penyelesaian tepat waktu secara *real-time*.
          </p>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Truk Beroperasi", val: "142 Unit", sub: "Aktif di Jalan", Icon: Truck },
            { label: "Rasio Ketepatan Waktu", val: "99.2%", sub: "Sesuai SLA", Icon: Zap },
            { label: "Paket Terdistribusi", val: "2,400", sub: "Hari ini", Icon: Package },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 group-hover:scale-110 transition-transform">
                  <stat.Icon className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                <h3 className="text-2xl font-extrabold text-[#0a0e1a]">{stat.val}</h3>
                <p className="text-[11px] text-green-500 font-semibold mt-1">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Area Pemantauan Distribusi Ekstensif</h3>
              <p className="text-sm text-gray-500 mt-1">Pemetaan lintasan kiriman antara Sekolah Penerima dan Mitra Dapur Pusat.</p>
            </div>
            <Link href="/">
              <button className="px-4 py-2 border border-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors">
                Kembali
              </button>
            </Link>
          </div>
          
          <div className="w-full">
            <LogistikMap />
          </div>
        </div>
      </div>
    </div>
  );
}
