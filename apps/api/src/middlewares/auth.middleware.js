// apps/api/src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const { ADMIN_ROLE } = require('../constants/auth.constants');

function getBearerToken(req) {
    const authHeader = req.headers?.authorization || req.headers?.Authorization;
    if (!authHeader || typeof authHeader !== 'string') {
        return null;
    }
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
        return null;
    }
    return token;
}

function authenticateUserToken(req, res, next) {
    const token = getBearerToken(req);

    if (!token) {
        return res.status(401).json({ error: 'Akses Ditolak! Anda belum login.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Tiket palsu atau sudah kadaluarsa!' });
        }

        req.user = user;
        next();
    });
}

function authenticateAdminToken(req, res, next) {
    return authenticateUserToken(req, res, () => {
        if (req.user?.peran !== ADMIN_ROLE) {
            return res.status(403).json({ error: 'Akses Ditolak! Hanya admin yang diizinkan.' });
        }
        next();
    });
}

function authorizeRoles(...allowedRoles) {
    const allowSet = new Set(allowedRoles);
    return (req, res, next) => {
        const peran = req.user?.peran;
        if (!peran || !allowSet.has(peran)) {
            return res.status(403).json({ error: 'Akses Ditolak! Role tidak diizinkan.' });
        }
        next();
    };
}

// Backward-compat alias for older routes
const authenticateToken = authenticateUserToken;

module.exports = {
    authenticateToken,
    authenticateUserToken,
    authenticateAdminToken,
    authorizeRoles,
};
