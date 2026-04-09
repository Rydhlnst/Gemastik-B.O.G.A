"use client";

import { useEffect, useState } from "react";
import { columns, LogistikDelivery } from "../../app/logistik/riwayat/columns";
import { DataTable } from "../../app/logistik/riwayat/data-table";
import { deliveryList, vendorSekolahList, vendorList, sekolahList } from "@/lib/mbgdummydata";
import { History, FileText } from "lucide-react";

function mapStatus(status: string) {
  if (status === "delivered") return "Selesai";
  if (status === "on_transit") return "Sedang Dikirim";
  if (status === "pending") return "Diproses";
  return "Kendala";
}

export function HistorySection() {
  const [data, setData] = useState<LogistikDelivery[]>([]);

  useEffect(() => {
    const formattedData = deliveryList.map((delivery) => {
      const vs = vendorSekolahList.find((v) => v.id === delivery.vendor_sekolah_id);
      const vendor = vendorList.find((v) => v.id === vs?.vendor_id);
      const sekolah = sekolahList.find((s) => s.id === vs?.sekolah_id);

      return {
        id: `LOG-INV-${delivery.id.toString().padStart(3, "0")}`,
        vendor: vendor?.nama || "Unknown Vendor",
        sekolah: sekolah?.nama || "Unknown Sekolah",
        porsi: delivery.porsi_dikirim > 0 ? delivery.porsi_dikirim : vs?.porsi_per_hari || 0,
        status: mapStatus(delivery.status) as any,
        waktu: delivery.jam_tiba !== "--" ? `${delivery.jam_tiba} WIB` : `${delivery.jam_target} WIB (Est)`,
      };
    });
    setData(formattedData);
  }, []);

  const handleExportCSV = () => {
    // Define headers
    const headers = ["ID Invoice", "Vendor", "Sekolah Tujuan", "Jumlah Porsi", "Status Pengiriman", "Waktu Kedatangan"];
    
    // Map data to CSV rows
    const rows = data.map(item => [
      item.id,
      `"${item.vendor}"`, // Wrap in quotes to handle commas in names
      `"${item.sekolah}"`,
      item.porsi,
      item.status,
      item.waktu
    ]);

    // Combine into CSV string
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    // Create Blob and Trigger Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().split('T')[0];
    
    link.setAttribute("href", url);
    link.setAttribute("download", `BOGA_Logistik_History_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="module-reveal pt-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Riwayat Pengiriman
          </h2>
          <p className="text-xs text-slate-500 font-medium italic tracking-[0.05em]">Tinjauan rekaman pengantaran logistik harian</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-6 py-2.5 bg-white/30 backdrop-blur-md border border-white/60 border-t-white/80 rounded-xl text-emerald-600 text-[10px] font-black shadow-sm hover:bg-white/50 transition-all uppercase tracking-widest leading-none"
        >
          <FileText className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-white/45 backdrop-blur-[40px] p-5 rounded-[32px] border border-white/60 border-t-white/80 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.25)] overflow-hidden">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
