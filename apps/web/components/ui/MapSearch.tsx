import { useEffect, useMemo, useRef, useState } from "react";
import { sekolahList, type Sekolah } from "@/lib/mbgdummydata";

export function MapSearch({ onSelect }: { onSelect: (school: Sekolah) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = document.getElementById("map-search-widget");
      if (el && !el.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sekolahList;
    return sekolahList.filter((s) => {
      const haystack = `${s.nama} ${s.kecamatan} ${s.kota} ${s.jenjang}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query]);

  const handleSelect = (school: Sekolah) => {
    onSelect(school);
    setOpen(false);
    setQuery("");
  };

  return (
    <div
      id="map-search-widget"
      className="absolute flex items-center"
      style={{
        bottom: isMobile ? "0.75rem" : "2rem",
        left: isMobile ? "0.5rem" : "2rem",
        right: isMobile ? "0.5rem" : "auto",
        zIndex: 1000,
      }}
    >
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.95)",
            border: "1px solid rgba(99,102,241,0.18)",
            borderRadius: 12,
            boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
            backdropFilter: "blur(16px)",
            cursor: "pointer",
          }}
          title="Cari sekolah atau lokasi"
          aria-label="Cari sekolah atau lokasi"
        >
          <svg width="18" height="18" fill="none" stroke="#6366f1" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>
      )}

      {open && (
        <div
          style={{
            height: "auto",
            width: isMobile ? "100%" : 320,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            padding: 12,
            background: "rgba(255,255,255,0.97)",
            border: "1px solid rgba(99,102,241,0.22)",
            borderRadius: 12,
            boxShadow: "0 4px 24px rgba(99,102,241,0.12)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="16" height="16" fill="none" stroke="#6366f1" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari sekolah atau port..."
              style={{
                flex: 1,
                outline: "none",
                border: "none",
                background: "transparent",
                fontSize: 13,
                color: "#111",
                fontFamily: "inherit",
              }}
              onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
            />

            {query && (
              <button
                onClick={() => setQuery("")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9ca3af",
                  padding: 0,
                  lineHeight: 1,
                }}
                aria-label="Clear search"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          <div style={{ maxHeight: 220, overflow: "auto" }}>
            {results.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelect(s)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 10px",
                  borderRadius: 10,
                  border: "1px solid transparent",
                  background: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget.style.background = "rgba(99,102,241,0.06)");
                  (e.currentTarget.style.borderColor = "rgba(99,102,241,0.14)");
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget.style.background = "transparent");
                  (e.currentTarget.style.borderColor = "transparent");
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{s.nama}</span>
                <span style={{ fontSize: 12, color: "#6b7280" }}>
                  {s.jenjang} · {s.kecamatan}, {s.kota}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

