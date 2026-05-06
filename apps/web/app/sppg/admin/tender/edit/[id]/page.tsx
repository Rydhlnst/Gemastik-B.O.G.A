"use client";

import React, { useState, useRef, useMemo } from "react";
import { 
  ArrowLeft, CheckCircle2, ChefHat, Info, Calendar, Users, MapPin, 
  Loader2, Lock, UtensilsCrossed, LayoutGrid, FileText, Building2,
  Plus, Box, Check, ListChecks, UploadCloud, Store, Search, X, AlertTriangle, Star, Sparkles, AlertCircle, Calculator, Trash2, Edit2, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

import { 
  CatalogItem, SelectedIngredient, CustomMenu, mockCatalogItems, STUDENTS_COUNT 
} from "@/lib/tender-utils";

export default function EditTenderDraftPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRevisionMode = searchParams.get("revision") === "true";
  
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  
  const [customMenus, setCustomMenus] = useState<CustomMenu[]>([]);
  
  // Pre-fill mock data for Revision Mode demo if id is 3
  React.useEffect(() => {
    if (isRevisionMode && id === "3" && customMenus.length === 0) {
      setCustomMenus([
        {
          id: "menu-1",
          name: "Nasi Daging Teriyaki Lokal",
          description: "Daging sapi teriyaki dengan sayur segar.",
          price: 18000,
          frequency: 8,
          selectedDays: [1, 5, 10, 15, 20, 25, 28, 30],
          bufferPercent: 5,
          overheadCost: 1500,
          cookingTime: 60,
          image: "https://images.unsplash.com/photo-1534422298391-e4f8c170db06?q=80&w=200&auto=format&fit=crop",
          compartments: { karbo: "Nasi", proteinUtama: "Daging", proteinNabati: "Tahu", sayur: "Buncis", buah: "Pisang" },
          ingredients: [
            { id: "c13", name: "Daging Sapi Has Dalam", vendor: "Peternakan Sapi Makmur", price: "Rp 135.000", category: "Protein Hewani", unit: "kg", stock: 50, het: "Rp 130.000", isMarkup: true, rating: 4.6, reviews: 200, isNew: false, distance: 4.2, image: "https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=300&auto=format&fit=crop", amountPerPortion: 100, description: "Daging sapi has dalam tekstur empuk, bebas lemak, sangat baik untuk pemenuhan gizi anak." , gallery: ["https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=300&auto=format&fit=crop", "https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=301&auto=format&fit=crop", "https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=302&auto=format&fit=crop", "https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=303&auto=format&fit=crop"] }
          ]
        },
        {
          id: "menu-2",
          name: "Nasi Sayur Lodeh Tahu",
          description: "Sayur lodeh kuah santan dengan tahu lembut.",
          price: 11000,
          frequency: 15,
          selectedDays: [2, 4, 6, 8, 12, 14, 16, 18, 22, 24, 26, 27, 29, 31],
          bufferPercent: 5,
          overheadCost: 1200,
          cookingTime: 45,
          image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=200&auto=format&fit=crop",
          compartments: { karbo: "Nasi", proteinUtama: "Telur", proteinNabati: "Tahu", sayur: "Lodeh", buah: "Jeruk" },
          ingredients: [
            { id: "c12", name: "Wortel Brastagi", vendor: "Sayur Mayur Lembang", price: "Rp 14.000", category: "Sayuran", unit: "kg", stock: 90, het: "Rp 15.000", isMarkup: false, rating: 4.7, reviews: 110, isNew: false, distance: 14.5, image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=300&auto=format&fit=crop", amountPerPortion: 50, description: "Wortel manis segar dari Brastagi, kaya akan vitamin A dan baik untuk mata." , gallery: ["https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=300&auto=format&fit=crop", "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=301&auto=format&fit=crop", "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=302&auto=format&fit=crop", "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=303&auto=format&fit=crop"] }
          ]
        }
      ]);
    }
  }, [isRevisionMode, id, customMenus.length]);
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Dialog States
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);

  // Persistence Logic: Load draft from SessionStorage
  React.useEffect(() => {
    const savedDraft = sessionStorage.getItem(`tender-draft-${id}`);
    if (savedDraft) {
      const { customMenus: savedMenus, currentForm, isMenuOpen, ingredients } = JSON.parse(savedDraft);
      if (savedMenus) setCustomMenus(savedMenus);
      if (currentForm) setForm(currentForm);
      if (isMenuOpen) setIsMenuDialogOpen(isMenuOpen);
      if (ingredients) setSelectedIngredients(ingredients);
      
      // Clear after loading to avoid stale data next time, 
      // but we actually want it to stay until explicitly cleared or published
      // sessionStorage.removeItem(`tender-draft-${id}`);
    }
  }, [id]);

  const saveDraftToSession = () => {
    const draftData = {
      customMenus,
      currentForm: form,
      isMenuOpen: isMenuDialogOpen,
      ingredients: selectedIngredients
    };
    sessionStorage.setItem(`tender-draft-${id}`, JSON.stringify(draftData));
  };
  
  // Filter & Sort States for Catalog
  const [catalogSearch, setCatalogSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  // Form State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([]);
  
  const [form, setForm] = useState({
    name: "",
    description: "",
    selectedDays: [] as number[],
    bufferPercent: 5,
    overheadCost: 1500,
    cookingTime: 90,
    image: "",
    karbo: "",
    proteinUtama: "",
    proteinNabati: "",
    sayur: "",
    buah: ""
  });

  const resetForm = () => {
    setForm({
      name: "", description: "", selectedDays: [], bufferPercent: 5, overheadCost: 1500, cookingTime: 90, image: "", 
      karbo: "", proteinUtama: "", proteinNabati: "", sayur: "", buah: ""
    });
    setImagePreview(null);
    setSelectedIngredients([]);
    setEditingMenuId(null);
  };

  const handleEditMenu = (menuId: string) => {
    const menu = customMenus.find(m => m.id === menuId);
    if (menu) {
      setForm({
        name: menu.name,
        description: menu.description,
        selectedDays: menu.selectedDays,
        bufferPercent: menu.bufferPercent,
        overheadCost: menu.overheadCost,
        cookingTime: menu.cookingTime,
        image: menu.image,
        karbo: menu.compartments.karbo,
        proteinUtama: menu.compartments.proteinUtama,
        proteinNabati: menu.compartments.proteinNabati,
        sayur: menu.compartments.sayur,
        buah: menu.compartments.buah
      });
      setSelectedIngredients(menu.ingredients);
      setImagePreview(menu.image);
      setEditingMenuId(menuId);
      setIsMenuDialogOpen(true);
    }
  };

  const toggleDay = (day: number) => {
    setForm(prev => {
       const isSelected = prev.selectedDays.includes(day);
       if (isSelected) {
         return { ...prev, selectedDays: prev.selectedDays.filter(d => d !== day) };
       } else {
         return { ...prev, selectedDays: [...prev.selectedDays, day].sort((a, b) => a - b) };
       }
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB max
        toast.error("Ukuran file maksimal 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setForm(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleIngredient = (item: CatalogItem) => {
    if (selectedIngredients.find(i => i.id === item.id)) {
      setSelectedIngredients(selectedIngredients.filter(i => i.id !== item.id));
    } else {
      setSelectedIngredients([...selectedIngredients, { ...item, amountPerPortion: 0 }]);
    }
  };

  const updateIngredientAmount = (id: string, amountStr: string) => {
    const val = parseFloat(amountStr);
    setSelectedIngredients(prev => prev.map(item => item.id === id ? { ...item, amountPerPortion: isNaN(val) ? 0 : val } : item));
  };

  // Kalkulasi Harga Unit (BOM)
  const currentMenuPrice = useMemo(() => {
    return selectedIngredients.reduce((total, ing) => {
      let factor = 1;
      // Konversi jika vendor memakai kilogram atau liter, tapi resep (input SPPG) memakai gram atau ml
      if (ing.unit === "kg" || ing.unit === "liter") factor = 1000;
      
      const vendorPriceNum = parseInt(ing.price.replace(/[^0-9]/g, '')) || 0;
      const costPerPortion = (ing.amountPerPortion / factor) * vendorPriceNum;
      
      // Hitung safety buffer
      const costWithBuffer = costPerPortion * (1 + (form.bufferPercent / 100));
      return total + costWithBuffer;
    }, 0) + form.overheadCost;
  }, [selectedIngredients, form.bufferPercent, form.overheadCost]);

  const handlePublish = () => {
    setIsPublishing(true);
    toast.loading("Memproses Framework Agreement Multi-Supplier...");
    
    setTimeout(() => {
      toast.dismiss();
      toast.success("Framework Agreement Berhasil Dikunci!");
      router.push("/sppg/admin/tender/list");
    }, 2000);
  };

  const handleAddMenu = () => {
    if (!form.name || !form.karbo || !form.proteinUtama) {
      toast.error("Harap isi minimal Nama Menu, Karbohidrat, dan Protein Utama.");
      return;
    }
    
    if (form.selectedDays.length === 0) {
      toast.error("Harap pilih minimal 1 tanggal penyajian di kalender jadwal.");
      return;
    }

    // Validasi Gramasi
    const emptyGrams = selectedIngredients.filter(i => i.amountPerPortion <= 0);
    if (emptyGrams.length > 0) {
      toast.error("Pastikan semua bahan baku yang dipilih memiliki nominal porsi (gram/unit) di atas 0.");
      return;
    }

    const newMenu: CustomMenu = {
      id: `menu-${Date.now()}`,
      name: form.name,
      description: form.description,
      price: currentMenuPrice,
      frequency: form.selectedDays.length,
      selectedDays: form.selectedDays,
      bufferPercent: form.bufferPercent,
      overheadCost: form.overheadCost,
      cookingTime: form.cookingTime,
      image: form.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop",
      compartments: {
        karbo: form.karbo,
        proteinUtama: form.proteinUtama,
        proteinNabati: form.proteinNabati,
        sayur: form.sayur,
        buah: form.buah
      },
      ingredients: selectedIngredients
    };

    if (editingMenuId) {
      setCustomMenus(prev => prev.map(m => m.id === editingMenuId ? { ...newMenu, id: editingMenuId } : m));
      toast.success("Rencana menu berhasil diperbarui!");
    } else {
      setCustomMenus([...customMenus, newMenu]);
      toast.success("Rencana menu berhasil ditambahkan ke Master Plan!");
    }
    resetForm();
    setIsMenuDialogOpen(false);
  };

  const handleDeleteMenu = (menuId: string) => {
    setCustomMenus(prev => prev.filter(m => m.id !== menuId));
    toast.success("Menu berhasil dihapus dari Master Plan.");
  };

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(number);
  };

  // Total Anggaran Calculation
  const { totalDays, totalBudget } = useMemo(() => {
    let days = 0;
    let budget = 0;
    customMenus.forEach(menu => {
      days += menu.frequency;
      budget += (menu.price * STUDENTS_COUNT * menu.frequency);
    });
    return { totalDays: days, totalBudget: budget };
  }, [customMenus]);

  const averageUnitCost = totalDays > 0 ? (totalBudget / (totalDays * STUDENTS_COUNT)) : 0;

  // Kepatuhan Multisupplier Tracker (Target BGN: min. 15 unique vendors)
  const uniqueVendorsCount = useMemo(() => {
    const vendors = new Set<string>();
    customMenus.forEach(menu => {
      menu.ingredients.forEach(ing => vendors.add(ing.vendor));
    });
    return vendors.size;
  }, [customMenus]);

  const targetVendors = 15;
  const progressPercentage = Math.min((uniqueVendorsCount / targetVendors) * 100, 100);
  const isCompliant = uniqueVendorsCount >= targetVendors;

  // Global PO Aggregation
  const globalPOs = useMemo(() => {
    const pos = new Map<string, { vendor: string, name: string, total: number, unit: string, image: string }>();
    
    customMenus.forEach(menu => {
      menu.ingredients.forEach(bahan => {
        const isMass = bahan.unit === 'kg';
        const isVol = bahan.unit === 'liter';
        const conversion = isMass || isVol ? 1000 : 1;
        
        const rawDemand = (bahan.amountPerPortion / conversion) * STUDENTS_COUNT * menu.frequency;
        const bufferedDemand = rawDemand * (1 + (menu.bufferPercent / 100));
        
        const key = bahan.id;
        if (pos.has(key)) {
          const existing = pos.get(key)!;
          existing.total += bufferedDemand;
        } else {
          pos.set(key, {
            vendor: bahan.vendor,
            name: bahan.name,
            total: bufferedDemand,
            unit: bahan.unit,
            image: bahan.image
          });
        }
      });
    });
    
    // Urutkan berdasarkan kuantitas terbesar
    return Array.from(pos.values()).sort((a, b) => b.total - a.total);
  }, [customMenus]);

  // Filter and Sort Logic for Catalog
  let filteredCatalog = mockCatalogItems.filter(item => 
    (item.name.toLowerCase().includes(catalogSearch.toLowerCase()) || 
     item.vendor.toLowerCase().includes(catalogSearch.toLowerCase())) &&
    (filterCategory === "all" || item.category === filterCategory)
  );

  if (sortBy === "cheapest") {
    filteredCatalog.sort((a, b) => parseInt(a.price.replace(/[^0-9]/g, '')) - parseInt(b.price.replace(/[^0-9]/g, '')));
  } else if (sortBy === "nearest") {
    filteredCatalog.sort((a, b) => a.distance - b.distance);
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Top Header Navigation */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="w-full px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/sppg/admin/tender/list">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-black text-[#213555] uppercase tracking-widest leading-none mb-1">
                <Lock size={10} /> Framework Agreement & Master Menu
              </div>
              <h2 className="text-xl font-bold text-slate-800 leading-none">Draft: FA-SPPG-2026-00{id}</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="rounded-[14px] font-bold text-slate-600 border-slate-200"
            >
              SIMPAN DRAFT
            </Button>
            <Button 
              onClick={handlePublish}
              disabled={isPublishing || (!isRevisionMode && (!isCompliant || customMenus.length === 0))}
              className={`rounded-[14px] font-bold px-6 shadow-lg transition-all ${
                (isCompliant && customMenus.length > 0) || isRevisionMode
                  ? "bg-[#213555] hover:opacity-90 text-white shadow-slate-900/10" 
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {isPublishing ? <Loader2 className="animate-spin" /> : (isRevisionMode ? "SIMPAN REVISI VENDOR" : "TERBITKAN SEKARANG")}
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Revision Mode Banner */}
        {isRevisionMode && (
          <div className="lg:col-span-12 bg-red-50 border border-red-200 rounded-[24px] p-5 flex items-start gap-4 shadow-sm mb-[-1rem]">
             <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <Lock size={20} />
             </div>
             <div>
                <h4 className="text-sm font-bold text-red-900 mb-1">Mode Revisi Mitra Aktif</h4>
                <p className="text-xs font-medium text-red-700 leading-relaxed max-w-4xl">
                   Anda hanya diizinkan untuk mengubah vendor yang bermasalah dan mencari penggantinya dari Katalog. Perubahan pada nama menu, kuantitas gramasi, dan jadwal <b>dikunci</b> agar tidak membatalkan persetujuan anggaran BGN yang sudah ada. Vendor yang sudah "Setuju" tidak dapat dihapus.
                </p>
             </div>
          </div>
        )}

        {/* Main Content: Menu Builder */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                  <ChefHat className="text-[#213555]" size={28} />
                  Master Rencana Menu
                </h3>
                <p className="text-slate-500 font-medium text-sm mt-1">Rakit menu gizi harian dan alokasi vendor bahan pokok Multisupplier.</p>
              </div>
              
              {!isMenuDialogOpen && !isRevisionMode ? (
                <Button 
                  onClick={() => setIsMenuDialogOpen(true)}
                  className="h-12 px-6 rounded-[16px] bg-[#F2F2F2] text-[#213555] hover:bg-[#D8C4B6] hover:text-[#213555] font-bold flex items-center gap-2 shadow-sm border border-slate-200 transition-colors"
                >
                  <Plus size={20} />
                  Tambah Menu Makanan
                </Button>
              ) : null}
            </div>

            {/* Flat Seamless Form Buat Menu (Menggantikan Card tebal) */}
            {isMenuDialogOpen && (
              <div className="mb-10 bg-slate-50/50 -mx-8 px-8 py-8 border-y border-slate-100 transition-all animate-in slide-in-from-top-4 fade-in duration-500">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <UtensilsCrossed className="text-[#213555]" size={18} /> Rakit Menu Baru
                    </h3>
                    <p className="text-slate-500 text-xs mt-1">Isi detail menu harian dan mapping Stainless Steel 304.</p>
                  </div>
                  <Button 
                    variant="ghost" size="icon" 
                    onClick={() => setIsMenuDialogOpen(false)}
                    className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                  >
                     <X size={20} />
                  </Button>
                </div>
                
                <div className="space-y-8">
                    
                    {/* Section 1: Upload Foto */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">
                        <UploadCloud size={14} /> Foto Representasi Menu
                      </div>
                      
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-[20px] p-6 text-center cursor-pointer transition-all ${imagePreview ? "border-[#213555] bg-slate-50" : "border-slate-300 hover:border-[#213555] hover:bg-white bg-white/50"}`}
                      >
                         <input 
                           type="file" 
                           ref={fileInputRef} 
                           onChange={handleImageChange} 
                           accept="image/png, image/jpeg" 
                           className="hidden" 
                         />
                         
                         {imagePreview ? (
                            <div className="flex flex-col items-center">
                               <div className="w-full max-w-[200px] h-32 rounded-xl overflow-hidden mb-3 border border-slate-200 shadow-sm">
                                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                               </div>
                               <p className="text-sm font-bold text-[#213555]">Foto Berhasil Diunggah</p>
                               <p className="text-xs text-slate-500 mt-1">Klik lagi untuk mengganti foto</p>
                            </div>
                         ) : (
                            <div className="flex flex-col items-center py-4">
                               <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                  <UploadCloud className="text-[#213555]" size={24} />
                               </div>
                               <p className="font-bold text-slate-700">Klik atau Drag & Drop Foto Menu</p>
                               <p className="text-xs text-slate-500 mt-1">Maksimal 2MB (Hanya PNG/JPG)</p>
                            </div>
                         )}
                      </div>
                    </div>

                    {/* Section 2: Info Dasar & Kalkulasi Harga (Auto BOM) */}
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">
                        <Calculator size={14} /> Kalkulasi Otomatis (Auto BOM)
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-2">
                          <Label className="text-xs font-bold text-slate-500">Nama Menu <span className="text-red-500">*</span></Label>
                          <Input disabled={isRevisionMode} placeholder="Contoh: Paket Nasi Ayam Bakar" className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-[#213555] shadow-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label className="text-xs font-bold text-slate-500 flex justify-between">
                            <span>Jadwal Penyajian (Kalender 31 Hari)</span>
                            <span className="text-[#213555] bg-[#D8C4B6]/20 px-2 py-0.5 rounded font-black">{form.selectedDays.length} Hari Terpilih</span>
                          </Label>
                          <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                             {Array.from({length: 31}, (_, i) => i + 1).map(day => {
                               const isSelected = form.selectedDays.includes(day);
                               return (
                                 <button
                                   key={day}
                                   type="button"
                                   onClick={() => !isRevisionMode && toggleDay(day)}
                                   className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${isSelected ? 'bg-[#213555] text-white shadow-sm shadow-slate-900/20 scale-105' : 'bg-white text-slate-400 border border-slate-200 hover:border-[#213555] hover:text-[#213555]'}`}
                                 >
                                   {day}
                                 </button>
                               )
                             })}
                          </div>
                        </div>

                        <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                          <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500">Safety Buffer Kuantitas</Label>
                            <div className="relative">
                              <Input disabled={isRevisionMode} placeholder="5" type="number" min="0" className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-[#213555] shadow-sm font-bold" value={form.bufferPercent} onChange={e => setForm({...form, bufferPercent: parseFloat(e.target.value) || 0})} />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500" title="Biaya Operasional Tenaga & Gas">Overhead / Porsi</Label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                              <Input disabled={isRevisionMode} placeholder="1500" type="number" min="0" className="h-11 pl-10 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-[#213555] shadow-sm font-bold" value={form.overheadCost} onChange={e => setForm({...form, overheadCost: parseInt(e.target.value) || 0})} />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500">Est. Waktu Memasak</Label>
                            <div className="relative">
                              <Input disabled={isRevisionMode} placeholder="90" type="number" min="0" className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-[#213555] shadow-sm font-bold" value={form.cookingTime} onChange={e => setForm({...form, cookingTime: parseInt(e.target.value) || 0})} />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Menit</span>
                            </div>
                          </div>
                        </div>

                        {/* Deskripsi Singkat */}
                        <div className="col-span-2 space-y-2 pt-2 border-t border-slate-100">
                          <Label className="text-xs font-bold text-slate-500 flex justify-between">
                            <span>Deskripsi Singkat Menu</span>
                            <span className="text-[10px] text-slate-400 font-medium">{form.description.length}/500</span>
                          </Label>
                          <Textarea 
                            disabled={isRevisionMode}
                            placeholder="Penjelasan singkat tentang menu ini (misal: Ayam bakar bumbu nusantara tinggi protein)..." 
                            className="min-h-[80px] resize-none rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-[#213555] shadow-sm text-sm" 
                            maxLength={500}
                            value={form.description} 
                            onChange={e => setForm({...form, description: e.target.value})} 
                          />
                        </div>

                        {/* Automated Pricing display (Read-only) */}
                        <div className="col-span-2 p-5 rounded-2xl border-2 border-slate-100 bg-[#F2F2F2] flex flex-col md:flex-row items-center justify-between gap-4">
                          <div>
                             <p className="text-xs font-black text-[#213555] uppercase tracking-widest flex items-center gap-1.5"><CheckCircle2 size={14}/> Auto-Costing Aktif</p>
                             <p className="text-xs font-medium text-slate-500 mt-1">Biaya HPP porsi dikalkulasi dari {selectedIngredients.length} bahan pokok + {form.bufferPercent}% buffer.</p>
                          </div>
                          <div className="text-right shrink-0">
                             <p className="text-sm font-bold text-slate-500">Total Biaya Porsi</p>
                             <p className="text-2xl font-black text-[#213555]">{formatRupiah(currentMenuPrice)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Pemetaan Wadah (Stainless Steel 304) */}
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">
                        <Box size={14} /> Pemetaan Kompartemen (Stainless 304)
                      </div>
                      <div className="grid grid-cols-2 gap-4 bg-slate-50 p-5 rounded-[20px] border border-slate-200 shadow-sm">
                        <div className="space-y-2">
                          <Label className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400"></div> Sekat 1: Karbohidrat</Label>
                          <Input placeholder="Contoh: Nasi Putih 150g" className="h-10 rounded-lg bg-white border-slate-200" value={form.karbo} onChange={e => setForm({...form, karbo: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-400"></div> Sekat 2: Lauk Utama</Label>
                          <Input placeholder="Contoh: Ayam Bakar Dada" className="h-10 rounded-lg bg-white border-slate-200" value={form.proteinUtama} onChange={e => setForm({...form, proteinUtama: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-400"></div> Sekat 3: Lauk Pendamping</Label>
                          <Input placeholder="Contoh: Tahu/Tempe Goreng" className="h-10 rounded-lg bg-white border-slate-200" value={form.proteinNabati} onChange={e => setForm({...form, proteinNabati: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400"></div> Sekat 4: Sayuran</Label>
                          <Input placeholder="Contoh: Tumis Buncis Jagung" className="h-10 rounded-lg bg-white border-slate-200" value={form.sayur} onChange={e => setForm({...form, sayur: e.target.value})} />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-400"></div> Sekat 5: Pelengkap (Buah/Susu)</Label>
                          <Input placeholder="Contoh: Pisang Ambon & Susu UHT 200ml" className="h-10 rounded-lg bg-white border-slate-200" value={form.buah} onChange={e => setForm({...form, buah: e.target.value})} />
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Bahan Pokok (Vendor Catalog Integration) */}
                    <div className="space-y-4 pt-4">
                       <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                            <Store size={14} /> Input Gramasi Resep (Multisupplier)
                          </div>
                          
                          <Button 
                            onClick={() => {
                              saveDraftToSession();
                              router.push(`/sppg/admin/tender/edit/${id}/catalog`);
                            }}
                            type="button"
                            variant="outline" 
                            size="sm" 
                            className="h-8 rounded-lg font-bold text-[#213555] border-slate-200 bg-[#F2F2F2] hover:bg-[#D8C4B6] shadow-sm"
                          >
                            <Search size={14} className="mr-1" /> Buka Katalog
                          </Button>
                       </div>

                      {/* List Bahan Terpilih dengan Input Gramasi */}
                      <div className="min-h-[100px] p-5 rounded-[20px] bg-slate-50 border border-slate-200 shadow-sm">
                        {selectedIngredients.length === 0 ? (
                           <div className="h-full flex flex-col items-center justify-center text-slate-400 py-4">
                             <ListChecks size={32} className="mb-3 opacity-30" />
                             <p className="text-sm font-bold">Belum ada bahan baku dipilih.</p>
                             <p className="text-xs mt-1 text-center max-w-xs">Klik tombol "Buka Katalog" untuk memilih bahan dari berbagai pemasok lokal.</p>
                           </div>
                        ) : (
                           <div className="flex flex-col gap-4">
                             {selectedIngredients.map(item => {
                               const isMass = item.unit === 'kg';
                               const isVolume = item.unit === 'liter';
                               const inputUnit = isMass ? 'gram' : isVolume ? 'ml' : item.unit;
                               const conversionFactor = isMass || isVolume ? 1000 : 1;
                               
                               const vendorPriceNum = parseInt(item.price.replace(/[^0-9]/g, '')) || 0;
                               const itemPortionCost = (item.amountPerPortion / conversionFactor) * vendorPriceNum;
                               const itemBufferedCost = itemPortionCost * (1 + (form.bufferPercent / 100));

                               return (
                               <div key={item.id} className="flex flex-col gap-3 bg-white p-4 rounded-xl border border-slate-100">
                                 {/* Item Header */}
                                 <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                                         <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-bold text-slate-800">{item.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                          <p className="text-[10px] font-medium text-slate-500"><Store size={10} className="inline mr-0.5"/>{item.vendor}</p>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                      <div className="text-right">
                                         <p className="text-[11px] font-black text-[#213555]">{item.price}<span className="text-[9px] text-slate-400 font-medium ml-1">/{item.unit}</span></p>
                                         <p className="text-[9px] font-bold text-slate-400 mt-0.5">Sisa: {item.stock} {item.unit}</p>
                                      </div>
                                      <Button 
                                        variant="ghost" size="icon" 
                                        className="w-8 h-8 rounded-full text-red-500 hover:bg-red-100 hover:text-red-700 shrink-0"
                                        onClick={() => { if (isRevisionMode && item.vendor !== "Sayur Mayur Lembang" && customMenus.find(m => m.ingredients.find(i => i.id === item.id))) { toast.error("Vendor yang sudah disetujui tidak dapat dihapus!"); return; } toggleIngredient(item); }}
                                      >
                                        <X size={16} />
                                      </Button>
                                    </div>
                                 </div>

                                 {/* Quantity Input Area */}
                                 <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <div className="flex-1">
                                      <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Kebutuhan per Porsi Siswa</Label>
                                      <div className="relative">
                                         <Input 
                                           type="number" 
                                           placeholder="0"
                                           value={item.amountPerPortion || ''}
                                           disabled={isRevisionMode}
                                           onChange={(e) => updateIngredientAmount(item.id, e.target.value)}
                                           className="h-10 pr-16 bg-white focus-visible:ring-[#213555] font-bold"
                                         />
                                         <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 bg-white">{inputUnit}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="flex-1 bg-white p-2.5 rounded-md border border-slate-100 flex items-center justify-between">
                                      <div>
                                         <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Modal per Porsi</p>
                                         <p className="text-[9px] text-slate-400 mt-0.5">Termasuk {form.bufferPercent}% buffer</p>
                                      </div>
                                      <p className="font-black text-sm text-[#213555]">{formatRupiah(itemBufferedCost)}</p>
                                    </div>
                                 </div>
                               </div>
                             )})}
                           </div>
                        )}
                      </div>
                    </div>

                </div>
                
                <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-200">
                  <Button variant="outline" onClick={() => setIsMenuDialogOpen(false)} className="rounded-xl font-bold h-11 px-6 bg-white border-slate-300">Batal</Button>
                  <Button onClick={handleAddMenu} className="rounded-xl bg-[#213555] hover:opacity-90 font-bold text-white shadow-md h-11 px-8">
                    Simpan ke Rencana Induk
                  </Button>
                </div>
              </div>
            )}
              

          </div>

          {/* List of Created Menus */}
          {customMenus.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-[24px] bg-[#F2F2F2] flex flex-col items-center justify-center">
              <UtensilsCrossed size={48} className="text-slate-300 mb-4" />
              <h4 className="text-lg font-bold text-slate-600 mb-1">Belum Ada Menu</h4>
              <p className="text-sm text-slate-500 max-w-sm">Klik "Tambah Menu Makanan" untuk merancang menu harian untuk instansi terkait.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {customMenus.map((menu, idx) => (
                <div key={menu.id} className="group relative flex flex-col lg:flex-row gap-6 p-6 rounded-[28px] bg-[#F2F2F2] border border-slate-200 hover:border-[#213555]/30 shadow-sm hover:shadow-xl hover:shadow-[#213555]/5 transition-all duration-300">
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[#213555] text-white flex items-center justify-center font-black text-sm border-4 border-white shadow-sm">
                    {idx + 1}
                  </div>
                  
                  <div className="w-full lg:w-48 h-48 rounded-[20px] overflow-hidden shrink-0 border border-slate-100 relative">
                    <img src={menu.image} alt={menu.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-3 left-3">
                       <p className="text-[10px] font-black text-white/80 uppercase tracking-widest mb-0.5">Biaya / Porsi</p>
                       <p className="text-sm font-black text-white">{formatRupiah(menu.price)}</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <div className="pr-4">
                        <h4 className="font-black text-slate-800 text-xl leading-tight mb-1">{menu.name}</h4>
                        <p className="text-sm text-slate-500 font-medium">{menu.description}</p>
                      </div>
                      <div className="flex items-start gap-3 shrink-0">
                         <div className="text-right">
                           <div className="flex justify-end gap-2 mb-1">
                             <p className="text-[9px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-1.5 rounded-md border border-amber-100 flex items-center gap-1"><ChefHat size={12} /> {menu.cookingTime} Mnt</p>
                             <p className="text-[10px] font-bold text-[#213555] uppercase tracking-widest bg-[#D8C4B6] px-2 py-1.5 rounded-md border border-[#D8C4B6]/20">Jadwal: {menu.frequency} Hari</p>
                           </div>
                           <p className="text-[9px] font-medium text-slate-400 mt-1 max-w-[150px] leading-tight text-right">Tgl: {menu.selectedDays.join(', ')}</p>
                         </div>
                         {!isRevisionMode && (
                           <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteMenu(menu.id)}
                              className="h-8 w-8 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                           >
                              <Trash2 size={16} />
                           </Button>
                         )}
                      </div>
                    </div>
                    
                    {/* Compartment Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-white p-3 rounded-[16px] border border-slate-100">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Karbo</p>
                        <p className="text-xs font-bold text-slate-700 truncate" title={menu.compartments.karbo}>{menu.compartments.karbo || "-"}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> Utama</p>
                        <p className="text-xs font-bold text-slate-700 truncate" title={menu.compartments.proteinUtama}>{menu.compartments.proteinUtama || "-"}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span> Pendamping</p>
                        <p className="text-xs font-bold text-slate-700 truncate" title={menu.compartments.proteinNabati}>{menu.compartments.proteinNabati || "-"}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Sayur</p>
                        <p className="text-xs font-bold text-slate-700 truncate" title={menu.compartments.sayur}>{menu.compartments.sayur || "-"}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Buah/Susu</p>
                        <p className="text-xs font-bold text-slate-700 truncate" title={menu.compartments.buah}>{menu.compartments.buah || "-"}</p>
                      </div>
                    </div>

                    {/* Proyeksi Kebutuhan PO (Demand Planning) */}
                    {menu.ingredients.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Box size={12} /> Proyeksi Kebutuhan PO ke Vendor</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {menu.ingredients.map((bahan) => {
                             // Hitung total PO unit yang dibutuhkan
                             const isMass = bahan.unit === 'kg';
                             const isVol = bahan.unit === 'liter';
                             const conversion = isMass || isVol ? 1000 : 1;
                             
                             // Total PO = (Gram per Porsi / Konversi) * 450 siswa * Frekuensi * Buffer
                             const rawDemand = (bahan.amountPerPortion / conversion) * STUDENTS_COUNT * menu.frequency;
                             const bufferedDemand = rawDemand * (1 + (menu.bufferPercent / 100));
                             
                             return (
                            <div key={bahan.id} className="flex flex-col gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-sm">
                              <p className="text-[10px] font-bold text-slate-700 leading-tight truncate">{bahan.name}</p>
                              <div className="flex justify-between items-end">
                                <p className="text-[9px] font-medium text-slate-500 leading-none">{bahan.vendor}</p>
                                <p className="text-xs font-black text-[#213555] leading-none">{bufferedDemand.toFixed(1)} <span className="text-[9px] font-bold opacity-70 uppercase">{bahan.unit}</span></p>
                              </div>
                            </div>
                          )})}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-[#F2F2F2] p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-start gap-5">
            <div className="w-12 h-12 rounded-[16px] bg-[#D8C4B6]/20 flex items-center justify-center shrink-0">
              <Info className="text-[#213555]" size={24} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-lg mb-1">Catatan Operasional Framework Agreement</h4>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-2">
                Dokumen ini merupakan Rencana Induk Menu (Master Plan) untuk program makan gizi gratis di instansi terkait. Setelah diterbitkan, sistem akan secara otomatis membuat draf <strong className="text-slate-700">Framework Agreement</strong> kepada seluruh Pemasok Lokal yang dilibatkan.
              </p>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Penerbitan <em>Purchase Order (PO)</em> harian dan proses Inbound/Outbound menggunakan QR Code & Blockchain Multi-Sig akan secara otomatis ditarik dari Proyeksi Kebutuhan PO di halaman ini.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#213555] p-8 rounded-[32px] text-white shadow-xl shadow-slate-900/10">
            <h3 className="text-lg font-black uppercase tracking-widest mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
              <FileText size={20} className="text-[#D8C4B6]" /> Master Rencana
            </h3>
            
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-[#D8C4B6] uppercase tracking-widest mb-2">Instansi Sasaran</p>
                <div className="flex items-start gap-3">
                  <Building2 size={20} className="text-[#D8C4B6] shrink-0" />
                  <p className="font-bold leading-tight">SDN 01 Bojongsoang, Kab. Bandung</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-black text-[#D8C4B6] uppercase tracking-widest mb-2">Kuota Harian</p>
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-[#D8C4B6]" />
                    <p className="text-xl font-black">{STUDENTS_COUNT} <span className="text-xs font-bold opacity-60">PORSI</span></p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-[#D8C4B6] uppercase tracking-widest mb-2">Total Jadwal</p>
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-[#D8C4B6]" />
                    <p className="text-xl font-black">{totalDays} <span className="text-xs font-bold opacity-60">HARI</span></p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-[#D8C4B6] uppercase tracking-widest mb-2">Wilayah Distribusi</p>
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-[#D8C4B6]" />
                  <p className="font-bold text-sm">Zona A - Bojongsoang & Sekitarnya</p>
                </div>
              </div>
            </div>
          </div>

          {/* NEW: Multisupplier Tracker Widget */}
          <div className={`p-6 rounded-[28px] border-2 shadow-sm ${isCompliant ? 'bg-[#F2F2F2] border-[#213555]' : 'bg-white border-slate-100 border-dashed'}`}>
             <div className="flex items-start justify-between mb-4">
                <div>
                   <p className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5"><Store size={14} /> Pemasok Terlibat</p>
                   <p className="text-[10px] font-medium text-slate-500 mt-1">Syarat BGN 2026: Min. {targetVendors} Vendor</p>
                </div>
                {isCompliant ? (
                   <span className="px-2 py-1 bg-[#213555]/10 text-[10px] font-black text-[#213555] rounded-lg uppercase flex items-center gap-1">
                      <CheckCircle2 size={10} /> Terpenuhi
                   </span>
                ) : (
                   <span className="px-2 py-1 bg-amber-100 text-[10px] font-black text-amber-700 rounded-lg uppercase flex items-center gap-1">
                      <AlertCircle size={10} /> Kurang
                   </span>
                )}
             </div>
             
             <div className="flex items-end gap-2 mb-3">
                <span className={`text-4xl font-black leading-none ${isCompliant ? 'text-[#213555]' : 'text-slate-800'}`}>{uniqueVendorsCount}</span>
                <span className="text-sm font-bold text-slate-400 mb-1">/ {targetVendors} Vendor Lokal</span>
             </div>
             
             <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                <div 
                   className={`h-full rounded-full transition-all duration-500 ${isCompliant ? 'bg-[#213555]' : 'bg-amber-400'}`}
                   style={{ width: `${progressPercentage}%` }}
                ></div>
             </div>
             
             {!isCompliant && (
                <p className="text-[10px] font-bold text-amber-600 mt-3 flex gap-1.5">
                   <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                   Sistem mengunci penerbitan. Tambahkan {targetVendors - uniqueVendorsCount} vendor lagi ke dalam menu untuk patuh pada aturan anti-monopoli.
                </p>
             )}
          </div>

          {/* NEW: Global PO Summary Widget */}
          {globalPOs.length > 0 && (
          <div className="bg-[#F2F2F2] p-6 rounded-[28px] border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-4">
                 <p className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                    <Store size={14} className="text-[#213555]" /> Resume Pesanan (PO)
                 </p>
                 <span className="px-2 py-1 bg-white text-[10px] font-bold text-[#213555] rounded-lg uppercase">Total Global</span>
             </div>
             
             <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                {globalPOs.map((po, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100 transition-all hover:border-[#213555] hover:shadow-sm">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                           <img src={po.image} alt={po.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="w-32">
                           <p className="text-[11px] font-bold text-slate-800 leading-tight truncate" title={po.name}>{po.name}</p>
                           <p className="text-[9px] font-medium text-slate-500 mt-0.5 truncate" title={po.vendor}>{po.vendor}</p>
                        </div>
                     </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-[#213555]">{po.total.toFixed(1)}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{po.unit}</p>
                      </div>
                  </div>
                ))}
             </div>
          </div>
          )}

          <div className="bg-[#F2F2F2] p-6 rounded-[28px] border border-slate-100 shadow-sm border-dashed">
             <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Kalkulasi Anggaran SPK</p>
                <span className="px-2 py-1 bg-white text-[10px] font-bold text-slate-500 rounded-lg uppercase">BOM Output</span>
             </div>
             <div className="space-y-3">
                <div className="flex justify-between text-sm font-medium text-slate-600">
                   <span>Unit Cost Rata-rata</span>
                   <span className="font-bold text-slate-800">{totalDays > 0 ? formatRupiah(averageUnitCost) : "-"}</span>
                </div>
                 <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                   <span className="text-xs font-black text-slate-800 uppercase">Total Anggaran Proyek</span>
                   <span className="text-lg font-black text-[#213555]">{totalBudget > 0 ? formatRupiah(totalBudget) : "-"}</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
