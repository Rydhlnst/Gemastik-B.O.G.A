"use client";

import React, { useState } from "react";
import { 
  Search, 
  FileText, 
  MoreVertical, 
  Building2, 
  Calendar, 
  Users, 
  ExternalLink,
  ChevronDown,
  Filter,
  CheckCircle2,
  Store,
  Clock,
  ShieldCheck,
  Info,
  UtensilsCrossed,
  PlusCircle,
  TrendingUp,
  MapPin,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ProgressKontrakPage() {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAllVendors, setShowAllVendors] = useState<{[key: string]: boolean}>({});
  
  // Data dummy (Khusus Kontrak Aktif)
  const [contracts] = useState([
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

  const getStatusBadge = (status: string) => {
    return <span className="w-40 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border border-emerald-200"><CheckCircle2 size={12}/> KONTRAK AKTIF</span>;
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
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Progress Kontrak Aktif</h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Daftar kontrak kerjasama yang sedang berjalan dan dalam tahap pengiriman logistik rutin.</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Cari No. Kontrak atau Nama Sekolah..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 pl-12 pr-4 rounded-[18px] bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-[#213555]/20 font-medium text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-12 px-5 rounded-[18px] border-slate-100 font-bold text-slate-600 flex items-center gap-2">
            <Filter size={18} />
            Urutkan
          </Button>
        </div>
      </div>

      {/* Contract List */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F2F2F2] border-b border-slate-200">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest w-[40%]">Nomor Registrasi & Sekolah</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest w-[20%]">Operasional</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status Pengiriman</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredContracts.map((contract) => (
                <React.Fragment key={contract.id}>
                  <tr 
                    className={`group hover:bg-slate-50/50 transition-colors cursor-pointer ${expandedId === contract.id ? 'bg-slate-50/50' : ''}`}
                    onClick={() => toggleExpand(contract.id)}
                  >
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-[#213555] flex items-center justify-center shadow-lg shadow-slate-900/10">
                          <FileText size={24} className="text-[#D8C4B6]" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-blue-500 font-black text-[10px] uppercase mb-1 tracking-wider leading-none">{contract.noReg}</div>
                          <div className="font-black text-slate-800 text-lg leading-tight">{contract.instansi}</div>
                          <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mt-1.5">
                             <Users size={12} className="opacity-60" /> {contract.pic}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-6">
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
                    
                    <td className="px-6 py-6">
                      {getStatusBadge(contract.status)}
                    </td>
                    
                    <td className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                         <Link href={`/sppg/admin/tender/progress/${contract.id}`}>
                           <Button className="h-10 px-6 rounded-xl bg-[#213555] hover:opacity-90 text-white font-bold shadow-sm text-[10px] uppercase tracking-widest">
                              Pantau Realtime
                           </Button>
                         </Link>
                         
                         <div className="flex items-center gap-1 ml-2">
                            <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full text-slate-400">
                               <MoreVertical size={18} />
                            </Button>
                         </div>

                         <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer" onClick={() => toggleExpand(contract.id)}>
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
