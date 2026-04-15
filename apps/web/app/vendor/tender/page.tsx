"use client";

import { useState, useMemo } from "react";
import { 
  Star, 
  Search, 
  ArrowRight, 
  Sparkles, 
  Zap
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import { tenderMaterials } from "@/lib/mbgdummydata";

const MATERIAL_TYPES = [...new Set(tenderMaterials.map(m => m.type))];

export default function TenderPage() {
  const [budget, setBudget] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);

  const filteredResults = useMemo(() => {
    let filtered = [...tenderMaterials];
    if (selectedMaterial) filtered = filtered.filter(m => m.type === selectedMaterial);
    if (budget) filtered = filtered.filter(m => m.price <= parseFloat(budget));
    
    // Sort: price ASC, then rating DESC if price equal
    return filtered.sort((a, b) => a.price !== b.price ? a.price - b.price : b.rating - a.rating);
  }, [budget, selectedMaterial]);

  // Reset pagination when search criteria change
  useMemo(() => {
    setVisibleCount(6);
  }, [budget, selectedMaterial]);

  const fmt = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  return (
    <div className="min-h-screen bg-[#f8f4ef] text-[#1a0a00] font-sans selection:bg-amber-500/30">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,100;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
      ` }} />

      <section className="p-4 md:p-10 pt-8 md:pt-16">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-7xl font-['Fraunces'] font-bold leading-[0.95] tracking-tight">
              Pangan Lebih <span className="text-[#78350f] italic">Segar</span>, <br /> Gizi Lebih Terjamin
            </h1>
            <p className="text-[#8b7355] text-sm md:text-lg max-w-2xl font-medium leading-relaxed">
              Sistem AI kami membantu Anda menemukan bahan baku terbaik sesuai standar gizi nasional secara real-time
            </p>
          </div>

          {/* Smart Form */}
          <div className="bg-white border-2 border-[#e8ddd4] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl shadow-black/5 space-y-6 md:space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#78350f] via-[#b45309] to-amber-400" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-[#78350f] tracking-widest uppercase">Anggaran Bahan (IDR)</label>
                <input 
                  type="number" 
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="contoh: 50.000.000"
                  className="w-full bg-[#faf7f4] border-2 border-[#e8ddd4] rounded-xl md:rounded-2xl px-5 md:px-6 py-3 md:py-4 text-[#1a0a00] focus:outline-none focus:border-[#78350f] focus:bg-white transition-all text-base md:text-lg font-medium"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-[#78350f] tracking-widest uppercase">Kategori Pangan</label>
                <select 
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full bg-[#faf7f4] border-2 border-[#e8ddd4] rounded-xl md:rounded-2xl px-5 md:px-6 py-3 md:py-4 text-[#1a0a00] focus:outline-none focus:border-[#78350f] focus:bg-white transition-all text-base md:text-lg font-medium appearance-none"
                >
                  <option value="">Semua Kategori Gizi</option>
                  {MATERIAL_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl md:rounded-2xl p-4 flex items-center gap-3 md:gap-4 text-[#78350f] text-xs md:text-sm font-medium">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
              <span>AI menyarankan: <strong>Daging Sapi & Beras Premium</strong> paling banyak dicari penyedia sekolah.</span>
            </div>
            <button className="w-full h-14 md:h-16 bg-[#1a0a00] text-white font-black rounded-xl md:rounded-2xl hover:bg-[#451a03] transition-all flex items-center justify-center gap-3 text-base md:text-lg tracking-tight">
              <Search className="w-5 h-5" /> Cari Bahan Pangan
            </button>
          </div>

          {/* Results List */}
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between px-2 md:px-4 gap-2 md:gap-4">
              <div className="space-y-1">
                <h3 className="text-xl md:text-2xl font-['Fraunces'] font-black text-[#1a0a00]">{filteredResults.length} Material Ditemukan</h3>
                <p className="text-[10px] md:text-xs text-[#8b7355] font-bold uppercase tracking-widest opacity-60 md:hidden pb-2">Geser untuk melihat lainnya →</p>
              </div>
              <p className="hidden md:block text-[10px] md:text-xs text-[#8b7355] font-bold uppercase tracking-widest opacity-60">Sort: Harga (ASC) & Rating (DESC)</p>
            </div>

            {/* Mobile View: Horizontal Scroll (Geser) */}
            <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 px-2 pb-6 scrollbar-hide">
              {filteredResults.map((m, i) => (
                <motion.div 
                  key={m.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="min-w-[85vw] snap-center bg-white border border-[#e8ddd4] rounded-3xl overflow-hidden shadow-lg relative"
                >
                  <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#78350f] text-white text-[10px] font-black flex items-center justify-center font-mono">
                    {i + 1}
                  </div>
                  <div className="p-6 pb-4 space-y-3">
                    <div className={`inline-block px-2.5 py-0.5 rounded-full text-[8px] font-black tracking-widest uppercase ${
                      i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-emerald-100 text-emerald-700" : "bg-purple-100 text-purple-700"
                    }`}>
                      {i === 0 ? "⭐ Top Rated" : i === 1 ? "✓ Best Match" : "💎 Best Value"}
                    </div>
                    <div>
                      <h4 className="text-lg font-['Fraunces'] font-black text-[#1a0a00] leading-tight truncate">{m.name}</h4>
                      <p className="text-[#8b7355] text-[10px] font-medium">{m.type}</p>
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-[#faf7f4] border-t border-[#f0e8e0] flex justify-between items-center">
                    <div>
                      <div className="text-xl font-black text-[#78350f]">{fmt(m.price)}</div>
                      <div className="text-[9px] text-[#8b7355] font-bold uppercase">{m.reviews} ulasan</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-[#1a0a00]">{m.rating}</div>
                      <div className="flex gap-0.5 text-amber-500 scale-75 origin-right">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className={`w-3 h-3 ${j < Math.floor(m.rating) ? 'fill-current' : 'text-amber-200'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {filteredResults.length > 0 && (
                <div className="min-w-[40vw] flex items-center justify-center">
                   <div className="text-center space-y-2 opacity-30">
                     <div className="w-10 h-10 border-2 border-[#78350f] rounded-full flex items-center justify-center mx-auto">
                        <ArrowRight className="w-5 h-5" />
                     </div>
                     <p className="text-[10px] font-bold uppercase tracking-tighter">Selesai</p>
                   </div>
                </div>
              )}
            </div>

            {/* Desktop View: Paginated Grid (Max 6) */}
            <div className="hidden md:block space-y-8">
              <div className="grid md:grid-cols-3 gap-6">
                {filteredResults.slice(0, visibleCount).map((m, i) => (
                  <motion.div 
                    key={m.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white border border-[#e8ddd4] rounded-3xl overflow-hidden hover:shadow-2xl hover:translate-y-[-4px] transition-all group relative cursor-pointer"
                  >
                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#78350f] text-white text-[11px] font-black flex items-center justify-center font-mono">
                      {i + 1}
                    </div>
                    <div className="p-8 pb-5 space-y-4">
                      <div className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${
                        i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-emerald-100 text-emerald-700" : "bg-purple-100 text-purple-700"
                      }`}>
                        {i === 0 ? "⭐ Top Rated" : i === 1 ? "✓ Best Match" : "💎 Best Value"}
                      </div>
                      <div>
                        <h4 className="text-xl font-['Fraunces'] font-black text-[#1a0a00] group-hover:text-[#78350f] transition-colors leading-tight">{m.name}</h4>
                        <p className="text-[#8b7355] text-xs font-medium">{m.type}</p>
                      </div>
                    </div>
                    <div className="px-8 py-6 bg-[#faf7f4] border-t border-[#f0e8e0] flex justify-between items-center group-hover:bg-[#f8f4ef] transition-colors">
                      <div>
                        <div className="text-2xl font-black text-[#78350f]">{fmt(m.price)}</div>
                        <div className="text-[10px] text-[#8b7355] font-bold uppercase">{m.reviews} ulasan</div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-black text-[#1a0a00]">{m.rating}</div>
                        <div className="flex gap-0.5 text-amber-500 scale-75 origin-right">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} className={`w-3 h-3 ${j < Math.floor(m.rating) ? 'fill-current' : 'text-amber-200'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Desktop Pagination Opsi Berikutnya */}
              {filteredResults.length > visibleCount && (
                <div className="flex items-center justify-center gap-4">
                  <div className="h-px w-24 bg-[#e8ddd4]" />
                  <button 
                    onClick={() => setVisibleCount(prev => prev + 6)}
                    className="flex items-center gap-2 px-8 py-3 bg-white border-2 border-[#1a0a00] rounded-2xl font-bold text-sm hover:bg-[#1a0a00] hover:text-white transition-all shadow-lg active:scale-95"
                  >
                    Lihat Hasil Berikutnya <ArrowRight className="w-4 h-4" />
                  </button>
                  <div className="h-px w-24 bg-[#e8ddd4]" />
                </div>
              )}
            </div>

            {filteredResults.length === 0 && (
              <div className="py-20 text-center text-[#8b7355] font-medium border-2 border-dashed border-[#e8ddd4] rounded-[2.5rem]">
                Maaf, tidak ada material yang sesuai dengan anggaran dan kategori Anda.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Floating Back to Dashboard */}
      <Link 
        href="/vendor/dashboard"
        className="fixed bottom-6 md:bottom-10 right-6 md:right-10 z-[1000] bg-white border-2 border-[#1a0a00] rounded-xl md:rounded-2xl p-3 md:p-4 shadow-2xl flex items-center gap-2 md:gap-3 group overflow-hidden hover:pr-8 transition-all"
      >
        <div className="bg-[#78350f] p-1.5 md:p-2 rounded-lg md:rounded-xl group-hover:rotate-[-10deg] transition-all">
          <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-white transform rotate-180" />
        </div>
        <span className="text-[#1a0a00] font-black text-[10px] md:text-xs uppercase tracking-widest whitespace-nowrap">Dashboard</span>
      </Link>
    </div>
  );
}
