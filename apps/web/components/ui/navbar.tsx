"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { MobileNavCards } from "./MobileCardNav";

const DEFAULT_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/sekolah/mitra", label: "Mitra" },
  { href: "/sekolah/about", label: "About Us" },
  { href: "/sekolah/contact", label: "Contact" },
];

const LOGISTIK_NAV_LINKS = [
  { href: "/logistik", label: "Dasbor Logistik" },
  { href: "/logistik/pantau", label: "Pantau Rute" },
  { href: "/logistik/riwayat", label: "Riwayat Pengiriman" },
  { href: "/logistik/contact", label: "Bantuan & Kontak" },
];

type NavPosition = "center" | "left";
const POSITION: NavPosition = "left";

export default function Navbar() {
  const location = usePathname();
  
  const isLogistik = location.startsWith("/logistik");
  const NAV_LINKS = isLogistik ? LOGISTIK_NAV_LINKS : DEFAULT_NAV_LINKS;

  // Halaman dashboard dengan sidebar sendiri — Navbar tidak diperlukan
  const SIDEBAR_ROUTES = ["/goverment", "/supplier", "/vendor"];
  const hasSidebar = SIDEBAR_ROUTES.some((r) => location.startsWith(r));

  const [scrolled, setScrolled] = useState(false);
  const [expandedByClick, setExpandedByClick] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isExpanded = scrolled || expandedByClick;

  useEffect(() => {
    const authStatus = localStorage.getItem("boga_is_auth");
    const roleId = localStorage.getItem("boga_user_role");
    if (authStatus === "true") {
      setIsAuth(true);
      setUserRole(roleId || "");
    } else {
      setIsAuth(false);
      setUserRole("");
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("boga_is_auth");
    localStorage.removeItem("boga_user_role");
    setIsAuth(false);
    setUserRole("");
    window.location.href = "/";
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 60) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogoClick = () => {
    if (!isExpanded) {
      setExpandedByClick(true);
    } else if (expandedByClick && !scrolled) {
      setExpandedByClick(false);
      setMobileMenuOpen(false);
    }
  };

  const wrapperStyle: React.CSSProperties =
    POSITION === "center"
      ? {
          position: "fixed",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 50,
          pointerEvents: "none",
        }
      : {
          position: "fixed",
          top: 20,
          left: 20,
          right: 20,
          zIndex: 50,
          pointerEvents: "none",
        };

  // Jangan render Navbar di halaman dashboard yang punya sidebar sendiri
  if (hasSidebar) return null;

  return (
    <div style={wrapperStyle}>
      <div
        style={{
          pointerEvents: "auto",
          position: "relative",
          width: isExpanded
            ? isMobile
              ? "100%"
              : "100%"
            : "52px",
          transition: "width 0.45s cubic-bezier(0.34, 1.2, 0.64, 1)",
        }}
      >
        {/* Layer shadow warna */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: mobileMenuOpen ? 16 : 9999,
            background:
              "linear-gradient(135deg, hsl(253,70%,60%), hsl(208,70%,60%))",
            transform: "translate(3px, 3px)",
            opacity: isExpanded ? 0.15 : 0,
            transition: "opacity 0.45s, border-radius 0.3s",
          }}
        />

        {/* Glass panel */}
        <div
          style={{
            position: "relative",
            width: "100%",
            borderRadius: isExpanded ? 20 : 9999,
            background: "hsla(0,0%,100%,0.65)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow:
              "0 0 0 1px hsla(0,0%,100%,0.55) inset, 0 8px 32px rgba(0,0,0,0.09)",
            overflow: "visible",
            cursor: isExpanded ? "default" : "pointer",
            transition:
              "padding 0.45s cubic-bezier(0.34, 1.2, 0.64, 1), border-radius 0.3s",
          }}
          onClick={!isExpanded ? handleLogoClick : undefined}
        >
          {/* ── Baris utama navbar ── */}
          <nav
            style={{
              height: 52,
              display: "flex",
              alignItems: "center",
              paddingLeft: isExpanded ? 12 : 8,
              paddingRight: isExpanded ? 8 : 0,
              transition: "padding 0.45s cubic-bezier(0.34, 1.2, 0.64, 1)",
            }}
          >
            {/* Logo */}
            <Link
              href="/"
              onClick={(e) => {
                if (!isExpanded) {
                  e.preventDefault();
                  handleLogoClick();
                }
              }}
              style={{ flexShrink: 0, textDecoration: "none" }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
                  boxShadow: "0 2px 12px rgba(99,102,241,0.45)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <Image
                  src="/icon.svg"
                  alt="Logo"
                  width={24}
                  height={24}
                  style={{ objectFit: "contain" }}
                />
              </div>
            </Link>

            {/* ── DESKTOP: links di tengah ── */}
            {!isMobile && (
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  alignItems: "center",
                  gap: 32,
                  opacity: isExpanded ? 1 : 0,
                  pointerEvents: isExpanded ? "auto" : "none",
                  transition: "opacity 0.25s ease 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {NAV_LINKS.map(({ href, label }) => {
                  const isExactOnly = href === "/" || href === "/logistik";
                  const active =
                    location === href ||
                    (!isExactOnly && location.startsWith(href));
                  return (
                    <Link
                      key={href}
                      href={href}
                      style={{
                        fontSize: 13,
                        fontWeight: active ? 600 : 500,
                        color: active ? "#4f46e5" : "#4b5563",
                        textDecoration: "none",
                        transition: "color 0.2s",
                      }}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* ── MOBILE: hamburger di dalam bar ── */}
            {isMobile && isExpanded && (
              <button
                onClick={() => setMobileMenuOpen((p) => !p)}
                aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
                style={{
                  width: 36, height: 36,
                  borderRadius: 8, border: "none",
                  background: "transparent", cursor: "pointer",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  gap: 6, flexShrink: 0, marginRight: 4,
                  opacity: isExpanded ? 1 : 0,
                  transition: "opacity 0.25s ease 0.1s",
                }}
              >
                <span style={{
                  display: "block", width: 20, height: 2,
                  background: "#4b5563", borderRadius: 2,
                  transition: "transform 0.3s ease",
                  transformOrigin: "50% 50%",
                  transform: mobileMenuOpen ? "translateY(4px) rotate(45deg)" : "none",
                }} />
                <span style={{
                  display: "block", width: 20, height: 2,
                  background: "#4b5563", borderRadius: 2,
                  transition: "transform 0.3s ease",
                  transformOrigin: "50% 50%",
                  transform: mobileMenuOpen ? "translateY(-4px) rotate(-45deg)" : "none",
                }} />
              </button>
            )}

            {/* ── CTA ── */}
            <div
              style={{
                position: "relative",
                opacity: isExpanded ? 1 : 0,
                pointerEvents: isExpanded ? "auto" : "none",
                transition: "opacity 0.25s ease 0.2s",
                flexShrink: 0,
              }}
            >
              {isAuth ? (
                <>
                  {/* Avatar User */}
                  <div 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-sm border-2 border-white cursor-pointer hover:shadow-md hover:scale-105 transition-all relative overflow-hidden"
                  >
                    <Image 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userRole || "Felix"}`} 
                      alt="User Avatar" 
                      width={32} 
                      height={32} 
                      className="rounded-full"
                    />
                  </div>

                  {/* Dropdown Profile */}
                  {showProfileMenu && (
                    <div className="absolute right-0 top-12 w-48 bg-white/95 backdrop-blur-md border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-2xl overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-3 border-b border-gray-50/50">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-500 mb-0.5">Role Pengguna</p>
                        <p className="text-sm font-bold text-gray-800 capitalize">{userRole || "User"}</p>
                      </div>
                      <Link href={`/${userRole}`} className="block px-4 py-2.5 text-xs font-semibold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors">
                        Dasbor Saya
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-50/50 transition-colors"
                      >
                        Keluar
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: "inline-block",
                    padding: "8px 18px",
                    borderRadius: 9999,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#fff",
                    background:
                      "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
                    boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Login / Sign Up
                </Link>
              )}
            </div>
          </nav>

        {/* ── MOBILE: CardNav GSAP ── */}
          {isMobile && isExpanded && (
            <div style={{ borderTop: mobileMenuOpen ? "0.5px solid rgba(0,0,0,0.06)" : "none" }}>
              <MobileNavCards
                isOpen={mobileMenuOpen}
                onLinkClick={() => setMobileMenuOpen(false)}
                cards={NAV_LINKS.map((l, i) => {
                  const bogaStops = ["#6366f1", "#4480e7", "#259bdd", "#06b6d4"];
                  return {
                    label: l.label,
                    href: l.href,
                    bgColor: bogaStops[i] ?? bogaStops[bogaStops.length - 1],
                    textColor: "#ffffff",
                  };
                })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}