"use client";

import React, { useState, useEffect } from "react";
import { 
  GraduationCap, 
  Factory, 
  MapPin, 
  MessageCircle, 
  Lock, 
  X,
  ThumbsUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { type Sekolah, type VendorSekolah, type Vendor } from "../../lib/mbgdummydata";
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
}

export const SchoolDetailPanel: React.FC<SchoolDetailPanelProps> = ({ school, vendors, onClose }) => {
  const [activeTab, setActiveTab] = useState<"vendor" | "comment">("vendor");
  const [newComment, setNewComment] = useState("");
  const comments = generateComments(school.nama);

  // Auth simulation
  const isAuth = true; 
  const avatarGradient = "linear-gradient(135deg,#6366f1,#06b6d4)";

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white rounded-[1.5rem] border border-slate-100 shadow-xl flex flex-col h-full overflow-hidden"
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
          Vendor ({vendors.length})
        </button>
        <button
          onClick={() => setActiveTab("comment")}
          className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest transition-all ${
            activeTab === "comment" ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Feedback ({comments.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        {activeTab === "vendor" ? (
          <div className="space-y-1">
            {vendors.map((v, idx) => (
              <div key={v.id} className="transform scale-[0.85] origin-top -mb-8">
                <VendorCard data={v} color={["#6366f1", "#10b981", "#f59e0b"][idx % 3]} />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Quick Comment Form */}
            <div className="flex gap-2 mb-3 bg-slate-50 p-1.5 rounded-lg">
              <input 
                type="text" 
                placeholder="Tulis..."
                className="flex-1 bg-transparent border-none text-[10px] focus:ring-0 placeholder:text-slate-400"
              />
              <button className="bg-indigo-600 text-white p-1 rounded-md">
                <MessageCircle className="w-3 h-3" />
              </button>
            </div>

            {comments.map((c) => (
              <div key={c.id} className="bg-slate-50/50 p-2.5 rounded-xl border border-white">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[9px] font-bold text-indigo-600">
                    {c.avatar}
                  </div>
                  <div className="flex-1 line-clamp-1">
                    <p className="text-[9px] font-black text-slate-800">{c.user}</p>
                    <p className="text-[7px] text-slate-400">{c.time}</p>
                  </div>
                </div>
                <p className="text-[9px] text-slate-600 leading-tight mb-1.5">
                  {c.content}
                </p>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1 text-[8px] font-bold text-slate-400 hover:text-indigo-600">
                    <ThumbsUp className="w-2.5 h-2.5" /> {c.likes}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
