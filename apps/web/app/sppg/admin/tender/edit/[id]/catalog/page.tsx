"use client";

import React, { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { 
  ArrowLeft, Store, Search, Star, ChevronDown, Filter, ListChecks, 
  CheckCircle2, ShoppingCart, SlidersHorizontal, Package, Info, X,
  User, Phone, MapPin, FileText, ChevronUp, ExternalLink, Mail, CreditCard, ShieldCheck, Sparkles, TrendingUp,
  ArrowUpDown, MapPinIcon, Users, ArrowDownNarrowWide, ArrowUpNarrowWide, Boxes, Fish, Wheat, Carrot, Factory, Utensils, Navigation
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CatalogItem, SelectedIngredient, mockCatalogItems 
} from "@/lib/tender-utils";

const LogisticsMap = dynamic(
  () => import("@/components/sppg/admin/LogisticsMap"),
  { ssr: false, loading: () => (
    <div className="w-full h-72 rounded-[32px] bg-slate-100 border border-slate-200 mb-6 animate-pulse flex items-center justify-center">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Memuat Peta...</span>
    </div>
  )}
);

const toRupiah = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

export default function CatalogSelectionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [catalogSearch, setCatalogSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([]);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  React.useEffect(() => {
    const savedDraft = sessionStorage.getItem(`tender-draft-${id}`);
    if (savedDraft) {
      const { ingredients } = JSON.parse(savedDraft);
      if (ingredients) setSelectedIngredients(ingredients);
    }
  }, [id]);

  // AUTO SCROLL TO TOP WHEN CARD EXPANDED
  useEffect(() => {
    if (expandedCardId) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [expandedCardId]);

  const toggleIngredient = (item: CatalogItem) => {
    if (selectedIngredients.find(i => i.id === item.id)) {
      setSelectedIngredients(selectedIngredients.filter(i => i.id !== item.id));
    } else {
      setSelectedIngredients([...selectedIngredients, { ...item, amountPerPortion: 0 }]);
    }
  };

  const handleSaveAndBack = () => {
    const savedDraft = sessionStorage.getItem(`tender-draft-${id}`);
    let draftData = savedDraft ? JSON.parse(savedDraft) : {};
    draftData.ingredients = selectedIngredients;
    sessionStorage.setItem(`tender-draft-${id}`, JSON.stringify(draftData));
    toast.success("Pilihan bahan baku berhasil disimpan!");
    router.back();
  };

  const handleCancel = () => router.back();

  const filteredCatalog = useMemo(() => {
    let result = [...mockCatalogItems].filter(item => 
      (item.name.toLowerCase().includes(catalogSearch.toLowerCase()) || 
       item.vendor.toLowerCase().includes(catalogSearch.toLowerCase()) ||
       item.category.toLowerCase().includes(catalogSearch.toLowerCase())) &&
      (filterCategory === "all" || item.category === filterCategory)
    );

    if (sortBy === "cheapest") {
      result.sort((a, b) => parseInt(a.price.replace(/[^0-9]/g, '')) - parseInt(b.price.replace(/[^0-9]/g, '')));
    } else if (sortBy === "expensive") {
      result.sort((a, b) => parseInt(b.price.replace(/[^0-9]/g, '')) - parseInt(a.price.replace(/[^0-9]/g, '')));
    } else if (sortBy === "rating_high") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "rating_low") {
      result.sort((a, b) => a.rating - b.rating);
    } else if (sortBy === "stock_high") {
      result.sort((a, b) => b.stock - a.stock);
    } else if (sortBy === "stock_low") {
      result.sort((a, b) => a.stock - b.stock);
    } else if (sortBy === "buyers_high") {
      result.sort((a, b) => b.buyersCount - a.buyersCount);
    } else if (sortBy === "buyers_low") {
      result.sort((a, b) => a.buyersCount - b.buyersCount);
    }
    
    return result;
  }, [catalogSearch, filterCategory, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-x-hidden scroll-smooth">
      <header className="border-b sticky top-0 z-50" style={{ backgroundColor: "#fff", borderColor: "#D8C4B6" }}>
        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={handleCancel} className="rounded-full hover:bg-[#F5EFE7]">
            <ArrowLeft size={22} style={{ color: "#213555" }} />
          </Button>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest" style={{ color: "#3E5879" }}>
            <ShieldCheck size={14} style={{ color: "#3E5879" }} /> Zero-Trust Verified Catalog
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto w-full flex-1 flex flex-col pt-12 pb-24">
        {/* Minimalist Search Bar */}
        <div className="px-6 mb-12">
           <div className="flex items-center gap-4">
              <div className="relative flex-1 group">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#213555] transition-colors" size={20} />
                 <Input 
                   placeholder="Cari berdasarkan nama atau kategori..." 
                   className="w-full h-16 pl-14 pr-6 rounded-full bg-white border-slate-100 shadow-xl shadow-slate-200/40 text-sm font-medium placeholder:text-slate-300 focus-visible:ring-[#213555] focus-visible:border-[#213555] transition-all"
                   value={catalogSearch}
                   onChange={e => setCatalogSearch(e.target.value)}
                 />
              </div>
              <button 
                onClick={() => setShowFilters(true)}
                className="w-16 h-16 rounded-[24px] flex items-center justify-center bg-white border border-slate-100 text-slate-500 shadow-xl shadow-slate-200/40 hover:border-[#213555] transition-all hover:scale-105 active:scale-95"
              >
                 <SlidersHorizontal size={22} />
              </button>
           </div>
        </div>

        <main className="px-6 flex-1">
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                Verified Catalog / <span className="text-slate-900">{filteredCatalog.length} Items Found</span>
             </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start transition-all">
            {filteredCatalog.map(item => (
              <ProductCard 
                key={item.id}
                item={item}
                isSelected={selectedIngredients.some(i => i.id === item.id)}
                isExpanded={expandedCardId === item.id}
                onToggleExpand={() => setExpandedCardId(expandedCardId === item.id ? null : item.id)}
                onSelect={() => toggleIngredient(item)}
              />
            ))}
          </div>
        </main>
      </div>

      {/* FILTER DRAWER */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFilters(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]" />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[40px] z-[80] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
               <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mt-4 mb-2"></div>
               <div className="px-10 py-5 flex items-center justify-between border-b border-slate-50">
                  <h3 className="text-xl font-black text-slate-900">Filter & Sortir</h3>
                  <button onClick={() => setShowFilters(false)} className="font-black text-sm uppercase tracking-widest hover:opacity-80" style={{ color: "#213555" }}>Selesai</button>
               </div>
               <div className="px-10 py-6 overflow-y-auto space-y-8 flex-1 no-scrollbar">
                  <div className="space-y-3">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Urutan Tampilan</p>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <FilterOption label="Stok Banyak" icon={<Boxes size={16} />} isActive={sortBy === "stock_high"} onClick={() => setSortBy("stock_high")} />
                        <FilterOption label="Stok Sedikit" icon={<Boxes size={16} />} isActive={sortBy === "stock_low"} onClick={() => setSortBy("stock_low")} />
                        <FilterOption label="Paling Laku" icon={<Users size={16} />} isActive={sortBy === "buyers_high"} onClick={() => setSortBy("buyers_high")} />
                        <FilterOption label="Kurang Laku" icon={<Users size={16} />} isActive={sortBy === "buyers_low"} onClick={() => setSortBy("buyers_low")} />
                        <FilterOption label="Rating Tinggi" icon={<Star size={16} />} isActive={sortBy === "rating_high"} onClick={() => setSortBy("rating_high")} />
                        <FilterOption label="Rating Rendah" icon={<Star size={16} />} isActive={sortBy === "rating_low"} onClick={() => setSortBy("rating_low")} />
                        <FilterOption label="Harga Tinggi" icon={<CreditCard size={16} />} isActive={sortBy === "expensive"} onClick={() => setSortBy("expensive")} />
                        <FilterOption label="Harga Rendah" icon={<CreditCard size={16} />} isActive={sortBy === "cheapest"} onClick={() => setSortBy("cheapest")} />
                     </div>
                  </div>
                  <div className="space-y-4">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Filter Kategori</p>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <CategoryOption label="Semua" icon={<Filter size={16} />} isActive={filterCategory === "all"} onClick={() => setFilterCategory("all")} />
                        <CategoryOption label="Karbo" icon={<Wheat size={16} />} isActive={filterCategory === "Karbohidrat"} onClick={() => setFilterCategory("Karbohidrat")} />
                        <CategoryOption label="Pro-Hewani" icon={<Utensils size={16} />} isActive={filterCategory === "Protein Hewani"} onClick={() => setFilterCategory("Protein Hewani")} />
                        <CategoryOption label="Pro-Ikan" icon={<Fish size={16} />} isActive={filterCategory === "Protein Ikan"} onClick={() => setFilterCategory("Protein Ikan")} />
                        <CategoryOption label="Pro-Nabati" icon={<Boxes size={16} />} isActive={filterCategory === "Protein Nabati"} onClick={() => setFilterCategory("Protein Nabati")} />
                        <CategoryOption label="Bumbu" icon={<Info size={16} />} isActive={filterCategory === "Bahan Dapur"} onClick={() => setFilterCategory("Bahan Dapur")} />
                        <CategoryOption label="Sayur & Buah" icon={<Carrot size={16} />} isActive={filterCategory === "Sayuran" || filterCategory === "Buah"} onClick={() => setFilterCategory("Sayuran")} />
                        <CategoryOption label="Industri" icon={<Factory size={16} />} isActive={filterCategory === "Industri"} onClick={() => setFilterCategory("Industri")} />
                     </div>
                  </div>
               </div>
               <div className="p-8 border-t border-slate-50 bg-white">
                  <Button onClick={() => setShowFilters(false)} className="w-full h-14 rounded-2xl text-white font-black text-sm uppercase tracking-[0.2em] shadow-lg transition-transform hover:scale-[1.01]" style={{ backgroundColor: "#213555" }}>Terapkan Filter</Button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedIngredients.length > 0 && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60]">
             <div className="bg-slate-900 text-white rounded-full px-8 py-5 flex items-center gap-6 shadow-2xl border border-white/10 backdrop-blur-xl">
                <div className="relative">
                   <ShoppingCart size={24} style={{ color: "#D8C4B6" }} />
                   <span className="absolute -top-2 -right-2 bg-white text-slate-900 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900">{selectedIngredients.length}</span>
                </div>
                <div className="h-8 w-px bg-white/10 mx-2"></div>
                <Button onClick={handleSaveAndBack} className="rounded-full bg-[#D8C4B6] hover:opacity-90 text-slate-900 font-black px-8 h-12 text-xs uppercase tracking-widest transition-all hover:scale-105">Finalisasi Pilihan</Button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterOption({ label, icon, isActive, onClick }: { label: string, icon: React.ReactNode, isActive: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all ${isActive ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100'}`}>
       <div className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-300'}`}>{icon}</div>
       <span className="text-[9px] font-black uppercase tracking-tight text-left leading-tight">{label}</span>
    </button>
  );
}

function CategoryOption({ label, icon, isActive, onClick }: { label: string, icon: React.ReactNode, isActive: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all ${isActive ? 'bg-[#213555] border-[#213555] text-white shadow-md' : 'bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100'}`}>
       <div className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-300'}`}>{icon}</div>
       <span className="text-[9px] font-black uppercase tracking-tight text-left leading-tight">{label}</span>
    </button>
  );
}

function ProductCard({ item, isSelected, isExpanded, onToggleExpand, onSelect }: { 
  item: CatalogItem, isSelected: boolean, isExpanded: boolean, onToggleExpand: () => void, onSelect: () => void 
}) {
  return (
    <div 
      className={`group relative bg-white rounded-[24px] border transition-all duration-300 flex flex-col overflow-hidden ${isExpanded ? 'col-span-full shadow-2xl border-emerald-200 order-first' : 'border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-200'} ${isSelected ? 'ring-2 ring-emerald-500' : ''}`}
    >
      <div className={`flex flex-col ${isExpanded ? 'lg:flex-row' : ''}`}>
        <div className={`relative overflow-hidden shrink-0 ${isExpanded ? 'lg:w-[480px] h-[480px] lg:h-[480px]' : 'h-56'}`}>
          <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          
          {/* HET MARKUP PERCENTAGE BADGE (MATCHING REFERENCE) */}
          {item.isMarkup && (
            <div className={`absolute left-3 bg-[#f59e0b] text-white rounded-full flex items-center gap-1.5 shadow-lg shadow-orange-900/20 backdrop-blur-sm ${isExpanded ? 'top-6 px-4 py-2' : 'top-3 px-2.5 py-1.5'}`}>
               <TrendingUp size={isExpanded ? 16 : 12} className="text-white" />
               <span className={`${isExpanded ? 'text-xs' : 'text-[9px]'} font-black uppercase tracking-tight`}>+{item.markupPercent}% HET</span>
            </div>
          )}

          {/* NEW PRODUCT BADGE */}
          {item.isNew && (
            <div className={`absolute bottom-3 left-3 bg-[#4f46e5] text-white px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg shadow-indigo-900/20`}>
               <Sparkles size={12} fill="white" />
               <span className="text-[8px] font-black uppercase tracking-widest">Produk Baru</span>
            </div>
          )}
        </div>

        <div className={`flex-1 flex flex-col min-w-0 ${isExpanded ? 'p-10' : 'p-5'}`}>
          <h3 className={`${isExpanded ? 'text-3xl' : 'text-base'} font-black text-[#213555] leading-tight mb-1 truncate`}>{item.name}</h3>
          <div className="flex items-center gap-2 mb-4">
             <Package size={isExpanded ? 16 : 12} className="text-slate-400" />
             <span className={`${isExpanded ? 'text-sm' : 'text-[10px]'} font-bold text-slate-500 uppercase tracking-widest truncate`}>{item.category}</span>
          </div>

          {!item.isNew ? (
            <div className="flex items-center gap-2 mb-4">
               <div className="flex items-center gap-1">
                  <Star size={isExpanded ? 18 : 12} className="fill-amber-400 text-amber-400" />
               </div>
               <span className={`${isExpanded ? 'text-lg' : 'text-sm'} font-black text-slate-800`}>{item.rating}</span>
            </div>
          ) : (
            <div className="mb-4 h-4 flex items-center">
               <span className={`${isExpanded ? 'text-sm' : 'text-[10px]'} font-medium text-slate-300 italic`}>Belum ada ulasan</span>
            </div>
          )}

          <div className="flex items-center gap-5 mb-6 border-l border-slate-100 pl-4 py-1">
             {!item.isNew ? (
               <>
                 <div className="flex flex-col">
                    <p className={`${isExpanded ? 'text-[10px]' : 'text-[8px]'} font-black text-slate-400 uppercase tracking-widest mb-1`}>Ulasan</p>
                    <p className={`${isExpanded ? 'text-lg' : 'text-sm'} font-black text-slate-700 leading-none`}>{item.reviews}</p>
                 </div>
                 <div className="h-8 w-px bg-slate-100"></div>
                 <div className="flex flex-col">
                    <p className={`${isExpanded ? 'text-[10px]' : 'text-[8px]'} font-black text-slate-400 uppercase tracking-widest mb-1`}>Pembeli</p>
                    <p className={`${isExpanded ? 'text-lg' : 'text-sm'} font-black text-slate-700 leading-none`}>{item.buyersCount}</p>
                 </div>
               </>
             ) : (
                <div className="flex flex-col">
                   <p className={`${isExpanded ? 'text-[10px]' : 'text-[8px]'} font-black text-slate-400 uppercase tracking-widest mb-1`}>Status</p>
                   <p className={`${isExpanded ? 'text-lg' : 'text-indigo-600'} font-black leading-none`}>Ready</p>
                </div>
             )}
             <div className="h-8 w-px bg-slate-100"></div>
             <div className="flex flex-col">
                <p className={`${isExpanded ? 'text-[10px]' : 'text-[8px]'} font-black text-slate-400 uppercase tracking-widest mb-1`}>Stok</p>
                <p className={`${isExpanded ? 'text-lg text-sm'} font-black leading-none`} style={{ color: "#213555" }}>{item.stock}</p>
             </div>
          </div>

          <div className="mt-auto space-y-4">
             <div className="pt-4 border-t border-slate-50">
                <p className={`${isExpanded ? 'text-[10px]' : 'text-[8px]'} font-black text-slate-300 uppercase mb-1`}>Harga Dasar</p>
                <div className="flex items-baseline gap-1">
                   <span className={`${isExpanded ? 'text-4xl' : 'text-xl'} font-black text-slate-900 leading-none`}>{item.price}</span>
                   <span className={`${isExpanded ? 'text-sm' : 'text-[12px]'} font-bold text-slate-400 uppercase`}>per {item.unit}</span>
                </div>
             </div>

             <div className={`${item.isMarkup ? 'bg-orange-50 border-orange-100' : 'bg-slate-50 border-slate-100'} border rounded-xl ${isExpanded ? 'px-6 py-4' : 'px-3 py-2.5'} flex items-center justify-between`}>
                <p className={`${isExpanded ? 'text-sm' : 'text-[10px]'} font-black uppercase tracking-widest ${item.isMarkup ? 'text-orange-600' : 'text-[#213555]'}`}>HET {toRupiah(item.hetValue)} / {item.unit}</p>
                {item.isMarkup ? <Info size={isExpanded ? 18 : 12} className="text-orange-500" /> : <CheckCircle2 size={isExpanded ? 18 : 12} style={{ color: "#213555" }} />}
             </div>

             <Button onClick={onSelect} className={`w-full ${isExpanded ? 'h-14 rounded-2xl text-sm' : 'h-11 rounded-xl text-xs'} font-black uppercase tracking-widest transition-all ${isSelected ? 'bg-slate-100 text-slate-500' : 'bg-[#213555] hover:bg-[#1a2a44] text-white shadow-lg'}`}>
               {isSelected ? "Batal" : "Pilih Bahan Baku Ini"}
             </Button>

             <button onClick={onToggleExpand} className="w-full flex items-center justify-center gap-1 py-1 text-[9px] font-black text-slate-300 hover:text-[#213555] uppercase tracking-widest transition-colors">
                {isExpanded ? <ChevronUp size={12} /> : <Search size={12} />}
                {isExpanded ? "Tutup Detail" : "Details"}
             </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="border-t border-slate-100 bg-slate-50/40">
             <div className="p-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
                   {/* Kolom Kiri: Peta & Info Toko */}
                   <div className="flex flex-col gap-6">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]"><Store size={14} style={{ color: "#213555" }} /> Informasi Toko & Lokasi</div>
                      
                      <LogisticsMap vendorName={item.vendor} />

                      <div className="p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6 flex-1" style={{ backgroundColor: "#F2F2F2" }}>
                         <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm"><Store style={{ color: "#213555" }} size={24} /></div>
                            <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nama Toko</p><p className="text-xl font-black text-slate-800">{item.vendor}</p></div>
                         </div>
                         <div className="grid grid-cols-2 gap-6">
                            <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pemilik</p><p className="text-sm font-bold text-slate-700">{item.vendorInfo.owner}</p></div>
                            <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">WhatsApp</p><p className="text-sm font-bold text-slate-700">{item.vendorInfo.phone}</p></div>
                            <div className="col-span-full"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Alamat Lengkap</p><p className="text-sm font-medium text-slate-600 leading-relaxed">{item.vendorInfo.address}</p></div>
                         </div>
                      </div>
                   </div>

                   {/* Kolom Kanan: Deskripsi Produk */}
                   <div className="flex flex-col gap-6">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]"><FileText size={14} style={{ color: "#213555" }} /> Deskripsi Produk</div>
                      <div className="p-8 rounded-[32px] border border-slate-200 shadow-sm flex-1 h-full" style={{ backgroundColor: "#F2F2F2" }}>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                          {item.description}
                        </p>
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
