/**
 * SCRIPT: Restore DB Total (V4 - THE GIANT STRING)
 * Menggabungkan semua query jadi satu string panjang dipisahkan titik koma.
 */
require('dotenv').config();
const { queryD1 } = require('./src/services/d1.service');

async function restoreV4() {
    const vendorId = "ACC-VEN-5E1FD92B";
    const pembeliId = "ACC-GOV-ROOT";
    
    console.log("🏗️ Merestorasi database Ahmad (V4 - THE GIANT STRING)...");

    // Gabungkan semua jadi satu string raksasa
    const giantSql = `
        PRAGMA foreign_keys = OFF;
        DELETE FROM Ulasan;
        DELETE FROM ItemPesanan;
        DELETE FROM MutasiStok;
        DELETE FROM PesananSignatures;
        DELETE FROM Pesanan;
        DELETE FROM Barang;
        INSERT INTO Barang (id, vendor_id, pihps_id, name, harga, unit, current_stock, category) VALUES ('BRG-A-01', '${vendorId}', 'PIHPS-BERAS', 'Beras Pandan Wangi Super', 15000, 'Kg', 5000, 'Karbohidrat');
        INSERT INTO Barang (id, vendor_id, pihps_id, name, harga, unit, current_stock, category) VALUES ('BRG-A-02', '${vendorId}', 'PIHPS-TELUR', 'Telur Ayam Ras', 28000, 'Kg', 1200, 'Protein Hewani');
        INSERT INTO Pesanan (id, pembeli_id, vendor_id, total_harga, status, escrow_status) VALUES ('PO-2024-001', '${pembeliId}', '${vendorId}', 10200000, 'PENDING', 'ESCROW_HOLD');
        INSERT INTO PesananSignatures (pesanan_id) VALUES ('PO-2024-001');
        INSERT INTO MutasiStok (id, commodity_id, movement_type, quantity, reason, reference_id, origin_source_name) VALUES ('MUT-A-01', 'BRG-A-01', 'OUTBOUND', 5, 'REVISION_REPLACEMENT', 'PO-2024-001', 'Ganti beras basah');
        INSERT INTO MutasiStok (id, commodity_id, movement_type, quantity, reason, origin_source_name) VALUES ('MUT-A-02', 'BRG-A-01', 'OUTBOUND', 2, 'SPOILAGE', 'Beras tumpah di gudang');
        PRAGMA foreign_keys = ON;
    `;

    try {
        await queryD1(giantSql);
        console.log("✅ RESTORASI V4 BERHASIL TOTAL!");
        console.log("🌟 Dashboard Ahmad sekarang pasti penuh riwayat.");
    } catch (e) {
        console.error("❌ Gagal:", e.message);
    }
}

restoreV4();
