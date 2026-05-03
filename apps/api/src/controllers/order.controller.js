const orderService = require('../services/order.service');

/**
 * CONTROLLER: Order Management
 */
class OrderController {
    
    /**
     * POST /api/spk/create
     * Membuat PO baru (SPPG Action)
     */
    async create(req, res) {
        const { pembeliId, vendorId, items } = req.body;
        const db = req.db;
        const log = req.log;

        log.info({ pembeliId, vendorId }, 'Memproses pembuatan pesanan baru (PO)');

        try {
            const result = await orderService.createOrder(db, { pembeliId, vendorId, items });
            log.info({ poId: result.poId }, 'Pesanan berhasil dibuat');
            res.status(201).json({ status: 'success', data: result });
        } catch (error) {
            log.error({ err: error.message }, 'Gagal membuat pesanan');
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    /**
     * GET /api/spk/vendor/:vendorId
     * Mendapatkan daftar PO untuk Vendor
     */
    async getVendorOrders(req, res) {
        const { vendorId } = req.params;
        const db = req.db;
        const log = req.log;

        log.info({ vendorId }, 'Menarik daftar pesanan vendor');

        try {
            const orders = await orderService.getOrdersByVendor(db, vendorId);
            res.json({ status: 'success', data: orders });
        } catch (error) {
            log.error({ err: error.message, vendorId }, 'Gagal mengambil daftar pesanan vendor');
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    /**
     * POST /api/spk/:poId/ready-for-pickup
     * Vendor konfirmasi barang siap
     */
    async readyForPickup(req, res) {
        const { poId } = req.params;
        const { vendorId } = req.body;
        const db = req.db;
        const log = req.log;

        log.info({ poId, vendorId }, 'Vendor menandai pesanan siap jemput');

        try {
            const result = await orderService.markReadyForPickup(db, poId, vendorId);
            log.info({ poId }, 'Pesanan siap jemput, PIN dihasilkan');
            res.json({ status: 'success', data: result });
        } catch (error) {
            log.error({ err: error.message, poId }, 'Gagal menandai pesanan siap jemput');
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    /**
     * POST /api/spk/:poId/sign
     * SPPG Sign (Multi-Sig)
     */
    async sign(req, res) {
        const { poId } = req.params;
        const { role } = req.body; // QC, ADMIN, LOGISTIK
        const db = req.db;
        const log = req.log;

        log.info({ poId, role }, 'Memproses tanda tangan multi-sig');

        try {
            const result = await orderService.signOrder(db, poId, role);
            log.info({ poId, role, status: result.status }, 'Tanda tangan berhasil dicatat');
            res.json({ status: 'success', data: result });
        } catch (error) {
            log.error({ err: error.message, poId, role }, 'Gagal memproses tanda tangan');
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    /**
     * POST /api/spk/:poId/reject
     * Vendor menolak pesanan
     */
    async reject(req, res) {
        const { poId } = req.params;
        const { vendorId } = req.body;
        const db = req.db;
        const log = req.log;

        log.warn({ poId, vendorId }, 'Vendor menolak pesanan!');

        try {
            const result = await orderService.rejectOrder(db, poId, vendorId);
            res.json({ status: 'success', data: result });
        } catch (error) {
            log.error({ err: error.message, poId }, 'Gagal menolak pesanan');
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    /**
     * PATCH /api/spk/:poId/status
     * DEBUG/SIMULATOR: Update status langsung
     */
    async updateStatus(req, res) {
        const { poId } = req.params;
        const { status } = req.body;
        const db = req.db;
        const log = req.log;

        log.info({ poId, status }, 'DEBUG: Memaksa update status pesanan');

        try {
            const { note } = req.body;
            let result;
            if (note) {
                result = await db.prepare('UPDATE Pesanan SET status = ?, revision_note = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
                    .bind(status, note, poId)
                    .run();
            } else {
                result = await db.prepare('UPDATE Pesanan SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
                    .bind(status, poId)
                    .run();
            }

            const changes = result.meta?.changes || 0;
            if (changes === 0) {
                log.warn({ poId }, 'Update status gagal: Pesanan tidak ditemukan');
                return res.status(404).json({ status: 'error', message: 'Pesanan tidak ditemukan di database.' });
            }
            
            res.json({ 
                status: 'success', 
                message: `Status berhasil diupdate ke ${status}`,
                changes: changes
            });
        } catch (error) {
            log.error({ err: error.message, poId }, 'Gagal update status paksa');
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
}

module.exports = new OrderController();
