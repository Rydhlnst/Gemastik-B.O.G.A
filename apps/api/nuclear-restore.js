/**
 * SCRIPT: Nuclear Restore (The Final Solution)
 * Membersihkan database sampai ke akar-akarnya dan membangun ulang dari schema.sql.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { batchD1 } = require('./src/services/d1.service');

async function nuclearRestore() {
    console.log("☢️ MEMULAI NUCLEAR RESTORE (PEMBERSIHAN TOTAL)...");
    
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const sqlContent = fs.readFileSync(schemaPath, 'utf8');

        // Pisahkan query berdasarkan titik koma (;)
        const statements = sqlContent
            .split(/;(?=(?:[^']*'[^']*')*[^']*$)/)
            .map(s => s.trim())
            .filter(s => s.length > 0);

        console.log(`📦 Mempersiapkan ${statements.length} perintah dalam satu BATCH...`);

        // Masukkan perintah penonaktifan FK di awal dan pengaktifan di akhir
        const finalBatch = [
            { sql: "PRAGMA foreign_keys = OFF;" },
            ...statements.map(s => ({ sql: s })),
            { sql: "PRAGMA foreign_keys = ON;" }
        ];

        await batchD1(finalBatch);

        // EXTRA: Tambahkan kolom yang tadi kita identifikasi dibutuhkan oleh Kode API terbaru
        console.log("🛠️ Sinkronisasi kolom tambahan (target_stock, price_per_unit)...");
        await batchD1([
            { sql: "ALTER TABLE Barang ADD COLUMN target_stock REAL DEFAULT 0;" },
            { sql: "ALTER TABLE MutasiStok ADD COLUMN price_per_unit REAL DEFAULT 0;" }
        ]);

        console.log("✅ NUCLEAR RESTORE BERHASIL!");
        console.log("🌟 Database Anda sekarang bersih, sinkron, dan siap untuk CRUD!");
    } catch (error) {
        console.error("❌ Gagal total:", error.message);
    }
}

nuclearRestore();
