// apps/api/src/routes/auth.route.js
const express = require('express');
const { ethers } = require('ethers');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { bogaIdentityContract } = require('../services/blockchain.service');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { queryD1 } = require('../services/d1.service');


// Mapping Enum Role sesuai dengan di Solidity
const ROLE = {
    NONE: 0,
    PENYEDIA: 1, // Vendor
    SPPG: 2,     // Dapur Umum
    PENGANTAR: 3, // Kurir
    SCHOOL: 4
};

// ==========================================
// TAHAP 1: VENDOR SUBMIT PENDAFTARAN (SHADOW WALLET)
// ==========================================
router.post('/register/vendor/submit', async (req, res) => {
    try {
        // 1. Tangkap data dari Postman/Frontend (Tidak ada lagi walletAddress)
        const { 
            emailMitra, password, namaPerusahaan, nibMitra, npwpMitra,
            aktaUrl, skKemenkumhamUrl, dokumenSppgUrl, documentHash 
        } = req.body;

        if (!emailMitra || !password || !nibMitra || !npwpMitra) {
            return res.status(400).json({ error: "Email, Password, NIB, dan NPWP wajib diisi!" });
        }

        console.log(`📥 Mendaftarkan Vendor: ${namaPerusahaan} (${emailMitra})...`);

        // 2. Hash Password (Standar Keamanan Web2)
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 3. Bikin Shadow Wallet (Standar Keamanan Web3/Gasless)
        const randomWallet = ethers.Wallet.createRandom();
        const newWalletAddress = randomWallet.address;
        const newPrivateKey = randomWallet.privateKey;

        console.log(`🪄 Shadow Wallet otomatis dibuat: ${newWalletAddress}`);

        // 4. Eksekusi Query ke Cloudflare D1 (Sesuai schema.sql yang baru)
        const sqlQuery = `
            INSERT INTO vendors (
                email_mitra, password_hash, wallet_address, private_key, document_hash, 
                nama_perusahaan, nib, npwp, akta_url, sk_url, sppg_url, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING_VERIFICATION')
        `;
        
        // Urutan param harus SAMA PERSIS dengan tanda tanya (?) di atas
        const params = [
            emailMitra, passwordHash, newWalletAddress, newPrivateKey, documentHash, 
            namaPerusahaan, nibMitra, npwpMitra, aktaUrl, skKemenkumhamUrl, dokumenSppgUrl
        ];

        // Tembak ke D1 Service
        await queryD1(sqlQuery, params);
        console.log(`✅ Data & Dompet berhasil diukir di Database Cloudflare D1!`);

        // 5. Kirim Balasan ke Frontend
        res.status(201).json({
            message: "Pendaftaran berhasil! Akun B.O.G.A dan Dompet Web3 otomatis telah dibuat.",
            data: {
                email: emailMitra,
                namaPerusahaan: namaPerusahaan,
                walletAddress: newWalletAddress, // Berikan info dompet ini ke Frontend
                status: "PENDING_VERIFICATION"
            }
        });

    } catch (error) {
        console.error("❌ Error submit vendor:", error.message);
        
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: "Gagal! Email, NIB, atau NPWP ini sudah terdaftar." });
        }
        
        res.status(500).json({ error: "Terjadi kesalahan internal server." });
    }
});

// ==========================================
// TAHAP 1.5: VENDOR LOGIN (DAPATKAN TOKEN JWT)
// ==========================================
router.post('/login/vendor', async (req, res) => {
    try {
        const { emailMitra, password } = req.body;

        if (!emailMitra || !password) {
            return res.status(400).json({ error: "Email dan Password wajib diisi!" });
        }

        console.log(`🔑 Mencoba login untuk: ${emailMitra}...`);

        // 1. Cari user di database Cloudflare D1
        const selectQuery = `SELECT * FROM vendors WHERE email_mitra = ?`;
        const dbRes = await queryD1(selectQuery, [emailMitra]);
        const vendor = dbRes.results ? dbRes.results[0] : null;

        // 2. Jika email tidak ditemukan
        if (!vendor) {
            return res.status(401).json({ error: "Email tidak terdaftar." });
        }

        // 3. Verifikasi Password pakai bcrypt
        const isPasswordValid = await bcrypt.compare(password, vendor.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Password salah!" });
        }

        // 4. Bikin Token Keamanan (JWT)
        // Kita masukan ID, Email, dan Role ke dalam token ini
        const token = jwt.sign(
            { 
                id: vendor.id, 
                email: vendor.email_mitra, 
                role: 'PENYEDIA' 
            },
            process.env.JWT_SECRET, // Pakai kunci rahasia dari .env
            { expiresIn: '24h' } // Token hangus dalam 24 jam
        );

        console.log(`✅ Login sukses! Token JWT diterbitkan untuk ${vendor.nama_perusahaan}`);

        // 5. Kirim balasan ke Frontend
        res.status(200).json({
            message: "Login Berhasil!",
            token: token, // Frontend wajib menyimpan token ini (biasanya di LocalStorage)
            data: {
                namaPerusahaan: vendor.nama_perusahaan,
                email: vendor.email_mitra,
                walletAddress: vendor.wallet_address, // Kirim Public Address-nya aja, JANGAN Private Key-nya!
                status: vendor.status
            }
        });

    } catch (error) {
        console.error("❌ Error login vendor:", error.message);
        res.status(500).json({ error: "Terjadi kesalahan internal server." });
    }
});

// ==========================================
// TAHAP 2: ADMIN BGN APPROVE & MINT SBT (SHADOW WALLET VERSION)
// ==========================================
router.post('/admin/approve/vendor', async (req, res) => {
    try {
        // 1. Tangkap Email, BUKAN Wallet Address lagi
        const { emailMitra } = req.body;

        if (!emailMitra) {
            return res.status(400).json({ error: "Email vendor wajib dikirim!" });
        }

        console.log(`🔍 Mengecek data Vendor dengan email: ${emailMitra} di D1...`);

        // 2. Cari data lengkap Vendor di D1 berdasarkan Email
        const selectQuery = `SELECT * FROM vendors WHERE email_mitra = ?`;
        const dbRes = await queryD1(selectQuery, [emailMitra]);
        const vendor = dbRes.results ? dbRes.results[0] : null;

        if (!vendor) {
            return res.status(404).json({ error: "Vendor tidak ditemukan di database D1." });
        }
        if (vendor.status !== "PENDING_VERIFICATION") {
            return res.status(400).json({ error: `Gagal! Status vendor saat ini: ${vendor.status}` });
        }

        console.log(`⏳ Vendor ditemukan: ${vendor.nama_perusahaan}.`);
        console.log(`🔑 Menggunakan Shadow Wallet: ${vendor.wallet_address}. Mengeksekusi Blockchain...`);

        // 3. Eksekusi Blockchain (Web3) pakai Shadow Wallet yang ada di D1!
        const tx = await bogaIdentityContract.mintIdentity(
            vendor.wallet_address, // <-- Narik dari database, bukan dari input user!
            ROLE.PENYEDIA, 
            vendor.document_hash
        );
        const receipt = await tx.wait();

        console.log(`✅ SBT Dicetak! Mengupdate status D1 menjadi ACTIVE...`);

        // 4. Update Status di Database D1
        const updateQuery = `UPDATE vendors SET status = 'ACTIVE' WHERE email_mitra = ?`;
        await queryD1(updateQuery, [emailMitra]);

        res.status(200).json({
            message: "Vendor berhasil diverifikasi. Lencana Blockchain telah diterbitkan ke Shadow Wallet!",
            data: {
                namaPerusahaan: vendor.nama_perusahaan,
                email: vendor.email_mitra,
                walletAddress: vendor.wallet_address,
                status: "ACTIVE",
                transactionHash: receipt.hash
            }
        });

    } catch (error) {
        console.error("❌ Error approval vendor:", error.message);
        
        if (error.message.includes("AlreadyHasIdentity")) {
            return res.status(400).json({ error: "Dompet bayangan ini sudah memiliki Lencana!" });
        }
        
        res.status(500).json({ error: "Gagal memproses verifikasi." });
    }
});

// ==========================================
// TAHAP 3: LIHAT PROFIL (CONTOH RUTE DIGEMBOK)
// ==========================================
// Perhatikan kita menyelipkan 'authenticateToken' di tengah-tengah
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        // req.user ini isinya otomatis dapet dari Satpam JWT tadi!
        const email = req.user.email; 

        // Tarik data dompet dan status dari Database
        const dbRes = await queryD1(`SELECT nama_perusahaan, wallet_address, status FROM vendors WHERE email_mitra = ?`, [email]);
        const vendor = dbRes.results[0];

        res.status(200).json({
            message: "Selamat datang di area rahasia Vendor!",
            data: {
                roleKamu: req.user.role,
                nama: vendor.nama_perusahaan,
                dompet: vendor.wallet_address,
                status: vendor.status
            }
        });
    } catch (error) {
        res.status(500).json({ error: "Gagal mengambil profil" });
    }
});

module.exports = router;