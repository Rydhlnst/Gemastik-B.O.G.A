import re

file_path = r"d:\My Project\Gemastik\Gemastik-B.O.G.A\apps\web\app\sppg\admin\tender\edit\[id]\page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update DialogContent for Right-Side Slide Panel (Drawer style)
dialog_pattern = r'<Dialog open={isCatalogDialogOpen \|\| isRevisionMode}.*?</Dialog>'

drawer_dialog = r"""<Dialog open={isCatalogDialogOpen || isRevisionMode} onOpenChange={setIsCatalogDialogOpen}>
               <DialogContent className="max-w-[85vw] w-full h-screen fixed inset-y-0 right-0 m-0 rounded-l-[48px] rounded-r-none border-l border-slate-200 bg-[#f8fafc] p-0 z-[60] flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.1)] outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right-full data-[state=closed]:slide-out-to-right-full duration-500 ease-in-out">
                 {/* Premium Drawer Header */}
                 <div className="p-8 bg-white border-b border-slate-100 shrink-0 shadow-sm z-10">
                    <div className="w-full flex items-center justify-between mb-6">
                       <div className="flex items-center gap-5">
                          <Button variant="ghost" size="icon" onClick={() => setIsCatalogDialogOpen(false)} className="rounded-full hover:bg-slate-100 h-12 w-12 group">
                             <ArrowLeft size={24} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
                          </Button>
                          <DialogTitle className="text-3xl font-black text-slate-800 flex items-center gap-4">
                             <div className="w-14 h-14 bg-emerald-50 rounded-[20px] flex items-center justify-center">
                                <Store className="text-emerald-600" size={32} />
                             </div>
                             <div>
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">E-Katalog BGN</p>
                                Portal Bahan Baku & Mitra Lokal
                             </div>
                          </DialogTitle>
                       </div>
                       <Button variant="outline" onClick={() => setIsCatalogDialogOpen(false)} className="rounded-2xl border-slate-200 font-bold hover:bg-slate-50">Tutup Panel</Button>
                    </div>
                    
                    <div className="w-full">
                      <div className="flex gap-4 items-center">
                        <div className="relative flex-1">
                           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                           <Input 
                             placeholder="Cari nama bahan, kategori, atau nama vendor..." 
                             className="pl-12 h-14 rounded-2xl bg-slate-50 border-slate-200 text-sm shadow-inner focus-visible:ring-emerald-500"
                             value={catalogSearch}
                             onChange={e => setCatalogSearch(e.target.value)}
                           />
                        </div>

                        <div className="flex items-center gap-3">
                           <select 
                             className="h-14 px-6 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 cursor-pointer"
                             value={filterCategory}
                             onChange={(e) => setFilterCategory(e.target.value)}
                           >
                             <option value="all">Semua Kategori</option>
                             <option value="Karbohidrat">Karbohidrat</option>
                             <option value="Protein Hewani">Protein Hewani</option>
                             <option value="Protein Nabati">Protein Nabati</option>
                             <option value="Sayuran">Sayuran</option>
                             <option value="Buah">Buah</option>
                             <option value="Bahan Dapur">Bahan Dapur</option>
                             <option value="Minuman">Minuman</option>
                           </select>
                           
                           <select 
                             className="h-14 px-6 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 cursor-pointer"
                             value={sortBy}
                             onChange={(e) => setSortBy(e.target.value)}
                           >
                             <option value="default">Relevansi</option>
                             <option value="cheapest">Termurah</option>
                             <option value="nearest">Terdekat</option>
                           </select>
                        </div>
                      </div>
                    </div>
                 </div>
                 
                 {/* Scrollable Content inside Drawer */}
                 <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                      {filteredCatalog.map(item => {
                         const isSelected = selectedIngredients.some(i => i.id === item.id);
                         return (
                           <div key={item.id} className={`flex flex-col p-8 rounded-[40px] border transition-all ${isSelected ? "border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-900/5" : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-2xl hover:shadow-slate-200/50"}`}>
                             <div className="flex items-start w-full gap-8">
                               {/* Product Image */}
                               <div className="w-40 h-40 rounded-[32px] overflow-hidden shrink-0 border border-slate-100 relative shadow-md">
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                               </div>
                               
                               {/* Product Info */}
                               <div className="flex-1 min-w-0">
                                 <div className="flex items-center gap-2 mb-3">
                                   {item.isNew && (
                                     <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 bg-blue-100 px-3 py-1 rounded-lg flex items-center gap-1.5">
                                        <Sparkles size={12} /> Baru
                                     </span>
                                   )}
                                   {item.category && (
                                     <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg">{item.category}</span>
                                   )}
                                 </div>
                                 <h4 className="text-xl font-black text-slate-800 truncate leading-tight mb-2">{item.name}</h4>
                                 
                                 <div className="flex items-center gap-3 mb-4">
                                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                                      <Star size={14} className="fill-amber-500" /> {item.rating}
                                    </div>
                                    <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                                    <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                                      <Store size={14} className="text-slate-300" /> {item.vendor}
                                    </p>
                                 </div>

                                 <details className="group cursor-pointer outline-none">
                                    <summary className="text-[10px] font-black text-emerald-600 flex items-center gap-1 list-none hover:text-emerald-700 transition-colors uppercase tracking-widest">
                                      Spesifikasi
                                      <ChevronDown size={12} className="transition-transform group-open:rotate-180" />
                                    </summary>
                                    <div className="bg-slate-50 mt-3 p-4 rounded-2xl border border-slate-100 shadow-inner">
                                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                        {item.description || "Tidak ada deskripsi."}
                                      </p>
                                    </div>
                                 </details>
                               </div>
                             </div>

                             {item.gallery && item.gallery.length > 0 && (
                               <div className="mt-6 pt-6 border-t border-slate-50 w-full">
                                 <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                                   {item.gallery.slice(0, 5).map((img, idx) => (
                                     <div key={idx} className="w-32 h-32 rounded-[24px] overflow-hidden shrink-0 border border-slate-100 hover:border-emerald-500 transition-all group/gallery">
                                       <img src={img} alt={`${item.name} detail ${idx+1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover/gallery:scale-110" />
                                     </div>
                                   ))}
                                 </div>
                               </div>
                             )}

                             <div className="mt-6 flex items-center justify-between bg-slate-50/50 p-5 rounded-[32px] border border-slate-100">
                               <div>
                                  <p className="text-2xl font-black text-slate-900">{item.price}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">per {item.unit}</p>
                               </div>
                               <Button 
                                 onClick={() => { if (isRevisionMode && item.vendor !== "Sayur Mayur Lembang" && customMenus.find(m => m.ingredients.find(i => i.id === item.id))) { toast.error("Vendor yang sudah disetujui tidak dapat dihapus!"); return; } toggleIngredient(item); }}
                                 variant={isSelected ? "default" : "outline"}
                                 className={`h-12 px-8 rounded-2xl font-black text-sm transition-all ${isSelected ? "bg-emerald-600 text-white hover:bg-emerald-700" : "text-emerald-700 border-emerald-200 bg-white hover:bg-emerald-50"}`}
                               >
                                 {isSelected ? "BATAL" : "PILIH"}
                               </Button>
                             </div>
                           </div>
                         );
                      })}
                    </div>
                 </div>
                 
                 {/* Drawer Footer */}
                 <div className="p-8 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-10">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                          <ListChecks className="text-emerald-600" size={24} />
                       </div>
                       <div>
                          <p className="text-lg font-bold text-slate-700">
                             <span className="text-emerald-600">{selectedIngredients.length}</span> Bahan Terpilih
                          </p>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <Button variant="ghost" onClick={() => setIsCatalogDialogOpen(false)} className="rounded-2xl font-bold text-slate-500">Batal</Button>
                       <Button 
                         onClick={() => {
                           if (isRevisionMode) {
                             toast.promise(
                               new Promise(resolve => setTimeout(resolve, 2000)),
                               {
                                 loading: 'Menyimpan vendor pengganti & merestrukturisasi PO...',
                                 success: () => {
                                   router.push('/sppg/admin/tender/list');
                                   return 'Mitra lokal pengganti berhasil diaktifkan!';
                                 }
                               }
                             );
                           } else {
                             setIsCatalogDialogOpen(false);
                           }
                         }} 
                         className="rounded-2xl font-black bg-[#0d5c46] hover:bg-[#0a4837] text-white px-10 h-14 text-base shadow-lg shadow-[#0d5c46]/20 transition-all hover:scale-105 active:scale-95"
                       >
                         {isRevisionMode ? "SIMPAN REVISI" : "KONFIRMASI PILIHAN"}
                       </Button>
                    </div>
                 </div>
               </DialogContent>
            </Dialog>"""

content = re.sub(dialog_pattern, drawer_dialog, content, flags=re.DOTALL)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Catalog portal converted to Right-Side Drawer.")
