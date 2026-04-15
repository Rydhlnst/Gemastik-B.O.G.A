const express = require('express');
const router = express.Router();
const { queryD1 } = require('../services/d1.service'); 
const { authenticateToken } = require('../middlewares/auth.middleware');

// ==========================================
// FASE 1: SPPG MENGIRIM DRAFT SPK KE VENDOR
// (Route ini tanpa JWT Token untuk mempermudah simulasi test)
// ==========================================
router.post('/draft', async (req, res) => {
    try {
        // Anggap data ini dikirim oleh Aplikasi SPPG saat Checkout
        const { vendorId, katalogId, jumlahPesanan, tanggalKebutuhan } = req.body;

        if (!vendorId || !katalogId || !jumlahPesanan || !tanggalKebutuhan) {
            return res.status(400).json({ error: "Data pesanan tidak lengkap!" });
        }

        // 1. Cek dulu, apakah barangnya beneran ada di E-Katalog dan harganya 'SAFE'?
        const dbKatalog = await queryD1(`
            SELECT nama_menu, harga_per_porsi, status_harga 
            FROM katalog_vendor 
            WHERE id = ? AND vendor_id = ?
        `, [katalogId, vendorId]);

        if (dbKatalog.results.length === 0) {
            return res.status(404).json({ error: "Barang tidak ditemukan di katalog Vendor ini." });
        }

        const barang = dbKatalog.results[0];

        // 2. Cegah SPPG beli barang yang udah di-Markup (Fitur Anti-Korupsi berjalan!)
        if (barang.status_harga === 'MARKUP_DETECTED') {
            return res.status(403).json({ 
                error: "DIBLOKIR SISTEM!", 
                message: "SPPG dilarang membeli barang yang terindikasi Mark-up Anggaran Negara." 
            });
        }

        // 3. Hitung Total Harga Kontrak
        const totalHarga = barang.harga_per_porsi * jumlahPesanan;

        // 4. Buat Draft SPK di Database
        await queryD1(`
            INSERT INTO kontrak_spk (vendor_id, katalog_id, jumlah_pesanan, total_harga, tanggal_kebutuhan, status) 
            VALUES (?, ?, ?, ?, ?, 'DRAFT')
        `, [vendorId, katalogId, jumlahPesanan, totalHarga, tanggalKebutuhan]);

        res.status(201).json({
            message: "Draft SPK berhasil dikirim ke Vendor!",
            data: {
                menu: barang.nama_menu,
                jumlahPesanan: `${jumlahPesanan} Porsi`,
                totalHarga: `Rp ${totalHarga}`,
                status: "DRAFT (Menunggu Persetujuan Vendor)"
            }
        });

    } catch (error) {
        console.error("❌ Error buat Draft SPK:", error.message);
        res.status(500).json({ error: "Gagal membuat Draft SPK." });
    }
});

// ==========================================
// FASE 2: VENDOR SETUJU KONTRAK & POTONG STOK (ANTI STOK GAIB)
// ==========================================
router.put('/:id/approve', authenticateToken, async (req, res) => {
    try {
        const vendorId = req.user.id; // Dari Token JWT Vendor
        const spkId = req.params.id; // Dari URL param (misal: /api/spk/1/approve)

        console.log(`🛡️ Memvalidasi Persetujuan SPK ID: ${spkId} oleh Vendor ID: ${vendorId}`);

        // 1. Ambil Data SPK
        const dbSpk = await queryD1(`SELECT * FROM kontrak_spk WHERE id = ? AND vendor_id = ? AND status = 'DRAFT'`, [spkId, vendorId]);
        
        if (dbSpk.results.length === 0) {
            return res.status(404).json({ error: "Draft SPK tidak ditemukan atau sudah diproses." });
        }

        const spk = dbSpk.results[0];

        // ========================================================
        // 🚨 LOGIKA SMART LEDGER (SIMULASI KEBUTUHAN BAHAN) 🚨
        // Asumsi hackathon: 1 Porsi butuh 0.1 Kg (100 gram) Beras
        // ========================================================
        const KEBUTUHAN_BERAS_PER_PORSI = 0.1;
        const totalBerasDibutuhkan = spk.jumlah_pesanan * KEBUTUHAN_BERAS_PER_PORSI; 

        // 2. CEK STOK GUDANG (ANTI-STOK GAIB)
        const dbStok = await queryD1(`SELECT total_kg FROM stock_balances WHERE vendor_id = ? AND nama_bahan = 'Beras'`, [vendorId]);

        const stokBerasSaatIni = dbStok.results.length > 0 ? dbStok.results[0].total_kg : 0;

        if (stokBerasSaatIni < totalBerasDibutuhkan) {
            return res.status(403).json({
                error: "TRANSAKSI DITOLAK: INDIKASI STOK FIKTIF!",
                message: `Anda butuh ${totalBerasDibutuhkan} kg Beras untuk ${spk.jumlah_pesanan} porsi, tapi stok di sistem Anda hanya ${stokBerasSaatIni} kg.`
            });
        }

        // 3. JIKA LOLOS: POTONG STOK (OUTBOUND)
        await queryD1(`
            UPDATE stock_balances 
            SET total_kg = total_kg - ?, last_updated = CURRENT_TIMESTAMP 
            WHERE vendor_id = ? AND nama_bahan = 'Beras'
        `, [totalBerasDibutuhkan, vendorId]);

        // 4. UBAH STATUS SPK MENJADI DISEPAKATI
        await queryD1(`UPDATE kontrak_spk SET status = 'VENDOR_ACCEPTED' WHERE id = ?`, [spkId]);

        res.status(200).json({
            message: "SPK Berhasil Disetujui! Stok otomatis dipotong.",
            data: {
                spkId: spkId,
                status: "VENDOR_ACCEPTED (Menunggu SPPG Mengunci Dana)",
                stokDipotong: `${totalBerasDibutuhkan} kg Beras`,
                sisaStokGudang: `${stokBerasSaatIni - totalBerasDibutuhkan} kg Beras`
            }
        });

    } catch (error) {
        console.error("❌ Error approve SPK:", error.message);
        res.status(500).json({ error: "Gagal menyetujui SPK." });
    }
});

module.exports = router;