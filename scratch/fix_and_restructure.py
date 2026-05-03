import re

file_path = r"d:\My Project\Gemastik\Gemastik-B.O.G.A\apps\web\app\sppg\admin\tender\edit\[id]\page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# I need to be very careful here because the previous edit might have left the file in a broken state.
# Let's check the current state around line 818.
# Currently line 820 is "return (" and 821 starts with "<span>...".
# It's missing the div opening and the start of the return block.

# Let's try to find the broken part and fix it.
broken_part = """                        {filteredCatalog.map(item => {
                           const isSelected = selectedIngredients.some(i => i.id === item.id);
                           return (
                                     <span className=\"text-[9px] font-black uppercase tracking-widest text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md flex items-center gap-1\">"""

fixed_part = """                        {filteredCatalog.map(item => {
                           const isSelected = selectedIngredients.some(i => i.id === item.id);
                           return (
                             <div key={item.id} className={`flex flex-col p-6 rounded-[32px] border transition-all ${isSelected ? "border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-900/5" : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xl"}`}>
                               <div className=\"flex items-start w-full\">
                                 {/* Product Image */}
                                 <div className=\"w-32 h-32 rounded-2xl overflow-hidden shrink-0 border border-slate-100 relative shadow-sm\">
                                    <img src={item.image} alt={item.name} className=\"w-full h-full object-cover\" />
                                 </div>
                                 
                                 {/* Product Info */}
                                 <div className=\"flex-1 min-w-0 px-5\">
                                   <div className=\"flex items-center gap-2 mb-2\">
                                     {item.isNew && (
                                       <span className=\"text-[9px] font-black uppercase tracking-widest text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md flex items-center gap-1\">"""

content = content.replace(broken_part, fixed_part)

# Now let's remove the old gallery and details stuff and put the new one at the end of the card.
# I'll search for the details block.

old_details = r"""                                 <details className="mt-2 group cursor-pointer outline-none">
                                   <summary className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 list-none hover:text-emerald-700 transition-colors">
                                     Lihat Deskripsi Lengkap
                                     <ChevronDown size={12} className="transition-transform group-open:rotate-180" />
                                   </summary>
                                   <div className="bg-slate-50 mt-2 p-3 rounded-xl border border-slate-100 shadow-inner">
                                     <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                                       {item.description || "Tidak ada deskripsi tersedia."}
                                     </p>
                                     {item.gallery && item.gallery.length > 0 && \(
                                       <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
                                          {item.gallery.slice\(0, 5\).map\(\(img, idx\) => \(
                                            <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-200 shadow-sm cursor-pointer hover:border-emerald-500 hover:scale-105 transition-all">
                                              <img src={img} alt={`${item.name} detail ${idx\+1}`} className="w-full h-full object-cover" />
                                            </div>
                                          \)\)}
                                       </div>
                                     \)}
                                   </div>
                                 </details>"""

new_details = r"""                                 <details className="mt-2 group cursor-pointer outline-none">
                                    <summary className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 list-none hover:text-emerald-700 transition-colors">
                                      Lihat Deskripsi Lengkap
                                      <ChevronDown size={12} className="transition-transform group-open:rotate-180" />
                                    </summary>
                                    <div className="bg-slate-50 mt-2 p-3 rounded-xl border border-slate-100 shadow-inner">
                                      <p className="text-[11px] text-slate-600 leading-relaxed">
                                        {item.description || "Tidak ada deskripsi tersedia."}
                                      </p>
                                    </div>
                                 </details>"""

# Using re.sub with re.DOTALL because of the complex multiline block.
# Actually, let's just do a string replace if possible.
# I'll try to match a simpler part.

content = re.sub(r'<details className="mt-2 group cursor-pointer outline-none">.*?</details>', new_details, content, flags=re.DOTALL)

# Now restructure the bottom part (Pricing & Action).
# Currently it looks like:
# <div className="flex items-center gap-6 shrink-0">
#   ...
# </div>

pricing_action_pattern = r'<div className="flex items-center gap-6 shrink-0">.*?<Button .*?</Button>\s*</div>'
new_bottom = r"""                                <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4 w-full">
                                   <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400">
                                      <p className="text-xl font-black text-emerald-600">{item.price} <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">/ {item.unit}</span></p>
                                      <div className="h-4 w-px bg-slate-200"></div>
                                      <p className="flex items-center gap-1.5"><Box size={14} className="text-slate-300" /> Stok: <span className="text-slate-700">{item.stock} {item.unit}</span></p>
                                   </div>
                                   <Button 
                                     onClick={() => { if (isRevisionMode && item.vendor !== "Sayur Mayur Lembang" && customMenus.find(m => m.ingredients.find(i => i.id === item.id))) { toast.error("Vendor yang sudah disetujui tidak dapat dihapus!"); return; } toggleIngredient(item); }}
                                     variant={isSelected ? "default" : "outline"}
                                     className={`h-11 px-8 rounded-xl font-bold transition-all ${isSelected ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-900/10" : "text-emerald-700 border-emerald-200 bg-white hover:bg-emerald-50"}`}
                                   >
                                     {isSelected ? "Batal Pilih" : "Pilih Bahan"}
                                   </Button>
                                 </div>
                               </div>
                             </div>

                             {item.gallery && item.gallery.length > 0 && (
                               <div className="mt-5 w-full">
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                   <LayoutGrid size={12} /> Galeri Foto Produk & Kualitas
                                 </p>
                                 <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                                   {item.gallery.slice(0, 5).map((img, idx) => (
                                     <div key={idx} className="w-44 h-44 rounded-[32px] overflow-hidden shrink-0 border-2 border-slate-100 shadow-sm hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-900/5 transition-all group/gallery">
                                       <img src={img} alt={`${item.name} detail ${idx+1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover/gallery:scale-110" />
                                     </div>
                                   ))}
                                 </div>
                               </div>
                             )}
                           </div>"""

content = re.sub(pricing_action_pattern, new_bottom, content, flags=re.DOTALL)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Restructuring applied successfully.")
