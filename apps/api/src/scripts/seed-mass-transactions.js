/**
 * MASSIVE TRANSACTION SEEDER (B.O.G.A)
 * Menghasilkan ratusan transaksi selama 1 tahun terakhir
 */
const { queryD1 } = require('../services/d1.service');
require('dotenv').config();

async function massSeed() {
    console.log("🚀 Initializing Massive Seeding (1 Year Data)...");
    
    const vendors = [
        { id: 'VDR-PN-001', name: 'Haji Ahmad', baseAmount: 5000000 },
        { id: 'VDR-BT-002', name: 'Siti', baseAmount: 8000000 }
    ];

    const now = new Date();
    let totalInserted = 0;

    for (const vendor of vendors) {
        console.log(`📦 Generating transactions for ${vendor.name}...`);
        
        // Loop mundur 365 hari
        for (let i = 365; i >= 0; i--) {
            // Kita buat transaksi setiap 2-3 hari sekali secara acak
            if (Math.random() > 0.6) {
                const date = new Date();
                date.setDate(now.getDate() - i);
                const dateString = date.toISOString().split('T')[0];

                // Randomize amount (base +/- 40%)
                const variance = (Math.random() * 0.8) + 0.6; // 0.6 to 1.4
                const amount = Math.floor(vendor.baseAmount * variance);
                const poId = `PO-MASS-${vendor.id.split('-')[1]}-${i}`;

                try {
                    await queryD1(
                        `INSERT OR IGNORE INTO Purchase_Orders (id, vendor_id, sppg_id, total_amount, order_date) 
                         VALUES (?, ?, ?, ?, ?)`,
                        [poId, vendor.id, 'SPPG-CENTRAL', amount, dateString]
                    );
                    totalInserted++;
                } catch (e) {
                    // Ignore errors for speed
                }
            }
        }
    }

    console.log(`✨ SUCCESS! ${totalInserted} transactions injected across 1 year.`);
}

massSeed();
