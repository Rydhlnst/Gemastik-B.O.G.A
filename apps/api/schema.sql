-- Legacy Tables Cleanup
DROP TABLE IF EXISTS StudentReviews;
DROP TABLE IF EXISTS Deliveries;
DROP TABLE IF EXISTS Schools;
DROP TABLE IF EXISTS EscrowTransactions;
DROP TABLE IF EXISTS PurchaseOrderItems;
DROP TABLE IF EXISTS PurchaseOrders;
DROP TABLE IF EXISTS Vendor_Stock_Movements;
DROP TABLE IF EXISTS Commodities;
DROP TABLE IF EXISTS Master_PIHPS_HET;
DROP TABLE IF EXISTS Vendors;
DROP TABLE IF EXISTS Accounts;

CREATE TABLE Accounts (
    id VARCHAR(50) PRIMARY KEY,
    nik VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    role VARCHAR(50) NOT NULL, -- 'PEMERINTAH', 'VENDOR', 'SPPG', 'SEKOLAH'
    wallet_address VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Vendors (
    id VARCHAR(50) PRIMARY KEY, -- Foreign Key to Accounts.id
    business_name VARCHAR(255) NOT NULL,
    business_email VARCHAR(255),
    business_phone VARCHAR(20),
    business_address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    npwp_number VARCHAR(50),
    nib_number VARCHAR(50),
    logo_url VARCHAR(255),
    
    akta_document_url VARCHAR(255),
    akta_document_hash VARCHAR(64),
    sk_kemenkumham_url VARCHAR(255),
    sk_kemenkumham_hash VARCHAR(64),
    npwp_document_url VARCHAR(255),
    npwp_document_hash VARCHAR(64),
    nib_document_url VARCHAR(255),
    nib_document_hash VARCHAR(64),
    sppg_readiness_document_url VARCHAR(255),
    sppg_readiness_document_hash VARCHAR(64),
    
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(50),
    bank_account_name VARCHAR(255),
    
    status VARCHAR(50) DEFAULT 'PENDING_AI', -- 'PENDING_AI', 'PENDING_GOV', 'APPROVED', 'REJECTED'
    ai_validation_score DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES Accounts(id) ON DELETE CASCADE
);

CREATE TABLE Master_PIHPS_HET (
    id VARCHAR(50) PRIMARY KEY,
    commodity_name VARCHAR(255) NOT NULL,
    max_het_price DECIMAL(15, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Commodities (
    id VARCHAR(50) PRIMARY KEY,
    vendor_id VARCHAR(50) NOT NULL,
    pihps_id VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    markup_percentage DECIMAL(5, 2) DEFAULT 0,
    is_markup BOOLEAN DEFAULT 0,
    current_stock DECIMAL(15, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES Vendors(id) ON DELETE CASCADE,
    FOREIGN KEY (pihps_id) REFERENCES Master_PIHPS_HET(id)
);

CREATE TABLE Vendor_Stock_Movements (
    id VARCHAR(50) PRIMARY KEY,
    vendor_id VARCHAR(50) NOT NULL,
    commodity_id VARCHAR(50) NOT NULL,
    movement_type VARCHAR(20) NOT NULL, -- 'INBOUND' atau 'OUTBOUND'
    quantity DECIMAL(15, 2) NOT NULL,
    
    -- Untuk INBOUND (Dari Petani ke Vendor)
    origin_source_name VARCHAR(255),
    origin_source_location TEXT,
    origin_proof_url VARCHAR(255),
    origin_proof_hash VARCHAR(64),
    
    -- Untuk OUTBOUND (Dari Vendor ke SPPG)
    purchase_order_id VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES Vendors(id) ON DELETE CASCADE,
    FOREIGN KEY (commodity_id) REFERENCES Commodities(id) ON DELETE CASCADE
);

CREATE TABLE PurchaseOrders (
    id VARCHAR(50) PRIMARY KEY,
    sppg_id VARCHAR(50) NOT NULL,
    vendor_id VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'SHIPPED', 'QC_PROCESS', 'COMPLETED', 'REJECTED'
    total_amount DECIMAL(15, 2) NOT NULL,
    smart_contract_escrow_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sppg_id) REFERENCES Accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (vendor_id) REFERENCES Vendors(id) ON DELETE CASCADE
);

CREATE TABLE PurchaseOrderItems (
    id VARCHAR(50) PRIMARY KEY,
    po_id VARCHAR(50) NOT NULL,
    commodity_id VARCHAR(50) NOT NULL,
    quantity DECIMAL(15, 2) NOT NULL,
    price_at_purchase DECIMAL(15, 2) NOT NULL,
    subtotal DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (po_id) REFERENCES PurchaseOrders(id) ON DELETE CASCADE,
    FOREIGN KEY (commodity_id) REFERENCES Commodities(id) ON DELETE CASCADE
);

-- Mock Data PIHPS
INSERT INTO Master_PIHPS_HET (id, commodity_name, max_het_price, unit) VALUES
('PIHPS-BERAS', 'Beras Premium', 15000, 'kg'),
('PIHPS-TELUR', 'Telur Ayam Ras', 28000, 'kg'),
('PIHPS-DAGING', 'Daging Sapi', 120000, 'kg');

-- Hapus data lama biar bersih
DELETE FROM Accounts;

-- 1. PEMERINTAH (5 Akun - Nama Pejabat/Admin)
INSERT INTO Accounts (id, nik, name, email, role, wallet_address, password_hash) VALUES 
('ACC-GOV-01', '3201011010800001', 'Ahmad Heryawan', 'ahmad.h@boga.go.id', 'PEMERINTAH', '0xACC_GOV_1', 'hash123'),
('ACC-GOV-02', '3201011010800002', 'Ridwan Kamil', 'ridwan.k@boga.go.id', 'PEMERINTAH', '0xACC_GOV_2', 'hash123'),
('ACC-GOV-03', '3201011010800003', 'Atalia Praratya', 'atalia@boga.go.id', 'PEMERINTAH', '0xACC_GOV_3', 'hash123'),
('ACC-GOV-04', '3201011010800004', 'Bima Arya', 'bima.arya@boga.go.id', 'PEMERINTAH', '0xACC_GOV_4', 'hash123'),
('ACC-GOV-05', '3201011010800005', 'Dedi Mulyadi', 'dedi.m@boga.go.id', 'PEMERINTAH', '0xACC_GOV_5', 'hash123');

-- 2. VENDOR (5 Akun - Nama Pemilik/Direktur)
INSERT INTO Accounts (id, nik, name, email, role, wallet_address, password_hash) VALUES 
('ACC-VEN-01', '3273012010900001', 'Haji Dadang', 'dadang@pangan.com', 'VENDOR', '0xACC_VEN_1', 'hash123'),
('ACC-VEN-02', '3273012010900002', 'Cecep Supriatna', 'cecep@vendor.id', 'VENDOR', '0xACC_VEN_2', 'hash123'),
('ACC-VEN-03', '3273012010900003', 'Asep Sunandar', 'asep@tani.org', 'VENDOR', '0xACC_VEN_3', 'hash123'),
('ACC-VEN-04', '3273012010900004', 'Siti Aminah', 'siti@supplier.com', 'VENDOR', '0xACC_VEN_4', 'hash123'),
('ACC-VEN-05', '3273012010900005', 'Dewi Sartika', 'dewi@sayur.com', 'VENDOR', '0xACC_VEN_5', 'hash123');

-- 3. SPPG (5 Akun - Nama Kepala Dapur)
INSERT INTO Accounts (id, nik, name, email, role, wallet_address, password_hash) VALUES 
('ACC-SPPG-01', '3204053010850001', 'Ujang Memet', 'ujang@sppg.net', 'SPPG', '0xACC_SPPG_1', 'hash123'),
('ACC-SPPG-02', '3204053010850002', 'Euis Rohayati', 'euis@sppg.net', 'SPPG', '0xACC_SPPG_2', 'hash123'),
('ACC-SPPG-03', '3204053010850003', 'Koswara', 'koswara@sppg.net', 'SPPG', '0xACC_SPPG_3', 'hash123'),
('ACC-SPPG-04', '3204053010850004', 'Maman Suherman', 'maman@sppg.net', 'SPPG', '0xACC_SPPG_4', 'hash123'),
('ACC-SPPG-05', '3204053010850005', 'Cucu Cahyati', 'cucu@sppg.net', 'SPPG', '0xACC_SPPG_5', 'hash123');

-- 4. SEKOLAH (5 Akun - Nama Kepala Sekolah/Admin TU)
INSERT INTO Accounts (id, nik, name, email, role, wallet_address, password_hash) VALUES 
('ACC-SCH-01', '3271024010920001', 'Bapak Mulyana', 'mulyana@sch.id', 'SEKOLAH', '0xACC_SCH_1', 'hash123'),
('ACC-SCH-02', '3271024010920002', 'Ibu Ratna', 'ratna@sch.id', 'SEKOLAH', '0xACC_SCH_2', 'hash123'),
('ACC-SCH-03', '3271024010920003', 'Bapak Jajang', 'jajang@sch.id', 'SEKOLAH', '0xACC_SCH_3', 'hash123'),
('ACC-SCH-04', '3271024010920004', 'Ibu Neneng', 'neneng@sch.id', 'SEKOLAH', '0xACC_SCH_4', 'hash123'),
('ACC-SCH-05', '3271024010920005', 'Bapak Toto', 'toto@sch.id', 'SEKOLAH', '0xACC_SCH_5', 'hash123');