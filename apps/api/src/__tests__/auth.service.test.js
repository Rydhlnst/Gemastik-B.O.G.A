import { describe, it, expect, vi, beforeEach } from 'vitest';

// 1. PANGGIL BCRYPT ASLI
const bcrypt = require('bcrypt');

// 2. GANTI FUNGSI ASLINYA DENGAN YANG PALSU (MONKEY PATCH)
bcrypt.compare = vi.fn();
bcrypt.hash = vi.fn();
bcrypt.genSalt = vi.fn();

const AuthService = require('../services/auth.service');
const authService = new AuthService();

describe('AuthService Unit Tests (D1 Bridge)', () => {
    let mockDb;

    beforeEach(() => {
        mockDb = {
            prepare: vi.fn().mockReturnThis(),
            bind: vi.fn().mockReturnThis(),
            run: vi.fn().mockResolvedValue({ success: true, lastRowId: 'ACC-01' }),
            first: vi.fn()
        };
        vi.clearAllMocks();
        
        // Setup default behavior
        bcrypt.compare.mockResolvedValue(true);
        bcrypt.hash.mockResolvedValue('hashed_password');
        bcrypt.genSalt.mockResolvedValue('salt');
    });

    describe('daftarVendor()', () => {
        it('harus berhasil mendaftarkan vendor baru', async () => {
            const mockData = {
                nik: '3201001122330001',
                nama: 'Ahmad Vendor',
                email: 'ahmad@test.com',
                password: 'password123',
                namaBisnis: 'PT. Pangan Tes'
            };

            const result = await authService.daftarVendor(mockDb, mockData);
            expect(result.email).toBe(mockData.email);
        });
    });

    describe('login()', () => {
        it('harus berhasil login jika email dan password benar', async () => {
            mockDb.first.mockResolvedValue({
                id: 'ACC-01',
                email: 'ahmad@test.com',
                password: 'hashed_password',
                peran: 'VENDOR'
            });

            const user = await authService.login(mockDb, 'ahmad@test.com', 'password123');
            expect(user.id).toBe('ACC-01');
        });

        it('harus gagal jika password salah', async () => {
            bcrypt.compare.mockResolvedValue(false);

            mockDb.first.mockResolvedValue({
                id: 'ACC-01',
                email: 'ahmad@test.com',
                password: 'hashed_password'
            });

            await expect(authService.login(mockDb, 'ahmad@test.com', 'salah'))
                .rejects.toThrow('Email atau Password salah!');
        });
    });
});
