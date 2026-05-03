-- =========================================================================
-- 🏛️ B.O.G.A (Bahan Olahan Gizi Amanah) - D1 SQL SCHEMA
-- DATABASE REBUILT: Consistent, Zero-Trust, No-NULLs
-- =========================================================================

PRAGMA foreign_keys = OFF;

-- 1. TABEL ACCOUNTS (Identity Management)
DROP TABLE IF EXISTS Accounts;
CREATE TABLE Accounts (
    id TEXT PRIMARY KEY,
    nik TEXT UNIQUE NOT NULL,
    nama TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telepon TEXT NOT NULL,
    peran TEXT NOT NULL, -- 'VENDOR', 'PEMERINTAH', 'QC', 'ADMIN'
    password_hash TEXT NOT NULL,
    wallet_address TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABEL VENDORS (Business & Legal Profile)
DROP TABLE IF EXISTS Vendors;
CREATE TABLE Vendors (
    id TEXT PRIMARY KEY,
    business_name TEXT NOT NULL,
    business_email TEXT NOT NULL,
    business_phone TEXT NOT NULL,
    business_address TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    npwp_number TEXT NOT NULL,
    nib_number TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    
    -- Dokumen Legalitas (Zero-Trust Fingerprint)
    akta_document_url TEXT NOT NULL,
    akta_document_hash TEXT NOT NULL,
    sk_kemenkumham_url TEXT NOT NULL,
    sk_kemenkumham_hash TEXT NOT NULL,
    npwp_document_url TEXT NOT NULL,
    npwp_document_hash TEXT NOT NULL,
    nib_document_url TEXT NOT NULL,
    nib_document_hash TEXT NOT NULL,
    sppg_readiness_document_url TEXT NOT NULL,
    sppg_readiness_document_hash TEXT NOT NULL,
    
    -- Banking
    bank_name TEXT NOT NULL,
    bank_account_number TEXT NOT NULL,
    bank_account_name TEXT NOT NULL,
    
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES Accounts(id)
);

-- 3. TABEL BARANG (E-Katalog)
DROP TABLE IF EXISTS Barang;
CREATE TABLE Barang (
    id TEXT PRIMARY KEY,
    vendor_id TEXT NOT NULL,
    pihps_id TEXT NOT NULL,
    name TEXT NOT NULL,
    harga REAL NOT NULL,
    unit TEXT NOT NULL,
    photo_url TEXT,
    description TEXT,
    markup_percentage REAL DEFAULT 0,
    is_markup INTEGER DEFAULT 0,
    current_stock REAL DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES Vendors(id)
);

-- 5. TABEL PESANAN (Zero-Trust Purchase Order Header)
DROP TABLE IF EXISTS Pesanan;
CREATE TABLE Pesanan (
    id TEXT PRIMARY KEY,
    pembeli_id TEXT NOT NULL,       -- ID Akun SPPG/Buyer
    vendor_id TEXT NOT NULL,        -- ID Vendor
    total_harga REAL NOT NULL,
    status TEXT DEFAULT 'PENDING',  -- PENDING, READY_FOR_PICKUP, VALIDATING, COMPLETED, CANCELLED
    escrow_status TEXT NOT NULL,    -- ESCROW_HOLD, READY_FOR_PICKUP, VALIDATING, REVISION, EXPIRED, RELEASED
    pickup_pin TEXT,                -- PIN 6-digit untuk serah terima QR
    revision_note TEXT,             -- Catatan revisi dari QC/Logistik
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pembeli_id) REFERENCES Accounts(id),
    FOREIGN KEY (vendor_id) REFERENCES Vendors(id)
);

-- 5.1 TABEL SIGNATURES (Audit Trail Multi-Sig SPPG)
DROP TABLE IF EXISTS PesananSignatures;
CREATE TABLE PesananSignatures (
    pesanan_id TEXT PRIMARY KEY,
    qc_status TEXT DEFAULT 'PENDING',       -- PENDING, SIGNED, REVISION
    qc_signed_at DATETIME,
    admin_status TEXT DEFAULT 'PENDING',    -- PENDING, SIGNED, REVISION
    admin_signed_at DATETIME,
    logistik_status TEXT DEFAULT 'PENDING', -- PENDING, SIGNED, REVISION
    logistik_signed_at DATETIME,
    FOREIGN KEY (pesanan_id) REFERENCES Pesanan(id)
);

-- 6. TABEL ITEM PESANAN (Detail Transaksi)
DROP TABLE IF EXISTS ItemPesanan;
CREATE TABLE ItemPesanan (
    id TEXT PRIMARY KEY,
    pesanan_id TEXT NOT NULL,
    barang_id TEXT NOT NULL,
    kuantitas REAL NOT NULL,
    harga_saat_itu REAL NOT NULL,
    FOREIGN KEY (pesanan_id) REFERENCES Pesanan(id),
    FOREIGN KEY (barang_id) REFERENCES Barang(id)
);

-- 7. TABEL ULASAN (Feedback Pembeli)
DROP TABLE IF EXISTS Ulasan;
CREATE TABLE Ulasan (
    id TEXT PRIMARY KEY,
    barang_id TEXT NOT NULL,
    akun_id TEXT NOT NULL, -- Siapa yang kasih ulasan
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    komentar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (barang_id) REFERENCES Barang(id),
    FOREIGN KEY (akun_id) REFERENCES Accounts(id)
);

-- 7. TABEL MUTASI STOK (Inbound/Outbound Tracking)
DROP TABLE IF EXISTS MutasiStok;
CREATE TABLE MutasiStok (
    id TEXT PRIMARY KEY,
    commodity_id TEXT NOT NULL,
    movement_type TEXT NOT NULL,    -- 'INBOUND', 'OUTBOUND'
    quantity REAL NOT NULL,
    reason TEXT NOT NULL,           -- 'PO_FULFILLMENT', 'REVISION_REPLACEMENT', 'SPOILAGE', 'ADJUSTMENT'
    reference_id TEXT,              -- PO ID atau Ref ID lainnya
    origin_source_name TEXT,        -- Nama Supplier (untuk Inbound) atau Keterangan (untuk Outbound)
    origin_source_location TEXT,
    origin_proof_url TEXT,          -- Foto struk/surat jalan
    origin_proof_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (commodity_id) REFERENCES Barang(id)
);

-- 5. TABEL MASTER PIHPS HET (Price Ceiling Reference)
DROP TABLE IF EXISTS Master_PIHPS_HET;
CREATE TABLE Master_PIHPS_HET (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    max_het_price REAL NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

PRAGMA foreign_keys = ON;

-- =========================================================================
-- 💉 SEEDING 5 VENDORS (3 APPROVED, 2 PENDING)
-- Password: hash123
-- =========================================================================

-- 1. SEED ACCOUNTS
INSERT INTO Accounts (id, nik, nama, email, telepon, peran, wallet_address, password_hash) VALUES 
('ACC-GOV-01', '3201011010800001', 'Ahmad Haji Dadang', 'ahmad.h@boga.go.id', '081122334455', 'VENDOR', '0xVEN_AHMAD', '$2b$10$QRZgi0Yr/lmSDWHVptOoCujMemfzEhvozHQTisprqFp5.XFFjxl9W'),
('ACC-VEN-01', '3273012010900001', 'Haji Dadang', 'dadang@pangan.com', '085211223344', 'VENDOR', '0xVEN_DADANG', '$2b$10$QRZgi0Yr/lmSDWHVptOoCujMemfzEhvozHQTisprqFp5.XFFjxl9W'),
('ACC-GOV-ROOT', '9999999999999999', 'Admin Pemerintah', 'admin@boga.go.id', '08999999999', 'PEMERINTAH', '0xADMIN', '$2b$10$QRZgi0Yr/lmSDWHVptOoCujMemfzEhvozHQTisprqFp5.XFFjxl9W'),
('ACC-VEN-02', '3273012010900002', 'Ibu Eni', 'eni@telur.com', '085211223355', 'VENDOR', '0xVEN_ENI', '$2b$10$QRZgi0Yr/lmSDWHVptOoCujMemfzEhvozHQTisprqFp5.XFFjxl9W'),
('ACC-VEN-03', '3273012010900003', 'Pak Jaka', 'jaka@beras.com', '085211223366', 'VENDOR', '0xVEN_JAKA', '$2b$10$QRZgi0Yr/lmSDWHVptOoCujMemfzEhvozHQTisprqFp5.XFFjxl9W'),
('ACC-VEN-04', '3273012010900004', 'Siti Maimunah', 'siti@catering.com', '085211223377', 'VENDOR', '0xVEN_SITI', '$2b$10$QRZgi0Yr/lmSDWHVptOoCujMemfzEhvozHQTisprqFp5.XFFjxl9W'),
('ACC-VEN-05', '3273012010900005', 'Budi Santoso', 'budi@barokah.com', '085211223388', 'VENDOR', '0xVEN_BUDI', '$2b$10$QRZgi0Yr/lmSDWHVptOoCujMemfzEhvozHQTisprqFp5.XFFjxl9W');

-- 2. SEED VENDORS (Semua kolom terisi asli)
INSERT INTO Vendors (
    id, business_name, business_email, business_phone, business_address,
    latitude, longitude, npwp_number, nib_number, logo_url,
    akta_document_url, akta_document_hash,
    sk_kemenkumham_url, sk_kemenkumham_hash,
    npwp_document_url, npwp_document_hash,
    nib_document_url, nib_document_hash,
    sppg_readiness_document_url, sppg_readiness_document_hash,
    bank_name, bank_account_number, bank_account_name, status
) VALUES 
-- Ahmad Haji Dadang (Approved)
('ACC-GOV-01', 'PD. Ahmad Haji Dadang', 'ahmad.h@boga.go.id', '081122334455', 'Pasar Induk Kramat Jati Blok A1, Jakarta', -6.175, 106.827, '01.999.888.7-654.000', '9999888877776', 'https://r2.boga.id/logos/ahmad.png', 
'https://r2.boga.id/docs/ahmad_akta.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
'https://r2.boga.id/docs/ahmad_sk.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
'https://r2.boga.id/docs/ahmad_npwp.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
'https://r2.boga.id/docs/ahmad_nib.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
'https://r2.boga.id/docs/ahmad_ready.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
'Bank Mandiri', '1234567890', 'Ahmad Haji Dadang', 'APPROVED'),
-- Haji Dadang (Approved)
('ACC-VEN-01', 'CV Pangan Berkah Dadang', 'dadang@pangan.com', '085211223344', 'Jl. Raya Soreang No. 123, Bandung', -7.033, 107.514, '01.234.567.8-901.000', '1234567890123', 'https://r2.boga.id/logos/dadang.png', 
'https://r2.boga.id/docs/akta1.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
'https://r2.boga.id/docs/sk1.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
'https://r2.boga.id/docs/npwp1.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
'https://r2.boga.id/docs/nib1.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
'https://r2.boga.id/docs/sppg1.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
'Bank Mandiri', '1234567890', 'Dadang Sudrajat', 'APPROVED'),

-- Ibu Eni (Approved)
('ACC-VEN-02', 'UD Telur Berkah Eni', 'eni@telur.com', '085211223355', 'Pasar Baru Bandung Lt. Dasar', -6.914, 107.604, '01.234.567.8-901.001', '1234567890124', 'https://r2.boga.id/logos/eni.png',
'https://r2.boga.id/docs/akta2.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
'https://r2.boga.id/docs/sk2.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
'https://r2.boga.id/docs/npwp2.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
'https://r2.boga.id/docs/nib2.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
'https://r2.boga.id/docs/sppg2.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
'Bank BCA', '0987654321', 'Eni Rohaeni', 'APPROVED'),

-- Pak Jaka (Approved)
('ACC-VEN-03', 'PT Jaka Pangan Nusantara', 'jaka@beras.com', '085211223366', 'Kawasan Industri Jababeka, Bekasi', -6.285, 107.170, '01.234.567.8-901.002', '1234567890125', 'https://r2.boga.id/logos/jaka.png',
'https://r2.boga.id/docs/akta3.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
'https://r2.boga.id/docs/sk3.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
'https://r2.boga.id/docs/npwp3.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
'https://r2.boga.id/docs/nib3.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
'https://r2.boga.id/docs/sppg3.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
'Bank BNI', '1122334455', 'Jaka Tingkir', 'APPROVED'),

-- Siti Catering (Pending)
('ACC-VEN-04', 'Catering Siti Sejahtera', 'siti@catering.com', '085211223377', 'Jl. Kebon Jeruk No. 45, Jakarta', -6.191, 106.764, '01.234.567.8-901.003', '1234567890126', 'https://r2.boga.id/logos/siti.png',
'https://r2.boga.id/docs/akta4.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
'https://r2.boga.id/docs/sk4.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
'https://r2.boga.id/docs/npwp4.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
'https://r2.boga.id/docs/nib4.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
'https://r2.boga.id/docs/sppg4.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
'Bank BRI', '5566778899', 'Siti Maimunah', 'PENDING'),

-- Budi Barokah (Pending)
('ACC-VEN-05', 'UD Beras Barokah Budi', 'budi@barokah.com', '085211223388', 'Jl. Malioboro No. 1, Yogyakarta', -7.792, 110.366, '01.234.567.8-901.004', '1234567890127', 'https://r2.boga.id/logos/budi.png',
'https://r2.boga.id/docs/akta5.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
'https://r2.boga.id/docs/sk5.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
'https://r2.boga.id/docs/npwp5.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
'https://r2.boga.id/docs/nib5.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
'https://r2.boga.id/docs/sppg5.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
'Bank Syariah Indonesia', '9988776655', 'Budi Santoso', 'PENDING');

-- 3. SEED MASTER PIHPS
INSERT INTO Master_PIHPS_HET (id, name, max_het_price) VALUES 
('PIHPS-BERAS', 'Beras Premium', 14500),
('PIHPS-TELUR', 'Telur Ayam Ras', 28000),
('PIHPS-AYAM', 'Daging Ayam Segar', 35000),
('PIHPS-MINYAK', 'Minyak Goreng Kita', 14000),
('PIHPS-GULA', 'Gula Pasir Lokal', 16000);

-- 4. SEED BARANG (12 Produk untuk Ahmad Haji Dadang)
INSERT INTO Barang (id, vendor_id, pihps_id, name, harga, unit, photo_url, description, current_stock, is_active) VALUES 
-- Produk 1: Si Legendaris
('BRG-A-01', 'ACC-GOV-01', 'PIHPS-BERAS-PREMIUM', 'Beras Pandan Wangi Super', 15000, 'Kg', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=400', 'Beras kualitas terbaik dari sawah pilihan Cianjur.', 5000, 1),
-- Produk 2: Si Markup
('BRG-A-02', 'ACC-GOV-01', 'PIHPS-BERAS-MEDIUM', 'Beras Medium Ramos', 14500, 'Kg', 'https://images.unsplash.com/photo-1590333746438-2834503f6700?q=80&w=400', 'Beras ramos untuk konsumsi harian.', 2000, 1),
-- Produk 3: Rating Rendah
('BRG-A-03', 'ACC-GOV-01', 'PIHPS-AYAM', 'Daging Ayam Broiler', 36000, 'Kg', 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?q=80&w=400', 'Ayam segar potong.', 200, 1),
-- Produk 4: Sedikit Peminat
('BRG-A-04', 'ACC-GOV-01', 'PIHPS-TELUR', 'Telur Bebek Asin', 35000, 'Kg', 'https://images.unsplash.com/photo-1614734322310-7467380963d7?q=80&w=400', 'Telur bebek asin berkualitas.', 100, 1),
-- Produk 5: Normal
('BRG-A-05', 'ACC-GOV-01', 'PIHPS-BAWANG', 'Bawang Merah Brebes', 32000, 'Kg', 'https://images.unsplash.com/photo-1508747703725-719777637510?q=80&w=400', 'Bawang merah asli Brebes.', 1000, 1),
-- Produk 6: Normal
('BRG-A-06', 'ACC-GOV-01', 'PIHPS-CABAI', 'Cabai Rawit Merah', 52000, 'Kg', 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?q=80&w=400', 'Cabai rawit super pedas.', 50, 1),
-- Produk 7: Normal
('BRG-A-07', 'ACC-GOV-01', 'PIHPS-GULA', 'Gula Pasir Kristal', 16000, 'Kg', 'https://images.unsplash.com/photo-1622484211148-7164999e0388?q=80&w=400', 'Gula pasir putih bersih.', 500, 1),
-- 5 Produk Baru (Tanpa Rating/Penjualan)
('BRG-A-08', 'ACC-GOV-01', 'PIHPS-BAWANG', 'Bawang Putih Kating', 28000, 'Kg', 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?q=80&w=400', 'Bawang putih impor pilihan.', 300, 1),
('BRG-A-09', 'ACC-GOV-01', 'PIHPS-KEDELAI', 'Tempe Kotak Super', 12000, 'Kg', 'https://images.unsplash.com/photo-1625943553852-781c33a6a1e8?q=80&w=400', 'Tempe kedelai murni.', 1000, 1),
('BRG-A-10', 'ACC-GOV-01', 'PIHPS-BUAH', 'Pisang Raja Sereh', 22000, 'sisir', 'https://images.unsplash.com/photo-1528825871115-3581a5387919?q=80&w=400', 'Pisang raja manis.', 50, 1),
('BRG-A-11', 'ACC-GOV-01', 'PIHPS-MINYAK', 'Minyak Goreng Sawit', 17000, 'liter', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=400', 'Minyak goreng bening.', 200, 1),
('BRG-A-12', 'ACC-GOV-01', 'PIHPS-IKAN', 'Ikan Bandeng Segar', 34000, 'Kg', 'https://images.unsplash.com/photo-1534346589587-9b51347da795?q=80&w=400', 'Ikan bandeng laut.', 40, 1);

-- 5. SEED PESANAN (Mencerminkan Kasus Frontend)
INSERT INTO Pesanan (id, pembeli_id, vendor_id, total_harga, status, escrow_status, pickup_pin, revision_note) VALUES 
-- Kasus 1: Menunggu Konfirmasi (ESCROW_HOLD)
('PO-2024-001', 'ACC-GOV-ROOT', 'ACC-GOV-01', 10200000, 'PENDING', 'ESCROW_HOLD', NULL, NULL),
-- Kasus 2: Siap Pickup (READY_FOR_PICKUP)
('PO-2024-002', 'ACC-GOV-ROOT', 'ACC-GOV-01', 2880000, 'READY_FOR_PICKUP', 'READY_FOR_PICKUP', '847291', NULL),
-- Kasus 3: Selesai (RELEASED)
('PO-2024-003', 'ACC-GOV-ROOT', 'ACC-GOV-01', 6750000, 'COMPLETED', 'RELEASED', '112233', NULL),
-- Kasus 4: Revisi (REVISION)
('PO-2024-006', 'ACC-GOV-ROOT', 'ACC-GOV-01', 1250000, 'VALIDATING', 'REVISION', '998877', 'Ditemukan 2 ikat bayam yang sudah layu.');

-- 5.1 SEED SIGNATURES
INSERT INTO PesananSignatures (pesanan_id, qc_status, admin_status, logistik_status) VALUES 
('PO-2024-001', 'PENDING', 'PENDING', 'PENDING'),
('PO-2024-002', 'PENDING', 'PENDING', 'PENDING'),
('PO-2024-003', 'SIGNED', 'SIGNED', 'SIGNED'),
('PO-2024-006', 'REVISION', 'PENDING', 'SIGNED');

INSERT INTO ItemPesanan (id, pesanan_id, barang_id, kuantitas, harga_saat_itu) VALUES 
-- Legendaris (1000 Kg)
('ITM-A-01', 'ORD-A-001', 'BRG-A-01', 1000, 15000),
-- Sedikit Peminat (100 Kg)
('ITM-A-02', 'ORD-A-002', 'BRG-A-04', 100, 35000),
-- Rating Rendah (100 Kg)
('ITM-A-03', 'ORD-A-003', 'BRG-A-03', 100, 36000);

INSERT INTO Ulasan (id, barang_id, akun_id, rating, komentar) VALUES 
-- Rating Legendaris (4.8 rata-rata)
('REV-A-01', 'BRG-A-01', 'ACC-GOV-ROOT', 5, 'Beras luar biasa pulen, langganan tetap!'),
('REV-A-02', 'BRG-A-01', 'ACC-GOV-ROOT', 5, 'Kualitas ekspor.'),
('REV-A-03', 'BRG-A-01', 'ACC-GOV-ROOT', 4, 'Bagus tapi pengiriman agak lama sedikit.'),
-- Rating Rendah (2.5)
('REV-A-04', 'BRG-A-03', 'ACC-GOV-ROOT', 2, 'Ayam kurang segar saat sampai.'),
('REV-A-05', 'BRG-A-03', 'ACC-GOV-ROOT', 3, 'Biasa saja.'),
-- Markup (4.0)
('REV-A-06', 'BRG-A-02', 'ACC-GOV-ROOT', 4, 'Beras enak walau harganya lumayan tinggi.');

-- 8. TABEL SEKOLAH (Instansi Sasaran SPPG)
DROP TABLE IF EXISTS Sekolah;
CREATE TABLE Sekolah (
    id TEXT PRIMARY KEY,           -- Format: ACC-SKL-[Prov][Kota][Urutan]
    sppg_region_id TEXT,           -- Mengikat sekolah ke region SPPG tertentu
    npsn TEXT UNIQUE NOT NULL,     
    nama TEXT NOT NULL,            
    tingkat TEXT NOT NULL,         -- SD, SMP, SMA, SMK, SLB
    alamat TEXT NOT NULL,          
    kota TEXT NOT NULL,            
    kecamatan TEXT NOT NULL,       
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    jumlah_siswa INTEGER NOT NULL, 
    nama_kepsek TEXT NOT NULL,     
    nip_kepsek TEXT NOT NULL,      
    telepon TEXT NOT NULL,         
    status TEXT DEFAULT 'VERIFIED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);