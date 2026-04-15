-- Hapus tabel lama beserta isinya (Mulai dari lembaran baru)
DROP TABLE IF EXISTS vendors;

-- Buat Tabel Vendor B.O.G.A (Versi Custodial/Shadow Wallet)
CREATE TABLE vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- ==========================================
    -- 1. AUTENTIKASI WEB2 (Sistem Login)
    -- ==========================================
    email_mitra TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    
    -- ==========================================
    -- 2. IDENTITAS WEB3 (Shadow Wallet)
    -- ==========================================
    wallet_address TEXT UNIQUE NOT NULL,
    private_key TEXT NOT NULL,
    document_hash TEXT, -- Bisa kosong saat baru bikin akun, diisi pas upload dokumen
    
    -- ==========================================
    -- 3. PROFIL PERUSAHAAN & DOKUMEN
    -- ==========================================
    nama_perusahaan TEXT NOT NULL,
    nib TEXT UNIQUE NOT NULL,
    npwp TEXT UNIQUE NOT NULL,
    no_hp_mitra TEXT,
    alamat_utama TEXT,
    
    akta_url TEXT,
    sk_url TEXT,
    logo_url TEXT,
    sppg_url TEXT,
    
    -- ==========================================
    -- 4. SISTEM TRACKING
    -- ==========================================
    status TEXT DEFAULT 'PENDING_VERIFICATION' CHECK(status IN ('PENDING_VERIFICATION', 'ACTIVE', 'REJECTED', 'FROZEN')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bikin Indexing biar pencarian Login dan Web3 makin ngebut
CREATE INDEX idx_vendors_email ON vendors(email_mitra);
CREATE INDEX idx_vendors_wallet ON vendors(wallet_address);
CREATE INDEX idx_vendors_status ON vendors(status);