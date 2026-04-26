import { StatusBadge } from "@/components/ui/status-badge";
import { type Vendor, type VendorSekolah } from "@/lib/mbgdummydata";
import { cn } from "@/lib/utils";

type VendorWithRelasi = VendorSekolah & { vendor: Vendor };

function normalizeVendorStatus(status?: string) {
  const normalized = String(status ?? "").trim().toUpperCase();
  if (!normalized) return "PENDING";
  if (normalized === "AKTIF" || normalized === "ACTIVE") return "AKTIF";
  if (normalized === "SUSPEND" || normalized === "SUSPENDED") return "SUSPENDED";
  return normalized;
}

export function VendorCard({
  data,
  color,
  className,
}: {
  data: VendorWithRelasi;
  color?: string;
  className?: string;
}) {
  const vendor = data.vendor;

  return (
    <div
      className={cn(
        "p-4 rounded-[var(--radius-lg)] bg-surface/80 backdrop-blur border border-border shadow-card",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              aria-hidden
              className="inline-flex w-2.5 h-2.5 rounded-[4px] flex-shrink-0"
              style={{ background: color ?? "var(--role-primary)" }}
            />
            <p className="font-semibold text-sm text-foreground truncate">
              {vendor.nama}
            </p>
          </div>

          <div className="space-y-0.5 text-xs text-muted">
            <p className="truncate">{vendor.kategori.replaceAll("_", " ")}</p>
            <p className="truncate tabular-nums">
              {vendor.rating} bintang · {vendor.on_time_rate}% on-time
            </p>
            <p className="truncate">{vendor.alamat}</p>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full border border-border bg-role-accent text-role-primary">
              {data.is_primary ? "Vendor Utama" : "Vendor Cadangan"}
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full border border-border bg-muted-bg text-foreground tabular-nums">
              {data.porsi_per_hari.toLocaleString("id-ID")} porsi/hari
            </span>
          </div>

          {data.menu_default?.length ? (
            <div className="flex flex-wrap gap-2 mt-3">
              {data.menu_default.slice(0, 6).map((menu) => (
                <span
                  key={menu}
                  className="text-xs font-medium px-2.5 py-0.5 rounded-full border border-border bg-surface text-muted"
                >
                  {menu.replaceAll("_", " ")}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={normalizeVendorStatus(vendor.status)} />
        </div>
      </div>
    </div>
  );
}

