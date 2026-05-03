"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, ShoppingBag, FileCheck, ArrowRight, ArrowLeft, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// --- Mock Data Katalog Vendor ---
const MOCK_CATALOG = [
  { id: "BRG-001", name: "Beras Medium", vendor: "PT. Pangan Nusantara", price: 14000, unit: "kg" },
  { id: "BRG-002", name: "Telur Ayam Ras", vendor: "CV. Berkah Sembako", price: 28000, unit: "kg" },
  { id: "BRG-003", name: "Daging Ayam segar", vendor: "PT. Pangan Nusantara", price: 35000, unit: "kg" },
  { id: "BRG-004", name: "Wortel Lokal", vendor: "Sayur Lembang", price: 12000, unit: "kg" },
  { id: "BRG-005", name: "Minyak Goreng Curah", vendor: "Distributor Minyak Jabar", price: 15500, unit: "liter" },
];

export function ProposalWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- State Step 1: Wilayah & Kontrak ---
  const [lokasi, setLokasi] = useState({
    provinsi: "Jawa Barat",
    kota: "",
    kecamatan: "",
    sekolah: "",
  });
  const [kontrak, setKontrak] = useState({
    tglMulai: "",
    durasi: "12",
    kuotaPorsi: "100",
  });

  // --- State Step 2: Menu & Barang (Keranjang) ---
  const [menus, setMenus] = useState([{ id: 1, name: "Menu Nasi Ayam", items: [] as any[] }]);
  
  const addMenu = () => {
    setMenus([...menus, { id: Date.now(), name: "Menu Baru", items: [] }]);
  };
  const removeMenu = (id: number) => {
    setMenus(menus.filter(m => m.id !== id));
  };
  const updateMenuName = (id: number, name: string) => {
    setMenus(menus.map(m => m.id === id ? { ...m, name } : m));
  };

  const addItemToMenu = (menuId: number, catalogItem: any) => {
    setMenus(menus.map(m => {
      if (m.id === menuId) {
        // Cek apakah barang sudah ada di menu ini
        const exists = m.items.find(i => i.id === catalogItem.id);
        if (exists) return m;
        return { ...m, items: [...m.items, { ...catalogItem, takaran: 1 }] };
      }
      return m;
    }));
    toast.success(`${catalogItem.name} ditambahkan ke menu.`);
  };

  const removeItemFromMenu = (menuId: number, itemId: string) => {
    setMenus(menus.map(m => {
      if (m.id === menuId) {
        return { ...m, items: m.items.filter(i => i.id !== itemId) };
      }
      return m;
    }));
  };

  const updateItemTakaran = (menuId: number, itemId: string, takaran: number) => {
    setMenus(menus.map(m => {
      if (m.id === menuId) {
        return {
          ...m,
          items: m.items.map(i => i.id === itemId ? { ...i, takaran } : i)
        };
      }
      return m;
    }));
  };

  // --- Step 3: Kalkulasi ---
  const hitungTotalHPP = () => {
    let totalHppPorsi = 0;
    menus.forEach(menu => {
      menu.items.forEach(item => {
        // Asumsi takaran adalah pengali dari harga (misal takaran 0.1 kg * 14000 = 1400)
        totalHppPorsi += (item.takaran * item.price);
      });
    });
    const grandTotal = totalHppPorsi * parseInt(kontrak.kuotaPorsi || "0");
    return { hppPorsi: totalHppPorsi, grandTotal };
  };

  const totals = hitungTotalHPP();

  // --- Handlers ---
  const handleNext = () => {
    if (step === 1) {
      if (!lokasi.kota || !lokasi.sekolah || !kontrak.tglMulai) {
        toast.error("Harap lengkapi semua data wajib bertanda (*)");
        return;
      }
    }
    if (step === 2) {
      const hasItems = menus.some(m => m.items.length > 0);
      if (!hasItems) {
        toast.error("Harap masukkan minimal 1 barang dari katalog ke dalam menu.");
        return;
      }
    }
    setStep(s => s + 1);
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    toast.loading("Menyimpan draft dan mengirim notifikasi ke Vendor...");
    
    // Simulasi API Call
    setTimeout(() => {
      toast.dismiss();
      toast.success("Draft Disimpan! Menunggu persetujuan vendor.");
      router.push("/sppg/admin/dashboard");
    }, 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      
      {/* --- Progress Tracker --- */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative z-10">
        <div className="flex items-center justify-between relative px-4 md:px-12">
          <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-100 -translate-y-1/2 rounded-full z-0" />
          <div 
            className="absolute top-1/2 left-8 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 -translate-y-1/2 rounded-full z-0 transition-all duration-700 ease-in-out"
            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : 'calc(100% - 4rem)' }}
          />
          
          {[ 
            { num: 1, label: "Kontrak & Wilayah", icon: MapPin, desc: "Penetapan Sasaran" },
            { num: 2, label: "Katalog & Menu", icon: ShoppingBag, desc: "Orkestrasi Gizi" },
            { num: 3, label: "Review & Draft", icon: FileCheck, desc: "Kalkulasi RAB" }
          ].map((s) => (
            <div key={s.num} className="relative z-10 flex flex-col items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-lg transition-all duration-500 ${step >= s.num ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-blue-500/30 scale-110' : 'bg-white text-slate-400 border-2 border-slate-100 shadow-none'}`}>
                {step > s.num ? <CheckCircle2 size={24} /> : <s.icon size={20} />}
              </div>
              <div className="text-center">
                <span className={`block text-sm font-black ${step >= s.num ? 'text-blue-900' : 'text-slate-400'}`}>{s.label}</span>
                <span className={`text-[10px] uppercase tracking-widest font-bold ${step >= s.num ? 'text-blue-500' : 'text-slate-300'}`}>{s.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- STEP 1: Wilayah & Kontrak --- */}
      {step === 1 && (
        <Card className="rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-200 animate-in fade-in slide-in-from-right-4 duration-500 bg-white overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400" />
          <CardHeader className="border-b border-slate-100 bg-slate-50/80 p-6 md:p-8">
            <CardTitle className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-lg flex items-center justify-center text-lg">1</span>
              Wilayah & Parameter Kontrak
            </CardTitle>
            <p className="text-sm text-slate-500 font-medium mt-1 ml-11">Pastikan ID Sekolah sasaran sudah terdaftar pada sistem Dapodik B.O.G.A.</p>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              
              {/* Kolom Kiri: Form Detail */}
              <div className="lg:col-span-3 space-y-6">
                
                <div className="space-y-4 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                    <MapPin size={18} className="text-blue-500" /> Lokasi Sasaran Distribusi
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1.5 block">Provinsi Wilayah</Label>
                      <Input value={lokasi.provinsi} disabled className="bg-slate-100 border-slate-200 text-slate-500 font-bold h-11" />
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase tracking-widest font-bold text-blue-600 mb-1.5 block">Kota/Kabupaten *</Label>
                      <select 
                        className="flex h-11 w-full rounded-xl border border-blue-200 bg-blue-50/30 px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        value={lokasi.kota} onChange={e => setLokasi({...lokasi, kota: e.target.value})}
                      >
                        <option value="">— Pilih Wilayah Administratif —</option>
                        <option value="Kota Bandung">Kota Bandung</option>
                        <option value="Kabupaten Bandung">Kabupaten Bandung</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-blue-600 mb-1.5 block">Instansi Sekolah Sasaran *</Label>
                    <div className="relative">
                      <Input 
                        placeholder="Ketik nama atau ID Sekolah..." 
                        value={lokasi.sekolah} 
                        onChange={e => setLokasi({...lokasi, sekolah: e.target.value})} 
                        className="h-12 pl-10 border-blue-200 bg-white font-semibold shadow-sm focus-visible:ring-blue-500"
                      />
                      <FileCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5 ml-1 flex items-center gap-1">
                      <Info size={10} /> Hubungkan dengan ID Sekolah resmi untuk audit otomatis.
                    </p>
                  </div>
                </div>

              </div>

              {/* Kolom Kanan: Parameter Kontrak */}
              <div className="lg:col-span-2">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#1e1b4b] text-white shadow-2xl shadow-indigo-900/20 relative overflow-hidden h-full">
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl transform -translate-x-5 translate-y-5" />

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <FileCheck size={20} className="text-blue-300" />
                      </div>
                      <h3 className="font-bold text-lg text-white">Parameter Anggaran</h3>
                    </div>
                    
                    <div className="space-y-5">
                      <div>
                        <Label className="text-[10px] uppercase tracking-widest font-bold text-blue-300 mb-1.5 block">Tanggal Efektif Kontrak *</Label>
                        <Input 
                          type="date" 
                          value={kontrak.tglMulai} 
                          onChange={e => setKontrak({...kontrak, tglMulai: e.target.value})} 
                          className="h-11 bg-white/10 border-white/20 text-white [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]" 
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-[10px] uppercase tracking-widest font-bold text-blue-300 mb-1.5 block">Durasi (Bulan) *</Label>
                          <div className="relative">
                            <Input 
                              type="number" min="1" 
                              value={kontrak.durasi} 
                              onChange={e => setKontrak({...kontrak, durasi: e.target.value})} 
                              className="h-11 bg-white/10 border-white/20 text-white font-mono text-lg font-bold pr-12" 
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-300">BLN</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-[10px] uppercase tracking-widest font-bold text-emerald-300 mb-1.5 block">Porsi / Hari *</Label>
                          <div className="relative">
                            <Input 
                              type="number" min="1" 
                              value={kontrak.kuotaPorsi} 
                              onChange={e => setKontrak({...kontrak, kuotaPorsi: e.target.value})} 
                              className="h-11 bg-emerald-500/10 border-emerald-500/30 text-emerald-100 font-mono text-lg font-bold pr-12 focus-visible:ring-emerald-500" 
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400">PRS</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-white/10">
                        <p className="text-xs text-blue-200/60 leading-relaxed text-justify">
                          Parameter ini akan digunakan sebagai pengali (*multiplier*) pada Tahap 3 untuk menghasilkan estimasi <strong>Harga Pokok Produksi (HPP) Total</strong> yang akan diajukan ke Pemerintah.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      )}

      {/* --- STEP 2: Susun Menu & Katalog --- */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
          
          {/* Kolom Kiri: Katalog Vendor */}
          <Card className="lg:col-span-5 rounded-2xl shadow-md border-none h-fit max-h-[600px] flex flex-col">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-2xl py-4">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <ShoppingBag size={18} className="text-blue-600"/> Katalog Vendor Lokal
              </CardTitle>
              <Input placeholder="Cari bahan baku..." className="mt-2 h-9 text-xs" />
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto custom-scrollbar">
              <div className="divide-y divide-slate-100">
                {MOCK_CATALOG.map(item => (
                  <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors group">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-sm text-slate-800">{item.name}</p>
                        <p className="text-[10px] text-slate-500 font-semibold uppercase">{item.vendor}</p>
                        <p className="text-xs font-mono font-bold text-emerald-600 mt-1">
                          Rp {item.price.toLocaleString()} / {item.unit}
                        </p>
                      </div>
                      
                      {/* Tombol Add (Dropdown Menu Target) */}
                      <div className="dropdown">
                        <Button variant="outline" size="sm" className="h-7 px-2 text-xs font-bold border-blue-200 text-blue-600 hover:bg-blue-50">
                          + Pilih
                        </Button>
                        <div className="dropdown-content mt-1 p-1 bg-white border border-slate-200 shadow-xl rounded-xl absolute z-50 w-48 hidden group-hover:block right-0">
                          <p className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">Pilih Menu Tujuan:</p>
                          {menus.map(m => (
                            <button key={m.id} onClick={() => addItemToMenu(m.id, item)} className="w-full text-left px-2 py-1.5 text-xs font-semibold hover:bg-blue-50 rounded-md text-slate-700">
                              {m.name}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Kolom Kanan: Papan Menu */}
          <div className="lg:col-span-7 space-y-4">
            {menus.map((menu, index) => (
              <Card key={menu.id} className="rounded-2xl shadow-sm border border-slate-200">
                <CardHeader className="py-3 px-4 bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between rounded-t-2xl">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-xs">
                      {index + 1}
                    </div>
                    <Input 
                      value={menu.name} 
                      onChange={e => updateMenuName(menu.id, e.target.value)}
                      className="h-8 font-bold border-transparent bg-transparent hover:border-slate-200 focus:bg-white max-w-[250px]"
                    />
                  </div>
                  {menus.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeMenu(menu.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0">
                      <Trash2 size={16} />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-0">
                  {menu.items.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">
                      Pilih barang dari katalog di samping dan masukkan ke menu ini.
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50/50 text-[10px] font-bold uppercase text-slate-500">
                        <tr>
                          <th className="text-left py-2 px-4">Bahan Baku & Vendor</th>
                          <th className="text-right py-2 px-4 w-28">Takaran</th>
                          <th className="text-right py-2 px-4">Subtotal HPP</th>
                          <th className="w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {menu.items.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="py-2 px-4">
                              <p className="font-bold text-slate-800 text-xs">{item.name}</p>
                              <p className="text-[9px] text-slate-400">{item.vendor} • Rp {item.price.toLocaleString()}/{item.unit}</p>
                            </td>
                            <td className="py-2 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Input 
                                  type="number" step="0.1" min="0" 
                                  value={item.takaran} 
                                  onChange={e => updateItemTakaran(menu.id, item.id, parseFloat(e.target.value) || 0)}
                                  className="h-7 w-16 text-right text-xs" 
                                />
                                <span className="text-[10px] text-slate-400">{item.unit}</span>
                              </div>
                            </td>
                            <td className="py-2 px-4 text-right font-mono font-bold text-emerald-600 text-xs">
                              Rp {(item.takaran * item.price).toLocaleString()}
                            </td>
                            <td className="py-2 px-2 text-center">
                              <button onClick={() => removeItemFromMenu(menu.id, item.id)} className="text-red-400 hover:text-red-600">
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>
            ))}

            <Button variant="outline" onClick={addMenu} className="w-full border-dashed border-blue-300 text-blue-600 bg-blue-50/50 hover:bg-blue-100 rounded-xl h-12">
              <Plus size={18} className="mr-2" /> Tambah Variasi Menu Baru
            </Button>
          </div>

        </div>
      )}

      {/* --- STEP 3: Review & Publish --- */}
      {step === 3 && (
        <Card className="rounded-2xl shadow-md border-none animate-in fade-in slide-in-from-right-4 duration-500 bg-gradient-to-br from-[#1E3A8A] to-[#1E1B4B] text-white">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <FileCheck size={24} className="text-blue-300" /> Ringkasan Proposal & Tender
            </CardTitle>
            <p className="text-blue-200 text-sm">Pastikan rincian kontrak dan HPP sudah sesuai sebelum dikirim ke Vendor untuk persetujuan.</p>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm">
              <div>
                <p className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">Sekolah Tujuan</p>
                <p className="font-bold mt-1">{lokasi.sekolah || "—"}</p>
                <p className="text-xs text-blue-200">{lokasi.kota}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">Mulai Kontrak</p>
                <p className="font-bold mt-1">{kontrak.tglMulai || "—"}</p>
                <p className="text-xs text-blue-200">{kontrak.durasi} Bulan</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">Porsi Harian</p>
                <p className="font-bold mt-1 text-emerald-300">{kontrak.kuotaPorsi} Porsi</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">Status Dokumen</p>
                <span className="inline-flex items-center px-2 py-1 rounded bg-amber-500/20 text-amber-300 text-xs font-bold mt-1">
                  Drafting
                </span>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-white text-slate-800 shadow-xl">
              <h4 className="font-bold text-lg border-b pb-2 mb-4">Estimasi Harga Pokok Produksi (HPP)</h4>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500 font-semibold">Total HPP per Porsi (Bahan Baku)</span>
                <span className="font-mono font-bold text-lg text-slate-800">Rp {totals.hppPorsi.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-200">
                <span className="text-slate-500 font-semibold">Total Porsi Kontrak ({kontrak.durasi} bln x asumsi hari)</span>
                <span className="font-mono font-bold text-lg text-slate-800">x {kontrak.kuotaPorsi} / hari</span>
              </div>
              
              <div className="flex items-center justify-between pt-4 mt-2">
                <div>
                  <p className="font-black text-xl text-[#1E3A8A]">Grand Total Estimasi RAB</p>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Diusulkan ke Pemerintah</p>
                </div>
                <span className="font-mono font-black text-3xl text-emerald-600">Rp {totals.grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-900/50 border border-blue-400/30">
              <h5 className="font-bold text-sm text-blue-200 flex items-center gap-2 mb-2">
                <ArrowRight size={16} /> Apa yang terjadi setelah ini?
              </h5>
              <p className="text-xs text-blue-100/70 leading-relaxed">
                Proposal ini akan disimpan sebagai <strong>Draft</strong>. Sistem akan mengirim notifikasi ke <strong>seluruh vendor</strong> yang barangnya Anda masukkan ke dalam menu (contoh: PT. Pangan Nusantara). Jika mereka mengkonfirmasi kesanggupan harga dan stok, Anda baru bisa menekan tombol <strong>Publish ke Pemerintah</strong>.
              </p>
            </div>

          </CardContent>
        </Card>
      )}

      {/* --- Footer Buttons --- */}
      <div className="flex items-center justify-between pt-4">
        {step > 1 ? (
          <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={isSubmitting} className="h-11 px-6 rounded-xl font-bold border-slate-200 text-slate-600">
            <ArrowLeft size={16} className="mr-2" /> Sebelumnya
          </Button>
        ) : <div />}

        {step < 3 ? (
          <Button onClick={handleNext} className="h-11 px-8 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
            Lanjut Tahap {step + 1} <ArrowRight size={16} className="ml-2" />
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button variant="secondary" disabled className="h-11 px-6 rounded-xl font-bold bg-white/50 text-slate-400 cursor-not-allowed">
              Publish ke Pemerintah (Terkunci)
            </Button>
            <Button onClick={handleSaveDraft} disabled={isSubmitting} className="h-11 px-8 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
              {isSubmitting ? "Memproses..." : "Simpan Draft & Request ke Vendor"}
            </Button>
          </div>
        )}
      </div>

    </div>
  );
}
