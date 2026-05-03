const { createId, generateHash } = require('../utils/crypto.util');

/**
 * CONTROLLER: E-Katalog & Komoditas Vendor
 */

/**
 * Menambahkan Komoditas ke E-Katalog (Dengan Kalkulasi Mark-Up PIHPS)
 */
const addCommodity = async (req, res) => {
    const log = req.log;
    try {
        const { vendor_id: paramVendorId } = req.params;
        const { vendor_id: bodyVendorId, pihps_id, name, price, unit, photo_url, description } = req.body;
        const vendor_id = paramVendorId || bodyVendorId;
        const db = req.db;

        log.info({ vendor_id, name, price }, 'Menambahkan komoditas baru ke katalog');

        // 1. Ambil Harga PIHPS dari Master Table
        const pihpsData = await db.prepare(`SELECT max_het_price FROM Master_PIHPS_HET WHERE id = ?`).bind(pihps_id).first();
        
        if (!pihpsData) {
            log.warn({ pihps_id }, 'Kategori PIHPS tidak ditemukan');
            return res.status(404).json({ status: 'error', message: 'Kategori PIHPS tidak ditemukan.' });
        }

        const max_het_price = pihpsData.max_het_price;

        // 2. Kalkulasi Mark-Up
        let markup_percentage = 0;
        let is_markup = 0;

        if (price > max_het_price) {
            markup_percentage = ((price - max_het_price) / max_het_price) * 100;
            is_markup = 1;
        }

        const commodityId = createId('COM');

        // 3. Simpan ke Tabel Barang (E-Katalog)
        await db.prepare(`
            INSERT INTO Barang (
                id, vendor_id, pihps_id, name, harga, unit, 
                photo_url, description,
                markup_percentage, is_markup, current_stock, target_stock, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 1)
        `).bind(
            commodityId, vendor_id, pihps_id, name, price, unit, 
            photo_url, description,
            markup_percentage, is_markup
        ).run();

        log.info({ commodityId }, 'Komoditas berhasil disimpan ke database');

        res.status(201).json({
            status: 'success',
            message: 'Komoditas berhasil ditambahkan ke E-Katalog.',
            data: {
                id: commodityId,
                name,
                price,
                markup_percentage: `${markup_percentage.toFixed(2)}%`,
                is_markup: is_markup === 1
            }
        });

    } catch (error) {
        log.error({ err: error.message }, 'Gagal menambahkan komoditas');
        res.status(500).json({ status: 'error', message: 'Gagal menambahkan komoditas.' });
    }
};

/**
 * Mencatat Inbound Stok Vendor
 */
const addVendorStockInbound = async (req, res) => {
    const log = req.log;
    try {
        const { commodity_id } = req.params;
        const { 
            vendor_id, 
            quantity, 
            origin_source_name, 
            origin_source_location, 
            origin_proof_url 
        } = req.body;

        const db = req.db;

        log.info({ commodity_id, quantity }, 'Mencatat inbound stok vendor');

        if (!origin_proof_url) {
            return res.status(400).json({ status: 'error', message: 'Foto Bukti Pembelian/Nota wajib dilampirkan!' });
        }
        const origin_proof_hash = generateHash(origin_proof_url);

        const movementId = createId('INB');

        // 2. Catat Mutasi Inbound ke MutasiStok
        await db.prepare(`
            INSERT INTO MutasiStok (
                id, commodity_id, movement_type, quantity, reason,
                origin_source_name, origin_source_location, 
                origin_proof_url, origin_proof_hash
            ) VALUES (?, ?, 'INBOUND', ?, 'INBOUND_RESTOCK', ?, ?, ?, ?)
        `).bind(
            movementId, commodity_id, quantity,
            origin_source_name, origin_source_location,
            origin_proof_url, origin_proof_hash
        ).run();

        // 3. Update current_stock di tabel Barang
        await db.prepare(`
            UPDATE Barang 
            SET current_stock = current_stock + ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND vendor_id = ?
        `).bind(quantity, commodity_id, vendor_id).run();

        log.info({ movementId }, 'Stok Inbound berhasil dicatat');

        res.status(201).json({
            status: 'success',
            message: 'Stok Inbound berhasil dicatat.',
            data: {
                movement_id: movementId,
                commodity_id: commodity_id,
                added_quantity: quantity,
                origin_proof_hash: origin_proof_hash
            }
        });

    } catch (error) {
        log.error({ err: error.message }, 'Gagal mencatat stok masuk vendor');
        res.status(500).json({ status: 'error', message: 'Gagal mencatat stok masuk vendor.' });
    }
};

/**
 * Menghapus Komoditas dari Katalog
 */
const deleteCommodity = async (req, res) => {
    const log = req.log;
    try {
        const { vendor_id, commodity_id } = req.params;
        const db = req.db;

        log.info({ vendor_id, commodity_id }, 'Menghapus komoditas dari katalog');

        const result = await db.prepare(`
            UPDATE Barang 
            SET is_active = 0, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ? AND vendor_id = ?
        `).bind(commodity_id, vendor_id).run();

        if (result.meta && result.meta.changes === 0) {
            log.warn('Upaya hapus barang gagal: Barang tidak ditemukan');
            return res.status(404).json({ status: 'error', message: 'Barang tidak ditemukan.' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Barang berhasil dihapus dari katalog.'
        });

    } catch (error) {
        log.error({ err: error.message }, 'Gagal menghapus barang');
        res.status(500).json({ status: 'error', message: 'Gagal menghapus barang.' });
    }
};

/**
 * Melihat Katalog Komoditas Milik Vendor Tertentu
 */
const getVendorCommodities = async (req, res) => {
    const log = req.log;
    try {
        const { vendor_id } = req.params;
        const db = req.db;

        log.info({ vendor_id }, 'Mengambil katalog komoditas vendor');

        const commodities = await db.prepare(`
            SELECT 
                b.*, 
                b.harga as price,
                (SELECT COALESCE(AVG(u.rating), 0) FROM Ulasan u WHERE u.barang_id = b.id) as rating,
                (SELECT COALESCE(SUM(ip.kuantitas), 0) FROM ItemPesanan ip WHERE ip.barang_id = b.id) as total_sold
            FROM Barang b
            WHERE b.vendor_id = ? AND b.is_active = 1
        `).bind(vendor_id).all();

        const dataRows = commodities.results || (Array.isArray(commodities) ? commodities : []);

        const formattedData = dataRows.map(item => ({
            ...item,
            rating: parseFloat(item.rating || 0),
            total_sold: parseInt(item.total_sold || 0)
        }));

        res.status(200).json({
            status: 'success',
            data: formattedData
        });

    } catch (error) {
        log.error({ err: error.message }, 'Gagal mengambil data komoditas');
        res.status(500).json({ status: 'error', message: 'Gagal mengambil data komoditas.' });
    }
};

/**
 * Mengambil Detail Profil Vendor Berdasarkan ID
 */
const getVendorById = async (req, res) => {
    const log = req.log;
    try {
        const { id } = req.params;
        const db = req.db;

        log.info({ id }, 'Mengambil profil detail vendor');

        const vendor = await db.prepare(`
            SELECT 
                v.*, 
                a.nama as owner_name, 
                a.email as owner_email, 
                a.telepon as owner_phone
            FROM Vendors v
            JOIN Accounts a ON v.id = a.id
            WHERE v.id = ?
        `).bind(id).first();

        if (!vendor) {
            log.warn({ id }, 'Vendor tidak ditemukan');
            return res.status(404).json({ status: 'error', message: 'Vendor tidak ditemukan.' });
        }

        res.status(200).json({
            status: 'success',
            data: vendor
        });

    } catch (error) {
        log.error({ err: error.message }, 'Gagal mengambil data vendor');
        res.status(500).json({ status: 'error', message: 'Gagal mengambil data vendor.' });
    }
};

/**
 * Mengambil Statistik Dashboard Vendor (Real Data)
 */
const getVendorStats = async (req, res) => {
    const log = req.log;
    try {
        const { vendor_id } = req.params;
        const db = req.db;

        log.info({ vendor_id }, 'Mengambil statistik dashboard vendor');

        // 1. Total Pendapatan (Pesanan COMPLETED)
        const revenueData = await db.prepare(`
            SELECT SUM(total_harga) as total 
            FROM Pesanan 
            WHERE vendor_id = ? AND status = 'COMPLETED'
        `).bind(vendor_id).first();

        // 2. Pesanan Masuk (PENDING / READY)
        const orderData = await db.prepare(`
            SELECT COUNT(*) as count 
            FROM Pesanan 
            WHERE vendor_id = ? AND status IN ('PENDING', 'READY_FOR_PICKUP')
        `).bind(vendor_id).first();

        // 3. Produk Aktif
        const productData = await db.prepare(`
            SELECT COUNT(*) as count 
            FROM Barang 
            WHERE vendor_id = ? AND is_active = 1
        `).bind(vendor_id).first();

        // 4. Total Inbound (Barang Masuk)
        const inboundData = await db.prepare(`
            SELECT COUNT(*) as count 
            FROM MutasiStok m
            JOIN Barang b ON m.commodity_id = b.id
            WHERE b.vendor_id = ? AND m.movement_type = 'INBOUND'
        `).bind(vendor_id).first();

        res.status(200).json({
            status: 'success',
            data: {
                total_revenue: parseFloat(revenueData?.total || 0),
                active_orders: parseInt(orderData?.count || 0),
                active_products: parseInt(productData?.count || 0),
                total_inbound: parseInt(inboundData?.count || 0)
            }
        });

    } catch (error) {
        log.error({ err: error.message }, 'Gagal mengambil statistik dashboard');
        res.status(500).json({ status: 'error', message: 'Gagal mengambil statistik dashboard.' });
    }
};

/**
 * Mengambil Semua Daftar Vendor (Untuk Simulator/Admin)
 */
const getAllVendors = async (req, res) => {
    const log = req.log;
    try {
        const db = req.db;
        log.info('Menarik semua daftar vendor terdaftar');

        const results = await db.prepare('SELECT id, business_name FROM Vendors').all();
        const vendors = results.results || (Array.isArray(results) ? results : []);

        res.status(200).json({
            status: 'success',
            data: vendors
        });
    } catch (error) {
        log.error({ err: error.message }, 'Gagal mengambil daftar semua vendor');
        res.status(500).json({ status: 'error', message: 'Gagal mengambil daftar semua vendor.' });
    }
};

module.exports = {
    addCommodity,
    addVendorStockInbound,
    getVendorCommodities,
    getVendorById,
    getVendorStats,
    deleteCommodity,
    getAllVendors
};
