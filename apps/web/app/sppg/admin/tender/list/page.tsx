"use client";

import React, { useState } from "react";
import { 
  Search, 
  Plus, 
  FileText, 
  MoreVertical, 
  Building2, 
  Calendar, 
  Users, 
  ExternalLink,
  ChevronDown,
  Filter,
  Send,
  CheckCircle2,
  Store,
  Clock,
  ShieldCheck,
  Info,
  UtensilsCrossed,
  PlusCircle,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TenderListPage() {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAllVendors, setShowAllVendors] = useState<{[key: string]: boolean}>({});
  
  // State untuk mengelola workflow persetujuan secara dinamis
  const [contracts, setContracts] = useState([
    {
      id: "1",
      noReg: "REG-SPPG-2026-001",
      instansi: "SDN 01 Bojongsoang",
      tglMulai: "2026-06-01",
      durasi: "12",
      kuota: "450",
      status: "Draft",
      pic: "Bp. Ahmad Sudrajat",
      menus: [
        { name: "Paket Nasi Ayam Bakar", freq: "15 Hari", totalPortion: "6.750", estCost: "Rp 15.000", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=200&auto=format&fit=crop" },
        { name: "Paket Ikan Nila Goreng", freq: "10 Hari", totalPortion: "4.500", estCost: "Rp 14.500", image: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?q=80&w=200&auto=format&fit=crop" }
      ],
      vendors: [
        { name: "Koperasi Tani Makmur", image: "https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?q=80&w=100&auto=format&fit=crop", status: "Menunggu" },
        { name: "CV Sayur Lembang", image: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=100&auto=format&fit=crop", status: "Menunggu" },
        { name: "Toko Beras Jaya", image: "https://images.unsplash.com/photo-1586201327693-86645f745a5c?q=80&w=100&auto=format&fit=crop", status: "Menunggu" },
        { name: "Peternakan Ayam Maju", image: "https://images.unsplash.com/photo-1584263343363-4499d56dec3a?q=80&w=100&auto=format&fit=crop", status: "Menunggu" },
        { name: "Nelayan Mandiri", image: "https://images.unsplash.com/photo-1498654077810-12c21d4d6dc3?q=80&w=100&auto=format&fit=crop", status: "Menunggu" },
        { name: "Susu Murni Ciwidey", image: "https://images.unsplash.com/photo-1550583724-1255d1426639?q=80&w=100&auto=format&fit=crop", status: "Menunggu" },
        { name: "Kebun Buah Segar", image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=100&auto=format&fit=crop", status: "Menunggu" }
      ]
    },
    {
      id: "2",
      noReg: "REG-SPPG-2026-002",
      instansi: "SMKN 01 Dayeuhkolot",
      tglMulai: "2026-07-15",
      durasi: "24",
      kuota: "1200",
      status: "Verifikasi BGN",
      pic: "Bp. Dani Ramdan",
      menus: [
        { name: "Nasi Telur Balado", freq: "20 Hari", totalPortion: "24.000", estCost: "Rp 12.000", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=200&auto=format&fit=crop" },
        { name: "Nasi Goreng Sayur", freq: "5 Hari", totalPortion: "6.000", estCost: "Rp 10.500", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=200&auto=format&fit=crop" }
      ],
      vendors: [
        { name: "Grosir Sembako Berkah", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=100&auto=format&fit=crop", status: "Menunggu" },
        { name: "Kelompok Tani Harapan", image: "https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?q=80&w=100&auto=format&fit=crop", status: "Menunggu" },
        { name: "CV Telur Emas", image: "https://images.unsplash.com/photo-1582722134903-b12ee057da1d?q=80&w=100&auto=format&fit=crop", status: "Menunggu" }
      ]
    },
    {
      id: "3",
      noReg: "REG-SPPG-2026-003",
      instansi: "SMPN 03 Margahayu",
      tglMulai: "2026-08-01",
      durasi: "6",
      kuota: "800",
      status: "Menunggu Vendor",
      pic: "Ibu Rina Marlina",
      menus: [
        { name: "Nasi Daging Teriyaki Lokal", freq: "8 Hari", totalPortion: "6.400", estCost: "Rp 18.000", image: "https://images.unsplash.com/photo-1534422298391-e4f8c170db06?q=80&w=200&auto=format&fit=crop" },
        { name: "Nasi Sayur Lodeh Tahu", freq: "15 Hari", totalPortion: "12.000", estCost: "Rp 11.000", image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=200&auto=format&fit=crop" }
      ],
      vendors: [
        { name: "Peternakan Sapi Makmur", image: "https://images.unsplash.com/photo-1584263343363-4499d56dec3a?q=80&w=100&auto=format&fit=crop", status: "Setuju" },
        { name: "Sayur Mayur Lembang", image: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=100&auto=format&fit=crop", status: "Ditolak", reason: "Gagal panen musim hujan, stok sayur lodeh kosong." },
        { name: "Tahu Tempe Pak Yanto", image: "https://images.unsplash.com/photo-1584263343363-4499d56dec3a?q=80&w=100&auto=format&fit=crop", status: "Menunggu" },
        { name: "Koperasi Beras Desa", image: "https://images.unsplash.com/photo-1586201327693-86645f745a5c?q=80&w=100&auto=format&fit=crop", status: "Setuju" }
      ]
    },
    {
      id: "4",
      noReg: "REG-SPPG-2026-004",
      instansi: "SDN 05 Ciparay",
      tglMulai: "2026-05-10",
      durasi: "12",
      kuota: "600",
      status: "Kontrak Aktif",
      pic: "Bp. Dedi Kusnadi",
      menus: [
        { name: "Nasi Opor Ayam", freq: "12 Hari", totalPortion: "7.200", estCost: "Rp 16.500", image: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=200&auto=format&fit=crop" },
        { name: "Nasi Tumis Kacang Panjang", freq: "10 Hari", totalPortion: "6.000", estCost: "Rp 12.500", image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?q=80&w=200&auto=format&fit=crop" }
      ],
      vendors: [
        { name: "Pemasok Ayam Boiler", image: "https://images.unsplash.com/photo-1584263343363-4499d56dec3a?q=80&w=100&auto=format&fit=crop", status: "Setuju" },
        { name: "Grosir Beras Nusantara", image: "https://images.unsplash.com/photo-1586201327693-86645f745a5c?q=80&w=100&auto=format&fit=crop", status: "Setuju" },
        { name: "Kebun Sayur Ceria", image: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=100&auto=format&fit=crop", status: "Setuju" }
      ]
    }
  ]);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
    setShowAllVendors({});
  };

  const toggleVendors = (id: string) => {
    setShowAllVendors(prev => ({...prev, [id]: !prev[id]}));
  };

  const progressStatus = (id: string, currentStatus: string) => {
    let nextStatus = currentStatus;
    let message = "";

    if (currentStatus === "Draft") {
      nextStatus = "Verifikasi BGN";
      message = "Draft Master Plan berhasil diajukan ke Badan Gizi Nasional (BGN). Menunggu persetujuan pusat.";
    } else if (currentStatus === "Verifikasi BGN") {
      nextStatus = "Disetujui BGN";
      message = "[Simulasi Pusat] Anggaran disetujui BGN! Rencana siap ditawarkan ke mitra lokal.";
    } else if (currentStatus === "Disetujui BGN") {
      nextStatus = "Menunggu Vendor";
      message = "Penawaran Kerja Sama (PO) berhasil dikirim ke mitra vendor lokal yang dipilih!";
    } else if (currentStatus === "Menunggu Vendor") {
      // Simulate vendor agreement if no rejected vendors
      const contract = contracts.find(c => c.id === id);
      const hasRejected = contract?.vendors.some(v => v.status === "Ditolak");
      
      if (hasRejected) {
        toast.error("Tidak bisa mengaktifkan kontrak! Masih ada mitra vendor yang menolak tawaran. Cari pengganti terlebih dahulu.");
        return;
      }
      
      nextStatus = "Kontrak Aktif";
      message = "[Simulasi Vendor] Semua mitra telah menyetujui. Kontrak Kerja Sama resmi AKTIF!";
    }

    if (currentStatus !== "Menunggu Vendor" || message !== "") {
       toast.success(message);
       setContracts(prev => prev.map(c => c.id === id ? { ...c, status: nextStatus } : c));
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Draft":
        return <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit"><FileText size={12}/> DRAFT AWAL</span>;
      case "Verifikasi BGN":
        return <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit"><Clock size={12} className="animate-spin-slow"/> PUSAT MENINJAU</span>;
      case "Disetujui BGN":
        return <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit"><ShieldCheck size={12}/> DISETUJUI PUSAT</span>;
      case "Menunggu Vendor":
        return <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit"><Store size={12} className="animate-pulse"/> MENUNGGU MITRA</span>;
      case "Kontrak Aktif":
        return <span className="bg-emerald-500 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit shadow-md shadow-emerald-500/20"><CheckCircle2 size={12}/> KONTRAK AKTIF</span>;
      default:
        return <span>{status}</span>;
    }
  };

  const getVendorBadgeColor = (status: string) => {
    switch(status) {
      case "Setuju": return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "Ditolak": return "border-red-300 bg-red-50 text-red-700";
      default: return "border-slate-200 bg-white text-slate-600"; // Menunggu
    }
  };

  const filteredContracts = contracts.filter(c => 
    c.noReg.toLowerCase().includes(search.toLowerCase()) || 
    c.instansi.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm mb-2 uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            Pusat Kemitraan & Pengadaan
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Daftar Ajuan Master Plan</h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Pantau proses pengajuan rencana menu gizi Anda ke BGN, hingga pengiriman penawaran ke mitra lokal.</p>
        </div>
        
        <Link href="/sppg/admin/tender/create">
          <Button className="h-14 px-8 rounded-[20px] bg-[#0d5c46] hover:bg-[#0a4837] text-white font-bold shadow-lg flex items-center gap-2 group transition-all">
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            RANCANG MENU BARU
          </Button>
        </Link>
      </div>

      {/* Workflow Informational Banner */}
      <div className="bg-emerald-50/50 border border-emerald-100 rounded-[24px] p-5 flex items-start gap-4">
         <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 border border-emerald-50 text-emerald-600">
            <Info size={20} />
         </div>
         <div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">Tata Cara Pengajuan (SOP BGN 2026)</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-4xl">
               Ajukan Draft Master Plan yang telah Anda racik ke Badan Gizi Nasional (BGN) untuk memverifikasi anggaran APBN. Jika disetujui Pusat, Anda dapat langsung mengirimkan Penawaran Kerja Sama ke mitra vendor lokal terpilih. Kontrak otomatis berjalan ketika vendor menyetujui penawaran tersebut.
            </p>
         </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Cari No. Registrasi atau Nama Sekolah..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 pl-12 pr-4 rounded-[18px] bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 font-medium text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-12 px-5 rounded-[18px] border-slate-100 font-bold text-slate-600 flex items-center gap-2">
            <Filter size={18} />
            Filter Status
          </Button>
        </div>
      </div>

      {/* Contract List (Table Style with Accordion) */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest w-[30%]">Nomor Registrasi & Sekolah</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest w-[20%]">Detail Operasional</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status Ajuan</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Tindakan Selanjutnya</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredContracts.map((contract) => (
                <React.Fragment key={contract.id}>
                  {/* MAIN ROW */}
                  <tr 
                    className={`group hover:bg-[#f4fcf9]/50 transition-colors cursor-pointer ${expandedId === contract.id ? 'bg-[#f4fcf9]/50' : ''}`}
                    onClick={() => toggleExpand(contract.id)}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-[16px] bg-[#f0f9f6] flex items-center justify-center shrink-0">
                          <FileText className="text-[#0d5c46]" size={24} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-mono font-bold text-slate-400 text-[10px] uppercase mb-0.5 tracking-tight">{contract.noReg}</div>
                          <div className="font-bold text-slate-800 text-sm truncate">{contract.instansi}</div>
                          <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5 mt-1">
                             <Users size={12} className="text-slate-300" /> PIC: {contract.pic}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-5">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <Calendar size={14} className="text-emerald-500" />
                          Mulai: {contract.tglMulai}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <Building2 size={14} className="text-emerald-500" />
                          Durasi: {contract.durasi} Bulan
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-5">
                      {getStatusBadge(contract.status)}
                    </td>
                    
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-3" onClick={e => e.stopPropagation()}>
                        
                        {/* Workflow Interactive Action Button */}
                        {contract.status === "Draft" && (
                          <Button onClick={() => progressStatus(contract.id, contract.status)} className="bg-[#0d5c46] hover:bg-[#0a4837] text-white font-bold h-10 px-5 rounded-xl shadow-sm text-xs">
                            <Send size={14} className="mr-2"/> Ajukan ke Pusat
                          </Button>
                        )}
                        
                        {contract.status === "Verifikasi BGN" && (
                          <Button onClick={() => progressStatus(contract.id, contract.status)} variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 font-bold h-10 px-5 rounded-xl text-xs">
                            [Simulasi] Setujui Pusat
                          </Button>
                        )}

                        {contract.status === "Disetujui BGN" && (
                          <Button onClick={() => progressStatus(contract.id, contract.status)} className="bg-amber-500 hover:bg-amber-600 text-white font-bold h-10 px-5 rounded-xl shadow-sm text-xs">
                            Kirim Penawaran ke Mitra
                          </Button>
                        )}

                        {contract.status === "Menunggu Vendor" && (
                          <Button 
                            onClick={() => progressStatus(contract.id, contract.status)} 
                            variant="outline" 
                            className="border-amber-200 text-amber-700 hover:bg-amber-50 font-bold h-10 px-5 rounded-xl text-xs"
                          >
                            [Simulasi] Mitra Setuju
                          </Button>
                        )}

                        {contract.status === "Kontrak Aktif" && (
                          <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold h-10 px-5 rounded-xl text-xs">
                            <ExternalLink size={14} className="mr-2"/> Pantau Pengiriman
                          </Button>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full text-slate-400">
                              <MoreVertical size={18} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 shadow-xl border-slate-100">
                             <DropdownMenuItem asChild className="rounded-xl px-3 py-2 font-bold text-sm cursor-pointer focus:bg-slate-50">
                               <Link href={`/sppg/admin/tender/edit/${contract.id}`}>Lihat & Edit Master Plan</Link>
                             </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl px-3 py-2 font-bold text-sm cursor-pointer focus:bg-slate-50 text-red-600 focus:text-red-600">Batalkan Rencana</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Chevron for expanding row */}
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors ml-2 cursor-pointer" onClick={() => toggleExpand(contract.id)}>
                           <ChevronDown size={18} className={`transition-transform duration-300 ${expandedId === contract.id ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* EXPANDED DETAILS ROW */}
                  {expandedId === contract.id && (
                    <tr className="bg-[#fafdfc] border-b border-slate-100">
                      <td colSpan={4} className="px-0 py-0">
                         <div className="p-6 md:p-8 border-l-4 border-emerald-400">
                           <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                             {/* Col 1: Menus */}
                             <div>
                               <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                  <UtensilsCrossed size={12}/> Daftar Rencana Menu Makanan
                               </h5>
                               <div className="space-y-3">
                                  {contract.menus.map((menu, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 rounded-2xl border border-emerald-100 bg-white shadow-[0_2px_10px_rgba(13,92,70,0.03)] overflow-hidden">
                                       <div className="flex items-center gap-4">
                                          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                                            <img src={menu.image} alt={menu.name} className="w-full h-full object-cover transition-transform hover:scale-110 duration-500" />
                                          </div>
                                          <div>
                                             <p className="text-xs font-black text-slate-800">{menu.name}</p>
                                             <p className="text-[10px] font-medium text-slate-500 mt-1">Jadwal: <span className="font-bold text-emerald-600">{menu.freq}</span></p>
                                          </div>
                                       </div>
                                       <div className="text-right pr-2">
                                          <p className="text-[11px] font-black text-emerald-700">{menu.totalPortion} Porsi</p>
                                          <p className="text-[9px] font-bold text-slate-400 mt-0.5">EST: {menu.estCost} / ANAK</p>
                                       </div>
                                    </div>
                                  ))}
                               </div>
                             </div>

                             {/* Col 2: Vendors & Revisions */}
                             <div className="flex flex-col">
                               <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                  <Store size={12}/> Status Persetujuan Mitra Vendor
                               </h5>

                               {/* REJECTED VENDOR ALERTS */}
                               {contract.vendors.filter(v => v.status === "Ditolak").length > 0 && (
                                 <div className="mb-4 space-y-3">
                                    {contract.vendors.filter(v => v.status === "Ditolak").map((vendor, i) => (
                                      <div key={i} className="p-4 rounded-2xl border-2 border-red-200 bg-red-50 flex items-center justify-between shadow-sm">
                                         <div className="flex items-center gap-4">
                                           <div className="w-12 h-12 rounded-xl overflow-hidden border border-red-300 shrink-0">
                                             <img src={vendor.image} alt={vendor.name} className="w-full h-full object-cover grayscale opacity-80" />
                                           </div>
                                           <div>
                                              <p className="text-xs font-black text-red-900 flex items-center gap-1.5"><AlertTriangle size={14}/> {vendor.name}</p>
                                              <p className="text-[10px] font-bold text-red-600 mt-0.5 max-w-[200px] leading-tight">MENOLAK: "{vendor.reason}"</p>
                                           </div>
                                         </div>
                                         <Link href={`/sppg/admin/tender/edit/${contract.id}?revision=true`}>
                                           <Button 
                                             className="bg-red-600 hover:bg-red-700 text-white text-xs h-10 px-5 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2"
                                           >
                                             <RefreshCw size={14} /> GANTI DI KATALOG
                                           </Button>
                                         </Link>
                                      </div>
                                    ))}
                                 </div>
                               )}

                               {/* NORMAL VENDORS */}
                               <div className="flex flex-wrap gap-2.5">
                                  {(showAllVendors[contract.id] ? contract.vendors.filter(v => v.status !== "Ditolak") : contract.vendors.filter(v => v.status !== "Ditolak").slice(0, 5)).map((vendor, i) => (
                                     <div key={i} className={`group px-3 py-2 rounded-xl border text-[11px] font-bold shadow-sm flex items-center gap-2.5 transition-all hover:shadow-md ${getVendorBadgeColor(vendor.status)}`}>
                                        <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0">
                                          <img src={vendor.image} alt={vendor.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                          <p className="leading-tight">{vendor.name}</p>
                                          {vendor.status !== "Menunggu" && <p className="text-[8px] uppercase tracking-widest mt-0.5 opacity-80">{vendor.status}</p>}
                                        </div>
                                     </div>
                                  ))}
                                  
                                  {contract.vendors.filter(v => v.status !== "Ditolak").length > 5 && !showAllVendors[contract.id] && (
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); toggleVendors(contract.id); }}
                                      className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-[10px] font-black text-emerald-600 hover:bg-emerald-100 transition-colors flex items-center gap-2"
                                    >
                                      <PlusCircle size={14}/> +{contract.vendors.filter(v => v.status !== "Ditolak").length - 5} MITRA LAGI
                                    </button>
                                  )}

                                  {showAllVendors[contract.id] && (
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); toggleVendors(contract.id); }}
                                      className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[10px] font-black text-slate-500 hover:bg-slate-100 transition-colors"
                                    >
                                      Tutup Daftar Mitra
                                    </button>
                                  )}
                               </div>
                               
                               {/* Kepatuhan BGN */}
                               <div className="mt-auto pt-6">
                                 <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600 shrink-0 border border-blue-50">
                                      <ShieldCheck size={20}/>
                                    </div>
                                    <div>
                                       <p className="text-xs font-black text-blue-900 mb-1">Kepatuhan Regulasi BGN</p>
                                       <p className="text-[10px] font-medium text-blue-700 leading-relaxed">Rencana ini telah melibatkan minimal 15 vendor lokal sesuai aturan anti-monopoli BGN 2026. Revisi mitra tidak akan merubah batas atas anggaran yang telah disetujui APBN.</p>
                                    </div>
                                 </div>
                               </div>

                             </div>
                           </div>
                         </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination/Footer */}
        <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Menampilkan {filteredContracts.length} Dokumen Rencana</p>
          <div className="flex gap-2">
            <Button disabled variant="outline" size="sm" className="rounded-xl font-bold h-9">Prev</Button>
            <Button disabled variant="outline" size="sm" className="rounded-xl font-bold h-9">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
