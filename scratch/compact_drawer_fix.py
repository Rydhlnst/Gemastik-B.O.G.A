import re

file_path = r"d:\My Project\Gemastik\Gemastik-B.O.G.A\apps\web\app\sppg\admin\tender\edit\[id]\page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Surgical overhaul for Compact Drawer UI
dialog_pattern = r'<Dialog open={isCatalogDialogOpen \|\| isRevisionMode}.*?</Dialog>'

compact_drawer = r"""<Dialog open={isCatalogDialogOpen || isRevisionMode} onOpenChange={setIsCatalogDialogOpen}>
               <DialogContent className="max-w-[75vw] h-[96vh] fixed top-[2vh] right-[2vh] bottom-[2vh] m-0 rounded-[40px] border border-slate-200 bg-white p-0 z-[60] flex flex-col shadow-[-40px_0_80px_rgba(0,0,0,0.15)] outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right-full data-[state=closed]:slide-out-to-right-full duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]">
                 {/* Compact Premium Header */}
                 <div className="p-6 bg-white border-b border-slate-100 shrink-0 z-20 rounded-t-[40px]">
                    <div className="flex items-center justify-between mb-6">
                       <div className="flex items-center gap-4">
                          <Button variant="ghost" size="icon" onClick={() => setIsCatalogDialogOpen(false)} className="rounded-full hover:bg-slate-100 h-10 w-10">
                             <ArrowLeft size={20} className="text-slate-500" />
                          </Button>
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <Store className="text-emerald-600" size={20} />
                             </div>
                             <div>
                                <DialogTitle className="text-xl font-black text-slate-800 leading-none mb-1">Katalog Mitra Lokal</DialogTitle>
                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">BGN Logistics Portal</p>
                             </div>
                          </div>
                       </div>
                       <Button variant="ghost" onClick={() => setIsCatalogDialogOpen(false)} className="h-10 px-4 rounded-xl text-slate-400 font-bold hover:bg-slate-50 hover:text-slate-600 transition-colors">Tutup</Button>
                    </div>
                    
                    <div className="flex gap-3 items-center">
                       <div className="relative flex-1">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <Input 
                            placeholder="Cari bahan baku atau mitra..." 
                            className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-emerald-500"
                            value={catalogSearch}
                            onChange={e => setCatalogSearch(e.target.value)}
                          />
                       </div>
                       <select 
                         className="h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-none cursor-pointer"
                         value={filterCategory}
                         onChange={(e) => setFilterCategory(e.target.value)}
                       >
                         <option value="all">Semua Kategori</option>
                         <option value="Karbohidrat">Karbohidrat</option>
                         <option value="Protein Hewani">Protein Hewani</option>
                         <option value="Protein Nabati">Protein Nabati</option>
                         <option value="Sayuran">Sayuran</option>
                         <option value="Buah">Buah</option>
                       </select>
                    </div>
                 </div>
                 
                 {/* Compact Scrollable Content */}
                 <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {filteredCatalog.map(item => {
                         const isSelected = selectedIngredients.some(i => i.id === item.id);
                         return (
                           <div key={item.id} className={`flex flex-col p-6 rounded-[32px] border transition-all duration-300 ${isSelected ? "border-emerald-500 bg-white shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-500" : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xl hover:shadow-slate-200/40"}`}>
                             <div className="flex items-start w-full gap-5">
                               {/* Image: Compact */}
                               <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-slate-100 relative shadow-sm">
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                               </div>
                               
                               {/* Info Section */}
                               <div className="flex-1 min-w-0">
                                 <div className="flex items-center gap-1.5 mb-2">
                                   {item.isNew && (
                                     <span className="text-[8px] font-black uppercase tracking-widest text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">BARU</span>
                                   )}
                                   {item.category && (
                                     <span className="text-[8px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">{item.category}</span>
                                   )}
                                 </div>
                                 <h4 className="text-lg font-black text-slate-800 truncate leading-tight mb-1">{item.name}</h4>
                                 
                                 <div className="flex items-center gap-3 mb-3">
                                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                                      <Star size={12} className="fill-amber-500" /> {item.rating}
                                    </div>
                                    <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                                    <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                                      <Store size={12} /> {item.vendor}
                                    </p>
                                 </div>

                                 <details className="group cursor-pointer outline-none">
                                    <summary className="text-[10px] font-black text-emerald-600 flex items-center gap-1 list-none hover:text-emerald-700 transition-colors uppercase tracking-widest">
                                      Deskripsi
                                      <ChevronDown size={10} className="transition-transform group-open:rotate-180" />
                                    </summary>
                                    <div className="bg-slate-50 mt-2 p-3 rounded-xl border border-slate-100 shadow-inner">
                                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                                        {item.description || "Tidak ada deskripsi."}
                                      </p>
                                    </div>
                                 </details>
                               </div>
                             </div>

                             {/* Gallery: Compact Tiles */}
                             {item.gallery && item.gallery.length > 0 && (
                               <div className="mt-4 pt-4 border-t border-slate-50 w-full">
                                 <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                                   {item.gallery.slice(0, 5).map((img, idx) => (
                                     <div key={idx} className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-100 hover:border-emerald-500 transition-all group/gallery shadow-sm">
                                       <img src={img} alt={`${item.name} detail ${idx+1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover/gallery:scale-110" />
                                     </div>
                                   ))}
                                 </div>
                               </div>
                             )}

                             {/* Price & Action Section */}
                             <div className="mt-4 flex items-center justify-between bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                               <div>
                                  <p className="text-xl font-black text-slate-900">{item.price}</p>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase">per {item.unit}</p>
                               </div>
                               <Button 
                                 onClick={() => { if (isRevisionMode && item.vendor !== "Sayur Mayur Lembang" && customMenus.find(m => m.ingredients.find(i => i.id === item.id))) { toast.error("Vendor yang sudah disetujui tidak dapat dihapus!"); return; } toggleIngredient(item); }}
                                 variant={isSelected ? "default" : "outline"}
                                 className={`h-10 px-6 rounded-xl font-black text-xs transition-all ${isSelected ? "bg-emerald-600 text-white hover:bg-emerald-700" : "text-emerald-700 border-emerald-200 bg-white hover:bg-emerald-50"}`}
                               >
                                 {isSelected ? "BATAL" : "PILIH BAHAN"}
                               </Button>
                             </div>
                           </div>
                         );
                      })}
                    </div>
                 </div>
                 
                 {/* Compact Footer Section */}
                 <div className="p-6 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 rounded-b-[40px] z-20">
                    <div className="flex items-center gap-4 px-2">
                       <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                          <ListChecks className="text-emerald-600" size={20} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Terpilih</p>
                          <p className="text-lg font-black text-slate-900">
                             <span className="text-emerald-600">{selectedIngredients.length}</span> Item Produk
                          </p>
                       </div>
                    </div>
                    <div className="flex gap-3">
                       <Button 
                         onClick={() => {
                           if (isRevisionMode) {
                             toast.promise(
                               new Promise(resolve => setTimeout(resolve, 2000)),
                               {
                                 loading: 'Menyimpan...',
                                 success: () => {
                                   router.push('/sppg/admin/tender/list');
                                   return 'Mitra lokal berhasil diaktifkan!';
                                 }
                               }
                             );
                           } else {
                             setIsCatalogDialogOpen(false);
                           }
                         }} 
                         className="rounded-xl font-black bg-[#0d5c46] hover:bg-[#0a4837] text-white px-8 h-12 text-sm shadow-lg shadow-[#0d5c46]/20 transition-all hover:scale-105 active:scale-95"
                       >
                         {isRevisionMode ? "SIMPAN REVISI" : "KONFIRMASI PILIHAN"}
                       </Button>
                    </div>
                 </div>
               </DialogContent>
            </Dialog>"""

content = re.sub(dialog_pattern, compact_drawer, content, flags=re.DOTALL)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Compact Drawer UI applied with fixed positioning.")
