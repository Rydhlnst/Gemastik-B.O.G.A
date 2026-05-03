/**
 * SCRIPT: TOTAL RESET & PROFESSIONAL SEEDING (CUSTOM IDS)
 * FORMAT ID: ACC-[ROLE]-[PP][CC][NNNN]
 * Lokasi: 3273 (Bandung), 3201 (Bogor), 3171 (Jakpus), 3174 (Jaksel)
 */
require('dotenv').config();
const { queryD1 } = require('../services/d1.service');
const bcrypt = require('bcrypt');

async function powerSeed() {
    console.log("🧨 OPERASI BOGA-RESET: Memulai pembersihan data total...");

    const PASS_HASH = bcrypt.hashSync('password123', 10);

    try {
        // 1. CLEANING DENGAN URUTAN TERBAIK (Anti-FK Fail)
        const tables = [
            'Ulasan', 'MutasiStok', 'ItemPesanan', 
            'PesananSignatures', 'Pesanan', 'Barang', 
            'Vendors', 'Accounts'
        ];
        
        for (const table of tables) {
            console.log(`🧹 Membersihkan isi tabel: ${table}...`);
            await queryD1(`DELETE FROM ${table}`);
        }

        console.log("✨ Database Bersih! Memulai pembangunan ulang identitas...");

        // 2. SEED ACCOUNTS & VENDORS
        const people = [
            {
                id: 'ACC-VEN-32730001', // Bandung
                nama: 'Ahmad Haji Dadang',
                email: 'ahmad.h@boga.go.id',
                role: 'VENDOR',
                business: 'PT. Pangan Nusantara Gedebage',
                address: 'Jl. Soekarno-Hatta No. 100, Bandung',
                wallet: '0xVEN_AHMAD_3273'
            },
            {
                id: 'ACC-VEN-32010001', // Bogor
                nama: 'Haji Dadang Sudrajat',
                email: 'dadang@pangan.com',
                role: 'VENDOR',
                business: 'CV. Berkah Sembako Bogor',
                address: 'Jl. Raya Tajur No. 45, Bogor',
                wallet: '0xVEN_DADANG_3201'
            },
            {
                id: 'ACC-GOV-32010001', // Bogor
                nama: 'SPPG Kabupaten Bogor',
                email: 'sppg.bogor@boga.go.id',
                role: 'PEMERINTAH',
                wallet: '0xGOV_BOGOR'
            },
            {
                id: 'ACC-GOV-31710001', // Jakarta Pusat
                nama: 'SPPG Pusat Jakarta',
                email: 'admin@boga.go.id',
                role: 'PEMERINTAH',
                wallet: '0xGOV_PUSAT'
            }
        ];

        for (const p of people) {
            console.log(`👤 Mendaftarkan: ${p.nama} [${p.id}]`);
            // Account
            await queryD1(`
                INSERT INTO Accounts (id, nik, nama, email, telepon, peran, password_hash, wallet_address)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [p.id, '32' + Math.floor(Math.random()*1e14), p.nama, p.email, '0812' + Math.floor(Math.random()*1e8), p.role, PASS_HASH, p.wallet]);

            // Profile Vendor (Jika Role VENDOR)
            if (p.role === 'VENDOR') {
                await queryD1(`
                    INSERT INTO Vendors (
                        id, business_name, business_email, business_phone, business_address,
                        latitude, longitude, npwp_number, nib_number, logo_url,
                        akta_document_url, akta_document_hash, sk_kemenkumham_url, sk_kemenkumham_hash,
                        npwp_document_url, npwp_document_hash, nib_document_url, nib_document_hash,
                        sppg_readiness_document_url, sppg_readiness_document_hash,
                        bank_name, bank_account_number, bank_account_name, status
                    ) VALUES (
                        ?, ?, ?, '021-5556677', ?, 
                        -6.914, 107.609, '01.234.567.8', '1234567890', 'https://r2.boga.id/logo.png',
                        '#', 'hash', '#', 'hash', '#', 'hash', '#', 'hash', '#', 'hash',
                        'Bank Mandiri', '12345678', ?, 'APPROVED'
                    )
                `, [p.id, p.business, p.email, p.address, p.nama]);
            }
        }

        // 3. SEED KATALOG (Barang)
        console.log("📦 Mengisi Katalog Produk Profesional...");
        const items = [
            { id: 'BRG-3273-001', v: 'ACC-VEN-32730001', n: 'Beras Pandan Wangi Cianjur', p: 15000, s: 5000 },
            { id: 'BRG-3273-002', v: 'ACC-VEN-32730001', n: 'Minyak Goreng Sawit Premium', p: 18000, s: 2000 },
            { id: 'BRG-3201-001', v: 'ACC-VEN-32010001', n: 'Telur Ayam Ras Bogor', p: 28000, s: 1000 },
            { id: 'BRG-3201-002', v: 'ACC-VEN-32010001', n: 'Daging Ayam Segar Potong', p: 35000, s: 500 }
        ];

        for (const i of items) {
            await queryD1(`
                INSERT INTO Barang (id, vendor_id, pihps_id, name, harga, unit, current_stock, is_active)
                VALUES (?, ?, 'PIHPS-MASTER', ?, ?, ?, ?, 1)
            `, [i.id, i.v, i.n, i.p, 'Kg', i.s]);
        }

        // 4. SEED TRANSAKSI (Pesanan)
        console.log("📜 Membangun Riwayat Transaksi Global...");
        const poId = 'PO-3201-3273-001';
        await queryD1(`
            INSERT INTO Pesanan (id, pembeli_id, vendor_id, total_harga, status, escrow_status)
            VALUES (?, ?, ?, ?, 'COMPLETED', 'RELEASED')
        `, [poId, 'ACC-GOV-32010001', 'ACC-VEN-32730001', 1500000]);

        await queryD1(`
            INSERT INTO ItemPesanan (id, pesanan_id, barang_id, kuantitas, harga_saat_itu)
            VALUES (?, ?, ?, ?, ?)
        `, ['ITM-001', poId, 'BRG-3273-001', 100, 15000]);

        await queryD1(`
            INSERT INTO PesananSignatures (pesanan_id, qc_status, admin_status, logistik_status)
            VALUES (?, 'SIGNED', 'SIGNED', 'SIGNED')
        `, [poId]);

        // 5. SEED MUTASI STOK
        console.log("📊 Sinkronisasi Mutasi & Stok...");
        await queryD1(`
            INSERT INTO MutasiStok (id, commodity_id, movement_type, quantity, reason)
            VALUES ('MUT-001', 'BRG-3273-001', 'INBOUND', 5000, 'Saldo Awal Seeding')
        `);
        await queryD1(`
            INSERT INTO MutasiStok (id, commodity_id, movement_type, quantity, reason, reference_id)
            VALUES ('MUT-002', 'BRG-3273-001', 'OUTBOUND', 100, 'Pengiriman PO-3201-3273-001', ?)
        `, [poId]);

        console.log("✅ MISI SELESAI! Database B.O.G.A kini bersih, profesional, dan informatif.");
        process.exit(0);

    } catch (error) {
        console.error("❌ OPERASI GAGAL:", error.message);
        process.exit(1);
    }
}

powerSeed();
