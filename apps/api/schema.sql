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