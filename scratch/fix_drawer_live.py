import re

file_path = r"d:\My Project\Gemastik\Gemastik-B.O.G.A\apps\web\app\sppg\admin\tender\edit\[id]\page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Complete Rewrite of the Dialog for Right-Side Drawer (Bulletproof version)
dialog_pattern = r'<Dialog open={isCatalogDialogOpen \|\| isRevisionMode}.*?</Dialog>'

# Bulletproof Drawer:
# - max-w-[80vw]
# - fixed inset-y-0 right-0
# - !translate-x-0 !translate-y-0 to avoid Shadcn centering
# - duration-500 for smooth slide
bulletproof_drawer = r"""<Dialog open={isCatalogDialogOpen || isRevisionMode} onOpenChange={setIsCatalogDialogOpen}>
               <DialogContent className="max-w-[80vw] w-full h-screen fixed inset-y-0 right-0 left-auto translate-x-0 translate-y-0 m-0 rounded-l-[40px] rounded-r-none border-l border-slate-200 bg-[#f8fafc] p-0 z-[60] flex flex-col shadow-[-30px_0_60px_rgba(0,0,0,0.1)] outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right-full data-[state=closed]:slide-out-to-right-full duration-500 ease-in-out sm:max-w-none">
                 {/* Fixed Premium Header */}
                 <div className="p-8 bg-white border-b border-slate-100 shrink-0 shadow-sm z-20">
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-6">
                          <Button variant="ghost" size="icon" onClick={() => setIsCatalogDialogOpen(false)} className="rounded-full hover:bg-slate-100 h-14 w-14">
                             <ArrowLeft size={28} className="text-slate-500" />
                          </Button>
                          <DialogTitle className="text-3xl font-black text-slate-800 flex items-center gap-4">
                             <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center">
                                <Store className="text-emerald-600" size={32} />
                             </div>
                             <div>
                                <p className="text-xs font-black text-emerald-600 uppercase tracking-[0.3em] mb-1">BGN LOGISTICS</p>
                                <p className="text-3xl">E-Katalog Mitra Lokal</p>
                             </div>
                          </DialogTitle>
                       </div>
                       <Button variant="outline" onClick={() => setIsCatalogDialogOpen(false)} className="h-12 px-6 rounded-2xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50">Tutup Panel</Button>
                    </div>
                    
                    <div className="flex gap-4 items-center max-w-5xl">
                      <div className="relative flex-1">
                         <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                         <Input 
                           placeholder="Cari bahan baku, kategori, atau nama mitra..." 
                           className="pl-14 h-14 rounded-2xl bg-slate-50 border-slate-200 text-base shadow-inner focus-visible:ring-emerald-500"
                           value={catalogSearch}
                           onChange={e => setCatalogSearch(e.target.value)}
                         />
                      </div>

                      <div className="flex items-center gap-3">
                         <select 
                           className="h-14 px-6 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
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
                           className="h-14 px-6 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                           value={sortBy}
                           onChange={(e) => setSortBy(e.target.value)}
                         >
                           <option value="default">Relevansi</option>
                           <option value="cheapest">Harga Termurah</option>
                           <option value="nearest">Jarak Terdekat</option>
                         </select>
                      </div>
                    </div>
                 </div>
                 
                 {/* Scrollable Main Content */}
                 <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-[#f8fafc]">
                    <div className="max-w-6xl">
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                        {filteredCatalog.map(item => {
                           const isSelected = selectedIngredients.some(i => i.id === item.id);
                           return (
                             <div key={item.id} className={`flex flex-col p-10 rounded-[48px] border transition-all duration-300 ${isSelected ? "border-emerald-500 bg-white shadow-2xl shadow-emerald-900/5 ring-1 ring-emerald-500" : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-2xl hover:shadow-slate-200/50"}`}>
                               <div className="flex items-start w-full gap-8">
                                 {/* Image: Scaled down for drawer */}
                                 <div className="w-36 h-36 rounded-[32px] overflow-hidden shrink-0 border border-slate-100 relative shadow-sm">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                 </div>
                                 
                                 {/* Info Section */}
                                 <div className="flex-1 min-w-0">
                                   <div className="flex items-center gap-2 mb-3">
                                     {item.isNew && (
                                       <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 bg-blue-100 px-3 py-1 rounded-lg">PRODUK BARU</span>
                                     )}
                                     {item.category && (
                                       <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg">{item.category}</span>
                                     )}
                                   </div>
                                   <h4 className="text-2xl font-black text-slate-800 truncate leading-tight mb-2">{item.name}</h4>
                                   
                                   <div className="flex items-center gap-4 mb-4">
                                      <div className="flex items-center gap-1.5 text-sm font-bold text-amber-500">
                                        <Star size={16} className="fill-amber-500" /> {item.rating}
                                      </div>
                                      <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
                                      <p className="text-sm font-bold text-slate-500 flex items-center gap-2">
                                        <Store size={16} className="text-slate-300" /> {item.vendor}
                                      </p>
                                   </div>

                                   <details className="group cursor-pointer outline-none mb-2">
                                      <summary className="text-[11px] font-black text-emerald-600 flex items-center gap-2 list-none hover:text-emerald-700 transition-colors uppercase tracking-[0.1em]">
                                        Detail & Deskripsi Produk
                                        <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
                                      </summary>
                                      <div className="bg-slate-50 mt-4 p-5 rounded-3xl border border-slate-100 shadow-inner">
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                          {item.description || "Tidak ada deskripsi tersedia."}
                                        </p>
                                      </div>
                                   </details>
                                 </div>
                               </div>

                               {/* Gallery: Scaled down for drawer */}
                               {item.gallery && item.gallery.length > 0 && (
                                 <div className="mt-8 pt-8 border-t border-slate-50 w-full">
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                      <LayoutGrid size={14} /> Galeri Kesegaran
                                   </p>
                                   <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                                     {item.gallery.slice(0, 5).map((img, idx) => (
                                       <div key={idx} className="w-32 h-32 rounded-[28px] overflow-hidden shrink-0 border-2 border-slate-100 hover:border-emerald-500 transition-all group/gallery shadow-sm">
                                         <img src={img} alt={`${item.name} detail ${idx+1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover/gallery:scale-110" />
                                       </div>
                                     ))}
                                   </div>
                                 </div>
                               )}

                               {/* Price & Action Section */}
                               <div className="mt-8 flex items-center justify-between bg-slate-50/50 p-6 rounded-[32px] border border-slate-100">
                                 <div>
                                    <p className="text-3xl font-black text-slate-900">{item.price}</p>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">per {item.unit}</p>
                                 </div>
                                 <Button 
                                   onClick={() => { if (isRevisionMode && item.vendor !== "Sayur Mayur Lembang" && customMenus.find(m => m.ingredients.find(i => i.id === item.id))) { toast.error("Vendor yang sudah disetujui tidak dapat dihapus!"); return; } toggleIngredient(item); }}
                                   variant={isSelected ? "default" : "outline"}
                                   className={`h-14 px-10 rounded-2xl font-black text-base shadow-lg transition-all ${isSelected ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-900/20" : "text-emerald-700 border-emerald-200 bg-white hover:bg-emerald-50"}`}
                                 >
                                   {isSelected ? "BATAL PILIH" : "PILIH BAHAN"}
                                 </Button>
                               </div>
                             </div>
                           );
                        })}
                      </div>
                      
                      {filteredCatalog.length === 0 && (
                         <div className="text-center py-20 bg-white rounded-[48px] border border-slate-200 border-dashed">
                            <Search className="mx-auto text-slate-300 mb-6" size={64} />
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Bahan Baku Tidak Ditemukan</h3>
                            <p className="text-slate-500 max-w-sm mx-auto font-medium">Coba gunakan kata kunci lain atau ubah filter kategori Anda.</p>
                         </div>
                      )}
                    </div>
                 </div>
                 
                 {/* Fixed Footer Section */}
                 <div className="p-8 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] z-20">
                    <div className="flex items-center gap-6 px-4">
                       <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center">
                          <ListChecks className="text-emerald-600" size={32} />
                       </div>
                       <div>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Bahan Terpilih</p>
                          <p className="text-2xl font-black text-slate-900">
                             <span className="text-emerald-600">{selectedIngredients.length}</span> Item Produk
                          </p>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <Button variant="ghost" onClick={() => setIsCatalogDialogOpen(false)} className="h-16 px-8 rounded-2xl font-bold text-slate-500 hover:bg-slate-50">Batalkan Pemilihan</Button>
                       <Button 
                         onClick={() => {
                           if (isRevisionMode) {
                             toast.promise(
                               new Promise(resolve => setTimeout(resolve, 2000)),
                               {
                                 loading: 'Menyimpan vendor pengganti & merestrukturisasi PO...',
                                 success: () => {
                                   router.push('/sppg/admin/tender/list');
                                   return 'Mitra lokal pengganti berhasil diaktifkan dan anggaran dikunci!';
                                 }
                               }
                             );
                           } else {
                             setIsCatalogDialogOpen(false);
                           }
                         }} 
                         className="rounded-[24px] font-black bg-[#0d5c46] hover:bg-[#0a4837] text-white px-12 h-16 text-lg shadow-xl shadow-[#0d5c46]/20 transition-all hover:scale-105 active:scale-95"
                       >
                         {isRevisionMode ? "SIMPAN & KONFIRMASI" : "KONFIRMASI BAHAN BAKU"}
                       </Button>
                    </div>
                 </div>
               </DialogContent>
            </Dialog>"""

content = re.sub(dialog_pattern, bulletproof_drawer, content, flags=re.DOTALL)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Drawer UI fixed with bulletproof positioning and scaling.")
