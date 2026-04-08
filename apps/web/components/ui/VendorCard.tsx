import { type Vendor, type VendorSekolah } from "@/lib/mbgdummydata";

type VendorWithRelasi = VendorSekolah & { vendor: Vendor };

export function VendorCard({
  data,
  color,
}: {
  data: VendorWithRelasi;
  color: string;
}) {
  return (
    <div
      className="p-4 rounded-2xl mb-3"
      style={{
        background: "rgba(255,255,255,0.6)",
        border: "1px solid rgba(99,102,241,0.14)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: color,
                flexShrink: 0,
              }}
            />
            <p style={{ fontWeight: 800, fontSize: 14, color: "#111827", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {data.vendor.nama}
            </p>
          </div>

          <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 3px 0" }}>
            {data.vendor.kategori.replace("_", " ")}
          </p>
          <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 3px 0" }}>
            {data.vendor.rating} bintang · {data.vendor.on_time_rate}% on-time
          </p>
          <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 10px 0" }}>
            {data.vendor.alamat}
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#374151",
                padding: "4px 8px",
                borderRadius: 9999,
                background: "rgba(99,102,241,0.08)",
                border: "1px solid rgba(99,102,241,0.12)",
              }}
            >
              {data.is_primary ? "Vendor Utama" : "Vendor Cadangan"}
            </span>

            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#374151",
                padding: "4px 8px",
                borderRadius: 9999,
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.12)",
              }}
            >
              {data.porsi_per_hari.toLocaleString("id-ID")} porsi/hari
            </span>
          </div>

          {data.menu_default?.length ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {data.menu_default.slice(0, 6).map((m) => (
                <span
                  key={m}
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#4b5563",
                    padding: "4px 10px",
                    borderRadius: 9999,
                    background: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  {m.replace("_", " ")}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: data.vendor.status === "aktif" ? "#10b981" : data.vendor.status === "suspend" ? "#ef4444" : "#f59e0b",
              textTransform: "uppercase",
              letterSpacing: "0.03em",
              padding: "4px 10px",
              borderRadius: 9999,
              background: "rgba(0,0,0,0.03)",
              border: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            {data.vendor.status}
          </span>
        </div>
      </div>
    </div>
  );
}

