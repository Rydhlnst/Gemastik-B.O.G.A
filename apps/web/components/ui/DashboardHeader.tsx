"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Bell, User } from "lucide-react";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Mitra", href: "/mitra" },
  { name: "About Us", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function DashboardHeader() {
  return (
    <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
      {/* Logo */}
      <Link href="/">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100"
        >
          B
        </motion.div>
      </Link>

      {/* Nav Links */}
      <nav className="hidden md:flex items-center gap-10">
        {NAV_LINKS.map((link) => (
          <Link key={link.name} href={link.href}>
            <span className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer tracking-tight">
              {link.name}
            </span>
          </Link>
        ))}
      </nav>

      {/* Profile & Actions */}
      <div className="flex items-center gap-4">
        <button className="p-2.5 bg-white border border-slate-100 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all shadow-sm">
          <Bell className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-100 shadow-sm cursor-pointer">
          <img 
            src="https://avatar.vercel.sh/boga" 
            alt="User profile" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
