"use client";

import React, { useState } from "react";
import { 
  Search, 
  Plus, 
  FileText, 
  Building2, 
  Calendar, 
  Users, 
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
  RefreshCw,
  TrendingUp,
  ArrowRight,
  PenBox,
  Trash2
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
  
  // Data Master
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
        { name: "Toko Beras Jaya", image: "https://images.unsplash.com/photo-1586201327693-86645f745a5c?q=80&w=100&auto=format&fit=crop", status: "Menunggu" }
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
        { name: "Nasi Telur Balado", freq: "20 Hari", totalPortion: "24.000", estCost: "Rp 12.000", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=200&auto=format&fit=crop" }
      ],
      vendors: [
        { name: "Grosir Sembako Berkah", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=100&auto=format&fit=crop", status: "Menunggu" }
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
        { name: "Nasi Daging Teriyaki Lokal", freq: "8 Hari", totalPortion: "6.400", estCost: "Rp 18.000", image: "https://images.unsplash.com/photo-1534422298391-e4f8c170db06?q=80&w=200&auto=format&fit=crop" }
      ],
      vendors: [
        { name: "Peternakan Sapi Makmur", image: "https://images.unsplash.com/photo-1584263343363-4499d56dec3a?q=80&w=100&auto=format&fit=crop", status: "Setuju" },
        { name: "Sayur Mayur Lembang", image: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=100&auto=format&fit=crop", status: "Ditolak", reason: "Gagal panen musim hujan." }
      ]
    },
    {
       id: "4",
       noReg: "REG-SPPG-2026-004",
       instansi: "SDN 05 Ciparay",
       tglMulai: "2026-05-10",
       durasi: "12",
       kuota: "600",
       status: "Kontrak Aktif", // Akan difilter keluar
       pic: "Bp. Dedi Kusnadi",
       menus: [],
       vendors: []
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
      message = "Draft Master Plan berhasil diajukan ke BGN.";
    } else if (currentStatus === "Verifikasi BGN") {
      nextStatus = "Disetujui BGN";
      message = "Anggaran disetujui BGN!";
    } else if (currentStatus === "Disetujui BGN") {
      nextStatus = "Menunggu Vendor";
      message = "Penawaran (PO) berhasil dikirim ke mitra vendor!";
    } else if (currentStatus === "Menunggu Vendor") {
      nextStatus = "Kontrak Aktif";
      message = "Semua mitra telah menyetujui. Kontrak AKTIF!";
    }

    toast.success(message);
    setContracts(prev => prev.map(c => c.id === id ? { ...c, status: nextStatus } : c));
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Draft":
        return <span className="w-40 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border border-slate-200"><FileText size={12}/> DRAFT AWAL</span>;
      case "Verifikasi BGN":
        return <span className="w-40 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border border-blue-200"><Clock size={12}/> PUSAT MENINJAU</span>;
      case "Disetujui BGN":
        return <span className="w-40 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border border-emerald-200"><ShieldCheck size={12}/> DISETUJUI PUSAT</span>;
      case "Menunggu Vendor":
        return <span className="w-40 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border border-amber-200"><Store size={12}/> MENUNGGU MITRA</span>;
      default:
        return <span className="w-40 bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center justify-center border border-slate-200">{status}</span>;
    }
  };

  // FILTER: Hanya tampilkan yang BELUM Kontrak Aktif
  const filteredContracts = contracts.filter(c => 
    c.status !== "Kontrak Aktif" && (
      c.noReg.toLowerCase().includes(search.toLowerCase()) || 
      c.instansi.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Daftar Ajuan Master Plan</h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Kelola pengajuan rencana menu gizi Anda yang sedang dalam tahap draft atau persetujuan BGN.</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-[#F2F2F2] border border-slate-200 rounded-[24px] p-5 flex items-start gap-4">
         <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100 text-[#213555]">
            <TrendingUp size={20} />
         </div>
         <div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">Status Sedang Berjalan ({filteredContracts.length})</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-4xl">
               Halaman ini hanya menampilkan tender yang masih dalam tahap perencanaan atau negosiasi. Tender yang sudah berstatus <span className="font-bold text-[#213555]">Kontrak Aktif</span> telah dipindahkan ke halaman Monitoring Progress.
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
            className="h-12 pl-12 pr-4 rounded-[18px] bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-[#213555]/20 font-medium text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-12 px-5 rounded-[18px] border-slate-100 font-bold text-slate-600 flex items-center gap-2">
            <Filter size={18} />
            Filter
          </Button>
        </div>
      </div>

      {/* Contract List Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest w-[30%]">Nomor Registrasi & Sekolah</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest w-[20%]">Operasional</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status Ajuan</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredContracts.map((contract) => (
                <React.Fragment key={contract.id}>
                  <tr 
                    className={`group hover:bg-[#F2F2F2]/50 transition-colors cursor-pointer ${expandedId === contract.id ? 'bg-[#F2F2F2]/50' : ''}`}
                    onClick={() => toggleExpand(contract.id)}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-[16px] bg-[#213555] flex items-center justify-center shrink-0">
                          <FileText className="text-[#D8C4B6]" size={24} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-mono font-bold text-slate-400 text-[10px] uppercase mb-0.5 tracking-tight">{contract.noReg}</div>
                          <div className="font-bold text-[#213555] text-sm truncate">{contract.instansi}</div>
                          <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5 mt-1">
                             <Users size={12} className="text-slate-300" /> {contract.pic}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-5">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <Calendar size={14} style={{ color: "#213555" }} />
                          {contract.tglMulai}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <Clock size={14} style={{ color: "#213555" }} />
                          {contract.durasi} Bulan
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-5">
                      {getStatusBadge(contract.status)}
                    </td>
                    
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                        {contract.status === "Draft" && (
                          <Button onClick={() => progressStatus(contract.id, contract.status)} className="w-44 bg-[#213555] hover:opacity-90 text-white font-bold h-10 px-0 rounded-xl shadow-sm text-[10px] uppercase tracking-widest">
                            <Send size={14} className="mr-2"/> Ajukan ke BGN
                          </Button>
                        )}
                        
                        {contract.status === "Verifikasi BGN" && (
                          <Button onClick={() => progressStatus(contract.id, contract.status)} variant="outline" className="w-44 border-blue-200 text-blue-700 hover:bg-blue-50 font-bold h-10 px-0 rounded-xl text-[10px] uppercase tracking-widest">
                            [Simulasi] Setuju
                          </Button>
                        )}

                        {contract.status === "Disetujui BGN" && (
                          <Button onClick={() => progressStatus(contract.id, contract.status)} className="w-44 bg-[#213555] text-white font-bold h-10 px-0 rounded-xl shadow-sm text-[10px] uppercase tracking-widest">
                            Kirim ke Mitra
                          </Button>
                        )}

                        {contract.status === "Menunggu Vendor" && (
                          <Button onClick={() => progressStatus(contract.id, contract.status)} variant="outline" className="w-44 border-amber-200 text-amber-700 hover:bg-amber-50 font-bold h-10 px-0 rounded-xl text-[10px] uppercase tracking-widest">
                            [Simulasi] Mitra OK
                          </Button>
                        )}

                        <div className="flex items-center gap-1 ml-2">
                           <Link href={`/sppg/admin/tender/edit/${contract.id}`}>
                              <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full text-[#213555] hover:bg-slate-100">
                                <PenBox size={18} />
                              </Button>
                           </Link>
                           <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full text-red-500 hover:bg-red-50">
                             <Trash2 size={18} />
                           </Button>
                        </div>

                        {/* Chevron for expanding row */}
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors ml-1 cursor-pointer" onClick={() => toggleExpand(contract.id)}>
                           <ChevronDown size={18} className={`transition-transform duration-300 ${expandedId === contract.id ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                    </td>
                  </tr>

                  {expandedId === contract.id && (
                    <tr className="bg-[#F2F2F2]/30 border-b border-slate-100">
                      <td colSpan={4} className="px-0 py-0">
                         <div className="p-8 border-l-4" style={{ borderColor: "#213555" }}>
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                               <div>
                                 <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <UtensilsCrossed size={12}/> Rencana Menu
                                 </h5>
                                 <div className="space-y-3">
                                    {contract.menus.map((menu, i) => (
                                      <div key={i} className="flex justify-between items-center p-3 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                         <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                                              <img src={menu.image} alt={menu.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                               <p className="text-xs font-black text-[#213555]">{menu.name}</p>
                                               <p className="text-[10px] font-medium text-slate-500 mt-1">Freq: <span className="font-bold text-[#213555]">{menu.freq}</span></p>
                                            </div>
                                         </div>
                                         <div className="text-right pr-2">
                                            <p className="text-[11px] font-black text-[#213555]">{menu.totalPortion} Porsi</p>
                                         </div>
                                      </div>
                                    ))}
                                 </div>
                               </div>

                               <div className="flex flex-col">
                                 <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Store size={12}/> Mitra Vendor
                                 </h5>
                                 <div className="flex flex-wrap gap-2">
                                    {contract.vendors.map((vendor, i) => (
                                       <div key={i} className={`px-3 py-2 rounded-xl border text-[10px] font-bold shadow-sm flex items-center gap-2 bg-white border-slate-100 text-slate-600`}>
                                          <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0">
                                            <img src={vendor.image} alt={vendor.name} className="w-full h-full object-cover" />
                                          </div>
                                          <p className="leading-tight">{vendor.name}</p>
                                       </div>
                                    ))}
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
      </div>
    </div>
  );
}
