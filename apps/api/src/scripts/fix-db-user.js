/**
 * SCRIPT PENYESUAIAN DATABASE KE BACKEND ASLI USER
 */
require('dotenv').config();
const { queryD1 } = require('../services/d1.service');

async function fixDatabase() {
    console.log("🛠️  Menyesuaikan database D1 dengan kode Backend Anda...");

    try {
        // 1. Buat Tabel Purchase_Orders (SESUAI KODE ANDA)
        console.log("📦 Membuat tabel Purchase_Orders...");
        await queryD1(`
            CREATE TABLE IF NOT EXISTS Purchase_Orders (
                id TEXT PRIMARY KEY,
                vendor_id TEXT NOT NULL,
                sppg_id TEXT NOT NULL,
                total_amount DECIMAL(20, 2) NOT NULL,
                escrow_status TEXT DEFAULT 'ESCROW_HOLD',
                order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                pickup_pin TEXT
            )
        `);

        // 2. Buat Tabel EscrowTransactions (Untuk modul SPK)
        console.log("📦 Membuat tabel EscrowTransactions...");
        await queryD1(`
            CREATE TABLE IF NOT EXISTS EscrowTransactions (
                id TEXT PRIMARY KEY,
                po_id TEXT NOT NULL,
                doku_ref_id TEXT,
                amount DECIMAL(20, 2) NOT NULL,
                status TEXT DEFAULT 'HOLD_3_DAYS',
                qc_approved INTEGER DEFAULT 0,
                admin_approved INTEGER DEFAULT 0,
                logistik_approved INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("✅ Database sudah sinkron dengan kode Backend Anda!");
    } catch (error) {
        console.error("❌ Gagal sinkronisasi database:", error);
    }
}

fixDatabase();
