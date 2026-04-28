const express = require('express');
const crypto = require('crypto');
const router = express.Router();

// ==========================================
// 🧮 RUMUS HAVERSINE (Zero-Trust Geofencing)
// Menghitung jarak (dalam meter) antara 2 titik GPS
// ==========================================
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Jari-jari bumi dalam meter
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Hasil dalam bentuk meter
};

/**
 * POST /api/deliveries/arrive
 * Kurir menekan tombol "Sampai Tujuan" beserta kirim GPS HP-nya
 */
router.post('/arrive', async (req, res) => {
    try {
        const { deliveryId, poId, courierLat, courierLng, proofUrl } = req.body;
        const db = req.db;

        console.log(`[Geofencing] Memvalidasi lokasi kurir untuk PO: ${poId}...`);

        // 1. Ambil koordinat tujuan (Sekolah / SPPG) dari Database
        // Asumsi: sppg_id di PurchaseOrders adalah user_id di tabel Schools
        const destination = await db.prepare(`
            SELECT s.latitude, s.longitude, s.school_name 
            FROM PurchaseOrders po
            JOIN Schools s ON po.sppg_id = s.user_id
            WHERE po.id = ?
        `).bind(poId).first();

        if (!destination) throw new Error("Titik tujuan tidak ditemukan di sistem!");

        // 2. Kalkulasi Jarak dengan Haversine
        const distanceInMeters = calculateDistance(
            parseFloat(courierLat), parseFloat(courierLng),
            parseFloat(destination.latitude), parseFloat(destination.longitude)
        );

        console.log(`[Geofencing] Jarak Kurir ke ${destination.school_name}: ${distanceInMeters.toFixed(2)} meter`);

        // 3. ZERO-TRUST LOGIC: Jarak maksimal 50 meter!
        const MAX_ALLOWED_DISTANCE = 50;

        if (distanceInMeters > MAX_ALLOWED_DISTANCE) {
            return res.status(403).json({
                status: "error",
                message: "Akses Ditolak! Anda terdeteksi berada di luar area pengiriman.",
                data: {
                    distance: distanceInMeters.toFixed(2),
                    maxAllowed: MAX_ALLOWED_DISTANCE,
                    status: "GEOFENCE_INVALID"
                }
            });
        }

        // 4. Jika jarak Valid (Di bawah 50m), Catat Kedatangan!
        await db.prepare(`
            UPDATE Deliveries 
            SET geofence_status = 1, status = 'ARRIVED', arrived_at = CURRENT_TIMESTAMP, delivery_proof_url = ? 
            WHERE id = ?
        `).bind(proofUrl, deliveryId).run();

        res.json({
            status: "success",
            message: "Verifikasi Geofencing Berhasil! Serah terima barang disahkan.",
            data: {
                schoolName: destination.school_name,
                distance: distanceInMeters.toFixed(2),
                geofenceStatus: "VALID"
            }
        });

    } catch (error) {
        console.error("[Geofencing Error]:", error.message);
        res.status(500).json({ status: "error", message: error.message });
    }
});

module.exports = router;