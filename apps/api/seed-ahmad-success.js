/**
 * SCRIPT: Seed Skenario Sukses Ahmad
 * HANYA INSERT DATA, TIDAK HAPUS TABEL.
 */
require('dotenv').config();
const { queryD1 } = require('./src/services/d1.service');

async function seedAhmadSuccess() {
    const ahmadId = "ACC-VEN-AHMAD"; // ID Ahmad Haji Dadang (VENDOR)
    const pembeliId = "ACC-GOV-ROOT";
    const poId = `PO-AHMAD-SUCCESS-${Date.now().toString(36).toUpperCase()}`;
    
    console.log(`🚀 Menanam skenario sukses untuk Ahmad (${ahmadId})...`);

    try {
        // 1. Tambah Pesanan (Status COMPLETED & RELEASED)
        await queryD1(`
            INSERT INTO Pesanan (id, pembeli_id, vendor_id, total_harga, status, escrow_status, updated_at)
            VALUES (?, ?, ?, ?, 'COMPLETED', 'RELEASED', CURRENT_TIMESTAMP)
        `, [poId, pembeliId, ahmadId, 7500000]);

        // 2. Tambah Detail Item (Beras Pandan Wangi)
        await queryD1(`
            INSERT INTO ItemPesanan (id, pesanan_id, barang_id, kuantitas, harga_saat_itu)
            VALUES (?, ?, ?, ?, ?)
        `, [`ITM-${poId}-1`, poId, "BRG-A-01", 500, 15000]);

        // 3. Tambah Tanda Tangan (Semua SIGNED)
        const now = new Date().toISOString();
        await queryD1(`
            INSERT INTO PesananSignatures (
                pesanan_id, qc_status, qc_signed_at, 
                admin_status, admin_signed_at, 
                logistik_status, logistik_signed_at
            ) VALUES (?, 'SIGNED', ?, 'SIGNED', ?, 'SIGNED', ?)
        `, [poId, now, now, now]);

        // 4. Tambah Riwayat Outbound (Mutasi Stok)
        await queryD1(`
            INSERT INTO MutasiStok (
                id, commodity_id, movement_type, quantity, reason, 
                reference_id, origin_source_name, created_at
            ) VALUES (?, ?, 'OUTBOUND', ?, 'PO_FULFILLMENT', ?, 'Pemenuhan PO Sukses', ?)
        `, [`MUT-SUC-${poId}`, "BRG-A-01", 500, poId, now]);

        console.log("✅ SKENARIO SUKSES AHMAD BERHASIL DITANAM!");
        console.log(`🌟 PO ID: ${poId}`);
        console.log("Ahmad sekarang punya riwayat pesanan sukses dan outbound.");
    } catch (error) {
        console.error("❌ Gagal menanam skenario:", error.message);
    }
}

seedAhmadSuccess();
