import re

file_path = r"d:\My Project\Gemastik\Gemastik-B.O.G.A\apps\web\app\sppg\admin\tender\edit\[id]\page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Imports
content = content.replace(
    'import { useRouter } from "next/navigation";',
    'import { useRouter, useSearchParams } from "next/navigation";'
)
content = content.replace(
    'Trash2',
    'Trash2, Edit2'
)

# 2. State and isRevisionMode
state_injection = """  const { id } = React.use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRevisionMode = searchParams.get("revision") === "true";
  
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);"""

content = content.replace(
    '  const { id } = React.use(params);\n  const router = useRouter();',
    state_injection
)

# 3. handleEditMenu and resetForm
reset_form_orig = """  const resetForm = () => {
    setForm({
      name: "", description: "", selectedDays: [], bufferPercent: 5, overheadCost: 1500, cookingTime: 90, image: "", 
      karbo: "", proteinUtama: "", proteinNabati: "", sayur: "", buah: ""
    });
    setImagePreview(null);
    setSelectedIngredients([]);
  };"""

reset_form_new = """  const resetForm = () => {
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
  };"""
content = content.replace(reset_form_orig, reset_form_new)

# 4. submitTender update
submit_orig = """    setCustomMenus([...customMenus, newMenu]);
    resetForm();
    setIsMenuDialogOpen(false);
    toast.success("Rencana menu berhasil ditambahkan ke Master Plan!");"""

submit_new = """    if (editingMenuId) {
      setCustomMenus(prev => prev.map(m => m.id === editingMenuId ? { ...newMenu, id: editingMenuId } : m));
      toast.success("Rencana menu berhasil diperbarui!");
    } else {
      setCustomMenus([...customMenus, newMenu]);
      toast.success("Rencana menu berhasil ditambahkan ke Master Plan!");
    }
    resetForm();
    setIsMenuDialogOpen(false);"""
content = content.replace(submit_orig, submit_new)

# 5. TERBITKAN SEKARANG Button
terbitkan_orig = """            <Button 
              onClick={handlePublish}
              disabled={isPublishing || !isCompliant || customMenus.length === 0}
              className={`rounded-[14px] font-bold px-6 shadow-lg transition-all ${
                isCompliant && customMenus.length > 0
                  ? "bg-[#0d5c46] hover:bg-[#0a4837] text-white shadow-emerald-900/10" 
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {isPublishing ? <Loader2 className="animate-spin" /> : "TERBITKAN SEKARANG"}
            </Button>"""

terbitkan_new = """            <Button 
              onClick={handlePublish}
              disabled={isPublishing || (!isRevisionMode && (!isCompliant || customMenus.length === 0))}
              className={`rounded-[14px] font-bold px-6 shadow-lg transition-all ${
                (isCompliant && customMenus.length > 0) || isRevisionMode
                  ? "bg-[#0d5c46] hover:bg-[#0a4837] text-white shadow-emerald-900/10" 
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {isPublishing ? <Loader2 className="animate-spin" /> : (isRevisionMode ? "SIMPAN REVISI VENDOR" : "TERBITKAN SEKARANG")}
            </Button>"""
content = content.replace(terbitkan_orig, terbitkan_new)

# 6. Revision Banner
banner_injection = """      <div className="w-full px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
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
        )}"""
# Wait, I already added the banner in my previous step manually, so I will skip this part.

# 7. Hide Tambah Menu buttons
content = content.replace(
    '{!isMenuDialogOpen ? (',
    '{!isMenuDialogOpen && !isRevisionMode ? ('
)
content = content.replace(
    '<div className="mt-8">\n                <Button onClick={() => { resetForm(); setIsMenuDialogOpen(true); }}',
    '{!isRevisionMode && <div className="mt-8">\n                <Button onClick={() => { resetForm(); setIsMenuDialogOpen(true); }}'
)
content = content.replace(
    '                  TAMBAH MENU MAKANAN BARU\n                </Button>\n              </div>',
    '                  TAMBAH MENU MAKANAN BARU\n                </Button>\n              </div>}'
)

# 8. Disable Inputs
content = content.replace(
    '<Input placeholder="Contoh: Paket Nasi Ayam Bakar"',
    '<Input disabled={isRevisionMode} placeholder="Contoh: Paket Nasi Ayam Bakar"'
)
content = content.replace(
    'disabled={isPublishing || customMenus.length === 0 || getUniqueVendorsCount() < 15}',
    'disabled={isPublishing || (!isRevisionMode && (!isCompliant || customMenus.length === 0))}'
)
content = content.replace(
    'onClick={() => toggleDay(day)}',
    'onClick={() => !isRevisionMode && toggleDay(day)}'
)
content = content.replace(
    '<Input placeholder="5" type="number"',
    '<Input disabled={isRevisionMode} placeholder="5" type="number"'
)
content = content.replace(
    '<Input placeholder="1500" type="number"',
    '<Input disabled={isRevisionMode} placeholder="1500" type="number"'
)
content = content.replace(
    '<Input placeholder="90" type="number"',
    '<Input disabled={isRevisionMode} placeholder="90" type="number"'
)
content = content.replace(
    '<Textarea \n                            placeholder="Penjelasan singkat',
    '<Textarea \n                            disabled={isRevisionMode}\n                            placeholder="Penjelasan singkat'
)
content = content.replace(
    'onChange={(e) => updateIngredientAmount(item.id, e.target.value)}',
    'disabled={isRevisionMode}\n                                           onChange={(e) => updateIngredientAmount(item.id, e.target.value)}'
)

# 9. Add Edit Button and Hide Trash button in Revision Mode
edit_button = """                         <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditMenu(menu.id)}
                            className="h-8 w-8 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                         >
                            <Edit2 size={16} />
                         </Button>
                         {!isRevisionMode && (
                           <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteMenu(menu.id)}
                              className="h-8 w-8 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                           >
                              <Trash2 size={16} />
                           </Button>
                         )}"""
                         
content = re.sub(
    r'<Button \s*variant="ghost" \s*size="icon" \s*onClick=\{\(\) => handleDeleteMenu\(menu\.id\)\}\s*className="h-8 w-8 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"\s*>\s*<Trash2 size=\{16\} />\s*</Button>',
    edit_button,
    content
)

# 10. Pre-fill mock data for ID 3 if it's empty to demonstrate revision
init_mock = """  const [customMenus, setCustomMenus] = useState<CustomMenu[]>([]);
  
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
            { id: "c13", name: "Daging Sapi Has Dalam", vendor: "Peternakan Sapi Makmur", price: "Rp 135.000", category: "Protein Hewani", unit: "kg", stock: 50, het: "Rp 130.000", isMarkup: true, rating: 4.6, reviews: 200, isNew: false, distance: 4.2, image: "https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=300&auto=format&fit=crop", amountPerPortion: 100 }
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
            { id: "c12", name: "Wortel Brastagi", vendor: "Sayur Mayur Lembang", price: "Rp 14.000", category: "Sayuran", unit: "kg", stock: 90, het: "Rp 15.000", isMarkup: false, rating: 4.7, reviews: 110, isNew: false, distance: 14.5, image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=300&auto=format&fit=crop", amountPerPortion: 50 }
          ]
        }
      ]);
    }
  }, [isRevisionMode, id, customMenus.length]);"""

content = content.replace('  const [customMenus, setCustomMenus] = useState<CustomMenu[]>([]);', init_mock)

# Prevent deleting existing items
content = content.replace(
    'onClick={() => toggleIngredient(item)}',
    'onClick={() => { if (isRevisionMode && item.vendor !== "Sayur Mayur Lembang" && customMenus.find(m => m.ingredients.find(i => i.id === item.id))) { toast.error("Vendor yang sudah disetujui tidak dapat dihapus!"); return; } toggleIngredient(item); }}'
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Refactor applied.")
