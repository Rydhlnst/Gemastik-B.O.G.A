-- Hapus tabel lama jika ada (urutan dari child ke parent)
DROP TABLE IF EXISTS EscrowTransactions;
DROP TABLE IF EXISTS PurchaseOrderItems;
DROP TABLE IF EXISTS PurchaseOrders;

-- 1. TABEL SURAT PESANAN (Kontrak B2G)
CREATE TABLE PurchaseOrders (
    id TEXT PRIMARY KEY,
    sppg_id TEXT NOT NULL REFERENCES Users(id),
    vendor_id TEXT NOT NULL REFERENCES Vendors(id),
    total_amount REAL NOT NULL,
    status TEXT CHECK( status IN ('CREATED', 'ESCROW_HOLD', 'DELIVERING', 'DISPUTED', 'COMPLETED') ) DEFAULT 'CREATED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABEL KERANJANG PESANAN (Snapshot Harga Zero-Trust)
CREATE TABLE PurchaseOrderItems (
    id TEXT PRIMARY KEY,
    po_id TEXT NOT NULL REFERENCES PurchaseOrders(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL REFERENCES VendorItems(id),
    quantity REAL NOT NULL,
    price_at_purchase REAL NOT NULL, -- Mengunci harga mati saat pesanan dibuat
    subtotal REAL NOT NULL
);

-- 3. TABEL MULTI-SIGNATURE ESCROW (Integrasi DOKU)
CREATE TABLE EscrowTransactions (
    id TEXT PRIMARY KEY,
    po_id TEXT NOT NULL REFERENCES PurchaseOrders(id) ON DELETE CASCADE,
    doku_ref_id TEXT, -- ID Transaksi asli dari gerbang pembayaran DOKU
    amount REAL NOT NULL,
    status TEXT CHECK( status IN ('HOLD_3_DAYS', 'STAGE_1_RELEASED', 'STAGE_2_RELEASED', 'REFUNDED') ) DEFAULT 'HOLD_3_DAYS',
    hold_until DATETIME, -- Waktu maksimal hold (3 hari dari serah terima)
    
    -- Otorisasi Multi-Sig (0 = Belum, 1 = Sudah Tanda Tangan)
    qc_approved INTEGER DEFAULT 0, 
    admin_approved INTEGER DEFAULT 0, 
    logistik_approved INTEGER DEFAULT 0, 
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexing untuk mempercepat query Dasbor SPPG
CREATE INDEX idx_po_sppg ON PurchaseOrders(sppg_id);
CREATE INDEX idx_escrow_po ON EscrowTransactions(po_id);

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
