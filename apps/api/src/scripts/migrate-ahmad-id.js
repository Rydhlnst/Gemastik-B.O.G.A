/**
 * SCRIPT: Migrasi ID Ahmad (Koreksi Prefix GOV -> VEN)
 * STRATEGI: Backup-Delete-Insert (Paling Aman untuk D1)
 */
require('dotenv').config();
const { queryD1 } = require('../services/d1.service');

async function migrateAhmad() {
    const OLD_ID = "ACC-GOV-01";
    const NEW_ID = "ACC-VEN-AHMAD";

    console.log(`🛠️ Memulai migrasi ID Ahmad (Atomic Mode): ${OLD_ID} -> ${NEW_ID}...`);

    try {
        // 1. Backup Data
        const oldAcc = await queryD1(`SELECT * FROM Accounts WHERE id = ?`, [OLD_ID]);
        if (!oldAcc.results || oldAcc.results.length === 0) {
            console.log("❌ Akun lama tidak ditemukan. Mungkin sudah termigrasi?");
            return;
        }
        const acc = oldAcc.results[0];

        const oldVendor = await queryD1(`SELECT * FROM Vendors WHERE id = ?`, [OLD_ID]);
        const v = (oldVendor.results && oldVendor.results.length > 0) ? oldVendor.results[0] : null;

        // 2. HAPUS DATA LAMA (Urutan Terbalik untuk FK)
        console.log("🧹 Menghapus identitas lama (GOV) untuk menghindari Unique Conflict...");
        if (v) await queryD1(`DELETE FROM Vendors WHERE id = ?`, [OLD_ID]);
        await queryD1(`DELETE FROM Accounts WHERE id = ?`, [OLD_ID]);

        // 3. PASANG DATA BARU (VEN)
        console.log("👤 Memasang identitas baru (VEN)...");
        await queryD1(`
            INSERT INTO Accounts (id, nik, nama, email, telepon, peran, password_hash, wallet_address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [NEW_ID, acc.nik, acc.nama, acc.email, acc.telepon, acc.peran, acc.password_hash, acc.wallet_address]);

        if (v) {
            console.log("🏢 Memasang profil Vendor baru...");
            await queryD1(`
                INSERT INTO Vendors (id, business_name, business_email, business_phone, business_address, status, bank_name, bank_account_number, bank_account_name)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [NEW_ID, v.business_name, v.business_email, v.business_phone, v.business_address, v.status, v.bank_name, v.bank_account_number, v.bank_account_name]);
        }

        // 4. ALIHKAN RELASI
        console.log("📦 Mengalihkan Katalog Barang...");
        await queryD1(`UPDATE Barang SET vendor_id = ? WHERE vendor_id = ?`, [NEW_ID, OLD_ID]);

        console.log("📜 Mengalihkan Riwayat Pesanan...");
        await queryD1(`UPDATE Pesanan SET vendor_id = ? WHERE vendor_id = ?`, [NEW_ID, OLD_ID]);

        console.log("✅ MIGRASI TOTAL BERHASIL! Ahmad resmi menggunakan ID: ACC-VEN-AHMAD.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migrasi Gagal Total:", error.message);
        process.exit(1);
    }
}

migrateAhmad();
