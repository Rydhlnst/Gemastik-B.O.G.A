const logger = require('../utils/logger.util');
const { createId } = require('../utils/crypto.util');
const bcrypt = require('bcrypt');

/**
 * SERVICE: Autentikasi & Pendaftaran
 * MENGGUNAKAN D1 BRIDGE (Bypass Prisma) untuk kestabilan Cloudflare
 */
class AuthService {

    /**
     * Ambil Profil Lengkap via D1 Bridge
     */
    async ambilProfilLengkap(db, email) {
        // Query menggunakan jembatan D1 Anda (req.db)
        const user = await db.prepare(`
            SELECT a.*, v.business_name, v.status as vendor_status
            FROM Accounts a
            LEFT JOIN Vendors v ON a.id = v.id
            WHERE a.email = ?
            LIMIT 1
        `).bind(email).first();

        if (!user) return null;

        // Map snake_case ke camelCase untuk kompatibilitas Frontend
        return {
            ...user,
            passwordHash: user.password_hash,
            profilVendor: user.business_name ? {
                namaBisnis: user.business_name,
                status: user.vendor_status
            } : null
        };
    }

    /**
     * Verifikasi Login & Ambil Token
     */
    async login(db, email, password) {
        logger.info({ email }, '[AuthService] Memverifikasi upaya login');

        // 1. Cari User pakai Jembatan D1
        const user = await this.ambilProfilLengkap(db, email);
        if (!user) {
            throw new Error('Email atau Password salah!');
        }

        // 2. Cek Password
        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) {
            throw new Error('Email atau Password salah!');
        }

        // Bersihkan data sensitif
        delete user.password_hash;
        delete user.passwordHash;
        
        return user;
    }

    /**
     * Daftar Vendor via D1 Bridge (Zero-Trust Onboarding)
     */
    async daftarVendor(db, data) {
        const { generateHash } = require('../utils/crypto.util');
        logger.info({ email: data.email }, '[AuthService] Memulai proses pendaftaran vendor baru');

        const idBaru = createId('ACC-VEN');
        const salt = await bcrypt.genSalt(10);
        const passHash = await bcrypt.hash(data.password, salt);

        // Zero-Trust: Kalkulasi Hash Sidik Jari untuk tiap dokumen
        const aktaHash = data.akta_document_url ? generateHash(data.akta_document_url) : null;
        const skHash = data.sk_kemenkumham_url ? generateHash(data.sk_kemenkumham_url) : null;
        const npwpHash = data.npwp_document_url ? generateHash(data.npwp_document_url) : null;
        const nibHash = data.nib_document_url ? generateHash(data.nib_document_url) : null;
        const sppgHash = data.sppg_readiness_document_url ? generateHash(data.sppg_readiness_document_url) : null;

        // 1. Simpan ke Accounts
        await db.prepare(`
            INSERT INTO Accounts (id, nik, nama, email, telepon, peran, password_hash, wallet_address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            idBaru, data.nik, data.name || data.nama, data.email, data.phone_number || data.telepon, 
            'VENDOR', passHash, data.wallet_address || data.alamatWallet
        ).run();

        // 2. Simpan ke Vendors (Lengkap dengan Legalitas & Bank)
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
                ?, ?, ?, 'PENDING'
            )
        `).bind(
            idBaru, data.business_name, data.business_email || data.email, 
            data.business_phone || data.phone_number || data.telepon, data.business_address,
            data.latitude || 0, data.longitude || 0, data.npwp_number, data.nib_number, data.logo_url,
            data.akta_document_url, aktaHash,
            data.sk_kemenkumham_url, skHash,
            data.npwp_document_url, npwpHash,
            data.nib_document_url, nibHash,
            data.sppg_readiness_document_url, sppgHash,
            data.bank_name, data.bank_account_number, data.bank_account_name
        ).run();

        return { id: idBaru, email: data.email, status: 'PENDING' };
    }
}

module.exports = AuthService;
