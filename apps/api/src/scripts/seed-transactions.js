/**
 * SEED TRANSAKSI VENDOR (B.O.G.A)
 * Mengisi data transaksi historis untuk keperluan visualisasi dashboard
 */
const { queryD1 } = require('../services/d1.service');
require('dotenv').config();

const SEED_ORDERS = [
    // Haji Ahmad (VDR-PN-001) - Tren Naik
    { id: 'PO-2026-A1', vendor_id: 'VDR-PN-001', sppg_id: 'SDN 01 Menteng', amount: 4500000, date: '2026-03-01' },
    { id: 'PO-2026-A2', vendor_id: 'VDR-PN-001', sppg_id: 'SDN 01 Menteng', amount: 5200000, date: '2026-03-15' },
    { id: 'PO-2026-A3', vendor_id: 'VDR-PN-001', sppg_id: 'SMPN 2 Jakarta', amount: 8100000, date: '2026-04-05' },
    { id: 'PO-2026-A4', vendor_id: 'VDR-PN-001', sppg_id: 'SDN 01 Menteng', amount: 7400000, date: '2026-04-20' },
    { id: 'PO-2026-A5', vendor_id: 'VDR-PN-001', sppg_id: 'SDN 01 Menteng', amount: 3200000, date: '2026-05-01' },
    
    // CV Berkah Tani (VDR-BT-002) - Tren Stabil
    { id: 'PO-2026-B1', vendor_id: 'VDR-BT-002', sppg_id: 'SMA 70 Jakarta', amount: 12000000, date: '2026-03-10' },
    { id: 'PO-2026-B2', vendor_id: 'VDR-BT-002', sppg_id: 'SMA 70 Jakarta', amount: 11500000, date: '2026-04-12' },
    { id: 'PO-2026-B3', vendor_id: 'VDR-BT-002', sppg_id: 'SMA 70 Jakarta', amount: 14000000, date: '2026-05-01' },
];

async function seed() {
    console.log("🚀 Seeding Purchase Orders to Cloud D1...");
    
    for (const po of SEED_ORDERS) {
        try {
            await queryD1(
                `INSERT OR IGNORE INTO Purchase_Orders (id, vendor_id, sppg_id, total_amount, order_date) 
                 VALUES (?, ?, ?, ?, ?)`,
                [po.id, po.vendor_id, po.sppg_id, po.amount, po.date]
            );
            console.log(`✅ PO ${po.id} seeded.`);
        } catch (e) {
            console.error(`❌ Failed PO ${po.id}:`, e.message);
        }
    }
    
    console.log("✨ Seeding completed!");
}

seed();
