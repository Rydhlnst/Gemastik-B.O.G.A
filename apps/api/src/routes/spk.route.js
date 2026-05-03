const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');

/**
 * ROUTES: Surat Pesanan (SPK) / Purchase Orders
 * Implementasi Zero-Trust Escrow & Multi-Sig
 */

// 1. Membuat Pesanan Baru (SPPG Action)
router.post('/create', orderController.create);

// 2. Mengambil Daftar Pesanan Vendor (Vendor Action)
router.get('/vendor/:vendorId', orderController.getVendorOrders);

// 3. Konfirmasi Barang Siap (Vendor Action)
router.post('/:poId/ready-for-pickup', orderController.readyForPickup);

// 4. Tanda Tangan Digital (Multi-Sig SPPG Action)
router.post('/:poId/sign', orderController.sign);

// 5. Menolak Pesanan (Vendor Action)
router.post('/:poId/reject', orderController.reject);

// 6. DEBUG/SIMULATOR: Update Status Langsung
router.patch('/:poId/status', orderController.updateStatus);

module.exports = router;