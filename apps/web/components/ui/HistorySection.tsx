import { InteractiveLogsTable } from "./interactive-logs-table-shadcnui";
import { deliveryList, vendorSekolahList, vendorList, sekolahList } from "@/lib/mbgdummydata";
import { useMemo } from "react";

export function HistorySection({ isLoading = false }: { isLoading?: boolean }) {
  const mappedLogs = useMemo(() => {
    return deliveryList.map((delivery) => {
      const vs = vendorSekolahList.find((v) => v.id === delivery.vendor_sekolah_id);
      const vendor = vendorList.find((v) => v.id === vs?.vendor_id);
      const sekolah = sekolahList.find((s) => s.id === vs?.sekolah_id);

      let level: "Selesai" | "Diperjalanan" | "Belum" = "Belum";
      let status_code = "200";
      
      if (delivery.status === "delivered") {
        level = "Selesai";
        status_code = "200";
      } else if (delivery.status === "on_transit") {
        level = "Diperjalanan";
        status_code = "warning";
      } else if (delivery.status === "pending") {
        level = "Belum";
        status_code = "201";
      } else {
        level = "Belum";
        status_code = "503";
      }

      return {
        id: delivery.id.toString(),
        timestamp: `${delivery.tanggal}T${delivery.jam_tiba !== "--" ? delivery.jam_tiba : delivery.jam_target}:00Z`,
        level,
        service: vendor?.nama || "Unknown Vendor",
        message: `Pengiriman ke ${sekolah?.nama || "Sekolah"} - ${delivery.catatan || "Operasional Rutin"}`,
        duration: `${delivery.porsi_dikirim} Porsi`,
        status: status_code,
        tags: ["Logistik", vendor?.nama || "Vendor", sekolah?.nama || "Sekolah"],
      };
    }).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white/45 backdrop-blur-[40px] p-5 rounded-[32px] border border-white/60 border-t-white/80 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="space-y-4">
          <div className="h-10 bg-slate-200/50 animate-pulse rounded-xl" />
          <div className="h-10 bg-slate-200/50 animate-pulse rounded-xl" />
          <div className="h-10 bg-slate-200/50 animate-pulse rounded-xl" />
          <div className="h-10 bg-slate-200/50 animate-pulse rounded-xl" />
          <div className="h-10 bg-slate-200/50 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="module-reveal pt-4">
      <InteractiveLogsTable data={mappedLogs} />
    </div>
  );
}
