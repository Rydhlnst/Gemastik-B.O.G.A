import re

file_path = r"d:\My Project\Gemastik\Gemastik-B.O.G.A\apps\web\app\sppg\admin\tender\edit\[id]\page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. We might need ChevronDown if it's not imported.
# It is actually already imported in `page.tsx` based on the first lines I viewed earlier:
# `import { ..., ChevronDown, ... } from "lucide-react";`

orig_desc = """                                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{item.description || "Tidak ada deskripsi tersedia."}</p>"""

new_desc = """                                <details className="mt-2 group cursor-pointer outline-none">
                                   <summary className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 list-none hover:text-emerald-700 transition-colors">
                                     Lihat Deskripsi Lengkap
                                     <ChevronDown size={12} className="transition-transform group-open:rotate-180" />
                                   </summary>
                                   <p className="text-[11px] text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-inner">
                                     {item.description || "Tidak ada deskripsi tersedia."}
                                   </p>
                                </details>"""

content = content.replace(orig_desc, new_desc)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Dropdown description applied.")
