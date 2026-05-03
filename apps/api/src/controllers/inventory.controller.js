const inventoryService = require('../services/inventory.service');

/**
 * CONTROLLER: Inventory & Outbound
 */
class InventoryController {

    /**
     * GET /api/inventory/outbound/:vendorId
     * Mendapatkan riwayat barang keluar
     */
    async getOutboundHistory(req, res) {
        const { vendor_id } = req.params;
        const db = req.db;
        const log = req.log;

        log.info({ vendor_id }, 'Menarik riwayat outbound vendor');

        try {
            const history = await inventoryService.getOutboundHistory(db, vendor_id);
            res.json({ status: 'success', data: history });
        } catch (error) {
            log.error({ err: error.message, vendor_id }, 'Gagal mengambil riwayat outbound');
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    /**
     * POST /api/inventory/outbound
     * Mencatat pengeluaran barang secara manual (Wastage / Revision Replacement)
     */
    async recordOutbound(req, res) {
        const { commodityId, quantity, reason, referenceId, note, proofUrl, proofHash } = req.body;
        const db = req.db;
        const log = req.log;

        log.info({ commodityId, quantity, reason }, 'Mencatat mutasi outbound manual');

        if (!commodityId || !quantity || !reason) {
            log.warn('Upaya recordOutbound ditolak: Data tidak lengkap');
            return res.status(400).json({ status: 'error', message: 'Data tidak lengkap (Commodity ID, Quantity, dan Reason diperlukan)' });
        }

        try {
            const result = await inventoryService.recordOutbound(db, {
                commodityId, quantity, reason, referenceId, note, proofUrl, proofHash
            });
            log.info({ mutasiId: result.mutasiId }, 'Mutasi outbound berhasil dicatat');
            res.status(201).json({ status: 'success', data: result });
        } catch (error) {
            log.error({ err: error.message }, 'Gagal mencatat mutasi outbound');
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    /**
     * GET /api/inventory/vendors/:vendor_id/history
     * Mendapatkan riwayat gabungan (Inbound, Outbound, Pesanan, Katalog)
     */
    async getGlobalHistory(req, res) {
        const { vendor_id } = req.params;
        const db = req.db;
        const log = req.log;

        log.info({ vendor_id }, 'Menarik riwayat global vendor');

        try {
            const sql = `
                SELECT 
                    'INBOUND' as type, 
                    m.id, 
                    'Stok Masuk Dicatat' as title, 
                    b.name || ' · ' || m.quantity || ' ' || b.unit as subtitle,
                    m.reason as detail,
                    NULL as amount,
                    m.created_at as timestamp,
                    m.origin_proof_hash as hash
                FROM MutasiStok m
                JOIN Barang b ON m.commodity_id = b.id
                WHERE b.vendor_id = ? AND m.movement_type = 'INBOUND'

                UNION ALL

                SELECT 
                    'OUTBOUND' as type, 
                    m.id, 
                    'Barang Keluar/Distribusi' as title, 
                    b.name || ' · ' || m.quantity || ' ' || b.unit as subtitle,
                    m.reason as detail,
                    NULL as amount,
                    m.created_at as timestamp,
                    m.origin_proof_hash as hash
                FROM MutasiStok m
                JOIN Barang b ON m.commodity_id = b.id
                WHERE b.vendor_id = ? AND m.movement_type = 'OUTBOUND'

                UNION ALL

                SELECT 
                    'KATALOG_ADDED' as type, 
                    id, 
                    'Produk Ditambahkan ke Katalog' as title, 
                    name || ' · Rp ' || harga || '/' || unit as subtitle,
                    description as detail,
                    NULL as amount,
                    created_at as timestamp,
                    NULL as hash
                FROM Barang 
                WHERE vendor_id = ?

                UNION ALL

                SELECT 
                    'KATALOG_REMOVED' as type, 
                    id, 
                    'Produk Dihapus dari Katalog' as title, 
                    name as subtitle,
                    'Produk ini telah dinonaktifkan dari katalog aktif.' as detail,
                    NULL as amount,
                    updated_at as timestamp,
                    NULL as hash
                FROM Barang 
                WHERE vendor_id = ? AND is_active = 0

                UNION ALL

                SELECT 
                    CASE 
                        WHEN status = 'REJECTED' THEN 'PO_REJECTED'
                        WHEN status = 'COMPLETED' THEN 'ESCROW_RELEASED'
                        ELSE 'PO_RECEIVED'
                    END as type, 
                    id, 
                    'Pesanan dari SPPG' as title, 
                    'No. Pesanan: ' || id as subtitle,
                    'Status Saat Ini: ' || status as detail,
                    total_harga as amount,
                    created_at as timestamp,
                    NULL as hash
                FROM Pesanan 
                WHERE vendor_id = ?

                ORDER BY timestamp DESC
                LIMIT 50
            `;

            const results = await db.prepare(sql).bind(vendor_id, vendor_id, vendor_id, vendor_id, vendor_id).all();
            const dataRows = results.results || (Array.isArray(results) ? results : []);

            res.json({ status: 'success', data: dataRows });
        } catch (error) {
            log.error({ err: error.message, vendor_id }, 'Gagal mengambil riwayat global');
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
}

module.exports = new InventoryController();
