"use client";

import { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { GraduationCap, CheckCircle2, Lock, Factory, MapPin, MessageCircle } from "lucide-react";

import {
  sekolahList,
  getVendorsBySekolah,
  type Sekolah,
  type Vendor,
  type VendorSekolah,
} from "../../lib/mbgdummydata";

import { MapSearch } from "./MapSearch";
import { VendorCard } from "./VendorCard";
import { AlertDestructive } from "./alert-destructive";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const iconSrc = typeof icon === "string" ? icon : (icon as any).src;
const iconShadowSrc = typeof iconShadow === "string" ? iconShadow : (iconShadow as any).src;

L.Marker.prototype.options.icon = L.icon({
  iconUrl: iconSrc,
  shadowUrl: iconShadowSrc,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const VENDOR_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const _schoolIconCache = new Map<boolean, L.DivIcon>();
const makeSchoolIcon = (selected: boolean) => {
  if (!_schoolIconCache.has(selected)) {
    _schoolIconCache.set(selected, L.divIcon({
      className: "",
      html: `<div style="
        width:${selected ? 44 : 36}px; height:${selected ? 44 : 36}px;
        background:${selected ? "linear-gradient(135deg,#f59e0b,#ef4444)" : "linear-gradient(135deg,#6366f1,#06b6d4)"};
        border-radius:50%; display:flex; align-items:center; justify-content:center;
        box-shadow:0 4px 14px rgba(0,0,0,0.25); border:${selected ? 4 : 3}px solid white;
        ${selected ? "animation:pulse 1.5s infinite;" : ""}
      ">
        <svg width="${selected ? 18 : 15}" height="${selected ? 18 : 15}" fill="white" viewBox="0 0 24 24">
          <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
        </svg>
      </div>
      <style>@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}</style>`,
      iconSize: [selected ? 44 : 36, selected ? 44 : 36],
      iconAnchor: [selected ? 22 : 18, selected ? 44 : 36],
    }));
  }
  return _schoolIconCache.get(selected)!;
};

const _vendorIconCache = new Map<string, L.DivIcon>();
const makeVendorIcon = (color: string, isPrimary: boolean) => {
  const key = `${color}-${isPrimary}`;
  if (!_vendorIconCache.has(key)) {
    _vendorIconCache.set(key, L.divIcon({
      className: "",
      html: `<div style="
        width:${isPrimary ? 38 : 30}px; height:${isPrimary ? 38 : 30}px;
        background:${color}; border-radius:8px; display:flex; align-items:center;
        justify-content:center; box-shadow:0 3px 10px rgba(0,0,0,0.2); border:2.5px solid white;
      ">
        <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
          <path d="M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5z"/>
        </svg>
      </div>`,
      iconSize: [isPrimary ? 38 : 30, isPrimary ? 38 : 30],
      iconAnchor: [isPrimary ? 19 : 15, isPrimary ? 38 : 30],
    }));
  }
  return _vendorIconCache.get(key)!;
};

type VendorWithRelasi = VendorSekolah & { vendor: Vendor };

interface Comment {
  id: number; user: string; avatar: string; role: string;
  time: string; content: string; likes: number;
}

const generateComments = (schoolName: string): Comment[] => [
  { id: 1, user: "Waka Kurikulum",   avatar: "W", role: "Admin",          time: "1 jam lalu",  content: `Distribusi ke ${schoolName} lancar. B.O.G.A on-time 3 bulan.`, likes: 12 },
  { id: 2, user: "Siswa - Kelas 8B", avatar: "S", role: "Siswa",          time: "3 jam lalu",  content: "Makannya enak dan porsinya cukup! Minta tambah susu dong!",      likes: 8  },
  { id: 3, user: "Operator MBG",     avatar: "O", role: "Operator",       time: "5 jam lalu",  content: "Manifest pengiriman sudah di-upload. Status: DELIVERED",          likes: 15 },
  { id: 4, user: "Kepala Sekolah",   avatar: "K", role: "Kepala Sekolah", time: "1 hari lalu", content: "Terima kasih atas kerjasamanya. Siswa sangat antusias.",           likes: 24 },
];

function MapController({ school }: { school: Sekolah | null }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => { map.invalidateSize(); }, 250);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (school) map.flyTo([school.lat, school.lng], 14, { duration: 1 });
  }, [school, map]);

  return null;
}

function MapScrollHandler() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    const handler = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        map.scrollWheelZoom.enable();
      } else {
        map.scrollWheelZoom.disable();
      }
    };
    container.addEventListener("wheel", handler, { passive: false });
    return () => container.removeEventListener("wheel", handler);
  }, [map]);
  return null;
}

export default function SchoolMap() {
  const [selectedSchool, setSelectedSchool] = useState<Sekolah | null>(null);
  const [activeVendors, setActiveVendors] = useState<VendorWithRelasi[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [activeTab, setActiveTab] = useState<"vendor" | "comment">("vendor");
  const [alerts, setAlerts] = useState<number[]>([]);
  const [routePaths, setRoutePaths] = useState<Record<number, [number, number][]>>({});
  const [mounted, setMounted] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setMapKey(prev => prev + 1);
  }, []);

  // Baca auth langsung dari localStorage saat render — tidak bergantung state async
  const getIsAuth = () => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("boga_is_auth") === "true";
  };
  const getUserRole = () => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("boga_user_role") || "";
  };

  const isAuth = mounted ? getIsAuth() : false;
  const userRole = mounted ? getUserRole() : "";

  const roleLabel: Record<string, string> = {
    logistik: "Operator Logistik",
    sekolah: "Kepala Sekolah",
    vendor: "Mitra Vendor",
    admin: "Admin",
    government: "Pemerintah",
    supplier: "SPPG",
  };
  const displayName = roleLabel[userRole] || userRole || "Pengguna";
  const avatarChar = displayName.charAt(0).toUpperCase();
  const avatarGradient =
    userRole === "admin" || userRole === "government" ? "linear-gradient(135deg,#f59e0b,#ef4444)"
    : userRole === "sekolah" ? "linear-gradient(135deg,#8b5cf6,#6366f1)"
    : "linear-gradient(135deg,#6366f1,#06b6d4)";

  const handleSchoolClick = (school: Sekolah) => {
    setSelectedSchool(school);
    const vendors = getVendorsBySekolah(school.id);
    setActiveVendors(vendors);
    setComments(generateComments(school.nama));
    setActiveTab("vendor");
    setTimeout(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 600);
  };

  useEffect(() => {
    if (!selectedSchool || activeVendors.length === 0) {
      setRoutePaths({});
      return;
    }

    let isMounted = true;
    const fetchRoutes = async () => {
      const paths: Record<number, [number, number][]> = {};
      
      for (const av of activeVendors) {
        const v = av.vendor;
        try {
          const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${v.lng},${v.lat};${selectedSchool.lng},${selectedSchool.lat}?overview=full&geometries=geojson`);
          const data = await res.json();
          if (data.routes && data.routes[0]) {
            paths[v.id] = data.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
          }
        } catch (error) {
          console.error("OSRM Route Failed", error);
        }
      }
      
      if (isMounted) setRoutePaths(paths);
    };

    fetchRoutes();
    return () => { isMounted = false; };
  }, [selectedSchool, activeVendors]);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setAlerts((prev) => {
      const id = Date.now();
      const updated = [...prev, id];
      if (updated.length > 3) updated.shift();
      setTimeout(() => {
        setAlerts((current) => current.filter((alertId) => alertId !== id));
      }, 3000);
      return updated;
    });
  };

  const vendorMarkersOnMap = activeVendors
    .map((av, idx) => ({ relasi: av, color: VENDOR_COLORS[idx % VENDOR_COLORS.length] }))
    .filter(({ relasi }) => relasi.vendor != null);

  if (!mounted) {
    return (
      <div
        style={{ height: "520px", width: "100%" }}
        className="flex items-center justify-center bg-gray-50 rounded-2xl"
      >
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-sm">Memuat peta...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative z-0">
      <div style={{ height: "520px", width: "100%", position: "relative" }}>
        <MapContainer
          key={`school-map-${mapKey}`}
          center={[-6.2, 106.838]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            subdomains={["a", "b", "c", "d"]}
            maxZoom={19}
          />
          <MapController school={selectedSchool} />
          <MapScrollHandler />

          {sekolahList.map((school) => (
            <Marker
              key={`school-${school.id}`}
              position={[school.lat, school.lng]}
              icon={makeSchoolIcon(selectedSchool?.id === school.id)}
              eventHandlers={{ click: () => handleSchoolClick(school) }}
            >
              <Popup>
                <div style={{ minWidth: 180, fontFamily: "sans-serif" }}>
                  <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{school.nama}</p>
                  <p style={{ fontSize: 12, color: "#555", marginBottom: 4 }}>{school.total_siswa} siswa · {school.jenjang}</p>
                  <p style={{ fontSize: 12, color: "#10b981" }}>● MBG Aktif</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {selectedSchool && vendorMarkersOnMap.map(({ relasi, color }) => {
            const v = relasi.vendor;
            const pathPositions = routePaths[v.id]
              ? routePaths[v.id]
              : [[v.lat, v.lng] as [number, number], [selectedSchool.lat, selectedSchool.lng] as [number, number]];

            return (
              <div key={`vendor-layer-${v.id}`}>
                <Polyline
                  positions={pathPositions}
                  pathOptions={{ color, weight: relasi.is_primary ? 3.5 : 2.5, dashArray: relasi.is_primary ? undefined : "8 5", opacity: 0.8 }}
                />
                <Marker position={[v.lat, v.lng]} icon={makeVendorIcon(color, relasi.is_primary)}>
                  <Popup>
                    <div style={{ minWidth: 190, fontFamily: "sans-serif" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                        <p style={{ fontWeight: 600, fontSize: 13 }}>{v.nama}</p>
                      </div>
                      <p style={{ fontSize: 12, color: "#555", marginBottom: 3 }}>{v.kategori.replace("_", " ")}</p>
                      <p style={{ fontSize: 12, color: "#555", marginBottom: 3 }}>{v.rating} bintang · {v.on_time_rate}% on-time</p>
                      <p style={{ fontSize: 12, color: "#555", marginBottom: 3 }}>{v.alamat}</p>
                      <p style={{ fontSize: 12, marginBottom: 2 }}>
                        Ke <strong>{selectedSchool.nama}</strong>:{" "}
                        <span style={{ color }}>{relasi.is_primary ? "Vendor Utama" : "Vendor Cadangan"}</span>
                      </p>
                      <p style={{ fontSize: 12, color: "#555" }}>{relasi.porsi_per_hari.toLocaleString("id-ID")} porsi/hari</p>
                    </div>
                  </Popup>
                </Marker>
              </div>
            );
          })}

          <MapSearch onSelect={handleSchoolClick} />
        </MapContainer>

        {selectedSchool && vendorMarkersOnMap.length > 0 && (
          <div style={{
            position: "absolute", bottom: 16, right: 16, zIndex: 1000,
            background: "rgba(255, 255, 255, 0.85)", borderRadius: 10, padding: "10px 14px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)", minWidth: 180,
            border: "1px solid rgba(255,255,255,0.6)",
            backdropFilter: "blur(8px)"
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Vendor Terhubung
            </p>
            {vendorMarkersOnMap.map(({ relasi, color }) => (
              <div key={relasi.vendor.id} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "#374151" }}>{relasi.vendor.nama}</span>
                {relasi.is_primary && <span style={{ fontSize: 10, color, fontWeight: 600 }}>• Utama</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedSchool && (
        <div
          ref={panelRef}
          className="mt-6 rounded-2xl overflow-hidden backdrop-blur-md"
          style={{
            background: "rgba(255, 255, 255, 0.75)",
            border: "1px solid rgba(255, 255, 255, 0.6)",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)"
          }}
        >
          <div className="p-5" style={{
            background: "rgba(255, 255, 255, 0.4)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.5)"
          }}>
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{selectedSchool.nama}</h3>
                <div className="flex items-center gap-4 text-gray-600 text-sm flex-wrap">
                  <span className="flex items-center gap-1"><GraduationCap className="w-4 h-4" /> {selectedSchool.total_siswa} siswa</span>
                  <span className="flex items-center gap-1"><Factory className="w-4 h-4" /> {selectedSchool.jenjang}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {selectedSchool.kecamatan}, {selectedSchool.kota}</span>
                </div>
              </div>
              <div className="text-right text-gray-600 text-sm">
                <p>Mulai: {selectedSchool.mulai_mbg}</p>
                <p className="font-medium">{activeVendors.length} vendor terdaftar</p>
              </div>
            </div>
          </div>

          <div className="flex border-b" style={{ borderColor: "rgba(99,102,241,0.12)" }}>
            {(["vendor", "comment"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-3 text-sm font-medium transition-colors"
                style={{
                  color: activeTab === tab ? "#6366f1" : "#6b7280",
                  borderBottom: activeTab === tab ? "2px solid #6366f1" : "2px solid transparent",
                }}
              >
                {tab === "vendor"
                  ? <span className="flex items-center justify-center gap-1.5"><Factory className="w-4 h-4" /> Vendor ({activeVendors.length})</span>
                  : <span className="flex items-center justify-center gap-1.5"><MessageCircle className="w-4 h-4" /> Komentar ({comments.length})</span>
                }
              </button>
            ))}
          </div>

          <div className="p-5">
            {activeTab === "vendor" && (
              <div>
                <p className="text-xs text-gray-500 mb-3">Garis solid = vendor utama · garis putus-putus = vendor cadangan</p>
                {activeVendors.map((v, idx) => (
                  <VendorCard key={v.id} data={v} color={VENDOR_COLORS[idx % VENDOR_COLORS.length]} />
                ))}
              </div>
            )}

            {activeTab === "comment" && (
              <div>
                {/* ── Belum login: banner tipis mobile / fixed desktop ── */}
                {/* ── Belum login: banner inline kompak (semua ukuran layar) ── */}
                {!isAuth && (
                  <div className="flex items-center justify-between gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2 mb-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <Lock className="w-4 h-4 text-indigo-400 shrink-0" />
                      <p className="text-xs font-semibold text-indigo-700 truncate">Login untuk berkomentar</p>
                    </div>
                    <a
                      href="/auth/login"
                      className="px-3 py-1 rounded-full text-[11px] font-bold text-white shrink-0"
                      style={{ background: "linear-gradient(135deg,#6366f1,#06b6d4)" }}
                    >
                      Masuk
                    </a>
                  </div>
                )}

                {/* ── Sudah login: form komentar ── */}
                {isAuth && (
                  <form onSubmit={handleSubmitComment} className="mb-6">
                    <div className="flex gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-sm"
                        style={{ background: avatarGradient }}
                      >
                        {avatarChar}
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider mb-1">{displayName}</p>
                        <input
                          type="text" value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Tambahkan komentar atau feedback..."
                          className="w-full px-4 py-3 rounded-xl border text-sm text-gray-800 bg-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          style={{ borderColor: "rgba(99,102,241,0.2)" }}
                        />
                        <div className="flex justify-end mt-2 gap-2">
                          <button type="button" onClick={() => setNewComment("")}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100/50 transition-colors">
                            Batal
                          </button>
                          <button type="submit" disabled={!newComment.trim()}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-white shadow-md disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg,#6366f1,#06b6d4)" }}>
                            Kirim
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                )}

                <div className="space-y-4">
                  {comments.map((c) => (
                    <div key={c.id} className="flex gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-sm"
                        style={{
                          background: c.role === "Admin" ? "linear-gradient(135deg,#f59e0b,#ef4444)"
                            : c.role === "Kepala Sekolah" ? "linear-gradient(135deg,#8b5cf6,#6366f1)"
                            : "linear-gradient(135deg,#6366f1,#06b6d4)",
                        }}>
                        {c.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-sm text-gray-900">{c.user}</span>
                          {c.role !== "Siswa" && c.role !== "Pengguna" && (
                            <span className="px-2 py-0.5 rounded-full text-xs text-white shadow-sm"
                              style={{ background: c.role === "Admin" ? "#ef4444" : c.role === "Kepala Sekolah" ? "#8b5cf6" : "#6366f1" }}>
                              {c.role}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">{c.time}</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{c.content}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition-colors">
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                            </svg>
                            {c.likes}
                          </button>
                          <button className="text-xs text-gray-500 hover:text-gray-800 font-medium transition-colors">Balas</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {alerts.map((id) => (
          <div key={id} className="animate-in slide-in-from-right-8 fade-in duration-300 pointer-events-auto">
            <AlertDestructive />
          </div>
        ))}
      </div>
    </div>
  );
}
