"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  sekolahList,
  getVendorsBySekolah,
  type Sekolah,
} from "../../lib/mbgdummydata";

import { VendorCard } from "./VendorCard";

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
        background:${selected ? "linear-gradient(135deg,#10b981,#34d399)" : "linear-gradient(135deg,#6366f1,#06b6d4)"};
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

export default function LogistikMap() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const PAGE_SIZE = 3;

  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isExpanded]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const allSchoolsWithVendors = sekolahList.map((school, originalIdx) => ({
    school,
    vendors: getVendorsBySekolah(school.id),
    originalIdx,
  }));

  const filteredSchools = allSchoolsWithVendors.filter(({ school, vendors }) => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    const matchSchool =
      school.nama.toLowerCase().includes(lowerQuery) ||
      school.kecamatan.toLowerCase().includes(lowerQuery) ||
      school.kota.toLowerCase().includes(lowerQuery) ||
      school.jenjang.toLowerCase().includes(lowerQuery);
    const matchVendor = vendors.some(
      (v) =>
        v.vendor.nama.toLowerCase().includes(lowerQuery) ||
        v.vendor.kategori.toLowerCase().includes(lowerQuery) ||
        v.vendor.alamat.toLowerCase().includes(lowerQuery)
    );
    return matchSchool || matchVendor;
  });

  const totalPages = Math.ceil(filteredSchools.length / PAGE_SIZE);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  const displayedSchools = filteredSchools.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (!mounted) {
    return (
      <div
        style={{ height: "520px", width: "100%" }}
        className="flex items-center justify-center bg-gray-50 rounded-2xl"
      >
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-green-400 border-t-green-600 rounded-full animate-spin" />
          <span className="text-sm border-b">Memuat peta operasional Logistik...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative z-0 flex flex-col gap-6">
      
      {/* Container Peta */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ 
          height: isExpanded ? "min(80vh, 800px)" : "clamp(12rem, 30vw, 40rem)", 
          width: "100%", 
          position: "relative" 
        }} 
        className={`
          rounded-2xl overflow-hidden shadow-sm border border-gray-200 transition-all duration-500 ease-in-out cursor-pointer group
          ${isExpanded ? "z-[70] shadow-2xl" : "z-0"}
        `}
      >
        {/* Expansion Overlay Indicator */}
        {!isExpanded && (
          <div className="absolute inset-0 bg-transparent z-[5] group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
             <span className="bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-bold text-gray-800 shadow-xl border border-white">Buka Peta Live</span>
          </div>
        )}
        <MapContainer
          center={[-6.205, 106.838]}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            subdomains={["a", "b", "c", "d"]}
            maxZoom={19}
          />
          <MapScrollHandler />
          <div className="absolute top-4 right-12 z-[1000] pointer-events-auto">
             <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className={`bg-white/90 backdrop-blur p-2 rounded-xl shadow-lg border border-black/5 hover:bg-white transition-all ${isExpanded ? "rotate-180" : ""}`}
             >
                <Search className="w-4 h-4 text-gray-600" />
             </button>
          </div>

          {/* Render SEMUA Sekolah dan Jalur Vendornya */}
          {filteredSchools.map(({ school, vendors, originalIdx }) => (
            <div key={`s-${school.id}`}>
              <Marker
                position={[school.lat, school.lng]}
                icon={makeSchoolIcon(false)}
              >
                <Popup>
                  <div style={{ minWidth: 180, fontFamily: "sans-serif" }}>
                    <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{school.nama}</p>
                    <p style={{ fontSize: 12, color: "#555", marginBottom: 4 }}>{school.total_siswa} siswa · {school.jenjang}</p>
                    <p style={{ fontSize: 12, color: "#10b981" }}>● MBG Aktif</p>
                  </div>
                </Popup>
              </Marker>

              {/* Render Semua Relasi Vendor untuk setiap sekolah */}
              {vendors.map((relasi, vendorIdx) => {
                const color = VENDOR_COLORS[(originalIdx + vendorIdx) % VENDOR_COLORS.length];
                const v = relasi.vendor;
                return (
                  <div key={`v-${v.id}-${school.id}`}>
                    <Polyline
                      positions={[[v.lat, v.lng], [school.lat, school.lng]]}
                      pathOptions={{ color, weight: relasi.is_primary ? 2.5 : 1.5, dashArray: relasi.is_primary ? undefined : "6 4", opacity: 0.65 }}
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
                        </div>
                      </Popup>
                    </Marker>
                  </div>
                );
              })}
            </div>
          ))}
        </MapContainer>
      </div>

      {/* Overview Detail Informasi (Tampil Lengkap Tanpa Klik) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 backdrop-blur-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h3 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
            Rekapitulasi Rute Distribusi (Live)
          </h3>
          <InputGroup className="w-full md:max-w-sm flex-shrink-0">
            <InputGroupInput
              placeholder="Cari nama sekolah, kecamatan, vendor..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
            <InputGroupAddon>
              <Search className="h-4 w-4" />
            </InputGroupAddon>
            {searchQuery && (
              <InputGroupAddon align="inline-end">
                {filteredSchools.length} hasil
              </InputGroupAddon>
            )}
          </InputGroup>
        </div>

        {filteredSchools.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-gray-500">Tidak ada rute distribusi yang cocok dengan pencarian.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedSchools.map(({ school, vendors, originalIdx }) => (
                <div key={school.id} className="border border-green-500/20 bg-green-50/20 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="border-b border-green-500/10 pb-3 mb-4">
                    <h4 className="font-bold text-gray-900 text-base">{school.nama}</h4>
                    <p className="text-xs text-gray-500 mt-1">{school.kecamatan}, {school.kota} · {school.jenjang}</p>
                    <div className="inline-flex mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                      Total Siswa: {school.total_siswa}
                    </div>
                  </div>
                  
                  <p className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-3">Armada Ditugaskan:</p>
                  
                  <div className="flex flex-col gap-3">
                    {vendors.map((relasi, vendorIdx) => {
                      const color = VENDOR_COLORS[(originalIdx + vendorIdx) % VENDOR_COLORS.length];
                      return (
                        <div key={relasi.vendor.id} className="bg-white border shadow-sm border-gray-100 p-3 rounded-lg relative overflow-hidden group">
                          <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: color }} />
                          <div className="flex items-start justify-between pl-2">
                            <div>
                              <p className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                                {relasi.vendor.nama}
                                {relasi.is_primary && (
                                  <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                )}
                              </p>
                              <p className="text-[10px] text-gray-500 mt-0.5">{relasi.vendor.kategori.replace("_", " ")}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-semibold" style={{ color }}>{relasi.porsi_per_hari} Porsi</p>
                              <p className="text-[10px] text-gray-400 capitalize">{relasi.is_primary ? "Utama" : "Cadangan"}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    aria-disabled={safePage === 1}
                    className={safePage === 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (totalPages > 5 && page !== 1 && page !== totalPages && Math.abs(page - safePage) > 1) {
                    if (page === safePage - 2 || page === safePage + 2) {
                      return (
                        <PaginationItem key={`ellipsis-${page}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  }
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={safePage === page}
                        onClick={() => setCurrentPage(page)}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    aria-disabled={safePage === totalPages}
                    className={safePage === totalPages ? "pointer-events-none opacity-40" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <p className="text-center text-xs text-gray-400 mt-2">
              Halaman {safePage} dari {totalPages} · {filteredSchools.length} rute total
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
