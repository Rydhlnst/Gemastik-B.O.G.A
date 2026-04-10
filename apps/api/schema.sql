-- ==========================================
-- 7. SISTEM SMART SPK (SURAT PERINTAH KERJA)
-- ==========================================
CREATE TABLE kontrak_spk (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sppg_id INTEGER DEFAULT 1, -- (Hardcode 1 dulu untuk simulasi Sekolah Pemesan)
    vendor_id INTEGER NOT NULL,
    katalog_id INTEGER NOT NULL, -- Merujuk ke barang di E-Katalog
    jumlah_pesanan REAL NOT NULL,
    total_harga REAL NOT NULL,
    tanggal_kebutuhan DATE NOT NULL,
    status TEXT DEFAULT 'DRAFT', -- Status awal wajib DRAFT
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (katalog_id) REFERENCES katalog_vendor(id)
);