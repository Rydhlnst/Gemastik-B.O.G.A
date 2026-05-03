/**
 * SCRIPT PERBAIKAN DATABASE B.O.G.A
 * Menjalankan migrasi untuk tabel yang hilang dan menyelaraskan nama tabel.
 */
require('dotenv').config();
const { queryD1 } = require('../services/d1.service');

async function fixDatabase() {
    console.log("🛠️  Memulai perbaikan database di Cloudflare D1...");

    try {
        // 1. Buat Tabel PurchaseOrders (Jika belum ada)
        console.log("📦 Membuat/Memastikan tabel PurchaseOrders...");
        await queryD1(`
            CREATE TABLE IF NOT EXISTS PurchaseOrders (
                id VARCHAR(50) PRIMARY KEY,
                sppg_id VARCHAR(50) NOT NULL,
                vendor_id VARCHAR(50) NOT NULL,
                status VARCHAR(50) DEFAULT 'PENDING',
                total_amount DECIMAL(15, 2) NOT NULL,
                pickup_pin VARCHAR(10),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Buat Tabel PurchaseOrderItems (Jika belum ada)
        console.log("📦 Membuat/Memastikan tabel PurchaseOrderItems...");
        await queryD1(`
            CREATE TABLE IF NOT EXISTS PurchaseOrderItems (
                id VARCHAR(50) PRIMARY KEY,
                po_id VARCHAR(50) NOT NULL,
                commodity_id VARCHAR(50) NOT NULL,
                item_id VARCHAR(50), -- Kompatibilitas dengan spk.route.js
                quantity DECIMAL(15, 2) NOT NULL,
                price_at_purchase DECIMAL(15, 2) NOT NULL,
                subtotal DECIMAL(15, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 3. Buat Tabel EscrowTransactions (Yang Ghaib)
        console.log("📦 Membuat tabel EscrowTransactions...");
        await queryD1(`
            CREATE TABLE IF NOT EXISTS EscrowTransactions (
                id VARCHAR(50) PRIMARY KEY,
                po_id VARCHAR(50) NOT NULL,
                doku_ref_id VARCHAR(255),
                amount DECIMAL(15, 2) NOT NULL,
                status VARCHAR(50) DEFAULT 'HOLD_3_DAYS',
                qc_approved INTEGER DEFAULT 0,
                admin_approved INTEGER DEFAULT 0,
                logistik_approved INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("✅ Database berhasil diperbaiki!");
    } catch (error) {
        console.error("❌ Gagal memperbaiki database:", error);
    }
}

fixDatabase();
