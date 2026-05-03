import { describe, it, expect, vi, beforeEach } from 'vitest';
// Menggunakan import daripada require untuk konsistensi di environment Vitest
import orderService from '../services/order.service';

describe('OrderService Unit Tests (Zero-Trust Logic)', () => {
    let mockDb;

    beforeEach(() => {
        mockDb = {
            prepare: vi.fn().mockReturnThis(),
            bind: vi.fn().mockReturnThis(),
            run: vi.fn().mockResolvedValue({ success: true, meta: { changes: 1 } }),
            all: vi.fn(),
            first: vi.fn()
        };
        vi.clearAllMocks();
    });

    describe('createOrder() - Zero-Trust Validation', () => {
        it('harus membuat pesanan dengan harga dari DB dan memvalidasi stok', async () => {
            // Mock data barang di DB
            mockDb.first.mockResolvedValue({
                name: 'Beras Super',
                harga: 15000,
                current_stock: 1000
            });

            const orderInput = {
                pembeliId: 'GOV-01',
                vendorId: 'VEN-01',
                items: [{ itemId: 'BRG-01', quantity: 10 }]
            };

            const result = await orderService.createOrder(mockDb, orderInput);

            expect(result.poId).toBeDefined();
            expect(result.totalHarga).toBe(150000); // 15000 * 10
            expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO Pesanan"));
            expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO PesananSignatures"));
        });

        it('harus gagal jika stok tidak mencukupi', async () => {
            mockDb.first.mockResolvedValue({
                name: 'Beras Super',
                harga: 15000,
                current_stock: 5 // Stok cuma 5
            });

            const orderInput = {
                pembeliId: 'GOV-01',
                vendorId: 'VEN-01',
                items: [{ itemId: 'BRG-01', quantity: 10 }] // Minta 10
            };

            await expect(orderService.createOrder(mockDb, orderInput)).rejects.toThrow('Stok Beras Super tidak mencukupi.');
        });
    });

    describe('markReadyForPickup()', () => {
        it('harus menghasilkan PIN 6 digit dan mengupdate status', async () => {
            const result = await orderService.markReadyForPickup(mockDb, 'PO-001', 'VEN-01');
            
            expect(result.success).toBe(true);
            expect(result.pickupPin).toHaveLength(6);
            expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining("UPDATE Pesanan SET status = 'READY_FOR_PICKUP'"));
        });
    });

    describe('signOrder() - Multi-Sig Logic', () => {
        it('harus mencatat tanda tangan QC dan status tetap VALIDATING jika belum 3/3', async () => {
            mockDb.first.mockResolvedValue({
                qc_status: 'SIGNED',
                admin_status: 'PENDING',
                logistik_status: 'PENDING'
            });

            const result = await orderService.signOrder(mockDb, 'PO-001', 'QC');

            expect(result.status).toBe('VALIDATING');
            expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining("qc_status = 'SIGNED'"));
        });

        it('harus mencairkan dana (RELEASED) jika tanda tangan sudah 3/3', async () => {
            mockDb.first.mockResolvedValue({
                qc_status: 'SIGNED',
                admin_status: 'SIGNED',
                logistik_status: 'SIGNED'
            });

            const result = await orderService.signOrder(mockDb, 'PO-001', 'LOGISTIK');

            expect(result.status).toBe('COMPLETED');
            expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining("escrow_status = 'RELEASED'"));
        });
    });

    describe('rejectOrder()', () => {
        it('harus merubah status pesanan menjadi CANCELLED dan EXPIRED', async () => {
            const result = await orderService.rejectOrder(mockDb, 'PO-001', 'VEN-01');

            expect(result.success).toBe(true);
            expect(result.status).toBe('REJECTED');
            expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining("status = 'CANCELLED'"));
            expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining("escrow_status = 'EXPIRED'"));
        });
    });
});
