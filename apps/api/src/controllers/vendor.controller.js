const crypto = require('crypto');
const bcrypt = require('bcrypt');

// Fungsi Utilitas Zero-Trust untuk Kriptografi Dokumen
const generateHash = (data) => {
    if (!data) return null;
    return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Mendaftarkan Vendor Baru beserta Dokumen Legalitas (Onboarding)
 */
const registerVendor = async (req, res) => {
    try {
        const {
            // Data Akun (Perwakilan)
            nik, name, email, phone_number, password, wallet_address,
            // Data Bisnis (Mitra)
            business_name, business_email, business_phone, business_address, 
            latitude, longitude, npwp_number, nib_number, logo_url,
            // Dokumen Legalitas (URL dari R2)
            akta_document_url, sk_kemenkumham_url, npwp_document_url, 
            nib_document_url, sppg_readiness_document_url,
            // Data Bank
            bank_name, bank_account_number, bank_account_name
        } = req.body;

        const db = req.db;
        const accountId = `ACC-VEN-${crypto.randomUUID().split('-')[0].toUpperCase()}`; // Generate ID singkat
        
        // 1. Hash Password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // 2. Zero-Trust: Kalkulasi Hash Sidik Jari untuk tiap dokumen yang diunggah
        const akta_document_hash = generateHash(akta_document_url);
        const sk_kemenkumham_hash = generateHash(sk_kemenkumham_url);
        const npwp_document_hash = generateHash(npwp_document_url);
        const nib_document_hash = generateHash(nib_document_url);
        const sppg_readiness_document_hash = generateHash(sppg_readiness_document_url);

        // 3. Simpan ke Tabel Accounts
        await db.prepare(`
            INSERT INTO Accounts (
                id, nik, name, email, phone_number, role, wallet_address, password_hash
            ) VALUES (?, ?, ?, ?, ?, 'VENDOR', ?, ?)
        `).bind(
            accountId, nik, name, email, phone_number, wallet_address, password_hash
        ).run();

        // 4. Simpan ke Tabel Vendors
        await db.prepare(`
            INSERT INTO Vendors (
                id, business_name, business_email, business_phone, business_address,
                latitude, longitude, npwp_number, nib_number, logo_url,
                akta_document_url, akta_document_hash,
                sk_kemenkumham_url, sk_kemenkumham_hash,
                npwp_document_url, npwp_document_hash,
                nib_document_url, nib_document_hash,
                sppg_readiness_document_url, sppg_readiness_document_hash,
                bank_name, bank_account_number, bank_account_name,
                status
            ) VALUES (
                ?, ?, ?, ?, ?, 
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, 'PENDING_AI'
            )
        `).bind(
            accountId, business_name, business_email, business_phone, business_address,
            latitude, longitude, npwp_number, nib_number, logo_url,
            akta_document_url, akta_document_hash,
            sk_kemenkumham_url, sk_kemenkumham_hash,
            npwp_document_url, npwp_document_hash,
            nib_document_url, nib_document_hash,
            sppg_readiness_document_url, sppg_readiness_document_hash,
            bank_name, bank_account_number, bank_account_name
        ).run();

        // 5. Kembalikan Response
        res.status(201).json({
            status: 'success',
            message: 'Registrasi Vendor berhasil. Menunggu proses validasi AI Vision.',
            data: {
                vendor_id: accountId,
                status: 'PENDING_AI',
                document_hashes: {
                    nib: nib_document_hash,
                    npwp: npwp_document_hash,
                    akta: akta_document_hash
                }
            }
        });

    } catch (error) {
        console.error('[Vendor Registration Error]:', error);
        res.status(500).json({ status: 'error', message: 'Gagal melakukan pendaftaran vendor.' });
    }
};

/**
 * Menambahkan Komoditas ke E-Katalog (Dengan Kalkulasi Mark-Up PIHPS)
 */
const addCommodity = async (req, res) => {
    try {
        const { vendor_id, pihps_id, name, price, unit } = req.body;
        const db = req.db;

        // 1. Ambil Harga PIHPS dari Master Table
        const pihpsData = await db.prepare(`SELECT max_het_price FROM Master_PIHPS_HET WHERE id = ?`).bind(pihps_id).first();
        
        if (!pihpsData) {
            return res.status(404).json({ status: 'error', message: 'Kategori PIHPS tidak ditemukan.' });
        }

        const max_het_price = pihpsData.max_het_price;

        // 2. Kalkulasi Mark-Up
        let markup_percentage = 0;
        let is_markup = 0; // SQLite boolean is 0 or 1

        if (price > max_het_price) {
            markup_percentage = ((price - max_het_price) / max_het_price) * 100;
            is_markup = 1;
        }

        const commodityId = `COM-${crypto.randomUUID().split('-')[0].toUpperCase()}`;

        // 3. Simpan ke E-Katalog
        await db.prepare(`
            INSERT INTO Commodities (
                id, vendor_id, pihps_id, name, price, unit, 
                markup_percentage, is_markup, current_stock, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 1)
        `).bind(
            commodityId, vendor_id, pihps_id, name, price, unit, 
            markup_percentage, is_markup
        ).run();

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
        console.error('[Add Commodity Error]:', error);
        res.status(500).json({ status: 'error', message: 'Gagal menambahkan komoditas.' });
    }
};

/**
 * Mencatat Inbound Stok Vendor (Barang Masuk dari Petani/Sumber)
 */
const addVendorStockInbound = async (req, res) => {
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

        // 1. Zero-Trust: Kalkulasi Hash dari Foto Nota Pembelian
        if (!origin_proof_url) {
            return res.status(400).json({ status: 'error', message: 'Foto Bukti Pembelian/Nota (origin_proof_url) wajib dilampirkan!' });
        }
        const origin_proof_hash = generateHash(origin_proof_url);

        const movementId = `INB-${crypto.randomUUID().split('-')[0].toUpperCase()}`;

        // 2. Catat Mutasi Inbound ke Vendor_Stock_Movements
        await db.prepare(`
            INSERT INTO Vendor_Stock_Movements (
                id, vendor_id, commodity_id, movement_type, quantity,
                origin_source_name, origin_source_location, 
                origin_proof_url, origin_proof_hash
            ) VALUES (?, ?, ?, 'INBOUND', ?, ?, ?, ?, ?)
        `).bind(
            movementId, vendor_id, commodity_id, quantity,
            origin_source_name, origin_source_location,
            origin_proof_url, origin_proof_hash
        ).run();

        // 3. Update current_stock di tabel Commodities
        await db.prepare(`
            UPDATE Commodities 
            SET current_stock = current_stock + ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND vendor_id = ?
        `).bind(quantity, commodity_id, vendor_id).run();

        res.status(201).json({
            status: 'success',
            message: 'Stok Inbound berhasil dicatat. Integritas nota dijamin oleh Zero-Trust Hash.',
            data: {
                movement_id: movementId,
                commodity_id: commodity_id,
                added_quantity: quantity,
                origin_proof_hash: origin_proof_hash
            }
        });

    } catch (error) {
        console.error('[Vendor Inbound Error]:', error);
        res.status(500).json({ status: 'error', message: 'Gagal mencatat stok masuk vendor.' });
    }
};

/**
 * Melihat Katalog Komoditas Milik Vendor Tertentu
 */
const getVendorCommodities = async (req, res) => {
    try {
        const { vendor_id } = req.params;
        const db = req.db;

        const commodities = await db.prepare(`
            SELECT * FROM Commodities WHERE vendor_id = ? AND is_active = 1
        `).bind(vendor_id).all();

        res.status(200).json({
            status: 'success',
            data: commodities
        });

    } catch (error) {
        console.error('[Get Commodities Error]:', error);
        res.status(500).json({ status: 'error', message: 'Gagal mengambil data komoditas.' });
    }
};

/**
 * Mengambil Detail Profil Vendor Berdasarkan ID
 */
const getVendorById = async (req, res) => {
    try {
        const { id } = req.params;
        const db = req.db;

        const vendor = await db.prepare(`
            SELECT 
                v.*, 
                a.name as owner_name, 
                a.email as owner_email, 
                a.phone_number as owner_phone
            FROM Vendors v
            JOIN Accounts a ON v.id = a.id
            WHERE v.id = ?
        `).bind(id).first();

        if (!vendor) {
            return res.status(404).json({ status: 'error', message: 'Vendor tidak ditemukan.' });
        }

        res.status(200).json({
            status: 'success',
            data: vendor
        });

    } catch (error) {
        console.error('[Get Vendor Error]:', error);
        res.status(500).json({ status: 'error', message: 'Gagal mengambil data vendor.' });
    }
};

module.exports = {
    registerVendor,
    addCommodity,
    addVendorStockInbound,
    getVendorCommodities,
    getVendorById
};
