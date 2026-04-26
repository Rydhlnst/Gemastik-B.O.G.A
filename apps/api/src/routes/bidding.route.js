const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middlewares/auth.middleware');
const { queryD1 } = require('../services/d1.service');

function requireRole(allowedRoles) {
    const allowSet = new Set(allowedRoles);
    return (req, res, next) => {
        const role = req.user?.role;
        if (!role || !allowSet.has(role)) {
            return res.status(403).json({ error: 'Akses Ditolak! Role tidak diizinkan.' });
        }
        next();
    };
}

const ROLE_VENDOR = ['VENDOR', 'PENYEDIA', 'vendor'];
const ROLE_SPPG = ['SPPG', 'sppg'];

router.get('/tenders', async (req, res) => {
    try {
        const db = await queryD1(
            `
            SELECT
                id,
                sppg_id,
                title,
                category,
                quantity,
                unit,
                deadline,
                status,
                weight_price,
                weight_quality,
                weight_distance,
                awarded_bid_id,
                created_at
            FROM tenders
            ORDER BY created_at DESC
            LIMIT 50
        `,
            [],
        );

        res.status(200).json({ data: db.results ?? [] });
    } catch (error) {
        console.error('❌ Error fetch tenders:', error.message);
        res.status(500).json({ error: 'Gagal mengambil daftar tender.' });
    }
});

router.post('/tenders', authenticateToken, requireRole(ROLE_SPPG), async (req, res) => {
    try {
        const { sppgId, title, category, quantity, unit, deadline, weights } = req.body ?? {};
        const weightPrice = Number(weights?.price ?? 0.5);
        const weightQuality = Number(weights?.quality ?? 0.35);
        const weightDistance = Number(weights?.distance ?? 0.15);

        if (!sppgId || !title || !category || !quantity || !unit || !deadline) {
            return res.status(400).json({ error: 'Data tender tidak lengkap.' });
        }

        await queryD1(
            `
            INSERT INTO tenders (
                sppg_id,
                title,
                category,
                quantity,
                unit,
                deadline,
                status,
                weight_price,
                weight_quality,
                weight_distance
            ) VALUES (?, ?, ?, ?, ?, ?, 'OPEN', ?, ?, ?)
        `,
            [sppgId, title, category, quantity, unit, deadline, weightPrice, weightQuality, weightDistance],
        );

        res.status(201).json({ message: 'Tender dibuat.', data: { title } });
    } catch (error) {
        console.error('❌ Error create tender:', error.message);
        res.status(500).json({ error: 'Gagal membuat tender.' });
    }
});

router.get('/tenders/:tenderId/bids', async (req, res) => {
    try {
        const { tenderId } = req.params;
        const db = await queryD1(
            `
            SELECT
                id,
                tender_id,
                vendor_id,
                price_per_unit,
                notes,
                created_at
            FROM tender_bids
            WHERE tender_id = ?
            ORDER BY created_at DESC
        `,
            [tenderId],
        );

        res.status(200).json({ data: db.results ?? [] });
    } catch (error) {
        console.error('❌ Error fetch bids:', error.message);
        res.status(500).json({ error: 'Gagal mengambil daftar bid.' });
    }
});

router.post('/tenders/:tenderId/bids', authenticateToken, requireRole(ROLE_VENDOR), async (req, res) => {
    try {
        const { tenderId } = req.params;
        const vendorId = req.user?.id || req.user?.actorId || req.user?.sub;
        const { pricePerUnit, notes } = req.body ?? {};

        if (!vendorId || !pricePerUnit) {
            return res.status(400).json({ error: 'Data bid tidak lengkap.' });
        }

        await queryD1(
            `
            INSERT INTO tender_bids (
                tender_id,
                vendor_id,
                price_per_unit,
                notes
            ) VALUES (?, ?, ?, ?)
        `,
            [tenderId, vendorId, pricePerUnit, notes || null],
        );

        res.status(201).json({ message: 'Bid terkirim.' });
    } catch (error) {
        console.error('❌ Error submit bid:', error.message);
        res.status(500).json({ error: 'Gagal mengirim bid.' });
    }
});

router.post('/tenders/:tenderId/award', authenticateToken, requireRole(ROLE_SPPG), async (req, res) => {
    try {
        const { tenderId } = req.params;
        const { bidId } = req.body ?? {};

        if (!bidId) {
            return res.status(400).json({ error: 'bidId wajib diisi.' });
        }

        await queryD1(
            `
            UPDATE tenders
            SET status = 'AWARDED', awarded_bid_id = ?
            WHERE id = ?
        `,
            [bidId, tenderId],
        );

        res.status(200).json({ message: 'Pemenang tender ditetapkan.' });
    } catch (error) {
        console.error('❌ Error award tender:', error.message);
        res.status(500).json({ error: 'Gagal menetapkan pemenang.' });
    }
});

module.exports = router;

