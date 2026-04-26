const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const {
    authenticateUserToken,
    authenticateAdminToken,
    authorizeRoles,
} = require('../middlewares/auth.middleware');
const { APP_ROLE, ADMIN_ROLE } = require('../constants/auth.constants');

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

test('authenticateUserToken should reject request without bearer token', () => {
    const req = { headers: {} };
    const res = createMockRes();
    let nextCalled = false;

    authenticateUserToken(req, res, () => {
        nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
    assert.equal(typeof res.body?.error, 'string');
});

test('authenticateUserToken should set req.user when token valid', () => {
    const token = jwt.sign(
        { sub: 10, actorId: 10, role: APP_ROLE.SPPG, status: 'ACTIVE' },
        process.env.JWT_SECRET,
    );
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createMockRes();
    let nextCalled = false;

    authenticateUserToken(req, res, () => {
        nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(req.user.role, APP_ROLE.SPPG);
    assert.equal(req.user.actorId, 10);
});

test('authenticateAdminToken should reject non-admin token', () => {
    const token = jwt.sign(
        { sub: 12, actorId: 12, role: APP_ROLE.LOGISTIK },
        process.env.JWT_SECRET,
    );
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createMockRes();
    let nextCalled = false;

    authenticateAdminToken(req, res, () => {
        nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 403);
});

test('authenticateAdminToken should allow admin token', () => {
    const token = jwt.sign(
        { sub: 1, role: ADMIN_ROLE, email: 'admin@boga.id' },
        process.env.JWT_SECRET,
    );
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createMockRes();
    let nextCalled = false;

    authenticateAdminToken(req, res, () => {
        nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(req.user.role, ADMIN_ROLE);
});

test('authorizeRoles should pass when role allowed', () => {
    const req = { user: { role: APP_ROLE.VENDOR } };
    const res = createMockRes();
    let nextCalled = false;

    authorizeRoles(APP_ROLE.VENDOR, APP_ROLE.SCHOOL)(req, res, () => {
        nextCalled = true;
    });

    assert.equal(nextCalled, true);
});

test('authorizeRoles should reject when role not allowed', () => {
    const req = { user: { role: APP_ROLE.SCHOOL } };
    const res = createMockRes();
    let nextCalled = false;

    authorizeRoles(APP_ROLE.VENDOR, APP_ROLE.LOGISTIK)(req, res, () => {
        nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 403);
});
