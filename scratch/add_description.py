import re

file_path = r"d:\My Project\Gemastik\Gemastik-B.O.G.A\apps\web\app\sppg\admin\tender\edit\[id]\page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add description to interface
content = content.replace(
    '  distance: number;\n}',
    '  distance: number;\n  description?: string;\n}'
)

# 2. Inject descriptions into mock data
descriptions = {
    "c1": "Beras premium kualitas super tanpa pemutih, cocok untuk konsumsi harian sekolah.",
    "c2": "Ayam broiler potong segar diproses secara higienis dengan sertifikasi halal MUI.",
    "c3": "Telur ayam ras segar dari peternakan lokal dengan jaminan cangkang tebal dan kualitas grade A.",
    "c4": "Tempe padat kaya protein dari kedelai pilihan non-GMO.",
    "c5": "Buncis segar hasil panen pagi hari dari perkebunan organik Cikole, kaya akan serat.",
    "c6": "Minyak goreng bening difortifikasi vitamin A, cocok untuk menggoreng lauk pauk.",
    "c7": "Ikan nila air tawar segar tanpa bau tanah, kaya akan protein dan Omega 3.",
    "c8": "Susu sapi perah murni pasteurisasi tanpa pengawet tambahan, sumber kalsium tinggi.",
    "c9": "Pisang ambon matang sempurna, manis alami, sangat cocok sebagai buah pencuci mulut.",
    "c10": "Bawang merah super Brebes kering, aromatik dan tahan lama.",
    "c11": "Bawang putih kating impor kualitas premium dengan aroma bawang yang sangat kuat.",
    "c12": "Wortel manis segar dari Brastagi, kaya akan vitamin A dan baik untuk mata.",
    "c13": "Daging sapi has dalam tekstur empuk, bebas lemak, sangat baik untuk pemenuhan gizi anak.",
    "c14": "Garam beryodium kemasan standar BPOM, penting untuk pertumbuhan optimal.",
    "c15": "Jeruk manis tanpa biji kaya vitamin C untuk menjaga imunitas tubuh anak-anak.",
    "c16": "Tahu mentah tanpa pengawet formalin, sumber protein nabati yang sangat baik."
}

for c_id, desc in descriptions.items():
    # Find the line for the item and append description before the closing brace
    pattern = r'(\{ id: "' + c_id + r'".*?)( \})'
    replacement = r'\1, description: "' + desc + r'"\2'
    content = re.sub(pattern, replacement, content)

# 3. Add UI rendering for the description in the Catalog Modal
# Let's find: <h4 className="text-base font-bold text-slate-800 truncate leading-snug">{item.name}</h4>
# And add the description directly below it.

desc_ui = """                                <h4 className="text-base font-bold text-slate-800 truncate leading-snug">{item.name}</h4>
                                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{item.description || "Tidak ada deskripsi tersedia."}</p>"""

content = content.replace(
    '<h4 className="text-base font-bold text-slate-800 truncate leading-snug">{item.name}</h4>',
    desc_ui
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Description added successfully.")
