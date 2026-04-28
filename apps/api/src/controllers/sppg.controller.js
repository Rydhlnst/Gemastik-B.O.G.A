const crypto = require('crypto');

/**
 * Melihat E-Katalog (Browsing Barang Vendor)
 * Menampilkan komoditas yang aktif dan stoknya tersedia.
 */
const getKatalogVendor = async (req, res) => {
    try {
        const db = req.db;

        // Ambil data komoditas beserta detail vendor dan PIHPS
        const katalog = await db.prepare(`
            SELECT 
                c.id as commodity_id,
                c.name as commodity_name,
                c.price,
                c.unit,
                c.markup_percentage,
                c.is_markup,
                c.current_stock,
                v.id as vendor_id,
                v.business_name as vendor_name,
                v.business_address as vendor_location,
                p.commodity_name as pihps_category,
                p.max_het_price
            FROM Commodities c
            JOIN Vendors v ON c.vendor_id = v.id
            LEFT JOIN Master_PIHPS_HET p ON c.pihps_id = p.id
            WHERE c.is_active = 1 AND c.current_stock > 0
            ORDER BY c.created_at DESC
        `).bind().all();

        res.status(200).json({
            status: 'success',
            message: 'Berhasil mengambil E-Katalog B.O.G.A',
            data: katalog
        });

    } catch (error) {
        console.error('[Get Katalog Error]:', error);
        res.status(500).json({ status: 'error', message: 'Gagal mengambil data E-Katalog.' });
    }
};

/**
 * Membuat Purchase Order (PO) / Checkout Keranjang Belanja
 * Mekanisme: Hard Booking (Stok langsung dipotong) & Lock Escrow
 */
const createPurchaseOrder = async (req, res) => {
    try {
        const { sppg_id, vendor_id, items } = req.body;
        const db = req.db;

        if (!items || items.length === 0) {
            return res.status(400).json({ status: 'error', message: 'Keranjang belanja kosong.' });
        }

        const poId = `PO-${crypto.randomUUID().split('-')[0].toUpperCase()}`;
        let totalAmount = 0;
        
        // --- TRANSAKSI DATABASE (Simulasi Manual Karena D1 Worker tidak support BEGIN TRANSACTION murni di SDK lama) ---
        // Kita akan melakukan pengecekan berlapis (Double-Check)
        
        // 1. Validasi Stok (Mencegah Barang Ghaib)
        const validItems = [];
        for (const item of items) {
            const commodity = await db.prepare(`
                SELECT name, price, current_stock FROM Commodities 
                WHERE id = ? AND vendor_id = ? AND is_active = 1
            `).bind(item.commodity_id, vendor_id).first();

            if (!commodity) {
                return res.status(404).json({ status: 'error', message: `Komoditas ${item.commodity_id} tidak ditemukan pada vendor ini.` });
            }

            if (item.quantity > commodity.current_stock) {
                return res.status(400).json({ 
                    status: 'error', 
                    message: `Stok tidak mencukupi untuk ${commodity.name}. Sisa stok: ${commodity.current_stock} ${item.unit || ''}` 
                });
            }

            const subtotal = item.quantity * commodity.price;
            totalAmount += subtotal;

            validItems.push({
                ...item,
                price_at_purchase: commodity.price,
                subtotal: subtotal
            });
        }

        // 2. Eksekusi Pembelian (HARD BOOKING)
        // Kunci Dana di Escrow (Simulasi Interaksi Blockchain / DOKU)
        const escrowTransactionId = `0xESCROW${crypto.createHash('sha256').update(poId + Date.now().toString()).digest('hex').substring(0, 40)}`;

        // Buat PO Header
        await db.prepare(`
            INSERT INTO PurchaseOrders (id, sppg_id, vendor_id, total_amount, smart_contract_escrow_id, status)
            VALUES (?, ?, ?, ?, ?, 'PENDING')
        `).bind(poId, sppg_id, vendor_id, totalAmount, escrowTransactionId).run();

        // 3. Masukkan Items & Potong Stok
        for (const item of validItems) {
            const itemId = `POI-${crypto.randomUUID().split('-')[0].toUpperCase()}`;
            
            // Insert ke PurchaseOrderItems
            await db.prepare(`
                INSERT INTO PurchaseOrderItems (id, po_id, commodity_id, quantity, price_at_purchase, subtotal)
                VALUES (?, ?, ?, ?, ?, ?)
            `).bind(itemId, poId, item.commodity_id, item.quantity, item.price_at_purchase, item.subtotal).run();

            // Potong Stok Langsung di Commodities
            await db.prepare(`
                UPDATE Commodities 
                SET current_stock = current_stock - ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).bind(item.quantity, item.commodity_id).run();

            // Catat ke Vendor_Stock_Movements (OUTBOUND)
            const movementId = `OUT-${crypto.randomUUID().split('-')[0].toUpperCase()}`;
            await db.prepare(`
                INSERT INTO Vendor_Stock_Movements (
                    id, vendor_id, commodity_id, movement_type, quantity, purchase_order_id
                ) VALUES (?, ?, ?, 'OUTBOUND', ?, ?)
            `).bind(movementId, vendor_id, item.commodity_id, item.quantity, poId).run();
        }

        res.status(201).json({
            status: 'success',
            message: 'Purchase Order berhasil dibuat! Dana APBN telah dikunci di Escrow DOKU.',
            data: {
                po_id: poId,
                total_amount: totalAmount,
                escrow_id: escrowTransactionId,
                status: 'PENDING (Menunggu Pengiriman Vendor)'
            }
        });

    } catch (error) {
        console.error('[Create PO Error]:', error);
        res.status(500).json({ status: 'error', message: 'Terjadi kesalahan saat memproses pesanan (PO).' });
    }
};

module.exports = {
    getKatalogVendor,
    createPurchaseOrder
};
