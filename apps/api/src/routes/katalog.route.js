const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.middleware');
const { queryD1 } = require('../services/d1.service'); 

// ==========================================
// TAHAP 1: VENDOR PAJANG MENU DI E-KATALOG
// ==========================================
router.post('/tambah', authenticateToken, async (req, res) => {
    try {
        const vendorId = req.user.id; 
        const { namaMenu, komposisi, hargaPerPorsi } = req.body;

        if (!namaMenu || !komposisi || !hargaPerPorsi) {
            return res.status(400).json({ error: "Lengkapi data menu dan harga!" });
        }

        console.log(`🔎 Menganalisis harga untuk menu: ${namaMenu} (Rp ${hargaPerPorsi})`);

        // ========================================================
        // 🚨 SIMULASI INTEGRASI PIHPS (BANK INDONESIA) 🚨
        // Di dunia nyata, ini nembak API BI. Untuk hackathon, kita mock datanya.
        // Asumsi Pagu Maksimal / Harga Wajar untuk "Nasi Ayam Sayur" di Jabar adalah Rp 15.000
        const HARGA_WAJAR_PIHPS = 15000; 
        // ========================================================

        let statusHarga = 'SAFE';
        let keteranganAudit = 'Harga Sesuai Standar Pasar (PIHPS).';

        // LOGIKA ANTI-MARKUP (KPK DIGITAL)
        if (hargaPerPorsi > HARGA_WAJAR_PIHPS) {
            const selisih = hargaPerPorsi - HARGA_WAJAR_PIHPS;
            const persentaseMarkup = ((selisih / HARGA_WAJAR_PIHPS) * 100).toFixed(1);
            
            statusHarga = 'MARKUP_DETECTED';
            keteranganAudit = `TERINDIKASI MARKUP! Lebih mahal ${persentaseMarkup}% (Rp ${selisih}) dari harga acuan BI.`;
        }

        // Masukkan ke Etalase Database D1
        await queryD1(`
            INSERT INTO katalog_vendor (vendor_id, nama_menu, komposisi, harga_per_porsi, status_harga, keterangan_audit) 
            VALUES (?, ?, ?, ?, ?, ?)
        `, [vendorId, namaMenu, komposisi, hargaPerPorsi, statusHarga, keteranganAudit]);

        // Balasan ke Frontend
        res.status(201).json({
            message: "Menu berhasil dipajang di E-Katalog!",
            auditResult: {
                status: statusHarga,
                keterangan: keteranganAudit
            },
            data: {
                menu: namaMenu,
                harga: `Rp ${hargaPerPorsi}`
            }
        });

    } catch (error) {
        console.error("❌ Error tambah katalog:", error.message);
        res.status(500).json({ error: "Gagal memproses katalog." });
    }
});

module.exports = router;