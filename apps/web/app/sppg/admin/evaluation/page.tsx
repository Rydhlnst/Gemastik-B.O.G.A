"use client";

import React, { useState } from "react";
import { 
  Search, 
  Star, 
  Heart, 
  Users, 
  MessageCircle, 
  ChevronRight, 
  Filter,
  Download,
  Calendar,
  Smile,
  ThumbsUp,
  AlertTriangle,
  ArrowUpRight,
  School,
  Utensils
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function SppgEvaluationPage() {
  const [search, setSearch] = useState("");

  // Data Dummy Penilaian dari Sekolah & Siswa
  const schoolEvaluations = [
    { 
      id: 1, 
      school: "SDN 05 Ciparay", 
      studentScore: 4.9, 
      staffScore: 4.8, 
      totalStudents: 450,
      favoriteMenu: "Paket Nasi Ayam Bakar",
      status: "Sangat Puas",
      lastComment: "Anak-anak sangat suka dengan ayam bakarnya, bumbunya meresap!"
    },
    { 
      id: 2, 
      school: "SMPN 1 Baleendah", 
      studentScore: 4.5, 
      staffScore: 4.2, 
      totalStudents: 850,
      favoriteMenu: "Paket Ikan Nila Goreng",
      status: "Puas",
      lastComment: "Porsi sudah pas, pengiriman selalu tepat waktu sebelum jam istirahat."
    },
    { 
      id: 3, 
      school: "SDIT Al-Amanah", 
      studentScore: 3.8, 
      staffScore: 4.0, 
      totalStudents: 320,
      favoriteMenu: "Paket Telur Balado",
      status: "Cukup",
      lastComment: "Rasa enak, tapi sayurnya terkadang agak layu saat sampai."
    },
    { 
      id: 4, 
      school: "SMKN 7 Bandung", 
      studentScore: 4.7, 
      staffScore: 4.6, 
      totalStudents: 1200,
      favoriteMenu: "Paket Daging Sapi Teriyaki",
      status: "Sangat Puas",
      lastComment: "Layanan SPPG sangat responsif koordinasinya."
    }
  ];

  const filteredSchools = schoolEvaluations.filter(e => 
    e.school.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-10 max-w-[1600px] mx-auto min-h-screen font-sans bg-slate-50">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2">
             Program Impact <ChevronRight size={10} /> Beneficiary Feedback
          </div>
          <h1 className="text-4xl font-black text-[#213555] tracking-tight">Kepuasan Sekolah & Siswa</h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Dashboard monitoring hasil penilaian langsung dari penerima manfaat program B.O.G.A.</p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200 font-black text-[10px] uppercase tracking-widest text-[#213555]">
              <Download size={14} className="mr-2"/> Cetak Raport SPPG
           </Button>
           <Button className="h-12 px-8 rounded-2xl bg-[#213555] hover:opacity-90 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#213555]/20">
              <Calendar size={14} className="mr-2"/> Filter Periode
           </Button>
        </div>
      </div>

      {/* Sentiment Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-4">
            <div className="bg-[#213555] rounded-[40px] p-8 text-white h-full shadow-2xl shadow-slate-900/20 relative overflow-hidden">
               <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12">
                  <Heart size={200} fill="white" />
               </div>
               <h3 className="text-xl font-black mb-2 flex items-center gap-3 text-[#D8C4B6]">
                  <Smile size={24} /> Total Happiness Index
               </h3>
               <p className="text-slate-400 text-sm font-medium mb-8">Rangkuman suara dari seluruh siswa/i binaan SPPG.</p>
               
               <div className="space-y-8 relative z-10">
                  <div>
                     <div className="flex justify-between items-end mb-2">
                        <span className="text-4xl font-black">4.7<span className="text-lg text-[#D8C4B6]">/5.0</span></span>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">Luar Biasa</span>
                     </div>
                     <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-[#D8C4B6]" style={{ width: '94%' }} />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                     <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Rasa Makanan</p>
                        <p className="text-lg font-black text-white">96% <span className="text-[10px] text-emerald-400">Enak</span></p>
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Porsi & Kenyang</p>
                        <p className="text-lg font-black text-white">92% <span className="text-[10px] text-emerald-400">Pas</span></p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Favorite Menus */}
         <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 flex flex-col justify-between">
               <div>
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                     <Utensils size={14} className="text-[#213555]" /> Menu Paling Disukai
                  </h4>
                  <div className="space-y-4">
                     {[
                       { name: "Paket Ayam Bakar", rate: 4.9, count: 1240 },
                       { name: "Sapi Teriyaki", rate: 4.8, count: 980 },
                       { name: "Ikan Nila Goreng", rate: 4.7, count: 750 }
                     ].map((menu, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                           <div className="flex items-center gap-3">
                              <span className="text-lg font-black text-[#213555] opacity-20">#{i+1}</span>
                              <p className="text-xs font-black text-slate-800">{menu.name}</p>
                           </div>
                           <div className="flex items-center gap-2">
                              <Star size={12} className="text-amber-500" fill="currentColor" />
                              <span className="text-xs font-black">{menu.rate}</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
               <Button variant="ghost" className="mt-6 w-full text-[10px] font-black uppercase text-[#213555] hover:bg-slate-50 h-10 rounded-xl">Lihat Statistik Menu Lengkap</Button>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 flex flex-col justify-between">
               <div>
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                     <AlertTriangle size={14} className="text-amber-500" /> Butuh Perhatian
                  </h4>
                  <div className="space-y-4">
                     {[
                       { name: "Suhu Makanan (Kurang Panas)", count: 3, level: "Moderate" },
                       { name: "Kerapian Packing (Bocor)", count: 1, level: "Low" }
                     ].map((issue, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                           <div>
                              <p className="text-xs font-black text-slate-800">{issue.name}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{issue.count} Sekolah Melaporkan</p>
                           </div>
                           <span className={`text-[9px] font-black px-2 py-1 rounded-md ${issue.level === 'Moderate' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>{issue.level}</span>
                        </div>
                     ))}
                  </div>
               </div>
               <Button className="mt-6 w-full h-12 rounded-2xl bg-[#213555] text-white font-black text-[10px] uppercase shadow-lg shadow-[#213555]/20">Tindak Lanjuti Masalah</Button>
            </div>
         </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
         <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#213555] flex items-center justify-center">
                  <School size={20} />
               </div>
               <h3 className="text-lg font-black text-slate-800">Detail Penilaian per Sekolah</h3>
            </div>
            <div className="relative w-full max-w-xs">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
               <Input 
                 placeholder="Cari nama sekolah..." 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="h-10 pl-9 rounded-xl bg-slate-50 border-slate-200 text-xs font-bold"
               />
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-[#F2F2F2]/50 border-b border-slate-100">
                  <tr>
                     <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Nama Sekolah</th>
                     <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Rating Siswa</th>
                     <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Penilaian Staff</th>
                     <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status Kepuasan</th>
                     <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right pr-10">Aksi</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredSchools.map((item) => (
                     <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6">
                           <div>
                              <p className="text-sm font-black text-slate-800">{item.school}</p>
                              <p className="text-[10px] font-bold text-blue-500 uppercase mt-0.5">{item.totalStudents} Siswa Terdaftar</p>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-2">
                              <Star size={12} className="text-amber-500" fill="currentColor" />
                              <span className="text-xs font-black">{item.studentScore}</span>
                              <span className="text-[10px] font-medium text-slate-400">Bagus</span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-2">
                              <ThumbsUp size={12} className="text-blue-500" />
                              <span className="text-xs font-black">{item.staffScore}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              item.status === 'Sangat Puas' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                              item.status === 'Puas' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 
                              'bg-amber-50 text-amber-600 border border-amber-100'
                           }`}>
                              {item.status}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-right pr-10">
                           <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full hover:bg-white hover:shadow-md text-[#213555]">
                              <ArrowUpRight size={18} />
                           </Button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

    </div>
  );
}
