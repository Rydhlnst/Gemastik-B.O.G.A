const express = require('express');
const crypto = require('crypto');
const router = express.Router();

/**
 * POST /api/spk/create
 * Membuat Surat Pesanan (PO) & Mengunci Dana di Escrow (DOKU Mock)
 */
router.post('/create', async (req, res) => {
    try {
        // items adalah array dari object: { itemId, quantity }
        const { sppgId, vendorId, items } = req.body;
        const db = req.db;

        console.log(`[SPK] Memproses pesanan dari SPPG ${sppgId} ke Vendor ${vendorId}...`);

        const poId = crypto.randomUUID();
        let totalAmount = 0;
        const poItemsData = [];

        // 1. VALIDASI ZERO-TRUST: Ambil harga langsung dari Database, BUKAN dari Frontend!
        for (const item of items) {
            const dbItem = await db.prepare(`
                SELECT final_price, current_stock FROM VendorItems WHERE id = ? AND vendor_id = ?
            `).bind(item.itemId, vendorId).first();

            if (!dbItem) throw new Error(`Barang dengan ID ${item.itemId} tidak valid atau bukan milik vendor ini!`);
            if (dbItem.current_stock < item.quantity) throw new Error(`Stok barang tidak mencukupi!`);

            const subtotal = dbItem.final_price * item.quantity;
            totalAmount += subtotal;

            poItemsData.push({
                poItemId: crypto.randomUUID(),
                itemId: item.itemId,
                quantity: item.quantity,
                priceAtPurchase: dbItem.final_price, // Mengunci harga saat ini
                subtotal: subtotal
            });
        }

        // 2. SIMPAN SURAT PESANAN UTAMA
        await db.prepare(`
            INSERT INTO PurchaseOrders (id, sppg_id, vendor_id, total_amount, status)
            VALUES (?, ?, ?, ?, 'ESCROW_HOLD')
        `).bind(poId, sppgId, vendorId, totalAmount).run();

        // 3. SIMPAN DETAIL KERANJANG BELANJA
        for (const poItem of poItemsData) {
            await db.prepare(`
                INSERT INTO PurchaseOrderItems (id, po_id, item_id, quantity, price_at_purchase, subtotal)
                VALUES (?, ?, ?, ?, ?, ?)
            `).bind(poItem.poItemId, poId, poItem.itemId, poItem.quantity, poItem.priceAtPurchase, poItem.subtotal).run();
        }

        // 4. CIPTAKAN KUNCI ESCROW (Simulasi DOKU Holding)
        const escrowId = crypto.randomUUID();
        const dokuRefId = `DOKU-MOCK-${Date.now()}`; // Simulasi kembalian dari Payment Gateway

        await db.prepare(`
            INSERT INTO EscrowTransactions (id, po_id, doku_ref_id, amount, status)
            VALUES (?, ?, ?, ?, 'HOLD_3_DAYS')
        `).bind(escrowId, poId, dokuRefId, totalAmount).run();

        console.log(`[SPK] Sukses! Dana Rp${totalAmount} ditahan di Escrow.`);

        res.status(201).json({
            status: "success",
            message: "Pesanan berhasil dibuat. Dana diamankan dalam Escrow!",
            data: {
                purchaseOrderId: poId,
                totalAmount: totalAmount,
                escrowRef: dokuRefId,
                securityNote: "Dana ditahan (HOLD) sampai mendapat 3 tanda tangan (Multi-Sig)"
            }
        });

    } catch (error) {
        console.error("[SPK Error]:", error.message);
        res.status(500).json({ status: "error", message: error.message });
    }
});

/**
 * POST /api/spk/approve-escrow
 * Fitur Zero-Trust: Multi-Signature (3/3) untuk mencairkan dana Escrow
 */
router.post('/approve-escrow', async (req, res) => {
    try {
        // role yang diizinkan: 'QC', 'ADMIN', 'LOGISTIK'
        const { poId, role } = req.body;
        const db = req.db;

        console.log(`[Escrow] Menerima tanda tangan dari otorisasi: ${role}...`);

        // 1. Cek status Escrow saat ini
        const escrow = await db.prepare(`SELECT * FROM EscrowTransactions WHERE po_id = ?`).bind(poId).first();
        if (!escrow) throw new Error("Transaksi Escrow tidak ditemukan!");
        if (escrow.status !== 'HOLD_3_DAYS') throw new Error(`Dana tidak bisa diproses. Status saat ini: ${escrow.status}`);

        // 2. Berikan Tanda Tangan (Digital Signature) sesuai Role
        let updateQuery = "";
        if (role === 'QC') updateQuery = "qc_approved = 1";
        else if (role === 'ADMIN') updateQuery = "admin_approved = 1";
        else if (role === 'LOGISTIK') updateQuery = "logistik_approved = 1";
        else throw new Error("Akses Ditolak! Role tidak memiliki otorisasi pencairan.");

        await db.prepare(`UPDATE EscrowTransactions SET ${updateQuery} WHERE po_id = ?`).bind(poId).run();

        // 3. CEK KONDISI MULTI-SIG (Apakah 3/3 sudah tanda tangan?)
        const updatedEscrow = await db.prepare(`SELECT * FROM EscrowTransactions WHERE po_id = ?`).bind(poId).first();

        let message = `Tanda tangan divisi ${role} berhasil direkam!`;
        let isReleased = false;

        // Jika ketiganya sudah bernilai 1 (True)
        if (updatedEscrow.qc_approved === 1 && updatedEscrow.admin_approved === 1 && updatedEscrow.logistik_approved === 1) {
            // CAIRKAN DANA TAHAP 1!
            await db.prepare(`UPDATE EscrowTransactions SET status = 'STAGE_1_RELEASED' WHERE po_id = ?`).bind(poId).run();
            message = "🔥 MULTI-SIG COMPLETE! Dana Tahap 1 resmi dicairkan ke dompet Vendor!";
            isReleased = true;
        } else {
            // Hitung progress tanda tangan
            const signs = [updatedEscrow.qc_approved, updatedEscrow.admin_approved, updatedEscrow.logistik_approved].filter(val => val === 1).length;
            message += ` (Progress Keamanan: ${signs}/3 Tanda Tangan)`;
        }

        res.json({
            status: "success",
            message: message,
            data: {
                purchaseOrderId: poId,
                isReleased: isReleased,
                currentStatus: isReleased ? 'STAGE_1_RELEASED' : 'HOLD_3_DAYS'
            }
        });

    } catch (error) {
        console.error("[Escrow Error]:", error.message);
        res.status(500).json({ status: "error", message: error.message });
    }
});

/**
 * GET /api/spk/vendor/:vendorId
 * Fitur Next.js Frontend: Vendor melihat daftar Surat Pesanan (PO) yang masuk
 */
router.get('/vendor/:vendorId', async (req, res) => {
    try {
        const { vendorId } = req.params;
        const db = req.db;

        console.log(`[SPK] Menarik riwayat pesanan untuk Vendor: ${vendorId}...`);

        // 1. Ambil data utama PO digabung dengan status Escrow-nya
        const orders = await db.prepare(`
            SELECT 
                po.id as po_id, 
                po.sppg_id, 
                po.total_amount, 
                po.status as po_status, 
                po.created_at,
                e.status as escrow_status,
                e.qc_approved,
                e.admin_approved,
                e.logistik_approved
            FROM PurchaseOrders po
            LEFT JOIN EscrowTransactions e ON po.id = e.po_id
            WHERE po.vendor_id = ?
            ORDER BY po.created_at DESC
        `).bind(vendorId).all();

        // Jika belum ada pesanan sama sekali
        if (!orders || orders.length === 0) {
            return res.json({
                status: "success",
                message: "Belum ada pesanan masuk.",
                data: []
            });
        }

        // 2. ZERO-TRUST DATA MAPPING: Ambil detail barang di dalam setiap karung pesanan
        const detailedOrders = [];
        for (const order of orders) {
            const items = await db.prepare(`
                SELECT 
                    poi.id as po_item_id,
                    poi.quantity,
                    poi.price_at_purchase,
                    poi.subtotal,
                    vi.item_name,
                    vi.unit
                FROM PurchaseOrderItems poi
                JOIN VendorItems vi ON poi.item_id = vi.id
                WHERE poi.po_id = ?
            `).bind(order.po_id).all();

            detailedOrders.push({
                purchaseOrderId: order.po_id,
                sppgId: order.sppg_id,
                orderDate: order.created_at,
                financials: {
                    totalAmount: order.total_amount,
                    escrowStatus: order.escrow_status,
                    signatures: {
                        qc: order.qc_approved === 1 ? 'SIGNED' : 'PENDING',
                        admin: order.admin_approved === 1 ? 'SIGNED' : 'PENDING',
                        logistik: order.logistik_approved === 1 ? 'SIGNED' : 'PENDING'
                    }
                },
                items: items // Array daftar barang (Beras, dll)
            });
        }

        res.json({
            status: "success",
            message: "Data SPK berhasil ditarik secara utuh!",
            data: detailedOrders
        });

    } catch (error) {
        console.error("[SPK Vendor Error]:", error.message);
        res.status(500).json({ status: "error", message: error.message });
    }
});

/**
 * POST /api/spk/:poId/ready-for-pickup
 * AKTOR: VENDOR
 * Logika: Vendor nge-klik "Barang Siap". Backend bikin PIN 6 Digit (Bisa dirender jadi QR di Frontend).
 */
router.post('/:poId/ready-for-pickup', async (req, res) => {
    try {
        const { poId } = req.params;
        const { vendorId } = req.body;
        const db = req.db;

        // Bikin PIN Rahasia 6 Digit
        const pickupPin = Math.floor(100000 + Math.random() * 900000).toString();

        const result = await db.prepare(`
            UPDATE PurchaseOrders 
            SET status = 'READY_FOR_PICKUP', pickup_pin = ? 
            WHERE id = ? AND vendor_id = ? AND status = 'ESCROW_HOLD'
        `).bind(pickupPin, poId, vendorId).run();

        if (result.meta.changes === 0) {
            throw new Error("Gagal! PO tidak ditemukan, bukan milik Anda, atau status belum masuk Escrow.");
        }

        res.json({
            status: "success",
            message: "Barang siap diambil! Tunjukkan PIN / QR Code ini kepada petugas SPPG.",
            data: { poId, status: "READY_FOR_PICKUP", pickupPin }
        });

    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

/**
 * POST /api/spk/:poId/confirm-pickup
 * AKTOR: SPPG
 * Logika: Petugas SPPG yang datang nge-scan QR Vendor (yang isinya PIN 6 digit tadi).
 */
router.post('/:poId/confirm-pickup', async (req, res) => {
    try {
        const { poId } = req.params;
        const { sppgId, inputPin } = req.body;
        const db = req.db;

        // Cek apakah PIN cocok dan statusnya memang sedang menunggu diambil
        const order = await db.prepare(`
            SELECT pickup_pin FROM PurchaseOrders 
            WHERE id = ? AND sppg_id = ? AND status = 'READY_FOR_PICKUP'
        `).bind(poId, sppgId).first();

        if (!order) {
            return res.status(403).json({ status: "error", message: "Pesanan tidak valid atau belum siap diambil." });
        }

        if (order.pickup_pin !== inputPin) {
            return res.status(401).json({ status: "error", message: "Akses Ditolak! PIN / Barcode Tidak Cocok." });
        }

        // Kalau PIN Cocok, Selesaikan Pesanan!
        await db.prepare(`
            UPDATE PurchaseOrders 
            SET status = 'COMPLETED_PICKUP', pickup_pin = NULL 
            WHERE id = ?
        `).bind(poId).run();

        res.json({
            status: "success",
            message: "Serah terima BARANG BERHASIL! Rantai pasok Fase 1 selesai.",
            data: { poId, status: "COMPLETED_PICKUP" }
        });

    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

module.exports = router;