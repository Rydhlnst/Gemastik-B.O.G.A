import { describe, it, expect, vi, beforeEach } from 'vitest';
const inventoryService = require('../services/inventory.service');

describe('InventoryService Unit Tests (Outbound Logic)', () => {
    let mockDb;

    beforeEach(() => {
        mockDb = {
            prepare: vi.fn().mockReturnThis(),
            bind: vi.fn().mockReturnThis(),
            run: vi.fn().mockResolvedValue({ success: true }),
            all: vi.fn(),
            first: vi.fn()
        };
        vi.clearAllMocks();
    });

    describe('recordOutbound()', () => {
        it('harus mencatat mutasi keluar dan mengurangi stok jika stok cukup', async () => {
            // Mock barang di gudang (Ada 100 kg)
            mockDb.first.mockResolvedValue({
                name: 'Beras Super',
                current_stock: 100
            });

            const input = {
                commodityId: 'BRG-001',
                quantity: 20,
                reason: 'PO_FULFILLMENT'
            };

            const result = await inventoryService.recordOutbound(mockDb, input);

            expect(result.success).toBe(true);
            expect(result.mutasiId).toContain('MUT-OUT-');
            // Pastikan ada query update stok
            expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining("UPDATE Barang SET current_stock = current_stock - ?"));
        });

        it('harus gagal jika stok tidak mencukupi', async () => {
            // Mock barang di gudang (Cuma ada 5 kg)
            mockDb.first.mockResolvedValue({
                name: 'Beras Super',
                current_stock: 5
            });

            const input = {
                commodityId: 'BRG-001',
                quantity: 10, // Minta 10 kg
                reason: 'SPOILAGE'
            };

            await expect(inventoryService.recordOutbound(mockDb, input)).rejects.toThrow('Stok Beras Super tidak mencukupi');
        });

        it('harus gagal jika barang tidak ditemukan', async () => {
            mockDb.first.mockResolvedValue(null);

            const input = {
                commodityId: 'GHOST-ID',
                quantity: 1,
                reason: 'ADJUSTMENT'
            };

            await expect(inventoryService.recordOutbound(mockDb, input)).rejects.toThrow('Barang tidak ditemukan');
        });
    });
});
