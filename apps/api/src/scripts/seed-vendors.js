require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { queryD1 } = require('../services/d1.service');
const blockchainService = require('../services/blockchain.service');
const { generateHash } = require('../utils/crypto.util');
const { logger } = require('../utils/logger.util');
const bcrypt = require('bcrypt');
const betterAuthService = require('../services/better-auth.service');

// Hash untuk password: "password123"
const SEED_PASSWORD_HASH = bcrypt.hashSync('password123', 10);

const seed = async () => {
    logger.info('Starting full system reset and COMPLETE seeding with password123...');

    try {
        // 1. MEMBERSIHKAN SEMUA DATA LAMA
        logger.warn('Clearing existing data from tables...');
        const tables = ['PurchaseOrderItems', 'PurchaseOrders', 'Vendor_Stock_Movements', 'Commodities', 'Vendors', 'Accounts'];
        for (const table of tables) { await queryD1(`DELETE FROM ${table}`); }

        // 2. DATA VENDOR LENGKAP
        const vendors = [
            {
                id: 'VDR-PN-001', nik: '3201010101010001', name: 'Haji Ahmad', email: 'ahmad@pangan.co.id',
                business_name: 'PT. Pangan Nusantara', wallet: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
                status: 'APPROVED', nib: '1234567890111', address: 'Jl. Industri No. 45, Bekasi', lat: -6.2856, long: 107.1706,
                npwp: '01.234.567.8-012.000', bank: { name: 'Bank Mandiri', no: '1234567890', owner: 'PT Pangan Nusantara' },
                docs: {
                    akta: 'https://r2.boga.id/v1/akta_pangan.pdf', sk: 'https://r2.boga.id/v1/sk_kemenkumham.pdf',
                    npwp: 'https://r2.boga.id/v1/npwp_bisnis.pdf', nib: 'https://r2.boga.id/v1/nib_legal.pdf', sppg: 'https://r2.boga.id/v1/sppg_ready.pdf'
                }
            },
            {
                id: 'VDR-BT-002', nik: '3201010101010002', name: 'Ibu Siti Aminah', email: 'siti@berkahtani.com',
                business_name: 'CV. Berkah Tani', wallet: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
                status: 'APPROVED', nib: '1234567890222', address: 'Jl. Pertanian Raya No. 12, Lembang', lat: -6.8167, long: 107.6167,
                npwp: '02.345.678.9-023.000', bank: { name: 'Bank BRI', no: '0987654321', owner: 'Siti Aminah' },
                docs: {
                    akta: 'https://r2.boga.id/v2/akta_tani.pdf', sk: 'https://r2.boga.id/v2/sk_kemenkumham_tani.pdf',
                    npwp: 'https://r2.boga.id/v2/npwp_siti.pdf', nib: 'https://r2.boga.id/v2/nib_siti.pdf', sppg: 'https://r2.boga.id/v2/sppg_ready_tani.pdf'
                }
            },
            {
                id: 'VDR-SS-003', nik: '3201010101010003', name: 'Bapak Cecep Supriatna', email: 'cecep@sayursegar.id',
                business_name: 'UD. Sayur Segar', wallet: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
                status: 'PENDING_AI', nib: '1234567890333', address: 'Pasar Induk Kramat Jati, Jakarta Timur', lat: -6.2892, long: 106.8732,
                npwp: '03.456.789.0-034.000', bank: { name: 'Bank BNI', no: '1122334455', owner: 'Cecep Supriatna' },
                docs: {
                    akta: 'https://r2.boga.id/v3/akta_cecep.pdf', sk: null, npwp: 'https://r2.boga.id/v3/npwp_cecep.pdf',
                    nib: 'https://r2.boga.id/v3/nib_cecep.pdf', sppg: null
                }
            }
        ];

        for (const v of vendors) {
            logger.info(`Injeksi Data & Kredensial: ${v.business_name}...`);

            // A1. Registrasi ke Better-Auth (Agar bisa Login)
            try {
                await betterAuthService.ensureRoleCredential({
                    role: 'VENDOR',
                    email: v.email,
                    password: 'password123',
                    displayName: v.name
                });
                logger.info(`[Better-Auth] Akun ${v.email} siap digunakan.`);
            } catch (baError) {
                logger.warn(`[Better-Auth Warning] Gagal/Sudah ada akun untuk ${v.email}`);
            }

            // A2. Simpan ke Accounts (D1)
            await queryD1(`
                INSERT INTO Accounts (id, nik, name, email, role, wallet_address, password_hash)
                VALUES (?, ?, ?, ?, 'VENDOR', ?, ?)
            `, [v.id, v.nik, v.name, v.email, v.wallet, SEED_PASSWORD_HASH]);

            // B. Simpan ke Vendors (D1)
            await queryD1(`
                INSERT INTO Vendors (
                    id, business_name, business_email, business_phone, business_address,
                    latitude, longitude, npwp_number, nib_number, logo_url,
                    akta_document_url, akta_document_hash,
                    sk_kemenkumham_url, sk_kemenkumham_hash,
                    npwp_document_url, npwp_document_hash,
                    nib_document_url, nib_document_hash,
                    sppg_readiness_document_url, sppg_readiness_document_hash,
                    bank_name, bank_account_number, bank_account_name, status
                ) VALUES (?, ?, ?, '0812345678', ?, ?, ?, ?, ?, 'https://logo.com/v.png', 
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                v.id, v.business_name, v.email, v.address, v.lat, v.long, v.npwp, v.nib,
                v.docs.akta, generateHash(v.docs.akta || ''),
                v.docs.sk, generateHash(v.docs.sk || ''),
                v.docs.npwp, generateHash(v.docs.npwp || ''),
                v.docs.nib, generateHash(v.docs.nib || ''),
                v.docs.sppg, generateHash(v.docs.sppg || ''),
                v.bank.name, v.bank.no, v.bank.owner, v.status
            ]);

            // C. Blockchain Sync
            try {
                const combinedHash = generateHash(v.business_name + v.nib);
                await blockchainService.registerVendorOnChain(v.wallet, v.nib, combinedHash);
            } catch (e) { logger.warn(`Skipping blockchain for ${v.business_name}`); }
        }

        logger.info('FULL Seeding completed! 🚀 Silakan login dengan password: password123');
        process.exit(0);
    } catch (error) { logger.error('Seeding failed:', error); process.exit(1); }
};

seed();
