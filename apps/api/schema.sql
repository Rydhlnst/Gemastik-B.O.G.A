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

-- ==========================================
-- 8. SISTEM BIDDING (SPPG MEMILIH VENDOR)
-- ==========================================
CREATE TABLE IF NOT EXISTS tenders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sppg_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit TEXT NOT NULL,
    deadline DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'OPEN', -- OPEN | CLOSED | AWARDED
    weight_price REAL NOT NULL DEFAULT 0.5,
    weight_quality REAL NOT NULL DEFAULT 0.35,
    weight_distance REAL NOT NULL DEFAULT 0.15,
    awarded_bid_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tender_bids (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tender_id INTEGER NOT NULL,
    vendor_id INTEGER NOT NULL,
    price_per_unit REAL NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
