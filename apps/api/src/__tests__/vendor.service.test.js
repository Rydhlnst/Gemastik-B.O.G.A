import { describe, it, expect, vi } from 'vitest';

// 1. BAJAK BLOCKCHAIN SERVICE (Monkey Patching gaya preman)
const blockchainService = require('../services/blockchain.service');
blockchainService.registerVendorOnChain = vi.fn().mockResolvedValue('0xmocktxhash');
blockchainService.recordMovementOnChain = vi.fn().mockResolvedValue('0xmocktxhash');

const vendorService = require('../services/vendor.service');
const { generateHash } = require('../utils/crypto.util');

describe('VendorService Unit Tests', () => {
    const mockDb = {
        prepare: vi.fn().mockReturnThis(),
        bind: vi.fn().mockReturnThis(),
        run: vi.fn().mockResolvedValue({ success: true }),
        first: vi.fn().mockResolvedValue({ wallet_address: '0x123' })
    };

    describe('recordInbound()', () => {
        it('should correctly calculate document hash and record movement', async () => {
            const mockData = {
                quantity: 100,
                origin_source_name: 'Petani Subang',
                origin_source_location: 'Subang, Jabar',
                origin_proof_url: 'https://r2.boga.id/nota-001.jpg'
            };

            const result = await vendorService.recordInbound(mockDb, 'VEN-01', 'COM-01', mockData);

            expect(result.success).toBe(true);
            expect(result.proofHash).toBe(generateHash(mockData.origin_proof_url));
            expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO MutasiStok'));
        });
    });

    describe('updateProfile()', () => {
        it('should sync document hashes to database', async () => {
            const mockProfile = {
                business_name: 'Toko Baru',
                akta_document_url: 'https://r2.id/akta.pdf',
                nib_document_url: 'https://r2.id/nib.pdf',
                npwp_document_url: 'https://r2.id/npwp.pdf'
            };

            const result = await vendorService.updateProfile(mockDb, 'VEN-01', mockProfile);

            expect(result.success).toBe(true);
            expect(mockDb.bind).toHaveBeenCalled();
        });
    });
});
