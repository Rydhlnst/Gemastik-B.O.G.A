import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login, daftarVendor } from '../controllers/auth.controller';
import jwt from 'jsonwebtoken';

// Mocking JWT saja karena ini library eksternal
vi.mock('jsonwebtoken', () => ({
    sign: vi.fn(() => 'mock-jwt-token')
}));

describe('Auth Controller TDD (Dependency Injection)', () => {
    let mockReq, mockRes, mockLog, mockAuthService;

    beforeEach(() => {
        // Mocking Service secara lokal (Sangat Mudah!)
        mockAuthService = {
            login: vi.fn(),
            daftarVendor: vi.fn()
        };

        mockLog = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
        mockRes = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis()
        };

        vi.clearAllMocks();
    });

    describe('login', () => {
        it('should return token on successful login', async () => {
            mockReq = {
                body: { email: 'user@test.com', password: 'password123' },
                db: {},
                log: mockLog,
                authService: mockAuthService // Suntikkan Mock di sini
            };

            const mockUser = { id: 'U-001', email: 'user@test.com', peran: 'VENDOR' };
            mockAuthService.login.mockResolvedValue(mockUser);

            await login(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 'success'
            }));
            const responseData = mockRes.json.mock.calls[0][0].data;
            expect(responseData.token).toBeDefined();
            expect(typeof responseData.token).toBe('string');
        });

        it('should return 401 on invalid credentials', async () => {
            mockReq = {
                body: { email: 'user@test.com', password: 'wrong' },
                db: {},
                log: mockLog,
                authService: mockAuthService
            };

            mockAuthService.login.mockRejectedValue(new Error('Password salah'));

            await login(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockLog.warn).toHaveBeenCalledWith(expect.anything(), 'Upaya login gagal');
        });
    });

    describe('daftarVendor', () => {
        it('should return 201 on success', async () => {
            mockReq = {
                body: { email: 'vendor@test.com', nama_perusahaan: 'PT Test' },
                db: {},
                log: mockLog,
                authService: mockAuthService
            };

            mockAuthService.daftarVendor.mockResolvedValue({ id: 'V-001', email: 'vendor@test.com' });

            await daftarVendor(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(201);
        });
    });
});
