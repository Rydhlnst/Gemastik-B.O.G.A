import re

file_path = r"d:\My Project\Gemastik\Gemastik-B.O.G.A\apps\web\app\sppg\admin\tender\edit\[id]\page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

new_map_content = r"""                        {filteredCatalog.map(item => {
                           const isSelected = selectedIngredients.some(i => i.id === item.id);
                           return (
                             <div key={item.id} className={`flex flex-col p-8 rounded-[40px] border transition-all ${isSelected ? "border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-900/5" : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-2xl hover:shadow-slate-200/50"}`}>
                               <div className="flex items-start w-full gap-8">
                                 {/* Product Image */}
                                 <div className="w-48 h-48 rounded-[32px] overflow-hidden shrink-0 border border-slate-100 relative shadow-md">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                 </div>
                                 
                                 {/* Product Info */}
                                 <div className="flex-1 min-w-0">
                                   <div className="flex items-center gap-2 mb-3">
                                     {item.isNew && (
                                       <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 bg-blue-100 px-3 py-1 rounded-lg flex items-center gap-1.5">
                                          <Sparkles size={12} /> Produk Baru
                                       </span>
                                     )}
                                     {item.category && (
                                       <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg">{item.category}</span>
                                     )}
                                     {item.isMarkup && (
                                       <span className="text-[10px] font-black uppercase tracking-widest text-orange-700 bg-orange-100 px-3 py-1 rounded-lg flex items-center gap-1.5">
                                          <AlertTriangle size={12} /> Markup
                                       </span>
                                     )}
                                   </div>
                                   <h4 className="text-2xl font-black text-slate-800 truncate leading-tight mb-2">{item.name}</h4>
                                   
                                   <div className="flex items-center gap-4 mb-4">
                                      {item.reviews > 0 ? (
                                        <div className="flex items-center gap-1.5 text-sm font-bold text-amber-500">
                                          <Star size={16} className="fill-amber-500" /> {item.rating} <span className="text-slate-400 font-medium ml-1">({item.reviews} ulasan pembeli)</span>
                                        </div>
                                      ) : (
                                        <p className="text-xs italic text-slate-400 font-medium">Belum ada ulasan dari SPPG lain</p>
                                      )}
                                   </div>

                                   <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs font-bold text-slate-500 mb-6">
                                      <p className="flex items-center gap-2"><Store size={14} className="text-slate-400" /> {item.vendor}</p>
                                      <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
                                      <p className="flex items-center gap-2 text-blue-600"><MapPin size={14} /> {item.distance} km dari Lokasi Sekolah</p>
                                      <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
                                      <p className="flex items-center gap-2"><Box size={14} className="text-slate-400" /> Stok Tersedia: <span className="text-slate-800">{item.stock} {item.unit}</span></p>
                                   </div>

                                   <details className="group cursor-pointer outline-none">
                                      <summary className="text-xs font-black text-emerald-600 flex items-center gap-1.5 list-none hover:text-emerald-700 transition-colors uppercase tracking-widest">
                                        Lihat Spesifikasi & Deskripsi Produk
                                        <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
                                      </summary>
                                      <div className="bg-slate-50 mt-4 p-5 rounded-2xl border border-slate-100 shadow-inner">
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                          {item.description || "Tidak ada deskripsi tersedia untuk produk ini."}
                                        </p>
                                      </div>
                                   </details>
                                 </div>
                               </div>

                               {item.gallery && item.gallery.length > 0 && (
                                 <div className="mt-8 pt-8 border-t border-slate-100 w-full">
                                   <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                     <LayoutGrid size={14} /> Galeri Kualitas Visual (Cek Kesegaran)
                                   </p>
                                   <div className="flex gap-5 overflow-x-auto pb-4 custom-scrollbar">
                                     {item.gallery.slice(0, 5).map((img, idx) => (
                                       <div key={idx} className="w-64 h-64 rounded-[32px] overflow-hidden shrink-0 border-2 border-slate-50 shadow-sm hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-900/10 transition-all group/gallery">
                                         <img src={img} alt={`${item.name} detail ${idx+1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover/gallery:scale-110" />
                                       </div>
                                     ))}
                                   </div>
                                 </div>
                               )}

                               <div className="mt-8 flex items-center justify-between bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                                 <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Harga Satuan FA</p>
                                    <p className="text-3xl font-black text-slate-900">{item.price} <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">/ {item.unit}</span></p>
                                 </div>
                                 <Button 
                                   onClick={() => { if (isRevisionMode && item.vendor !== "Sayur Mayur Lembang" && customMenus.find(m => m.ingredients.find(i => i.id === item.id))) { toast.error("Vendor yang sudah disetujui tidak dapat dihapus!"); return; } toggleIngredient(item); }}
                                   variant={isSelected ? "default" : "outline"}
                                   className={`h-14 px-10 rounded-2xl font-black text-base shadow-lg transition-all ${isSelected ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-900/20" : "text-emerald-700 border-emerald-200 bg-white hover:bg-emerald-50"}`}
                                 >
                                   {isSelected ? "BATAL PILIH" : "PILIH BAHAN INI"}
                                 </Button>
                               </div>
                             </div>
                           );
                        })}"""

# Replace from the first occurrence of {filteredCatalog.map to the last line of the map
# We use a broad match to catch the broken state.
start_marker = r'\{filteredCatalog\.map\(item => \{'
end_marker = r'\}\)\s*\}\s*</div>\s*</div>\s*</div>\s*<div className=\"p-5 bg-white border-t'

# Find the content between these markers and replace it.
content = re.sub(start_marker + r'.*?' + end_marker, new_map_content + r'\n                    </div>\n                 </div>\n                 \n                 <div className="p-5 bg-white border-t', content, flags=re.DOTALL)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Clean Restructuring applied.")
