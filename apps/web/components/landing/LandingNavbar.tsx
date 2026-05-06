"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Landmark, Store, Box, Truck, School, Users } from "lucide-react";
import Link from "next/link";
import { PrimaryButton } from "./CustomButtons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const portalLinks = [
  { label: "Portal Pemerintah", href: "/goverment/dashboard", icon: Landmark },
  { label: "Portal Vendor", href: "/vendor/dashboard", icon: Store },
  { label: "Portal SPPG", href: "/sppg/dashboard", icon: Box },
  { label: "Portal Logistik", href: "/logistik/dashboard", icon: Truck },
  { label: "Admin Sekolah", href: "/sekolah/admin", icon: School },
  { label: "Siswa", href: "/sekolah/siswa", icon: Users },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobilePortalsOpen, setMobilePortalsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "#" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Primitives", href: "#primitives" },
    { label: "Roles", href: "#roles" },
    { label: "Portals", href: "#", hasDropdown: true },
  ];

  return (
    <nav
      className={[
        "fixed top-0 left-0 right-0 z-50 h-[72px] transition-all duration-500",
        scrolled
          ? "bg-white/70 backdrop-blur-[24px] border-b border-slate-200/60 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]"
          : "bg-black/5 backdrop-blur-[12px] border-b border-white/10",
      ].join(" ")}
    >
      <div className="h-full max-w-[1400px] mx-auto px-6 lg:px-10 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-cyan-500 rounded-[10px] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20">
            B
          </div>
          <span
            className={[
              "font-bold text-sm tracking-tight transition-colors",
              scrolled ? "text-slate-900" : "text-white",
            ].join(" ")}
          >
            B.O.G.A
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            if (link.hasDropdown) {
              return (
                <DropdownMenu key={link.label}>
                  <DropdownMenuTrigger className="outline-none">
                    <div
                      className={[
                        "flex items-center gap-1 text-sm font-medium transition-colors hover:text-indigo-600",
                        scrolled
                          ? "text-slate-600"
                          : "text-white/80 hover:text-white",
                      ].join(" ")}
                    >
                      {link.label}
                      <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="min-w-[220px] p-2 bg-white/95 backdrop-blur-md border-[#E2E8F0] shadow-xl rounded-xl">
                    {portalLinks.map((portal) => (
                      <DropdownMenuItem key={portal.label} asChild>
                        <Link
                          href={portal.href}
                          className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                            <portal.icon className="w-4 h-4 text-slate-500 group-hover:text-indigo-600" />
                          </div>
                          <span className="text-sm font-medium text-slate-700">
                            {portal.label}
                          </span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }
            return (
              <a
                key={link.label}
                href={link.href}
                className={[
                  "flex items-center gap-1 text-sm font-medium transition-colors hover:text-indigo-600",
                  scrolled
                    ? "text-slate-600"
                    : "text-white/80 hover:text-white",
                ].join(" ")}
              >
                {link.label}
              </a>
            );
          })}
        </div>

        {/* CTA */}
        <div className="hidden md:block">
          <PrimaryButton
            href="/auth/login"
            className="py-2.5 px-5 text-sm"
            icon={false}
          >
            Masuk
          </PrimaryButton>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={[
            "md:hidden p-2 rounded-lg transition-colors",
            scrolled
              ? "text-slate-700 hover:bg-slate-100"
              : "text-white hover:bg-white/10",
          ].join(" ")}
        >
          {menuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="md:hidden bg-[rgba(250,250,247,0.95)] backdrop-blur-[16px] border-b border-[#E2E8F0] overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <div key={link.label}>
                  <button
                    onClick={() => {
                      if (link.hasDropdown) {
                        setMobilePortalsOpen(!mobilePortalsOpen);
                      } else {
                        setMenuOpen(false);
                        window.location.href = link.href;
                      }
                    }}
                    className="w-full flex items-center justify-between py-3 px-4 rounded-xl text-slate-700 font-medium hover:bg-slate-100 transition-colors"
                  >
                    {link.label}
                    {link.hasDropdown && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${mobilePortalsOpen ? "rotate-180" : ""}`}
                      />
                    )}
                  </button>
                  {link.hasDropdown && (
                    <AnimatePresence>
                      {mobilePortalsOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pl-4 overflow-hidden"
                        >
                          {portalLinks.map((portal) => (
                            <Link
                              key={portal.label}
                              href={portal.href}
                              onClick={() => setMenuOpen(false)}
                              className="flex items-center gap-3 py-3 px-4 rounded-xl text-slate-600 text-sm hover:bg-slate-50 transition-colors"
                            >
                              <portal.icon className="w-4 h-4 opacity-70" />
                              {portal.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
              <div className="mt-4 px-4 pb-4">
                <PrimaryButton
                  href="/auth/login"
                  className="w-full"
                  icon={false}
                >
                  Masuk
                </PrimaryButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
