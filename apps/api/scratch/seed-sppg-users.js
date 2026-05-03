require('dotenv').config({ path: '../.env' });
const { queryD1 } = require('../src/services/d1.service');
const bcrypt = require('bcrypt');

async function seedSppgUsers() {
    console.log("🧨 OPERASI SEED-SPPG: Menyuntikkan Akun Admin & QC...");

    const PASS_HASH = bcrypt.hashSync('password123', 10);

    const accounts = [
        {
            id: 'ACC-SPG-32730001', // Bandung
            nik: '3273000000000001',
            nama: 'Admin SPPG Bandung',
            email: 'admin@sppg.go.id',
            telepon: '08111111111',
            role: 'ADMIN',
            wallet: '0xSPG_ADMIN_3273'
        },
        {
            id: 'ACC-SPG-32730002', // Bandung
            nik: '3273000000000002',
            nama: 'QC SPPG Bandung',
            email: 'qc@sppg.go.id',
            telepon: '08222222222',
            role: 'QC',
            wallet: '0xSPG_QC_3273'
        }
    ];

    try {
        for (const acc of accounts) {
            // Delete existing if any
            await queryD1(`DELETE FROM Accounts WHERE email = ?`, [acc.email]);
            
            console.log(`👨‍💼 Menambahkan akun: ${acc.nama} (${acc.role})`);
            await queryD1(`
                INSERT INTO Accounts (id, nik, nama, email, telepon, peran, password_hash, wallet_address)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                acc.id,
                acc.nik,
                acc.nama,
                acc.email,
                acc.telepon,
                acc.role,
                PASS_HASH,
                acc.wallet
            ]);
        }
        
        console.log("✅ SEED SPPG SELESAI!");
        console.log("-----------------------------------------");
        console.log("Gunakan kredensial berikut untuk login:");
        console.log("1. Admin: admin@sppg.go.id / password123");
        console.log("2. QC   : qc@sppg.go.id / password123");
        console.log("-----------------------------------------");

    } catch (error) {
        console.error("❌ SEED GAGAL:", error.message);
    }
}

seedSppgUsers();
