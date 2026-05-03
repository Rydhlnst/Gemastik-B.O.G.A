import re

file_path = r"d:\My Project\Gemastik\Gemastik-B.O.G.A\apps\web\app\sppg\admin\tender\edit\[id]\page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Modify the Selesai Memilih Button inside the Dialog
selesai_orig = """                    <Button onClick={() => setIsCatalogDialogOpen(false)} className="rounded-xl font-bold bg-[#0d5c46] hover:bg-[#0a4837] text-white px-8 h-11">
                      Selesai Memilih
                    </Button>"""

selesai_new = """                    <Button 
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
                      className="rounded-xl font-bold bg-[#0d5c46] hover:bg-[#0a4837] text-white px-8 h-11"
                    >
                      {isRevisionMode ? "Simpan Perubahan & Kembali" : "Selesai Memilih"}
                    </Button>"""

content = content.replace(selesai_orig, selesai_new)

# 2. Make the Catalog open on load and stay open if isRevisionMode is true
# We can just change the Dialog to have `open={isCatalogDialogOpen || isRevisionMode}`
content = content.replace(
    '<Dialog open={isCatalogDialogOpen} onOpenChange={setIsCatalogDialogOpen}>',
    '<Dialog open={isCatalogDialogOpen || isRevisionMode} onOpenChange={setIsCatalogDialogOpen}>'
)

# 3. Add a transparent or blurry backdrop? The default is Dialog backdrop which is fine.
# Let's also hide the close button of the Dialog (X icon) in revision mode?
# There is no close X button shown in the snippet we saw, just "Selesai Memilih".

# 4. We need to hide the background content using CSS or just let the backdrop cover it. The default Dialog covers it with a dark bg which is perfect.

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Simple Mockup Refactor applied.")
