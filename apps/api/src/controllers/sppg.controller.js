const crypto = require('crypto');

/**
 * Melihat E-Katalog (Browsing Barang Vendor)
 * Menampilkan komoditas yang aktif dan stoknya tersedia.
 */
const getKatalogVendor = async (req, res) => {
    const log = req.log;
    try {
        const db = req.db;

        log.info('SPPG menarik data E-Katalog B.O.G.A');

        // Ambil data komoditas beserta detail vendor dan PIHPS
        const katalog = await db.prepare(`
            SELECT 
                b.id as commodity_id,
                b.name as commodity_name,
                b.harga as price,
                b.unit,
                b.markup_percentage,
                b.is_markup,
                b.current_stock,
                v.id as vendor_id,
                v.business_name as vendor_name,
                v.business_address as vendor_location,
                p.commodity_name as pihps_category,
                p.max_het_price
            FROM Barang b
            JOIN Vendors v ON b.vendor_id = v.id
            LEFT JOIN Master_PIHPS_HET p ON b.pihps_id = p.id
            WHERE b.is_active = 1 AND b.current_stock > 0
            ORDER BY b.created_at DESC
        `).bind().all();

        const dataRows = katalog.results || (Array.isArray(katalog) ? katalog : []);

        res.status(200).json({
            status: 'success',
            message: 'Berhasil mengambil E-Katalog B.O.G.A',
            data: dataRows
        });

    } catch (error) {
        log.error({ err: error.message }, 'Gagal mengambil data E-Katalog');
        res.status(500).json({ status: 'error', message: 'Gagal mengambil data E-Katalog.' });
    }
};

/**
 * Membuat Purchase Order (PO) / Checkout Keranjang Belanja
 * Mekanisme: Hard Booking (Stok langsung dipotong) & Lock Escrow
 */
const createPurchaseOrder = async (req, res) => {
    const log = req.log;
    try {
        const { sppg_id, vendor_id, items } = req.body;
        const db = req.db;

        log.info({ sppg_id, vendor_id }, 'SPPG membuat Purchase Order baru');

        if (!items || items.length === 0) {
            return res.status(400).json({ status: 'error', message: 'Keranjang belanja kosong.' });
        }

        const poId = `PO-${crypto.randomUUID().split('-')[0].toUpperCase()}`;
        let totalAmount = 0;
        
        // 1. Validasi Stok (Mencegah Barang Ghaib)
        const validItems = [];
        for (const item of items) {
            const commodity = await db.prepare(`
                SELECT name, harga, current_stock FROM Barang 
                WHERE id = ? AND vendor_id = ? AND is_active = 1
            `).bind(item.commodity_id, vendor_id).first();

            if (!commodity) {
                log.warn({ commodity_id: item.commodity_id }, 'Komoditas tidak ditemukan');
                return res.status(404).json({ status: 'error', message: `Komoditas ${item.commodity_id} tidak ditemukan pada vendor ini.` });
            }

            if (item.quantity > commodity.current_stock) {
                log.warn({ commodity_id: item.commodity_id, stok: commodity.current_stock }, 'Stok tidak mencukupi');
                return res.status(400).json({ 
                    status: 'error', 
                    message: `Stok tidak mencukupi untuk ${commodity.name}. Sisa stok: ${commodity.current_stock} ${item.unit || ''}` 
                });
            }

            const subtotal = item.quantity * commodity.harga;
            totalAmount += subtotal;

            validItems.push({
                ...item,
                price_at_purchase: commodity.harga,
                subtotal: subtotal
            });
        }

        // 2. Eksekusi Pembelian (HARD BOOKING)
        // Buat PO Header (Tabel: Pesanan)
        await db.prepare(`
            INSERT INTO Pesanan (id, pembeli_id, vendor_id, total_harga, status, escrow_status)
            VALUES (?, ?, ?, ?, 'PENDING', 'ESCROW_HOLD')
        `).bind(poId, sppg_id, vendor_id, totalAmount).run();

        // 3. Masukkan Items & Potong Stok
        for (const item of validItems) {
            const itemId = `POI-${crypto.randomUUID().split('-')[0].toUpperCase()}`;
            
            // Insert ke ItemPesanan
            await db.prepare(`
                INSERT INTO ItemPesanan (id, pesanan_id, barang_id, kuantitas, harga_saat_itu)
                VALUES (?, ?, ?, ?, ?)
            `).bind(itemId, poId, item.commodity_id, item.quantity, item.price_at_purchase).run();

            // Potong Stok Langsung di Barang
            await db.prepare(`
                UPDATE Barang 
                SET current_stock = current_stock - ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).bind(item.quantity, item.commodity_id).run();

            // Catat ke MutasiStok (OUTBOUND_PO)
            const movementId = `OUT-${crypto.randomUUID().split('-')[0].toUpperCase()}`;
            await db.prepare(`
                INSERT INTO MutasiStok (
                    id, commodity_id, movement_type, quantity, reason, reference_id, origin_source_name
                ) VALUES (?, ?, 'OUTBOUND', ?, 'PO_FULFILLMENT', ?, 'Pesanan Pemerintah (SPPG)')
            `).bind(movementId, item.commodity_id, item.quantity, poId).run();
        }

        log.info({ poId, totalAmount }, 'Purchase Order berhasil dibuat dan stok dipotong');

        res.status(201).json({
            status: 'success',
            message: 'Purchase Order berhasil dibuat! Dana telah dikunci di Escrow.',
            data: {
                po_id: poId,
                total_amount: totalAmount,
                status: 'PENDING'
            }
        });

    } catch (error) {
        log.error({ err: error.message }, 'Gagal membuat Purchase Order');
        res.status(500).json({ status: 'error', message: 'Terjadi kesalahan saat memproses pesanan (PO).' });
    }
};

module.exports = {
    getKatalogVendor,
    createPurchaseOrder
};
