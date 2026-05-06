"use client";

import React, { useState } from "react";
import { 
  ArrowLeft, Calendar, CheckCircle2, Clock, Truck, 
  ShieldCheck, PenTool, ChevronRight, Package, 
  MapPin, Info, AlertCircle, FileCheck, Search,
  Filter, Download, Share2, ClipboardList, TrendingUp, Store, ChevronDown, Utensils, Zap, School
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function RealtimeMonitoringPage() {
  const params = useParams();
  const id = params.id as string;
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [searchVendor, setSearchVendor] = useState("");
  const [expandedVendorId, setExpandedVendorId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("logistics");

  // Data Dummy 15+ Vendor dengan Individual Steps (Opsi 2)
  const suppliers = [
    { 
      id: 1, name: "Toko Beras Jaya", category: "Karbo", item: "Beras Cianjur", status: "QC Selesai", progress: 100, time: "08:15",
      steps: [
        { label: "Handover", status: "completed", time: "08:15", desc: "Barang sudah diterima di titik muat." },
        { label: "Transit", status: "completed", time: "10:00", desc: "Armada dalam perjalanan ke SPPG." },
        { label: "QC Check", status: "completed", time: "14:00", desc: "Lulus uji kadar air & kebersihan." },
        { label: "Final Sign", status: "completed", time: "15:00", desc: "Disetujui oleh Admin." }
      ]
    },
    { 
      id: 2, name: "Peternakan Maju", category: "Protein", item: "Daging Ayam", status: "Transit", progress: 50, time: "10:30",
      steps: [
        { label: "Handover", status: "completed", time: "10:30", desc: "Daging ayam segar sudah dimuat." },
        { label: "Transit", status: "current", time: "Moving", desc: "Dalam perjalanan (Suhu Cold Storage: 4°C)." },
        { label: "QC Check", status: "pending", time: "-", desc: "Menunggu armada tiba di SPPG." },
        { label: "Final Sign", status: "pending", time: "-", desc: "Menunggu verifikasi QC." }
      ]
    },
    { 
      id: 3, name: "Kebun Lembang", category: "Sayur", item: "Pakcoy & Wortel", status: "Handover", progress: 25, time: "11:45",
      steps: [
        { label: "Handover", status: "current", time: "11:45", desc: "Sedang proses sortir dan pemuatan." },
        { label: "Transit", status: "pending", time: "-", desc: "-" },
        { label: "QC Check", status: "pending", time: "-", desc: "-" },
        { label: "Final Sign", status: "pending", time: "-", desc: "-" }
      ]
    },
    { id: 4, name: "CV Telur Emas", category: "Protein", item: "Telur Ayam", status: "QC Selesai", progress: 100, time: "09:00", steps: [] },
    { id: 5, name: "Koperasi Susu Berkah", category: "Pelengkap", item: "Susu UHT", status: "Transit", progress: 65, time: "11:20", steps: [] },
    { id: 6, name: "Tani Makmur Ciparay", category: "Karbo", item: "Jagung Manis", status: "QC Selesai", progress: 100, time: "08:45", steps: [] },
    { id: 7, name: "Nelayan Selatan", category: "Protein", item: "Ikan Nila", status: "Handover", progress: 10, time: "13:00", steps: [] },
    { id: 8, name: "Grosir Bumbu Desa", category: "Bumbu", item: "Bumbu Dasar", status: "QC Selesai", progress: 100, time: "07:30", steps: [] },
    { id: 9, name: "Kebun Buah Ciwidey", category: "Buah", item: "Pisang Ambon", status: "Transit", progress: 50, time: "12:15", steps: [] },
    { id: 10, name: "Mandiri Sayur", category: "Sayur", item: "Buncis & Bayam", status: "Handover", progress: 25, time: "12:45", steps: [] },
    { id: 11, name: "Dapur Rempah", category: "Bumbu", item: "Minyak & Garam", status: "QC Selesai", progress: 100, time: "07:00", steps: [] },
    { id: 12, name: "Ternak Berkah", category: "Protein", item: "Daging Sapi", status: "Transit", progress: 45, time: "13:30", steps: [] },
    { id: 13, name: "Pabrik Tahu Bandung", category: "Protein", item: "Tahu & Tempe", status: "QC Selesai", progress: 100, time: "08:00", steps: [] },
    { id: 14, name: "Agro Sejahtera", category: "Sayur", item: "Labu Siam", status: "Handover", progress: 15, time: "14:00", steps: [] },
    { id: 15, name: "Mitra Logistik A", category: "Gudang", item: "Buffer Stock", status: "QC Selesai", progress: 100, time: "06:00", steps: [] },
  ];

  const filteredSuppliers = suppliers.filter(s => s.name.toLowerCase().includes(searchVendor.toLowerCase()));

  // Data Dummy Progress Per Minggu (Agregat)
  const weeklyData = [
    { week: 1, status: "Selesai", dateRange: "01 - 07 Juni 2026", progress: 100 },
    { week: 2, status: "Sedang Berjalan", dateRange: "08 - 14 Juni 2026", progress: 65 }
  ];

  const currentData = weeklyData.find(d => d.week === selectedWeek) || weeklyData[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Premium Header */}
      <header className="bg-slate-50/80 backdrop-blur-md border-b sticky top-0 z-40" style={{ borderColor: "#D8C4B6" }}>
        <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
           <div className="flex items-center gap-6">
              <Link href="/sppg/admin/tender/progress">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-200/50">
                  <ArrowLeft size={22} className="text-[#213555]" />
                </Button>
              </Link>
              <div>
                 <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">
                    Multisupplier Monitoring <ChevronRight size={10} /> SDN 05 Ciparay
                 </div>
                 <h1 className="text-xl font-black text-[#213555]">Monitoring Admin</h1>
              </div>
           </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto w-full p-8">
        
        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit mb-8">
           <button 
             onClick={() => setActiveTab("logistics")}
             className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "logistics" ? 'bg-[#213555] text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
           >
              1. Logistik Bahan Baku
           </button>
           <button 
             onClick={() => setActiveTab("production")}
             className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "production" ? 'bg-[#213555] text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
           >
              2. Produksi & Pengiriman
           </button>
        </div>

        {activeTab === "logistics" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Sidebar: Weekly Selector */}
        <div className="lg:col-span-3 space-y-6">
           <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Pilih Periode Minggu</h3>
              <div className="space-y-3">
                 {weeklyData.map((data) => (
                   <button 
                     key={data.week}
                     onClick={() => setSelectedWeek(data.week)}
                     className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group ${selectedWeek === data.week ? 'bg-[#213555] border-[#213555] text-white shadow-xl' : 'bg-white border-slate-100 text-slate-600 hover:border-[#213555]/30'}`}
                   >
                      <div className="text-left">
                         <p className={`text-xs font-black ${selectedWeek === data.week ? 'text-white' : 'text-slate-900'}`}>Minggu ke-{data.week}</p>
                         <p className={`text-[10px] font-medium ${selectedWeek === data.week ? 'text-white/60' : 'text-slate-400'}`}>{data.dateRange}</p>
                      </div>
                      {data.status === "Selesai" && <CheckCircle2 size={16} className={selectedWeek === data.week ? 'text-[#D8C4B6]' : 'text-emerald-500'} />}
                      {data.status === "Sedang Berjalan" && <Clock size={16} className={selectedWeek === data.week ? 'text-white animate-pulse' : 'text-amber-500'} />}
                   </button>
                 ))}
              </div>
           </div>

           <div className="bg-[#213555] rounded-[32px] p-8 text-white shadow-2xl shadow-slate-900/20">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 rounded-2xl bg-[#D8C4B6] flex items-center justify-center text-[#213555]">
                    <ShieldCheck size={20} />
                 </div>
                 <p className="text-xs font-black uppercase tracking-widest leading-tight">Batch Authorization</p>
              </div>
              <p className="text-[11px] font-medium text-slate-300 mb-6">Penyelesaian batch membutuhkan validasi dari setiap vendor yang terdaftar di minggu ini.</p>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Vendor Cleared</span>
                    <span className="text-xs font-black">9 / 15</span>
                 </div>
                 <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#D8C4B6]" style={{ width: '60%' }} />
                 </div>
              </div>
           </div>
        </div>

        {/* Main Content: Progress Tracker */}
        <div className="lg:col-span-9 space-y-8">
           
           {/* Kitchen Production Monitor & Dispatch Control */}
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Menu Production Progress */}
              <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
                 <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                          <Utensils size={24} />
                       </div>
                       <div>
                          <h3 className="text-lg font-black text-[#213555]">Progres Menu Hari Ini</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Dapur Pusat SPPG</p>
                       </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                       Tepat Waktu
                    </div>
                 </div>

                 <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Persiapan", progress: 100, icon: Package },
                      { label: "Memasak", progress: 85, icon: Zap },
                      { label: "Packing", progress: 40, icon: CheckCircle2 }
                    ].map((step, i) => (
                       <div key={i} className="p-4 rounded-2xl border border-slate-50 bg-slate-50/50 relative overflow-hidden group">
                          <div className="absolute top-0 left-0 h-1 bg-blue-500 transition-all duration-1000" style={{ width: `${step.progress}%` }} />
                          <step.icon size={16} className="text-[#213555] mb-3 opacity-40" />
                          <p className="text-[10px] font-black text-slate-800 mb-3">{step.label}</p>
                          <div className="flex items-end justify-between">
                             <span className="text-xl font-black text-[#213555]">{step.progress}%</span>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Dispatch Authorization Card */}
              <div className="bg-[#213555] rounded-[32px] p-8 text-white shadow-xl shadow-slate-900/30 flex flex-col justify-between relative overflow-hidden">
                 <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                 
                 <div>
                    <div className="flex items-center gap-3 mb-4 text-[#D8C4B6]">
                       <ShieldCheck size={20} />
                       <h4 className="text-sm font-black uppercase tracking-widest">Otoritas Pengiriman</h4>
                    </div>
                    <p className="text-[11px] font-medium text-slate-400 leading-relaxed mb-6">
                       Klik tombol di bawah untuk **Membuka Gerbang Logistik** setelah semua menu siap dikirim.
                    </p>
                 </div>

                 <Button className="w-full h-12 rounded-2xl bg-[#D8C4B6] hover:bg-[#D8C4B6]/90 text-[#213555] font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-black/20 flex items-center gap-3 group transition-all">
                    <Truck size={16} className="group-hover:translate-x-1 transition-transform" />
                    Izinkan Pengiriman
                 </Button>
              </div>
           </div>
           {/* MULTISUPPLIER DETAILED TRACKING */}
           <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                 <div>
                    <h3 className="text-lg font-black text-[#213555] flex items-center gap-3">
                       <Store size={22} className="text-[#D8C4B6]" /> Daftar Vendor & Progress Individual
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">Klik pada baris vendor untuk melihat detail perjalanan logistik.</p>
                 </div>
                 <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <Input 
                       placeholder="Cari Nama Vendor..." 
                       value={searchVendor}
                       onChange={(e) => setSearchVendor(e.target.value)}
                       className="h-10 pl-9 pr-4 rounded-xl bg-slate-50 border-slate-200 text-xs font-bold"
                    />
                 </div>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-[#F2F2F2] border-b border-slate-200">
                       <tr>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Pemasok & Bahan Baku</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Kategori</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right pr-10">Status Terakhir</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {filteredSuppliers.map((supplier) => (
                          <React.Fragment key={supplier.id}>
                             <tr 
                                onClick={() => setExpandedVendorId(expandedVendorId === supplier.id ? null : supplier.id)}
                                className={`group hover:bg-slate-50 transition-all cursor-pointer ${expandedVendorId === supplier.id ? 'bg-slate-50/80' : ''}`}
                             >
                                <td className="px-8 py-5">
                                   <div className="flex items-center gap-4">
                                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${expandedVendorId === supplier.id ? 'bg-[#213555] text-white' : 'bg-slate-100 text-[#213555] border border-slate-200 shadow-sm'}`}>
                                         {expandedVendorId === supplier.id ? <ChevronDown size={20} /> : <Package size={20} />}
                                      </div>
                                      <div>
                                         <p className="text-sm font-black text-slate-800">{supplier.name}</p>
                                         <p className="text-[10px] font-bold text-blue-500 uppercase mt-0.5">{supplier.item}</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-8 py-5">
                                   <span className="px-2 py-1 rounded-md bg-[#D8C4B6]/20 text-[#213555] text-[9px] font-black uppercase tracking-wider">{supplier.category}</span>
                                </td>
                                <td className="px-8 py-5 text-right pr-10">
                                   <div className="flex items-center justify-end gap-2">
                                      <div className={`w-2 h-2 rounded-full ${supplier.status === 'QC Selesai' ? 'bg-emerald-500' : supplier.status === 'Transit' ? 'bg-blue-500' : 'bg-amber-500 animate-pulse'}`} />
                                      <span className={`text-[10px] font-black uppercase tracking-widest ${supplier.status === 'QC Selesai' ? 'text-emerald-600' : supplier.status === 'Transit' ? 'text-blue-600' : 'text-amber-600'}`}>{supplier.status}</span>
                                   </div>
                                </td>
                             </tr>
                             
                             {/* Individual Stepper & Action Expansion (Opsi 2) */}
                             <AnimatePresence>
                               {expandedVendorId === supplier.id && (
                                 <motion.tr 
                                   initial={{ opacity: 0, height: 0 }}
                                   animate={{ opacity: 1, height: 'auto' }}
                                   exit={{ opacity: 0, height: 0 }}
                                   className="bg-white border-b border-slate-100"
                                 >
                                    <td colSpan={3} className="px-12 py-10">
                                       <div className="flex flex-col gap-10">
                                          {/* Step Flow */}
                                          <div className="grid grid-cols-4 gap-4 relative">
                                             <div className="absolute top-6 left-10 right-10 h-0.5 bg-slate-100" />
                                             
                                             {(supplier.steps && supplier.steps.length > 0 ? supplier.steps : [
                                               { label: "Handover", status: "completed", time: "08:00", desc: "Barang sudah masuk." },
                                               { label: "Transit", status: "current", time: "Active", desc: "Menuju lokasi." },
                                               { label: "QC Check", status: "pending", time: "-", desc: "Antre pengecekan." },
                                               { label: "Final Sign", status: "pending", time: "-", desc: "Belum disahkan." }
                                             ]).map((step, idx) => (
                                               <div key={idx} className="relative z-10 flex flex-col items-center text-center">
                                                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border-4 border-white shadow-lg transition-all ${
                                                     step.status === "completed" ? 'bg-emerald-500 text-white' : 
                                                     step.status === "current" ? 'bg-[#213555] text-white scale-110' : 
                                                     'bg-slate-100 text-slate-300'
                                                  }`}>
                                                     {idx === 0 && <Package size={18} />}
                                                     {idx === 1 && <Truck size={18} />}
                                                     {idx === 2 && <ShieldCheck size={18} />}
                                                     {idx === 3 && <PenTool size={18} />}
                                                  </div>
                                                  <p className="text-[10px] font-black uppercase tracking-wider mb-1 text-slate-800">{step.label}</p>
                                                  <p className="text-[9px] font-medium text-slate-400 leading-tight max-w-[100px]">{step.desc}</p>
                                                  {step.time !== "-" && <p className="mt-2 text-[9px] font-black text-[#213555] bg-[#D8C4B6]/30 px-2 py-0.5 rounded-full">{step.time}</p>}
                                               </div>
                                             ))}
                                          </div>

                                          {/* Admin Actions (Individual) */}
                                          <div className="bg-slate-50 rounded-[24px] p-6 border border-slate-200 flex items-center justify-between">
                                             <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#213555]">
                                                   <AlertCircle size={20} />
                                                </div>
                                                <div>
                                                   <p className="text-xs font-black text-[#213555] uppercase tracking-wider">Verifikasi Akhir Vendor</p>
                                                   <p className="text-[10px] text-slate-400 font-medium">Lakukan tanda tangan digital untuk setiap vendor secara mandiri.</p>
                                                </div>
                                             </div>
                                             <div className="flex items-center gap-3">
                                                <Button 
                                                  variant="outline" 
                                                  className="h-10 px-6 rounded-xl border-red-200 text-red-600 hover:bg-red-50 font-black text-[10px] uppercase tracking-widest"
                                                >
                                                   <Info size={14} className="mr-2" /> Ajukan Revisi
                                                </Button>
                                                <Button 
                                                  disabled={supplier.status === "QC Selesai"}
                                                  className="h-10 px-6 rounded-xl bg-[#213555] text-white hover:opacity-90 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                                                >
                                                   <PenTool size={14} /> Setujui & Tanda Tangan
                                                </Button>
                                             </div>
                                          </div>
                                       </div>
                                    </td>
                                 </motion.tr>
                               )}
                             </AnimatePresence>
                          </React.Fragment>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
          </div>
        </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* Kitchen Authorization Workflow */}
             <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5">
                   <Utensils size={200} />
                </div>
                
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-12 border-b border-slate-50 pb-8">
                   <div>
                      <h2 className="text-3xl font-black text-[#213555]">Otoritas Produksi & Dispatch</h2>
                      <p className="text-slate-500 font-medium mt-1 text-sm">Pilih sekolah untuk mensahkan tahapan produksi dan izin kirim.</p>
                   </div>
                   
                   {/* School Selector for Production */}
                   <div className="flex flex-col gap-2 min-w-[280px]">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilih Sekolah Penerima</p>
                      <div className="flex gap-2">
                         <select 
                           className="flex-1 h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#213555] focus:ring-2 focus:ring-[#213555]/10 outline-none appearance-none"
                           defaultValue="SDN 05 Ciparay"
                         >
                            <option>SDN 05 Ciparay</option>
                            <option>SMPN 1 Baleendah</option>
                            <option>SMKN 7 Bandung</option>
                         </select>
                         <div className="w-12 h-12 rounded-xl bg-[#213555] text-[#D8C4B6] flex items-center justify-center">
                            <School size={20} />
                         </div>
                      </div>
                   </div>
                </div>

                {/* Today's Specific Menu for Selected School */}
                <div className="mb-12">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Utensils size={14} className="text-[#213555]" /> Daftar Menu Produksi Hari Ini
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { name: "Nasi Putih Organik", weight: "150g", status: "Selesai" },
                        { name: "Ayam Bakar Madu", weight: "100g", status: "Sedang Dimasak" },
                        { name: "Tumis Labu Siam", weight: "80g", status: "Persiapan" }
                      ].map((menu, i) => (
                         <div key={i} className="p-5 rounded-3xl border border-slate-100 bg-slate-50/50 flex items-center justify-between group hover:border-[#213555]/20 transition-all">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-[#213555] font-black text-xs">
                                  {i+1}
                               </div>
                               <div>
                                  <p className="text-xs font-black text-[#213555]">{menu.name}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">{menu.weight}</p>
                               </div>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${menu.status === 'Selesai' ? 'bg-emerald-500' : menu.status === 'Sedang Dimasak' ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`} />
                         </div>
                      ))}
                   </div>
                </div>

                {/* Production Steps */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   {[
                     { label: "1. Pemasakan", status: "Selesai", icon: Zap, color: "bg-emerald-500", detail: "Chef telah memvalidasi rasa & kematangan." },
                     { label: "2. QC Nutrisi", status: "Selesai", icon: ShieldCheck, color: "bg-emerald-500", detail: "Kandungan gizi sesuai standar BGN." },
                     { label: "3. Packing & Label", status: "Dalam Proses", icon: Package, color: "bg-blue-500", detail: "Sedang proses penyegelan wadah makanan." },
                     { label: "4. Izin Dispatch", status: "Terkunci", icon: Truck, color: "bg-slate-200", detail: "Menunggu pengesahan admin SPPG." }
                   ].map((step, i) => (
                      <div key={i} className={`p-8 rounded-[32px] border transition-all ${step.status === 'Selesai' ? 'bg-emerald-50/50 border-emerald-100' : step.status === 'Dalam Proses' ? 'bg-white border-blue-200 shadow-xl shadow-blue-500/5' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-white ${step.color}`}>
                            <step.icon size={24} />
                         </div>
                         <p className="text-xs font-black text-slate-800 mb-2">{step.label}</p>
                         <p className="text-[10px] font-bold text-slate-400 mb-6 uppercase tracking-widest">{step.status}</p>
                         <p className="text-[11px] font-medium text-slate-500 leading-relaxed">{step.detail}</p>
                      </div>
                   ))}
                </div>

                <div className="mt-12 p-8 rounded-[32px] bg-[#213555] text-white flex flex-col md:flex-row items-center justify-between gap-8">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center text-[#D8C4B6]">
                         <FileCheck size={32} />
                      </div>
                      <div>
                         <h4 className="text-xl font-black">Sahkan Hasil Produksi</h4>
                         <p className="text-sm text-slate-400 font-medium leading-relaxed">Pengesahan ini berlaku khusus untuk unit logistik tujuan sekolah yang dipilih.</p>
                      </div>
                   </div>
                   <div className="flex gap-4 w-full md:w-auto">
                      <Button variant="outline" className="flex-1 md:flex-none h-14 px-8 rounded-2xl border-white/20 text-white hover:bg-white/5 font-black text-[10px] uppercase tracking-widest">
                         Tunda & Revisi
                      </Button>
                      <Button className="flex-1 md:flex-none h-14 px-12 rounded-2xl bg-[#D8C4B6] text-[#213555] hover:bg-[#D8C4B6]/90 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-black/20">
                         Sahkan & Buka Gerbang
                      </Button>
                   </div>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`px-2 py-1 rounded text-[10px] font-bold border ${className}`}>
      {children}
    </span>
  );
}
