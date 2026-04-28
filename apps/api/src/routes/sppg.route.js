const express = require('express');
const router = express.Router();
const sppgController = require('../controllers/sppg.controller');

/**
 * Endpoint Induk: /api/sppg
 */

// GET /api/sppg/katalog
// SPPG melihat seluruh daftar barang yang aktif dari para Vendor (E-Katalog B.O.G.A)
router.get('/katalog', sppgController.getKatalogVendor);

// POST /api/sppg/purchase-orders
// SPPG membuat Purchase Order (Pesanan Barang) dan memicu sistem Escrow & Hard Booking
router.post('/purchase-orders', sppgController.createPurchaseOrder);

module.exports = router;
