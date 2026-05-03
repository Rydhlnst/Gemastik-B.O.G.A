const { generateHash } = require('../utils/crypto.util');
const logger = require('../utils/logger.util');
const blockchainService = require('./blockchain.service');

/**
 * SERVICE: Vendor Management System
 * Mengelola sinkronisasi antara Database D1 dan Blockchain Registry
 */
class VendorService {
    
    /**
     * Memperbarui Profil Vendor (DB + Blockchain Sync)
     */
    async updateProfile(db, vendorId, data) {
        const MODULE = 'VendorService';
        logger.info(MODULE, 'Memperbarui profil vendor...', { vendorId });

        try {
            // 1. Kalkulasi Hash Dokumen (Zero-Trust Fingerprint)
            // Kita gabungkan URL dokumen utama untuk membuat satu hash identitas unik
            const combinedDocs = `${data.akta_document_url}${data.nib_document_url}${data.npwp_document_url}`;
            const combinedHash = generateHash(combinedDocs);

            // 2. Simpan ke Database D1
            logger.debug(MODULE, 'Menyimpan data profil ke Database D1', { vendorId });
            await db.prepare(`
                UPDATE Vendors SET 
                    business_name = ?, business_email = ?, business_phone = ?, business_address = ?,
                    latitude = ?, longitude = ?, npwp_number = ?, nib_number = ?, logo_url = ?,
                    akta_document_url = ?, akta_document_hash = ?,
                    sk_kemenkumham_url = ?, sk_kemenkumham_hash = ?,
                    npwp_document_url = ?, npwp_document_hash = ?,
                    nib_document_url = ?, nib_document_hash = ?,
                    sppg_readiness_document_url = ?, sppg_readiness_document_hash = ?,
                    bank_name = ?, bank_account_number = ?, bank_account_name = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).bind(
                data.business_name, data.business_email, data.business_phone, data.business_address,
                data.latitude, data.longitude, data.npwp_number, data.nib_number, data.logo_url,
                data.akta_document_url, generateHash(data.akta_document_url),
                data.sk_kemenkumham_url, generateHash(data.sk_kemenkumham_url),
                data.npwp_document_url, generateHash(data.npwp_document_url),
                data.nib_document_url, generateHash(data.nib_document_url),
                data.sppg_readiness_document_url, generateHash(data.sppg_readiness_document_url),
                data.bank_name, data.bank_account_number, data.bank_account_name,
                vendorId
            ).run();

            // 3. Sinkronisasi ke Blockchain (On-Chain Audit Trail)
            // Ambil wallet address vendor untuk pendaftaran on-chain
            const account = await db.prepare(`SELECT wallet_address FROM Accounts WHERE id = ?`).bind(vendorId).first();
            
            let txHash = null;
            if (account && account.wallet_address) {
                logger.info(MODULE, 'Sinkronisasi data vendor ke Blockchain...', { wallet: account.wallet_address });
                txHash = await blockchainService.registerVendorOnChain(
                    account.wallet_address, 
                    data.nib_number, 
                    combinedHash
                );
            }

            return { success: true, txHash, combinedHash };

        } catch (error) {
            logger.error(MODULE, 'Gagal memperbarui profil vendor', error);
            throw error;
        }
    }

    /**
     * Mencatat Stok Masuk (Inbound) dengan Traceability Hash
     */
    async recordInbound(db, vendorId, commodityId, data) {
        const MODULE = 'VendorService';
        logger.info(MODULE, 'Mencatat stok masuk (Inbound)...', { vendorId, commodityId });

        try {
            const proofHash = generateHash(data.origin_proof_url);
            const movementId = `INB-${Date.now().toString(36).toUpperCase()}`;

            // 1. Simpan Mutasi
            await db.prepare(`
                INSERT INTO MutasiStok (
                    id, commodity_id, movement_type, quantity,
                    reason, origin_source_name, origin_source_location, 
                    origin_proof_url, origin_proof_hash
                ) VALUES (?, ?, 'INBOUND', ?, 'INBOUND_RESTOCK', ?, ?, ?, ?)
            `).bind(
                movementId, commodityId, data.quantity,
                data.origin_source_name, data.origin_source_location,
                data.origin_proof_url, proofHash
            ).run();

            // 2. Update Stok Utama
            await db.prepare(`
                UPDATE Barang SET current_stock = current_stock + ? WHERE id = ?
            `).bind(data.quantity, commodityId).run();

            return { success: true, movementId, proofHash };
        } catch (error) {
            logger.error(MODULE, 'Gagal mencatat stok masuk', error);
            throw error;
        }
    }

    /**
     * Menambah Barang Baru ke E-Katalog
     */
    async createCommodity(db, data) {
        const MODULE = 'VendorService';
        logger.info(MODULE, 'Membuat barang baru di E-Katalog...', { name: data.name });

        try {
            const commodityId = `COM-${Date.now().toString(36).toUpperCase()}`;
            
            await db.prepare(`
                INSERT INTO Barang (
                    id, vendor_id, pihps_id, name, harga, unit, 
                    markup_percentage, is_markup, current_stock, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 1)
            `).bind(
                commodityId, data.vendor_id, data.pihps_id, data.name, data.harga, data.unit,
                data.markup_percentage || 0, data.is_markup || 0
            ).run();

            return { id: commodityId, name: data.name };
        } catch (error) {
            logger.error(MODULE, 'Gagal membuat barang baru', error);
            throw error;
        }
    }
}

module.exports = new VendorService();
