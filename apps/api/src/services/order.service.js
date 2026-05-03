const logger = require('../utils/logger.util');
const crypto = require('crypto');

/**
 * SERVICE: Order Management (SPK / Purchase Orders)
 * Menangani alur Zero-Trust Escrow dan Multi-Signature
 */
class OrderService {
    
    /**
     * Membuat Pesanan Baru (Zero-Trust)
     * Harga diambil dari DB, bukan input user untuk mencegah manipulasi.
     */
    async createOrder(db, { pembeliId, vendorId, items }) {
        const MODULE = 'OrderService';
        const poId = `PO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        logger.info(MODULE, 'Memulai pembuatan pesanan baru...', { poId, vendorId });

        try {
            let totalHarga = 0;
            const itemsToInsert = [];

            // 1. Validasi & Hitung Harga (Zero-Trust)
            for (const item of items) {
                const targetId = item.commodityId || item.itemId; // Support both names
                const dbBarang = await db.prepare(`
                    SELECT id, name, harga, current_stock FROM Barang WHERE id = ? AND vendor_id = ?
                `).bind(targetId, vendorId).first();

                if (!dbBarang) throw new Error(`Barang ${targetId} tidak ditemukan atau bukan milik vendor ini.`);
                if (dbBarang.current_stock < item.quantity) throw new Error(`Stok ${dbBarang.name} tidak mencukupi.`);

                const subtotal = dbBarang.harga * item.quantity;
                totalHarga += subtotal;

                itemsToInsert.push({
                    id: crypto.randomUUID(),
                    barangId: dbBarang.id,
                    kuantitas: item.quantity,
                    hargaSaatItu: dbBarang.harga
                });
            }

            // 2. Simpan Header Pesanan
            await db.prepare(`
                INSERT INTO Pesanan (id, pembeli_id, vendor_id, total_harga, escrow_status)
                VALUES (?, ?, ?, ?, 'ESCROW_HOLD')
            `).bind(poId, pembeliId, vendorId, totalHarga).run();

            // 3. Simpan Detail Item
            for (const itm of itemsToInsert) {
                await db.prepare(`
                    INSERT INTO ItemPesanan (id, pesanan_id, barang_id, kuantitas, harga_saat_itu)
                    VALUES (?, ?, ?, ?, ?)
                `).bind(itm.id, poId, itm.barangId, itm.kuantitas, itm.hargaSaatItu).run();
            }

            // 4. Inisialisasi Slot Tanda Tangan
            await db.prepare(`
                INSERT INTO PesananSignatures (pesanan_id) VALUES (?)
            `).bind(poId).run();

            logger.info(MODULE, 'Pesanan berhasil dibuat & dana masuk Escrow.', { poId, totalHarga });
            return { poId, totalHarga };

        } catch (error) {
            logger.error(MODULE, 'Gagal membuat pesanan', error);
            throw error;
        }
    }

    /**
     * Mengambil semua pesanan untuk vendor tertentu
     */
    async getOrdersByVendor(db, vendorId) {
        const MODULE = 'OrderService';
        logger.info(MODULE, 'Menarik data pesanan untuk vendor...', { vendorId });

        const orders = await db.prepare(`
            SELECT 
                p.id as purchaseOrderId,
                a.nama as sppgId,
                p.created_at as orderDate,
                p.total_harga as totalAmount,
                p.escrow_status as escrowStatus,
                p.pickup_pin,
                p.revision_note,
                s.qc_status, s.admin_status, s.logistik_status
            FROM Pesanan p
            JOIN Accounts a ON p.pembeli_id = a.id
            LEFT JOIN PesananSignatures s ON p.id = s.pesanan_id
            WHERE p.vendor_id = ?
            ORDER BY p.created_at DESC
        `).bind(vendorId).all();

        return Promise.all(orders.map(async (po) => {
            const items = await db.prepare(`
                SELECT b.name as item_name, ip.kuantitas as quantity, b.unit, ip.harga_saat_itu as price_at_purchase
                FROM ItemPesanan ip JOIN Barang b ON ip.barang_id = b.id WHERE ip.pesanan_id = ?
            `).bind(po.purchaseOrderId).all();

            return {
                ...po,
                financials: {
                    totalAmount: po.totalAmount,
                    escrowStatus: po.escrowStatus,
                    signatures: { qc: po.qc_status, admin: po.admin_status, logistik: po.logistik_status }
                },
                items: items.map(i => ({ ...i, subtotal: i.quantity * i.price_at_purchase }))
            };
        }));
    }

    /**
     * Vendor Konfirmasi Barang Siap
     */
    async markReadyForPickup(db, poId, vendorId) {
        const MODULE = 'OrderService';
        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        
        await db.prepare(`
            UPDATE Pesanan SET status = 'READY_FOR_PICKUP', escrow_status = 'READY_FOR_PICKUP', pickup_pin = ?
            WHERE id = ? AND vendor_id = ?
        `).bind(pin, poId, vendorId).run();

        logger.info(MODULE, 'PIN Pickup dihasilkan!', { poId, pin });
        return { success: true, pickupPin: pin };
    }

    /**
     * Multi-Signature Approval (Zero-Trust Validation)
     */
    async signOrder(db, poId, role) {
        const MODULE = 'OrderService';
        let updateField = "";
        if (role === 'QC') updateField = "qc_status = 'SIGNED', qc_signed_at = CURRENT_TIMESTAMP";
        else if (role === 'ADMIN') updateField = "admin_status = 'SIGNED', admin_signed_at = CURRENT_TIMESTAMP";
        else if (role === 'LOGISTIK') updateField = "logistik_status = 'SIGNED', logistik_signed_at = CURRENT_TIMESTAMP";
        else throw new Error("Role tidak valid untuk tanda tangan.");

        await db.prepare(`UPDATE PesananSignatures SET ${updateField} WHERE pesanan_id = ?`).bind(poId).run();

        // Cek apakah Multi-Sig Selesai (3/3)
        const sigs = await db.prepare(`SELECT * FROM PesananSignatures WHERE pesanan_id = ?`).bind(poId).first();
        if (sigs.qc_status === 'SIGNED' && sigs.admin_status === 'SIGNED' && sigs.logistik_status === 'SIGNED') {
            await db.prepare(`UPDATE Pesanan SET escrow_status = 'RELEASED', status = 'COMPLETED' WHERE id = ?`).bind(poId).run();
            logger.info(MODULE, 'MULTI-SIG COMPLETE! Dana dicairkan.', { poId });
            return { status: 'COMPLETED', message: 'Multi-sig lengkap, dana dicairkan!' };
        }

        return { status: 'VALIDATING', message: `Tanda tangan ${role} berhasil.` };
    }

    /**
     * Penolakan Pesanan (Vendor Action)
     * Membatalkan alur escrow dan mengunci status jadi REJECTED
     */
    async rejectOrder(db, poId, vendorId) {
        const MODULE = 'OrderService';
        logger.warn(MODULE, 'Vendor menolak pesanan!', { poId, vendorId });

        await db.prepare(`
            UPDATE Pesanan SET 
                status = 'CANCELLED',
                escrow_status = 'EXPIRED',
                vendor_status = 'REJECTED',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND vendor_id = ?
        `).bind(poId, vendorId).run();

        return { success: true, status: 'REJECTED' };
    }
}

module.exports = new OrderService();
