import re

file_path = r"d:\My Project\Gemastik\Gemastik-B.O.G.A\apps\web\app\sppg\admin\tender\edit\[id]\page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add gallery to interface
content = content.replace(
    '  description?: string;\n}',
    '  description?: string;\n  gallery?: string[];\n}'
)

# 2. Add gallery to ALL mock items. We can just duplicate the item.image with a few different w/h params to simulate different photos.
def add_gallery_to_item(match):
    full_item = match.group(0)
    # Find the image URL
    img_match = re.search(r'image: "(.*?)"', full_item)
    if img_match:
        img_url = img_match.group(1)
        # Create some variations
        gallery_str = f', gallery: ["{img_url}", "{img_url.replace("w=300", "w=301")}", "{img_url.replace("w=300", "w=302")}", "{img_url.replace("w=300", "w=303")}"]'
        return full_item.replace('}', gallery_str + ' }', 1)
    return full_item

# This matches the lines starting with { id: "c... }
content = re.sub(r'\{ id: "c\d+".*?\}', add_gallery_to_item, content)

# 3. Add UI rendering for the gallery inside the <details> dropdown.
orig_details_end = """                                   <p className="text-[11px] text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-inner">
                                     {item.description || "Tidak ada deskripsi tersedia."}
                                   </p>
                                </details>"""

new_details_end = """                                   <div className="bg-slate-50 mt-2 p-3 rounded-xl border border-slate-100 shadow-inner">
                                     <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                                       {item.description || "Tidak ada deskripsi tersedia."}
                                     </p>
                                     {item.gallery && item.gallery.length > 0 && (
                                       <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
                                          {item.gallery.slice(0, 5).map((img, idx) => (
                                            <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-200 shadow-sm cursor-pointer hover:border-emerald-500 hover:scale-105 transition-all">
                                              <img src={img} alt={`${item.name} detail ${idx+1}`} className="w-full h-full object-cover" />
                                            </div>
                                          ))}
                                       </div>
                                     )}
                                   </div>
                                </details>"""

content = content.replace(orig_details_end, new_details_end)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Gallery applied successfully.")
