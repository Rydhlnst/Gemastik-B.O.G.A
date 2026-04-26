import * as React from "react";

import { cn } from "@/lib/utils";

type StatusColor = "success" | "warning" | "danger" | "info" | "pending";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: StatusColor }
> = {
  APPROVED: { label: "Disetujui", color: "success" },
  ACCEPTED: { label: "Disetujui", color: "success" },
  VERIFIED: { label: "Terverifikasi", color: "success" },
  VALID: { label: "Valid", color: "success" },

  PENDING: { label: "Menunggu", color: "warning" },
  WAITING: { label: "Menunggu", color: "warning" },
  REVIEW: { label: "Perlu Review", color: "warning" },
  NEEDS_REVIEW: { label: "Perlu Review", color: "warning" },
  FLAGGED: { label: "Perlu Review", color: "warning" },

  REJECTED: { label: "Ditolak", color: "danger" },
  DECLINED: { label: "Ditolak", color: "danger" },
  FAILED: { label: "Gagal", color: "danger" },
  ERROR: { label: "Gagal", color: "danger" },
  SUSPENDED: { label: "Ditangguhkan", color: "danger" },
  SUSPEND: { label: "Ditangguhkan", color: "danger" },
  BLOCKED: { label: "Diblokir", color: "danger" },

  IN_TRANSIT: { label: "Dalam Pengiriman", color: "info" },
  SHIPPING: { label: "Dalam Pengiriman", color: "info" },
  DELIVERED: { label: "Terkirim", color: "success" },
  COMPLETED: { label: "Selesai", color: "success" },
  DONE: { label: "Selesai", color: "success" },
  FINISHED: { label: "Selesai", color: "success" },

  LOCKED: { label: "Dana Terkunci", color: "warning" },
  RELEASED: { label: "Dana Cair", color: "success" },

  /* Indonesian app statuses */
  LULUS: { label: "Lulus", color: "success" },
  DITERIMA: { label: "Diterima", color: "success" },
  DISETUJUI: { label: "Disetujui", color: "success" },
  TERVERIFIKASI: { label: "Terverifikasi", color: "success" },

  TINJAU: { label: "Perlu Tinjau", color: "warning" },
  DITINJAU: { label: "Perlu Tinjau", color: "warning" },
  PERLU_TINJAU: { label: "Perlu Tinjau", color: "warning" },
  MENUNGGU: { label: "Menunggu", color: "pending" },
  DIPROSES: { label: "Diproses", color: "info" },
  DALAM_PENGIRIMAN: { label: "Dalam Pengiriman", color: "info" },
  SEDANG_DIKIRIM: { label: "Dalam Pengiriman", color: "info" },
  KENDALA: { label: "Kendala", color: "danger" },

  GAGAL: { label: "Gagal", color: "danger" },
  DITOLAK: { label: "Ditolak", color: "danger" },
  DIBLOKIR: { label: "Diblokir", color: "danger" },

  AKTIF: { label: "Aktif", color: "info" },
  NONAKTIF: { label: "Nonaktif", color: "pending" },
  SELESAI: { label: "Selesai", color: "success" },
  SIAP: { label: "Siap", color: "success" },
  SIAP_DIEKSEKUSI: { label: "Siap Dieksekusi", color: "warning" },
};

function colorClasses(color: StatusColor) {
  switch (color) {
    case "success":
      return "bg-status-success-bg text-status-success border-status-success/25";
    case "warning":
      return "bg-status-warning-bg text-status-warning border-status-warning/25";
    case "danger":
      return "bg-status-danger-bg text-status-danger border-status-danger/25";
    case "info":
      return "bg-status-info-bg text-status-info border-status-info/25";
    case "pending":
    default:
      return "bg-status-pending-bg text-status-pending border-status-pending/25";
  }
}

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const normalized = String(status ?? "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
  const config = STATUS_CONFIG[normalized] ?? {
    label: status,
    color: "pending" as const,
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide uppercase",
        colorClasses(config.color),
        className
      )}
    >
      {config.label}
    </span>
  );
}
