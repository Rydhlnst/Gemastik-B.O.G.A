const logger = require('../utils/logger.util');
const crypto = require('crypto');

/**
 * SERVICE: Inventory & Stock Management
 * Menangani Inbound, Outbound, Wastage, dan Audit Trail Stok
 */
class InventoryService {

    /**
     * Mengambil riwayat barang keluar (Outbound)
     */
    async getOutboundHistory(db, vendorId) {
        const MODULE = 'InventoryService';
        logger.info(MODULE, 'Menarik riwayat outbound...', { vendorId });

        try {
            const history = await db.prepare(`
                SELECT 
                    m.id,
                    b.name as commodity_name,
                    m.quantity,
                    b.unit,
                    m.reason,
                    m.reference_id,
                    m.origin_source_name as note,
                    m.created_at
                FROM MutasiStok m
                JOIN Barang b ON m.commodity_id = b.id
                WHERE b.vendor_id = ? AND m.movement_type = 'OUTBOUND'
                ORDER BY m.created_at DESC
            `).bind(vendorId).all();

            return history;
        } catch (error) {
            logger.error(MODULE, 'Gagal mengambil riwayat outbound', error);
            throw error;
        }
    }

    /**
     * Mencatat Barang Keluar (Outbound / Wastage / Revision)
     * Secara otomatis mengurangi stok di tabel Barang.
     */
    async recordOutbound(db, { commodityId, quantity, reason, referenceId, note, proofUrl, proofHash }) {
        const MODULE = 'InventoryService';
        const mutasiId = `MUT-OUT-${Date.now()}`;
        
        logger.warn(MODULE, 'Mencatat mutasi keluar...', { commodityId, quantity, reason });

        try {
            // 1. Cek Stok Saat Ini
            const barang = await db.prepare(`SELECT name, current_stock FROM Barang WHERE id = ?`).bind(commodityId).first();
            if (!barang) throw new Error('Barang tidak ditemukan.');
            if (barang.current_stock < quantity) throw new Error(`Stok ${barang.name} tidak mencukupi untuk pengeluaran ini.`);

            // 2. Simpan Mutasi
            await db.prepare(`
                INSERT INTO MutasiStok (
                    id, commodity_id, movement_type, quantity, price_per_unit, reason, 
                    reference_id, origin_source_name, origin_source_location, 
                    origin_proof_url, origin_proof_hash
                ) VALUES (?, ?, 'OUTBOUND', ?, 0, ?, ?, ?, ?, ?, ?)
            `).bind(mutasiId, commodityId, quantity, reason, referenceId, note, 'Vendor Warehouse', proofUrl, proofHash).run();

            // 3. Update Stok di Master Barang
            await db.prepare(`
                UPDATE Barang SET current_stock = current_stock - ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).bind(quantity, commodityId).run();

            logger.info(MODULE, 'Mutasi keluar berhasil dicatat & stok diperbarui.', { mutasiId, newStock: barang.current_stock - quantity });
            return { success: true, mutasiId };

        } catch (error) {
            logger.error(MODULE, 'Gagal mencatat mutasi keluar', error);
            throw error;
        }
    }
}

module.exports = new InventoryService();
