const express = require('express');
const crypto = require('crypto');
const router = express.Router();

/**
 * POST /api/inventory/movement
 * Fitur Inbound (Stok Masuk) & Outbound (Stok Keluar)
 */
router.post('/movement', async (req, res) => {
    try {
        const { itemId, type, quantity, referenceId, notes } = req.body;
        const db = req.db;

        // 1. Ambil stok saat ini (Current Stock)
        const item = await db.prepare(`
            SELECT current_stock FROM VendorItems WHERE id = ?
        `).bind(itemId).first();

        if (!item) return res.status(404).json({ message: "Item tidak ditemukan" });

        const previousStock = item.current_stock;
        let newStock = 0;

        // 2. Hitung stok baru berdasarkan tipe mutasi
        if (type === 'INBOUND') {
            newStock = previousStock + parseFloat(quantity);
        } else if (type === 'OUTBOUND') {
            if (previousStock < quantity) throw new Error("Stok tidak mencukupi!");
            newStock = previousStock - parseFloat(quantity);
        }

        // 3. Update tabel VendorItems (Atomic Update)
        await db.prepare(`UPDATE VendorItems SET current_stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
            .bind(newStock, itemId).run();

        // 4. Catat sejarah mutasi di StockMovements (Zero-Trust Audit Trail)
        const movementId = crypto.randomUUID();
        await db.prepare(`
            INSERT INTO StockMovements (id, item_id, movement_type, quantity, previous_stock, new_stock, reference_id, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(movementId, itemId, type, quantity, previousStock, newStock, referenceId, notes).run();

        res.json({
            status: "success",
            message: `Mutasi ${type} berhasil dicatat!`,
            data: { movementId, previousStock, newStock }
        });

    } catch (error) {
        console.error("[Inventory Error]:", error.message);
        res.status(500).json({ status: "error", message: error.message });
    }
});

module.exports = router;