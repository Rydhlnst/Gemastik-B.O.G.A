/**
 * SCRIPT: Force Rebuild & Seed TOTAL (Ahmad's Version)
 * Menggunakan Batch API untuk melompati Foreign Key constraints.
 */
require('dotenv').config();
const { batchD1 } = require('./src/services/d1.service');

async function forceRebuild() {
    const vendorId = "ACC-VEN-5E1FD92B";
    const pembeliId = "ACC-GOV-ROOT";

    console.log("🚀 Memulai BATCH REBUILD TOTAL untuk Ahmad...");

    const migrationBatch = [
        // 1. Matikan Foreign Keys
        { sql: "PRAGMA foreign_keys = OFF;" },
        
        // 2. Hapus Semua Tabel
        { sql: "DROP TABLE IF EXISTS PesananSignatures;" },
        { sql: "DROP TABLE IF EXISTS ItemPesanan;" },
        { sql: "DROP TABLE IF EXISTS Pesanan;" },
        { sql: "DROP TABLE IF EXISTS MutasiStok;" },
        { sql: "DROP TABLE IF EXISTS Barang;" },

        // 3. Bangun Tabel Barang
        { sql: `CREATE TABLE Barang (
            id TEXT PRIMARY KEY,
            vendor_id TEXT NOT NULL,
            name TEXT NOT NULL,
            harga REAL NOT NULL,
            unit TEXT NOT NULL,
            current_stock REAL DEFAULT 0,
            category TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );` },

        // 4. Bangun Tabel MutasiStok
        { sql: `CREATE TABLE MutasiStok (
            id TEXT PRIMARY KEY,
            commodity_id TEXT NOT NULL,
            movement_type TEXT NOT NULL,
            quantity REAL NOT NULL,
            reason TEXT NOT NULL,
            reference_id TEXT,
            origin_source_name TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (commodity_id) REFERENCES Barang(id)
        );` },

        // 5. Bangun Tabel Pesanan
        { sql: `CREATE TABLE Pesanan (
            id TEXT PRIMARY KEY,
            pembeli_id TEXT NOT NULL,
            vendor_id TEXT NOT NULL,
            total_harga REAL NOT NULL,
            status TEXT DEFAULT 'PENDING',
            escrow_status TEXT NOT NULL,
            vendor_status TEXT,
            pickup_pin TEXT,
            revision_note TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );` },

        // 6. Bangun Tabel ItemPesanan
        { sql: `CREATE TABLE ItemPesanan (
            id TEXT PRIMARY KEY,
            pesanan_id TEXT NOT NULL,
            barang_id TEXT NOT NULL,
            kuantitas REAL NOT NULL,
            harga_saat_itu REAL NOT NULL,
            FOREIGN KEY (pesanan_id) REFERENCES Pesanan(id)
        );` },

        // 7. Bangun Tabel Signatures
        { sql: `CREATE TABLE PesananSignatures (
            pesanan_id TEXT PRIMARY KEY,
            qc_status TEXT DEFAULT 'PENDING',
            admin_status TEXT DEFAULT 'PENDING',
            logistik_status TEXT DEFAULT 'PENDING',
            FOREIGN KEY (pesanan_id) REFERENCES Pesanan(id)
        );` },

        // 8. Nyalakan Lagi Foreign Keys
        { sql: "PRAGMA foreign_keys = ON;" },

        // 9. SEEDING DATA AHMAD
        { sql: "INSERT INTO Barang (id, vendor_id, name, harga, unit, current_stock, category) VALUES (?, ?, ?, ?, ?, ?, ?)", 
          params: ["BRG-A-01", vendorId, "Beras Pandan Wangi Super", 15000, "Kg", 5000, "Karbohidrat"] },
        { sql: "INSERT INTO Barang (id, vendor_id, name, harga, unit, current_stock, category) VALUES (?, ?, ?, ?, ?, ?, ?)", 
          params: ["BRG-A-02", vendorId, "Telur Ayam Ras", 28000, "Kg", 1200, "Protein Hewani"] },
        
        { sql: "INSERT INTO Pesanan (id, pembeli_id, vendor_id, total_harga, status, escrow_status) VALUES (?, ?, ?, ?, 'PENDING', 'ESCROW_HOLD')", 
          params: ["PO-2024-001", pembeliId, vendorId, 10200000] },
        { sql: "INSERT INTO PesananSignatures (pesanan_id) VALUES (?)", params: ["PO-2024-001"] },
        
        { sql: "INSERT INTO MutasiStok (id, commodity_id, movement_type, quantity, reason, reference_id, origin_source_name) VALUES (?, ?, 'OUTBOUND', ?, ?, ?, ?)", 
          params: ["MUT-A-01", "BRG-A-01", 5, "REVISION_REPLACEMENT", "PO-2024-001", "Ganti beras basah"] },
        { sql: "INSERT INTO MutasiStok (id, commodity_id, movement_type, quantity, reason, origin_source_name) VALUES (?, ?, 'OUTBOUND', ?, ?, ?)", 
          params: ["MUT-A-02", "BRG-A-02", 2, "SPOILAGE", "Telur pecah di rak"] }
    ];

    try {
        await batchD1(migrationBatch);
        console.log("✅ REBUILD & SEEDING BERHASIL TOTAL!");
        console.log("🌟 Dashboard Ahmad (ACC-VEN-5E1FD92B) sekarang sudah penuh data.");
    } catch (error) {
        console.error("❌ Gagal total:", error.message);
    }
}

forceRebuild();
