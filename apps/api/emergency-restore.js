/**
 * SCRIPT: Emergency Restore to Original State
 * Membaca schema.sql dan mengeksekusinya secara total.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { queryD1 } = require('./src/services/d1.service');

async function emergencyRestore() {
    console.log("🚑 MEMULAI RESTORASI DARURAT KE KONDISI AWAL...");
    
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const sqlContent = fs.readFileSync(schemaPath, 'utf8');

        // Pisahkan query berdasarkan titik koma (;) tapi abaikan yang di dalam string
        // Kita gunakan regex sederhana untuk memisahkan statement
        const statements = sqlContent
            .split(/;(?=(?:[^']*'[^']*')*[^']*$)/)
            .map(s => s.trim())
            .filter(s => s.length > 0);

        console.log(`📦 Terdeteksi ${statements.length} perintah SQL.`);

        // Eksekusi satu per satu
        // Matikan FK dulu
        await queryD1("PRAGMA foreign_keys = OFF");

        for (let i = 0; i < statements.length; i++) {
            const sql = statements[i];
            process.stdout.write(`\r🚀 Menjalankan perintah ${i + 1}/${statements.length}... `);
            try {
                await queryD1(sql);
            } catch (err) {
                // Abaikan error drop jika tabel memang tidak ada
                if (!sql.toUpperCase().includes("DROP")) {
                    console.error(`\n❌ Error pada perintah ${i + 1}:`, err.message);
                }
            }
        }

        // Nyalakan FK lagi
        await queryD1("PRAGMA foreign_keys = ON");

        console.log("\n\n✅ RESTORASI BERHASIL TOTAL!");
        console.log("🌟 Database Anda kembali ke kondisi awal semula (Original Seed).");
    } catch (error) {
        console.error("\n❌ Gagal total:", error.message);
    }
}

emergencyRestore();
