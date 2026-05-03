"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Users, Phone, Building2, Save, Calendar, FileCheck, ArrowRight, Loader2, CheckCircle2, Navigation } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Filter, ChevronDown } from "lucide-react";
import { SchoolMap } from "./school-map";

export function ContractBuilder() {
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [schools, setSchools] = useState<any[]>([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);

  const sppgLocation = {
    lat: -6.973007,
    lng: 107.630730,
    name: "Satuan Pelayanan Gizi (SPPG) Bojongsoang"
  };

  const categories = [
    { id: "Semua", label: "Semua" },
    { id: "PAUD", label: "PAUD" },
    { id: "SD", label: "SD" },
    { id: "SMP", label: "SMP" },
    { id: "SMA", label: "SMA" },
    { id: "SMK", label: "SMK" },
    { id: "SLB", label: "SLB" },
  ];
  
  const [kontrak, setKontrak] = useState({
    noSpk: `SPK-SPPG-${new Date().getFullYear()}-001`,
    tglMulai: new Date().toISOString().split('T')[0],
    durasi: "12",
    kuotaPorsi: "",
    picInternal: "Admin Pusat",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSchools = async () => {
      setIsLoadingSchools(true);
      try {
        const res = await fetch(`http://localhost:3001/api/sekolah?q=${searchQuery}&cat=${selectedCategory}`);
        const data = await res.json();
        if (data.success) {
          setSchools(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch schools:", err);
      } finally {
        setIsLoadingSchools(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchSchools();
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory]);

  const handleSelectSchool = (school: any) => {
    setSelectedSchool(school);
    setKontrak(prev => ({
      ...prev,
      kuotaPorsi: school.jumlah_siswa.toString()
    }));
  };

  const handleSaveContract = async () => {
    if (!selectedSchool || !kontrak.tglMulai || !kontrak.durasi || !kontrak.kuotaPorsi) {
      toast.error("Harap lengkapi instansi sasaran dan parameter kontrak.");
      return;
    }
    setIsSubmitting(true);
    toast.loading("Menyimpan draft Surat Perintah Kerja (SPK)...");
    
    setTimeout(() => {
      toast.dismiss();
      toast.success("Draft SPK Tersimpan!");
      router.push("/sppg/admin/tender/list");
    }, 1500);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  return (
    <div className="w-full space-y-6 pb-12">
      
      {/* Search & Compact Dropdown Filter Header */}
      <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
        
        {/* Search Input */}
        <div className="flex-1 w-full relative shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-[24px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <Input 
            placeholder="Cari NPSN, Nama Instansi Sasaran, atau Wilayah..." 
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="h-16 pl-12 pr-12 rounded-[24px] bg-white border border-slate-100 text-slate-700 text-base font-medium focus-visible:ring-2 focus-visible:ring-emerald-500/20 shadow-none"
          />
          {isLoadingSchools && <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-500 animate-spin" size={20} />}
        </div>

        {/* Compact Dropdown Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="h-16 px-6 rounded-[24px] bg-white border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:bg-slate-50 flex items-center gap-3 transition-all duration-300 min-w-[200px] justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[10px] bg-emerald-50 flex items-center justify-center">
                  <Filter size={16} className="text-[#0d5c46]" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Jenjang Instansi</p>
                  <p className="text-sm font-bold text-slate-700 leading-none truncate max-w-[120px]">
                    {categories.find(c => c.id === selectedCategory)?.label}
                  </p>
                </div>
              </div>
              <ChevronDown size={16} className="text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px] rounded-[20px] p-2 shadow-xl border-slate-100">
            <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Klasifikasi Jenjang Instansi</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100 mx-2" />
            {categories.map((cat) => (
              <DropdownMenuItem
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-[12px] px-3 py-2.5 text-sm font-bold cursor-pointer mb-1 last:mb-0 transition-colors ${
                  selectedCategory === cat.id 
                    ? "bg-[#0d5c46] text-white focus:bg-[#0d5c46] focus:text-white" 
                    : "text-slate-600 focus:bg-slate-100"
                }`}
              >
                {cat.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Kolom Kiri: Hasil Pencarian (Grid Cards) */}
        <div className="lg:col-span-7">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Database Instansi Sasaran ({schools.length})</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[1000px] overflow-y-auto pr-2 custom-scrollbar">
            {schools.length === 0 && !isLoadingSchools ? (
              <div className="col-span-2 p-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-[24px]">
                Tidak ada data instansi yang ditemukan.
              </div>
            ) : (
              schools.map((school) => {
                const isSelected = selectedSchool?.id === school.id;
                const distance = calculateDistance(sppgLocation.lat, sppgLocation.lng, school.latitude, school.longitude);
                // Hardcoded random values for UI demonstration
                const accreditation = ["A", "A", "B"][Math.floor(Math.random() * 3)];

                return (
                  <div 
                    key={school.id} 
                    onClick={() => handleSelectSchool(school)}
                    className={`group relative flex flex-col rounded-[24px] cursor-pointer transition-all duration-500 overflow-hidden border ${
                      isSelected 
                        ? 'border-[#0d5c46] shadow-[0_12px_32px_rgba(13,92,70,0.15)] bg-[#f4fcf9]' 
                        : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-xl'
                    }`}
                  >
                    {/* School Image Section */}
                    <div className="relative h-32 w-full overflow-hidden">
                      <img 
                        src={`https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=800&auto=format&fit=crop`}
                        alt={school.nama}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                      
                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <div className={`px-2 py-1 rounded-[8px] text-[9px] font-black tracking-wider shadow-sm ${
                          school.tingkat === 'SD' ? 'bg-amber-400 text-white' :
                          school.tingkat === 'SMP' ? 'bg-blue-500 text-white' :
                          'bg-emerald-500 text-white'
                        }`}>
                          {school.tingkat}
                        </div>
                        <div className="px-2 py-1 rounded-[8px] text-[9px] font-black tracking-wider bg-white/90 text-slate-800 shadow-sm backdrop-blur-md">
                          AKREDITASI {accreditation}
                        </div>
                      </div>

                      {/* Distance Badge */}
                      <div className="absolute bottom-3 right-3 px-2 py-1 rounded-[8px] text-[9px] font-black tracking-wider bg-[#0d5c46] text-white shadow-lg flex items-center gap-1">
                        <Navigation size={10} fill="currentColor" /> {distance} KM
                      </div>

                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 bg-[#0d5c46] text-white p-1 rounded-full shadow-lg border-2 border-white">
                          <CheckCircle2 size={14} />
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="p-4 flex flex-col flex-1">
                      <div className="mb-3">
                        <h3 className="font-bold text-slate-800 text-sm leading-tight group-hover:text-[#0d5c46] transition-colors line-clamp-1">{school.nama}</h3>
                        <p className="text-[10px] font-mono font-bold text-slate-500 mt-0.5 uppercase tracking-tight">NPSN: {school.npsn}</p>
                      </div>
                      
                      <div className="mt-auto space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500 bg-slate-50 p-1.5 rounded-[10px]">
                          <MapPin size={12} className="text-emerald-600" />
                          <span className="truncate">Kec. {school.kecamatan}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                            <Users size={10} /> {school.jumlah_siswa} Siswa
                          </div>
                          <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                            <Phone size={10} /> {school.telepon || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Kolom Kanan: Parameter Kontrak & MAP */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* MAP SECTION */}
          <div className="h-[350px] w-full">
            <SchoolMap selectedSchool={selectedSchool} sppgLocation={sppgLocation} />
          </div>

          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Parameter Operasional SPK</h2>
          
          {/* Card: Status SPK */}
          <div className="bg-white p-6 rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">Nomor Referensi (SPK)</p>
              <Input 
                value={kontrak.noSpk} 
                onChange={e => setKontrak({...kontrak, noSpk: e.target.value})}
                className="h-8 p-0 text-lg font-bold text-slate-800 border-none bg-transparent focus-visible:ring-0 shadow-none"
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-[12px] border border-amber-100">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-[11px] font-bold text-amber-700 uppercase">Drafting</span>
            </div>
          </div>

          {/* Card: Parameter Detail (2x2 Grid) */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Box 1 */}
            <div className="bg-white p-5 rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100">
              <div className="w-10 h-10 rounded-[12px] bg-[#f0f9f6] flex items-center justify-center mb-4">
                <Calendar className="text-[#0d5c46]" size={20} />
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Mulai Efektif</p>
              <Input 
                type="date" 
                value={kontrak.tglMulai} onChange={e => setKontrak({...kontrak, tglMulai: e.target.value})}
                className="h-auto p-0 text-base font-bold text-slate-800 border-none bg-transparent focus-visible:ring-0 shadow-none [&::-webkit-calendar-picker-indicator]:opacity-50"
              />
            </div>

            {/* Box 2 */}
            <div className="bg-white p-5 rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100">
              <div className="w-10 h-10 rounded-[12px] bg-amber-50 flex items-center justify-center mb-4">
                <FileCheck className="text-amber-600" size={20} />
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Durasi Kontrak</p>
              <div className="flex items-center gap-2">
                <Input 
                  type="number" min="1"
                  value={kontrak.durasi} onChange={e => setKontrak({...kontrak, durasi: e.target.value})}
                  className="h-auto p-0 w-12 text-2xl font-black text-slate-800 border-none bg-transparent focus-visible:ring-0 shadow-none text-center"
                />
                <span className="text-sm font-bold text-slate-500">Bulan</span>
              </div>
            </div>

            {/* Box 3 */}
            <div className="col-span-2 bg-white p-5 rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100 flex items-center gap-5">
              <div className="w-12 h-12 shrink-0 rounded-[14px] bg-blue-50 flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Kuota Distribusi Harian</p>
                  {selectedSchool && <span className="text-[10px] font-bold text-[#0d5c46] bg-[#f0f9f6] px-2 py-0.5 rounded-[6px]">Auto-Synced</span>}
                </div>
                <div className="flex items-baseline gap-2">
                  <Input 
                    type="number" min="1"
                    value={kontrak.kuotaPorsi} onChange={e => setKontrak({...kontrak, kuotaPorsi: e.target.value})}
                    className="h-auto p-0 w-24 text-3xl font-black text-slate-800 border-none bg-transparent focus-visible:ring-0 shadow-none"
                    placeholder="0"
                  />
                  <span className="text-base font-bold text-slate-500">Porsi / Hari</span>
                </div>
              </div>
            </div>

            {/* Detailed Selected School Info Card */}
            <div className={`col-span-2 p-5 rounded-[24px] border transition-all duration-500 ${
              selectedSchool ? 'bg-[#f4fcf9] border-[#0d5c46]/20 shadow-md' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 ${
                  selectedSchool ? 'bg-white shadow-sm text-[#0d5c46]' : 'bg-slate-200 text-slate-400'
                }`}>
                  <Building2 size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Target Instansi Terpilih</p>
                    {selectedSchool && (
                      <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1">
                        <Navigation size={10} fill="currentColor" /> {calculateDistance(sppgLocation.lat, sppgLocation.lng, selectedSchool.latitude, selectedSchool.longitude)} KM
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-800 leading-tight truncate text-sm">
                    {selectedSchool ? selectedSchool.nama : "Belum ada sekolah dipilih"}
                  </h4>
                  {selectedSchool && (
                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                        <Users size={12} className="text-slate-300" />
                        PIC: {selectedSchool.nama_kepsek || "N/A"}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                        <Phone size={12} className="text-slate-300" />
                        {selectedSchool.telepon || "N/A"}
                      </div>
                      <div className="col-span-2 flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                        <Navigation size={12} className="text-slate-300" />
                        {selectedSchool.alamat}, Kec. {selectedSchool.kecamatan}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          <Button 
            onClick={handleSaveContract} 
            disabled={isSubmitting || !selectedSchool}
            className="w-full h-16 rounded-[20px] font-bold text-base bg-[#0d5c46] hover:bg-[#0a4837] text-white shadow-[0_8px_20px_rgba(13,92,70,0.2)] transition-all"
          >
            {isSubmitting ? (
              <><Loader2 className="animate-spin mr-2" /> MEMPROSES SPK...</>
            ) : (
              <>VALIDASI & TERBITKAN SPK <ArrowRight className="ml-2" size={20} /></>
            )}
          </Button>
          
        </div>
      </div>
    </div>
  );
}
