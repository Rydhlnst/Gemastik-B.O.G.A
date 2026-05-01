const express = require('express');
const vendorController = require('../controllers/vendor.controller');

const router = express.Router();

/**
 * ========================================================
 * VENDOR ONBOARDING ROUTES
 * ========================================================
 */

// POST /api/vendors/register
// Endpoint Pendaftaran Entitas Vendor
router.post('/register', vendorController.registerVendor);


/**
 * ========================================================
 * E-KATALOG ROUTES
 * ========================================================
 */

// POST /api/vendors/commodities
// Menambahkan komoditas baru (dengan kalkulasi PIHPS Mark-Up)
router.post('/commodities', vendorController.addCommodity);

// POST /api/vendors/commodities/:commodity_id/stock-in
// Mencatat Inbound stok dari petani/tengkulak beserta Hash Nota Zero-Trust
router.post('/commodities/:commodity_id/stock-in', vendorController.addVendorStockInbound);

// GET /api/vendors/:id
// Mengambil profil detail vendor
router.get('/:id', vendorController.getVendorById);

// GET /api/vendors/:vendor_id/commodities

module.exports = router;
