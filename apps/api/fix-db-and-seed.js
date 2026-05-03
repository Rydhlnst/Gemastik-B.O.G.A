/**
 * SCRIPT: Fix Database & Seed (Alter Table Version)
 * Menambahkan kolom yang kurang tanpa menghapus tabel (Aman dari FK Error).
 */
require('dotenv').config();
const { queryD1 } = require('./src/services/d1.service');

async function fixAndSeed() {
    const vendorId = "ACC-VEN-5E1FD92B";
    const pembeliId = "ACC-GOV-ROOT";

    console.log("🛠️ Memperbaiki kolom & nanam data Ahmad...");

    try {
        // 1. Tambahkan kolom yang kurang di Barang (jika belum ada)
        console.log("📝 Memastikan kolom tabel Barang...");
        try { await queryD1("ALTER TABLE Barang ADD COLUMN category TEXT"); } catch(e) {}
        try { await queryD1("ALTER TABLE Barang ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP"); } catch(e) {}

        // 2. Tambahkan kolom yang kurang di MutasiStok
        console.log("📝 Memastikan kolom tabel MutasiStok...");
        try { await queryD1("ALTER TABLE MutasiStok ADD COLUMN reason TEXT"); } catch(e) {}
        try { await queryD1("ALTER TABLE MutasiStok ADD COLUMN reference_id TEXT"); } catch(e) {}

        // 3. Tambahkan kolom yang kurang di Pesanan
        console.log("📝 Memastikan kolom tabel Pesanan...");
        try { await queryD1("ALTER TABLE Pesanan ADD COLUMN vendor_status TEXT"); } catch(e) {}
        try { await queryD1("ALTER TABLE Pesanan ADD COLUMN pickup_pin TEXT"); } catch(e) {}
        try { await queryD1("ALTER TABLE Pesanan ADD COLUMN revision_note TEXT"); } catch(e) {}

        // 4. Bersihkan data lama (Hanya barisnya, bukan tabelnya)
        console.log("🧹 Membersihkan data lama...");
        await queryD1("DELETE FROM PesananSignatures");
        await queryD1("DELETE FROM ItemPesanan");
        await queryD1("DELETE FROM MutasiStok");
        await queryD1("DELETE FROM Pesanan");
        await queryD1("DELETE FROM Barang");

        // 5. Tanam Data Ahmad
        console.log("🌱 Menanam data Ahmad...");
        await queryD1("INSERT INTO Barang (id, vendor_id, name, harga, unit, current_stock, category) VALUES (?, ?, ?, ?, ?, ?, ?)", 
            ["BRG-A-01", vendorId, "Beras Pandan Wangi Super", 15000, "Kg", 5000, "Karbohidrat"]);
        await queryD1("INSERT INTO Barang (id, vendor_id, name, harga, unit, current_stock, category) VALUES (?, ?, ?, ?, ?, ?, ?)", 
            ["BRG-A-02", vendorId, "Telur Ayam Ras", 28000, "Kg", 1200, "Protein Hewani"]);
        
        await queryD1("INSERT INTO Pesanan (id, pembeli_id, vendor_id, total_harga, status, escrow_status) VALUES (?, ?, ?, ?, 'PENDING', 'ESCROW_HOLD')", 
            ["PO-2024-001", pembeliId, vendorId, 10200000]);
        await queryD1("INSERT INTO PesananSignatures (pesanan_id) VALUES (?)", ["PO-2024-001"]);
        
        await queryD1("INSERT INTO MutasiStok (id, commodity_id, movement_type, quantity, reason, reference_id, origin_source_name) VALUES (?, ?, 'OUTBOUND', ?, ?, ?, ?)", 
            ["MUT-A-01", "BRG-A-01", 5, "REVISION_REPLACEMENT", "PO-2024-001", "Ganti beras basah"]);
        await queryD1("INSERT INTO MutasiStok (id, commodity_id, movement_type, quantity, reason, origin_source_name) VALUES (?, ?, 'OUTBOUND', ?, ?, ?)", 
            ["MUT-A-02", "BRG-A-02", 2, "SPOILAGE", "Telur pecah di rak"]);

        console.log("✅ DATABASE FIXED & SEEDING BERHASIL!");
        console.log("🌟 Ahmad (ACC-VEN-5E1FD92B) sekarang punya data riil.");

    } catch (error) {
        console.error("❌ Gagal:", error.message);
    }
}

fixAndSeed();
