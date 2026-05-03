const express = require('express');
const vendorController = require('../controllers/vendor.controller');

const router = express.Router();

/**
 * ========================================================
 * VENDOR ONBOARDING ROUTES
 * ========================================================
 */

/**
 * ========================================================
 */
 
// GET /api/vendors
// Mendapatkan semua daftar vendor (untuk simulator/admin)
router.get('/', vendorController.getAllVendors);

// POST /api/vendors/:vendor_id/commodities
// Menambahkan komoditas baru (dengan kalkulasi PIHPS Mark-Up)
router.post('/:vendor_id/commodities', vendorController.addCommodity);

// POST /api/vendors/commodities/:commodity_id/stock-in
// Mencatat Inbound stok dari petani/tengkulak beserta Hash Nota Zero-Trust
router.post('/commodities/:commodity_id/stock-in', vendorController.addVendorStockInbound);

// DELETE /api/vendors/:vendor_id/commodities/:commodity_id
// Menghapus barang dari katalog
router.delete('/:vendor_id/commodities/:commodity_id', vendorController.deleteCommodity);

// GET /api/vendors/:id
// Mengambil profil detail vendor
router.get('/:id', vendorController.getVendorById);

// GET /api/vendors/:vendor_id/commodities
// Mengambil list katalog milik vendor
router.get('/:vendor_id/commodities', vendorController.getVendorCommodities);

// GET /api/vendors/:vendor_id/stats
// Mengambil statistik dashboard (Real Data)
router.get('/:vendor_id/stats', vendorController.getVendorStats);

module.exports = router;
