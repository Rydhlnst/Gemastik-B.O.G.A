const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.middleware');

// Pastikan lu import fungsi queryD1 lu di sini (sesuaikan path-nya)
const { queryD1 } = require('../services/d1.service');

// ==========================================
// TAHAP 1: VENDOR CATAT BARANG MASUK (INBOUND)
// ==========================================
router.post('/inbound', authenticateToken, async (req, res) => {
    try {
        // 1. Ambil data dari tiket JWT
        const vendorId = req.user.id; 
        
        // 2. Ambil data dari Postman
        const { namaBahan, jumlahKg, hargaBeliTotal, notaUrl } = req.body;

        if (!namaBahan || !jumlahKg || !hargaBeliTotal || !notaUrl) {
            return res.status(400).json({ error: "Semua data belanja wajib diisi!" });
        }

        console.log(`📦 Mencatat Inbound ${jumlahKg}kg ${namaBahan} untuk Vendor ID: ${vendorId}`);

        // 3. Catat di Buku Riwayat (Ledger)
        await queryD1(`
            INSERT INTO stock_inbounds (vendor_id, nama_bahan, jumlah_kg, harga_beli_total, nota_url) 
            VALUES (?, ?, ?, ?, ?)
        `, [vendorId, namaBahan, jumlahKg, hargaBeliTotal, notaUrl]);

        // 4. Update Saldo Akhir Gudang (Upsert: Kalau belum ada dibikin, kalau ada ditambah)
        await queryD1(`
            INSERT INTO stock_balances (vendor_id, nama_bahan, total_kg)
            VALUES (?, ?, ?)
            ON CONFLICT(vendor_id, nama_bahan) 
            DO UPDATE SET 
                total_kg = total_kg + excluded.total_kg,
                last_updated = CURRENT_TIMESTAMP
        `, [vendorId, namaBahan, jumlahKg]);

        // 5. Cek Saldo Terkini buat dikirim ke Frontend
        const dbSaldo = await queryD1(`
            SELECT total_kg FROM stock_balances WHERE vendor_id = ? AND nama_bahan = ?
        `, [vendorId, namaBahan]);

        res.status(201).json({
            message: "Barang berhasil masuk ke gudang digital!",
            data: {
                namaBahan: namaBahan,
                penambahan: `${jumlahKg} kg`,
                saldoSaatIni: `${dbSaldo.results[0].total_kg} kg`
            }
        });

    } catch (error) {
        console.error("❌ Error catat inbound:", error.message);
        res.status(500).json({ error: "Gagal mencatat stok barang." });
    }
});

module.exports = router;