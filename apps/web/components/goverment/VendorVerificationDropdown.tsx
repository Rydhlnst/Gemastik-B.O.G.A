"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  Star,
  Timer,
  XCircle,
} from "lucide-react";

import {
  sppgList,
  vendorList,
  vendorSekolahList,
  type KategoriVendor,
  type Vendor,
} from "@/lib/mbgdummydata";
import { cn } from "@/lib/utils";

type VerificationStatus = "lulus" | "tinjau" | "gagal";

type VendorVerification = {
  status: VerificationStatus;
  requiredCerts: string[];
  missingCerts: string[];
  issues: string[];
  suggestedActions: string[];
};

function requiredCertsFor(kategori: KategoriVendor): string[] {
  switch (kategori) {
    case "katering":
      return ["Halal MUI", "BPOM"];
    case "logistik":
      return ["ISO 9001"];
    case "supplier_bahan":
      return ["Halal MUI"];
    default:
      return [];
  }
}

function verifyVendor(v: Vendor): VendorVerification {
  const requiredCerts = requiredCertsFor(v.kategori);
  const missingCerts = requiredCerts.filter((c) => !v.sertifikasi.includes(c));

  const issues: string[] = [];
  const suggestedActions: string[] = [];

  if (v.status !== "aktif") {
    issues.push(`Status vendor tidak aktif (${v.status}).`);
    suggestedActions.push("Lakukan verifikasi ulang dan aktivasi status vendor.");
  }

  if (missingCerts.length > 0) {
    issues.push(`Sertifikasi wajib belum lengkap: ${missingCerts.join(", ")}.`);
    suggestedActions.push("Unggah dan validasi dokumen sertifikasi wajib.");
  }

  if (v.on_time_rate < 90) {
    issues.push(`On-time rate rendah (${v.on_time_rate.toFixed(1)}%).`);
    suggestedActions.push("Jadwalkan audit SLA dan rencana perbaikan ketepatan waktu.");
  }

  if (v.rating < 4.0) {
    issues.push(`Rating rendah (${v.rating.toFixed(1)}).`);
    suggestedActions.push("Tinjau keluhan operasional dan lakukan tindakan korektif.");
  }

  let status: VerificationStatus = "lulus";
  if (v.status !== "aktif" || missingCerts.length > 0) status = "gagal";
  else if (v.on_time_rate < 95 || v.rating < 4.5) status = "tinjau";

  return {
    status,
    requiredCerts,
    missingCerts,
    issues,
    suggestedActions: Array.from(new Set(suggestedActions)),
  };
}

function statusBadge(status: VerificationStatus) {
  if (status === "lulus") {
    return {
      label: "Lulus",
      cls: "bg-status-success-bg text-status-success border-status-success/25",
      icon: CheckCircle2,
    };
  }
  if (status === "tinjau") {
    return {
      label: "Perlu Tinjau",
      cls: "bg-status-warning-bg text-status-warning border-status-warning/25",
      icon: AlertTriangle,
    };
  }
  return {
    label: "Gagal",
    cls: "bg-status-danger-bg text-status-danger border-status-danger/25",
    icon: XCircle,
  };
}

function kategoriLabel(kategori: KategoriVendor) {
  return kategori === "supplier_bahan"
    ? "Supplier Bahan"
    : kategori === "katering"
      ? "Katering"
      : "Logistik";
}

function statusRank(s: VerificationStatus) {
  if (s === "gagal") return 0;
  if (s === "tinjau") return 1;
  return 2;
}

function Pill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-wide",
        className
      )}
    >
      {children}
    </span>
  );
}

export function VendorVerificationDropdown() {
  const [expandedVendorId, setExpandedVendorId] = useState<number | null>(null);

  const usedVendors = useMemo(() => {
    const usedIds = new Set<number>();
    for (const vs of vendorSekolahList) usedIds.add(vs.vendor_id);
    for (const sppg of sppgList) usedIds.add(sppg.vendor_id);

    const vendors = vendorList.filter((v) => usedIds.has(v.id));
    return vendors.length > 0 ? vendors : vendorList;
  }, []);

  const vendorsWithVerification = useMemo(() => {
    return usedVendors
      .map((v) => ({ v, ver: verifyVendor(v) }))
      .sort((a, b) => {
        const r = statusRank(a.ver.status) - statusRank(b.ver.status);
        if (r !== 0) return r;
        return a.v.nama.localeCompare(b.v.nama);
      });
  }, [usedVendors]);

  const counts = useMemo(() => {
    const base = { total: vendorsWithVerification.length, gagal: 0, tinjau: 0, lulus: 0 };
    for (const it of vendorsWithVerification) base[it.ver.status] += 1;
    return base;
  }, [vendorsWithVerification]);

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-card)]">
      <div className="flex flex-col gap-4 border-b border-border px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-role-accent/15 text-role-badge">
            <BadgeCheck className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Vendor digunakan
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
              Hasil verifikasi vendor
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Klik vendor untuk melihat detail—terutama yang{" "}
              <span className="font-medium text-status-danger">gagal</span> atau{" "}
              <span className="font-medium text-status-warning">perlu tinjau</span>.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Pill className="border-border bg-surface-raised text-foreground">Total {counts.total}</Pill>
          {counts.gagal > 0 ? (
            <Pill className="border-status-danger/25 bg-status-danger-bg text-status-danger">
              {counts.gagal} gagal
            </Pill>
          ) : null}
          {counts.tinjau > 0 ? (
            <Pill className="border-status-warning/25 bg-status-warning-bg text-status-warning">
              {counts.tinjau} tinjau
            </Pill>
          ) : null}
          {counts.lulus > 0 ? (
            <Pill className="border-status-success/25 bg-status-success-bg text-status-success">
              {counts.lulus} lulus
            </Pill>
          ) : null}
        </div>
      </div>

      <div className="divide-y divide-border">
        {vendorsWithVerification.map(({ v, ver }) => {
          const badge = statusBadge(ver.status);
          const Icon = badge.icon;
          const isExpanded = expandedVendorId === v.id;

          return (
            <motion.div key={v.id} layout className="bg-surface">
              <button
                type="button"
                onClick={() => setExpandedVendorId(isExpanded ? null : v.id)}
                aria-expanded={isExpanded}
                className={cn(
                  "w-full px-5 py-4 sm:px-6 text-left transition-colors hover:bg-surface-raised/60",
                  ver.status === "gagal"
                    ? "bg-status-danger-bg/50"
                    : ver.status === "tinjau"
                      ? "bg-status-warning-bg/50"
                      : undefined
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{v.nama}</p>
                      <Pill className="border-border bg-surface-raised text-muted-foreground">
                        {kategoriLabel(v.kategori)}
                      </Pill>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide",
                          badge.cls
                        )}
                      >
                        <Icon className="size-3.5" />
                        {badge.label}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-4">
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Timer className="size-4 text-role-badge" aria-hidden />
                        {v.on_time_rate.toFixed(1)}% tepat waktu
                      </span>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="size-4 text-status-warning" aria-hidden />
                        {v.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <ChevronDown
                    className={cn(
                      "mt-1 size-5 shrink-0 text-muted-foreground transition-transform",
                      isExpanded && "rotate-180"
                    )}
                    aria-hidden
                  />
                </div>
              </button>

              <AnimatePresence>
                {isExpanded ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-1 sm:px-6">
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div className="rounded-xl border border-border bg-surface-raised p-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Temuan
                          </p>
                          {ver.issues.length === 0 ? (
                            <p className="mt-2 text-sm text-muted-foreground">Tidak ada temuan.</p>
                          ) : (
                            <ul className="mt-2 space-y-2 text-sm text-foreground">
                              {ver.issues.map((issue) => (
                                <li key={issue} className="flex gap-2">
                                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-role-badge" aria-hidden />
                                  <span className="leading-relaxed">{issue}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        <div className="rounded-xl border border-border bg-surface-raised p-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Rekomendasi tindakan
                          </p>
                          {ver.suggestedActions.length === 0 ? (
                            <p className="mt-2 text-sm text-muted-foreground">Tidak ada rekomendasi.</p>
                          ) : (
                            <ul className="mt-2 space-y-2 text-sm text-foreground">
                              {ver.suggestedActions.map((action) => (
                                <li key={action} className="flex gap-2">
                                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-role-badge" aria-hidden />
                                  <span className="leading-relaxed">{action}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

