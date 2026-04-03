import * as React from "react"
import { ChevronDown, FileText, Search, Wallet, UserPlus, Hospital, Building2, Banknote, UserCog } from "lucide-react"
import { Card } from "@/components/ui/card"

export function FloatingSearchBar() {
  const layanans = [
    { name: "Ajukan Klaim", icon: FileText, color: "text-accent" },
    { name: "Cek Status Klaim", icon: Search, color: "text-accent" },
    { name: "Cek Saldo", icon: Wallet, color: "text-accent" },
    { name: "Pendaftaran Peserta", icon: UserPlus, color: "text-neutral-500" },
    { name: "RS/Klinik Kerjasama Kecelakaan Kerja", icon: Hospital, color: "text-accent" },
    { name: "Pelaporan Data Perusahaan", icon: Building2, color: "text-neutral-500" },
    { name: "Pembayaran Iuran", icon: Banknote, color: "text-accent" },
    { name: "Ubah Data Peserta", icon: UserCog, color: "text-neutral-500" },
  ]

  return (
    <div className="relative -mt-16 z-20 container mx-auto px-4 sm:px-6 w-full max-w-5xl">
      <Card className="rounded-xl shadow-2xl bg-white border-0 overflow-hidden">
        
        {/* Search Input Area */}
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center border-b border-neutral-100">
          <div className="flex-grow w-full">
            <label className="text-sm font-semibold text-neutral-800 mb-2 block">Saya Ingin:</label>
            <div className="w-full relative flex items-center bg-transparent border-b-2 border-neutral-200 focus-within:border-primary transition-colors cursor-pointer group pb-2">
              <span className="text-neutral-400 group-hover:text-neutral-600 text-lg sm:text-xl font-medium w-full truncate">
                Pilih Layanan BPJAMSOSTEK
              </span>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-primary w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Layanan Grid */}
        <div className="p-6 md:p-8 pb-10">
          <h2 className="text-2xl font-bold text-neutral-800 mb-6 tracking-tight">Layanan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {layanans.map((layanan, i) => (
              <button 
                key={i}
                className="flex items-center gap-4 bg-white border border-neutral-200/80 hover:border-primary/50 hover:shadow-md transition-all rounded-xl p-4 text-left group"
              >
                <div className="bg-neutral-50 group-hover:bg-primary/5 p-3 rounded-lg transition-colors">
                  <layanan.icon className={`w-6 h-6 ${layanan.color}`} />
                </div>
                <span className="text-sm font-semibold text-neutral-700 leading-tight">
                  {layanan.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
