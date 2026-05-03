import { describe, it, expect, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import {
    authenticateUserToken,
    authenticateAdminToken,
    authorizeRoles,
} from '../middlewares/auth.middleware';
import { APP_ROLE, ADMIN_ROLE } from '../constants/auth.constants';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

function createMockRes() {
    const response = {
        statusCode: 200,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.body = payload;
            return this;
        },
    };
    return response;
}

describe('Auth Middleware Tests', () => {
    it('authenticateUserToken should reject request without bearer token', () => {
        const req = { headers: {} };
        const res = createMockRes();
        const next = vi.fn();

        authenticateUserToken(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.statusCode).toBe(401);
    });

    it('authenticateUserToken should set req.user when token valid', () => {
        // Gunakan 'peran' bukan 'role' agar sinkron dengan middleware
        const token = jwt.sign(
            { sub: 10, actorId: 10, peran: APP_ROLE.SPPG, status: 'ACTIVE' },
            process.env.JWT_SECRET,
        );
        const req = { headers: { authorization: `Bearer ${token}` } };
        const res = createMockRes();
        const next = vi.fn();

        authenticateUserToken(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.user.peran).toBe(APP_ROLE.SPPG);
    });

    it('authenticateAdminToken should reject non-admin token', () => {
        const token = jwt.sign(
            { sub: 12, actorId: 12, peran: APP_ROLE.LOGISTIK },
            process.env.JWT_SECRET,
        );
        const req = { headers: { authorization: `Bearer ${token}` } };
        const res = createMockRes();
        const next = vi.fn();

        authenticateAdminToken(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.statusCode).toBe(403);
    });

    it('authorizeRoles should pass when role allowed', () => {
        const req = { user: { peran: APP_ROLE.VENDOR } };
        const res = createMockRes();
        const next = vi.fn();

        authorizeRoles(APP_ROLE.VENDOR, APP_ROLE.SCHOOL)(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    it('authorizeRoles should reject when role not allowed', () => {
        const req = { user: { peran: APP_ROLE.SCHOOL } };
        const res = createMockRes();
        const next = vi.fn();

        authorizeRoles(APP_ROLE.VENDOR, APP_ROLE.LOGISTIK)(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.statusCode).toBe(403);
    });
});
