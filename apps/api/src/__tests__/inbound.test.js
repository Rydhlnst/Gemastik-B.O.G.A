const { recordInbound } = require('../controllers/inbound.controller');

describe('Inbound Controller TDD', () => {
    let mockReq, mockRes, mockDb;

    beforeEach(() => {
        // Mock Database D1
        mockDb = {
            prepare: vi.fn().mockReturnThis(),
            bind: vi.fn().mockReturnThis(),
            run: vi.fn().mockResolvedValue({ success: true }),
            first: vi.fn(),
            all: vi.fn()
        };

        mockReq = {
            body: {
                commodity_id: 'COM-001',
                quantity: 50,
                price_per_unit: 10000,
                origin_source_name: 'Pemasok Test'
            },
            db: mockDb,
            log: { info: vi.fn(), error: vi.fn(), warn: vi.fn() } // Tambahkan warn disini
        };

        mockRes = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis()
        };
    });

    it('should successfully record inbound and update stock atomically', async () => {
        // 1. Mock data barang saat ini
        mockDb.first.mockResolvedValue({
            id: 'COM-001',
            name: 'Beras Ramos',
            current_stock: 100,
            target_stock: 200
        });

        // 2. Jalankan fungsi controller
        await recordInbound(mockReq, mockRes);

        // 3. Verifikasi kueri database (Atomic Update)
        expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('UPDATE Barang'));
        expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('MAX(target_stock, current_stock + ?)'));
        
        // 4. Verifikasi mutasi stok dicatat
        expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO MutasiStok'));

        // 5. Verifikasi response sukses
        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            status: 'success'
        }));
    });

    it('should return 400 if commodity_id is missing', async () => {
        mockReq.body.commodity_id = null;
        await recordInbound(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
    });
});
