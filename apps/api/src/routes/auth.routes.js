const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

/**
 * ROUTES: Autentikasi v1
 * Endpoint: /api/v1/auth/...
 */
router.post('/register-vendor', authController.daftarVendor);
router.post('/login', authController.login);

module.exports = router;
