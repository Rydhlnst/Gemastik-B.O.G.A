"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { CalendarIcon, Package, Factory, BarChart3, ShieldCheck, RefreshCw, Zap } from "lucide-react"
import { type DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import VendorRanking from "@/components/ui/vendorranking"
import FlowingMenu from "@/components/ui/flowmenu"

const items = [
  { Icon: Package,     name: "Freight Forwarding",      desc: "Pengiriman barang komprehensif jalur darat dengan integrasi langsung sistem B.O.G.A." },
  { Icon: Factory,     name: "Warehousing",             desc: "Warehouse bersuhu terjaga (Cold Storage) untuk memastikan kualitas bahan mentah tetap segar." },
  { Icon: BarChart3,   name: "Supply Chain Analytics",  desc: "Insight berbasis data real-time untuk optimalisasi jadwal, efisiensi rute, dan menekan cost logistik." },
  { Icon: ShieldCheck, name: "Cargo Insurance",         desc: "Opsi asuransi terintegrasi untuk keamanan pendistribusian skala besar tiap bulannya." },
  { Icon: RefreshCw,   name: "Returns Management",      desc: "Alur pengembalian sisa bahan dapur yang higienis serta terkontrol standar SOP." },
  { Icon: Zap,         name: "Express Logistics",       desc: "Distribusi kilat khusus bagi darurat suplai dengan SLA maksimum 1 jam keterlambatan." },
];

export default function Services() {
  const [showRanking, setShowRanking] = React.useState(false);
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 20),
    to: addDays(new Date(new Date().getFullYear(), 0, 20), 20),
  })

  return (
    <div className="bg-white min-h-screen">
      {/* Header section */}
      <section className="py-12 md:py-24 px-6 md:px-16" style={{ background: "linear-gradient(135deg, #0a0e28 0%, #0d1a4a 100%)" }}>
        <div className="max-w-4xl mx-auto pt-8">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#a5b4fc" }}>Jaringan B.O.G.A</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4 font-sans">
            Layanan Logistik & Vendor Terpadu
          </h1>
          <p className="text-sm md:text-base text-indigo-200/80 max-w-2xl leading-relaxed mb-6">
            Mengeksplorasi ekosistem mitra logistik, penyedia katering, dan rantai pasokan bahan bergizi yang transparan dan akuntabel di seluruh sekolah.
          </p>
          <div className="w-16 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" />
        </div>
      </section>

      {/* Services grid */}
      <section className="py-12 md:py-16 px-6 md:px-16 bg-[#f8faff]">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item.name} className="bg-white rounded-2xl p-7 border border-indigo-500/10 shadow-[0_4px_24px_rgba(99,102,241,0.06)] hover:shadow-lg transition-shadow">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg,#ede9fe,#cffafe)" }}>
                <item.Icon className="w-5 h-5 text-indigo-500" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{item.name}</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed m-0">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vendor Ranking Section - Dark Mode matching theme */}
      <section className={`bg-[#0a0a0a] relative overflow-hidden flex flex-col justify-center transition-all duration-700 ${!showRanking ? 'py-0' : 'py-16 md:py-24 px-6 md:px-16 min-h-[500px]'}`}>
        
        {!showRanking ? (
          <div className="relative w-full h-[250px] md:h-[350px] border-y border-white/10 overflow-hidden">
            <FlowingMenu
              items={[
                { text: "Buka Data Performa Vendor", link: "#", onClick: () => setShowRanking(true) }
              ]}
              speed={25}
              bgColor="#000000"
              marqueeBgColor="#000000"
              textColor="#ffffff"
              marqueeTextColor="#ffffff"
              borderColor="rgba(255,255,255,0.1)"
            />
          </div>
        ) : (
          <div className="max-w-4xl w-full mx-auto relative z-10 animate-in fade-in zoom-in-95 duration-500 -mt-4">
            {/* Glow effect matching index */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 mt-2 relative z-20">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-cyan-400">Transparansi Rantai Pasok</p>
                  <button 
                    onClick={() => setShowRanking(false)}
                    className="text-[10px] font-bold tracking-widest uppercase text-white/50 bg-white/5 border border-white/10 px-2 py-0.5 rounded cursor-pointer hover:bg-white/10 hover:text-white transition-colors"
                  >
                    × Tutup Laporan
                  </button>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  Performa Vendor Tertinggi
                </h2>
              </div>

              {/* Date Picker Filter matching theme */}
              <div className="flex flex-col gap-2">
                <label htmlFor="date-picker-range" className="text-[11px] font-medium text-white/50 uppercase tracking-widest pl-1">
                  Filter Waktu Pengiriman
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="date-picker-range"
                      className="w-full md:w-[260px] justify-start text-left font-normal bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white transition-colors h-10 px-3 cursor-pointer"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-cyan-400" />
                      {date?.from ? (
                        date.to ? (
                          <span className="text-sm">
                            {format(date.from, "dd MMM y")} - {format(date.to, "dd MMM y")}
                          </span>
                        ) : (
                          <span className="text-sm">{format(date.from, "dd MMM y")}</span>
                        )
                      ) : (
                        <span className="text-sm text-white/50">Pilih rentang tanggal</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="relative z-20">
              <VendorRanking />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
