const express = require('express');
const router = express.Router();
const { recordInbound, getInboundHistory } = require('../controllers/inbound.controller');
const inventoryController = require('../controllers/inventory.controller');

// POST /api/inventory/inbound
router.post('/inbound', recordInbound);

// GET /api/inventory/vendors/:vendor_id/inbound
router.get('/vendors/:vendor_id/inbound', getInboundHistory);

// POST /api/inventory/outbound
router.post('/outbound', inventoryController.recordOutbound);

// GET /api/inventory/vendors/:vendor_id/outbound
router.get('/vendors/:vendor_id/outbound', inventoryController.getOutboundHistory);

// GET /api/inventory/vendors/:vendor_id/history
router.get('/vendors/:vendor_id/history', inventoryController.getGlobalHistory);

// --- FALLBACK UNTUK FRONTEND LAMA ---
router.get('/outbound/:vendorId', inventoryController.getOutboundHistory);
router.get('/inbound/:vendor_id', getInboundHistory);



module.exports = router;