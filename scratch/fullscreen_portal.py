import re

file_path = r"d:\My Project\Gemastik\Gemastik-B.O.G.A\apps\web\app\sppg\admin\tender\edit\[id]\page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Replace the header section
header_old = r"""                 <div className="p-6 bg-white border-b border-slate-100 shrink-0">
                    <DialogTitle className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                       <Store className="text-emerald-600" />
                       Katalog Bahan Baku Vendor Lokal
                    </DialogTitle>"""

header_new = r"""                 <div className="p-8 bg-white border-b border-slate-100 shrink-0 shadow-sm">
                    <div className="max-w-7xl mx-auto w-full flex items-center justify-between mb-6">
                       <div className="flex items-center gap-4">
                          <Button variant="ghost" size="icon" onClick={() => setIsCatalogDialogOpen(false)} className="rounded-full hover:bg-slate-100 h-12 w-12">
                             <ArrowLeft size={24} className="text-slate-600" />
                          </Button>
                          <DialogTitle className="text-3xl font-black text-slate-800 flex items-center gap-3">
                             <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                                <Store className="text-emerald-600" size={28} />
                             </div>
                             Portal Katalog Bahan Baku & Mitra Lokal BGN
                          </DialogTitle>
                       </div>
                    </div>
                    
                    <div className="max-w-7xl mx-auto w-full">"""

content = content.replace(header_old, header_new)

# 2. Fix the grid opening and add the container
grid_old = r"""                 <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                     <div className="grid grid-cols-1 gap-6">"""

grid_new = r"""                 <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                      <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">"""

content = content.replace(grid_old, grid_new)

# 3. Fix the closing of the grid container (we need an extra div for max-w-7xl)
# Find the part before the footer
footer_marker = r"""                  <div className="p-8 bg-white border-t border-slate-200 flex items-center justify-center shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">"""

content = content.replace(footer_marker, "                     </div>\n                  </div>\n" + footer_marker)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Full-screen portal conversion applied.")
