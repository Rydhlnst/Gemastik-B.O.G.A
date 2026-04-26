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
        top: isMobile ? "0.5rem" : "1rem",
        left: isMobile ? "0.5rem" : "1rem",
        right: isMobile ? "0.5rem" : "auto",
        zIndex: 10,
      }}
    >
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="hover:scale-105 active:scale-95 transition-all"
          style={{
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.9)",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: 10,
            boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
            backdropFilter: "blur(12px)",
            cursor: "pointer",
          }}
          title="Cari sekolah"
        >
          <svg width="15" height="15" fill="none" stroke="#6366f1" strokeWidth="2.5" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>
      )}

      {open && (
        <div
          className="transition-all animate-in fade-in zoom-in duration-200"
          style={{
            height: "auto",
            width: isMobile ? "calc(100vw - 1rem)" : 260,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: 10,
            background: "rgba(255,255,255,0.98)",
            border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: 12,
            boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="14" height="14" fill="none" stroke="#6366f1" strokeWidth="2.5" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari sekolah..."
              style={{
                flex: 1,
                outline: "none",
                border: "none",
                background: "transparent",
                fontSize: 12,
                fontWeight: 500,
                color: "#1e293b",
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
                  color: "#94a3b8",
                  padding: 2,
                }}
              >
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {/* Jenjang Filter Chips */}
          <div style={{ display: "flex", gap: 4, marginBottom: 2 }}>
            {["SD", "SMP", "SMA"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setQuery(lvl)}
                className="transition-all active:scale-95"
                style={{
                  padding: "3px 8px",
                  borderRadius: "6px",
                  fontSize: "9px",
                  fontWeight: 900,
                  letterSpacing: "0.04em",
                  background: query.toUpperCase() === lvl ? "linear-gradient(135deg,#6366f1,#06b6d4)" : "rgba(99,102,241,0.06)",
                  color: query.toUpperCase() === lvl ? "white" : "#6366f1",
                  border: "1px solid",
                  borderColor: query.toUpperCase() === lvl ? "transparent" : "rgba(99,102,241,0.15)",
                  cursor: "pointer",
                }}
              >
                {lvl}
              </button>
            ))}
            <button
               onClick={() => setQuery("")}
               style={{
                  padding: "3px 8px",
                  borderRadius: "6px",
                  fontSize: "9px",
                  fontWeight: 900,
                  color: !query ? "#475569" : "#94a3b8",
                  background: !query ? "rgba(71,85,105,0.12)" : "transparent",
                  border: "1px solid",
                  borderColor: !query ? "transparent" : "rgba(71,85,105,0.1)",
                  cursor: "pointer"
               }}
            >
              ALL
            </button>
          </div>

          {results.length > 0 && (
            <div style={{ maxHeight: 180, overflow: "auto", borderTop: "1px solid rgba(0,0,0,0.04)", paddingTop: 4 }}>
              {results.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelect(s)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "6px 8px",
                    borderRadius: 8,
                    border: "1px solid transparent",
                    background: "transparent",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget.style.background = "rgba(99,102,241,0.06)");
                    (e.currentTarget.style.borderColor = "rgba(99,102,241,0.1)");
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget.style.background = "transparent");
                    (e.currentTarget.style.borderColor = "transparent");
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{s.nama}</span>
                  <span style={{ fontSize: 10, color: "#64748b" }}>
                    {s.jenjang} · {s.kecamatan}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

