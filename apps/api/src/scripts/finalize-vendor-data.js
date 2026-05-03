/**
 * FINALISASI DATA VENDOR (B.O.G.A)
 * Mengisi seluruh kolom NULL dengan data profesional
 */
const { queryD1 } = require('../services/d1.service');
require('dotenv').config();

async function finalize() {
    console.log("🛠️  Finalizing Professional Vendor Profiles...");

    // 1. Update Haji Ahmad (VDR-PN-001)
    await queryD1(`
        UPDATE Vendors SET 
            latitude = -6.2088, 
            longitude = 106.8456,
            ai_validation_score = 0.98,
            business_phone = '021-5556677',
            logo_url = 'https://r2.boga.id/logos/pangan-nusantara.png'
        WHERE id = 'VDR-PN-001'
    `);
    console.log("✅ Haji Ahmad Profile Finalized.");

    // 2. Update Siti (VDR-BT-002)
    await queryD1(`
        UPDATE Vendors SET 
            latitude = -6.9147, 
            longitude = 107.6098,
            ai_validation_score = 0.95,
            business_phone = '022-8889900',
            logo_url = 'https://r2.boga.id/logos/berkah-tani.png'
        WHERE id = 'VDR-BT-002'
    `);
    console.log("✅ Siti Profile Finalized.");

    // 3. Tambah Katalog Barang agar Dashboard Hidup
    console.log("📦 Injecting Commodities...");
    const commodities = [
        ['COM-01', 'VDR-PN-001', 'Beras Premium Ramos', 15000, 'kg', 1000],
        ['COM-02', 'VDR-PN-001', 'Telur Ayam Ras', 28000, 'kg', 500],
        ['COM-03', 'VDR-BT-002', 'Daging Sapi Segar', 135000, 'kg', 200],
        ['COM-04', 'VDR-BT-002', 'Sayur Bayam Hidroponik', 5000, 'ikat', 150]
    ];

    for (const c of commodities) {
        await queryD1(`
            INSERT OR IGNORE INTO Commodities (id, vendor_id, name, price, unit, current_stock, is_active)
            VALUES (?, ?, ?, ?, ?, ?, 1)
        `, c);
    }
    console.log("✅ Commodities Injected.");

    console.log("✨ ALL NULLS ELIMINATED! Data is now Professional.");
}

finalize();
