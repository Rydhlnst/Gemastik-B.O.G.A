import { columns, LogistikDelivery } from "./columns"
import { DataTable } from "./data-table"
import { AnimatedScene } from "@/components/ui/animatedbg"

import { deliveryList, vendorSekolahList, vendorList, sekolahList } from "@/lib/mbgdummydata"

function mapStatus(status: string) {
  if (status === "delivered") return "Selesai"
  if (status === "on_transit") return "Sedang Dikirim"
  if (status === "pending") return "Diproses"
  return "Kendala" // untuk "gagal"
}

async function getData(): Promise<LogistikDelivery[]> {
  // Parsing data dari mbgdummydata.ts
  return deliveryList.map((delivery) => {
    const vs = vendorSekolahList.find((v) => v.id === delivery.vendor_sekolah_id)
    const vendor = vendorList.find((v) => v.id === vs?.vendor_id)
    const sekolah = sekolahList.find((s) => s.id === vs?.sekolah_id)
    
    return {
      id: `LOG-INV-${delivery.id.toString().padStart(3, "0")}`,
      vendor: vendor?.nama || "Unknown Vendor",
      sekolah: sekolah?.nama || "Unknown Sekolah",
      porsi: delivery.porsi_dikirim > 0 ? delivery.porsi_dikirim : (vs?.porsi_per_hari || 0),
      status: mapStatus(delivery.status) as any,
      waktu: delivery.jam_tiba !== "--" ? `${delivery.jam_tiba} WIB` : `${delivery.jam_target} WIB (Est)`,
    }
  })
}

export default async function RiwayatDashboardPage() {
  const data = await getData()

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] font-sans pb-20">
      <div className="w-full h-[280px] relative overflow-hidden bg-white border-b" style={{borderColor: 'rgba(44,110,73,0.12)'}}>
        <div className="absolute inset-0 opacity-40"><AnimatedScene /></div>
        <div className="absolute inset-0 logistik-hero-gradient" />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-32 pb-12 flex flex-col justify-end h-full">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-white/80" />
            <span className="text-xs font-bold tracking-widest uppercase text-white/90">
              Laporan Ekstensif
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Riwayat Pengiriman
          </h1>
          <p className="text-sm text-white/70 mt-3 max-w-2xl">
            Semua riwayat pengantaran makanan bergizi oleh armada logistik boga, ditinjau secara *real-time* termasuk status keberhasilan dan kendala.
          </p>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto pt-10 px-6">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  )
}
