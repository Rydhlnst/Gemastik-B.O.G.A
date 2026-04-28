"use client";

import React, { useState, useEffect } from "react";
import { 
  GraduationCap, 
  Factory, 
  MapPin, 
  MessageCircle, 
  Lock, 
  X,
  ThumbsUp,
  Star,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { type Sekolah, type VendorSekolah, type Vendor, getSPPGBySekolah } from "../../lib/mbgdummydata";
import { VendorCard } from "./VendorCard";

interface Comment {
  id: number;
  user: string;
  avatar: string;
  role: string;
  time: string;
  content: string;
  likes: number;
}

const generateComments = (schoolName: string): Comment[] => [
  { id: 1, user: "Waka Kurikulum", avatar: "W", role: "Admin", time: "1 jam lalu", content: `Distribusi ke ${schoolName} lancar. B.O.G.A on-time 3 bulan.`, likes: 12 },
  { id: 2, user: "Siswa - Kelas 8B", avatar: "S", role: "Siswa", time: "3 jam lalu", content: "Makannya enak dan porsinya cukup! Minta tambah susu dong!", likes: 8 },
  { id: 3, user: "Operator MBG", avatar: "O", role: "Operator", time: "5 jam lalu", content: "Manifest pengiriman sudah di-upload. Status: DELIVERED", likes: 15 },
];

interface SchoolDetailPanelProps {
  school: Sekolah;
  vendors: (VendorSekolah & { vendor: Vendor })[];
  onClose: () => void;
  readOnly?: boolean;
}

export const SchoolDetailPanel: React.FC<SchoolDetailPanelProps> = ({ school, vendors, onClose, readOnly = false }) => {
  const [submitted, setSubmitted] = useState(false);
  
  const comments = generateComments(school.nama);
  const sppg = getSPPGBySekolah(school.id);

  // Auth simulation
  const isAuth = true; 
  const avatarGradient = "linear-gradient(135deg,var(--role-primary),var(--role-accent))";

  const handleRate = (key: keyof typeof rating, val: number) => {
    setRating(prev => ({ ...prev, [key]: val }));
  };

  const submitRating = () => {
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setRating({ rasa: 0, higiene: 0, porsi: 0, waktu: 0 });
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-surface rounded-[var(--radius-xl)] border border-border shadow-lg flex flex-col h-full overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-50 relative bg-gradient-to-br from-slate-50/50 to-white">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        
        <h3 className="text-base font-black text-slate-900 leading-tight mb-1.5 pr-8">
          {school.nama}
        </h3>
        
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500">
            <GraduationCap className="w-3 h-3" />
            <span className="text-[10px] font-bold">{school.total_siswa} Siswa · {school.jenjang}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <MapPin className="w-3 h-3" />
            <span className="text-[10px] font-bold truncate">{school.kecamatan}, {school.kota}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-50">
        <button
          onClick={() => setActiveTab("vendor")}
          className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest transition-all ${
            activeTab === "vendor" ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Vendor
        </button>
        <button
          onClick={() => setActiveTab("sppg")}
          className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest transition-all ${
            activeTab === "sppg" ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Unit (SPPG)
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === "vendor" ? (
            <motion.div 
              key="vendor-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-1"
            >
              {vendors.map((v, idx) => (
                <div key={v.id} className="transform scale-[0.85] origin-top -mb-8">
                  <VendorCard
                    data={v}
                    color={
                      [
                        "hsl(var(--status-info))",
                        "hsl(var(--status-success))",
                        "hsl(var(--status-warning))",
                      ][idx % 3]
                    }
                  />
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="sppg-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 px-1"
            >
              {sppg ? (
                <>
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                        <Factory className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-slate-800 leading-none mb-1">{sppg.nama}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{sppg.kecamatan}, {sppg.kota}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white p-2 rounded-lg border border-slate-50">
                        <p className="text-[7px] font-black text-slate-400 uppercase">Kapasitas</p>
                        <p className="text-[10px] font-black text-slate-800">{sppg.kapasitas_porsi.toLocaleString()} / hari</p>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-50">
                        <p className="text-[7px] font-black text-slate-400 uppercase">Rating Unit</p>
                        <p className="text-[10px] font-black text-slate-800">★ {sppg.rating.toFixed(1)}</p>
                      </div>
                    </div>
                  </div>


                </>
              ) : (
                <div className="py-20 text-center">
                  <p className="text-[10px] font-bold text-slate-400 italic">Data SPPG tidak ditemukan untuk sekolah ini.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
