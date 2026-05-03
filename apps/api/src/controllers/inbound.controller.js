const crypto = require('crypto');

/**
 * Controller untuk menangani stok masuk (Inbound)
 * Mengimplementasikan Audit Trail D1 + Blockchain Hashing
 */
const recordInbound = async (req, res) => {
    const { vendor_id, commodity_id, quantity, price_per_unit, origin_source_name, origin_source_location, origin_proof_url, notes } = req.body;
    const db = req.db;
    const log = req.log; // Pino logger from middleware

    log.info({ commodity_id, quantity }, 'Menerima permintaan Inbound baru');

    try {
        if (!commodity_id || !quantity) {
            log.warn('Permintaan Inbound ditolak: Data tidak lengkap');
            return res.status(400).json({ status: 'error', message: 'Commodity ID dan Quantity wajib diisi' });
        }

        // 1. Ambil data barang & stok saat ini
        log.info({ commodity_id }, 'Mengambil metadata barang dari katalog');
        const item = await db.prepare('SELECT id, current_stock, target_stock, name FROM Barang WHERE id = ?')
            .bind(commodity_id)
            .first();

        if (!item) {
            log.error({ commodity_id }, 'Produk tidak ditemukan saat proses Inbound');
            return res.status(404).json({ status: 'error', message: 'Produk tidak ditemukan di katalog' });
        }

        // 2. Generate Blockchain Proof Hash (Traceability)
        log.info('Menghitung Blockchain Proof Hash (Audit Trail)');
        const timestamp = new Date().toISOString();
        const rawPayload = `${commodity_id}-${quantity}-${price_per_unit || 0}-${timestamp}-${origin_source_name || 'unknown'}-${origin_proof_url ? origin_proof_url.slice(-50) : 'no-photo'}`;
        const proofHash = crypto.createHash('sha256').update(rawPayload).digest('hex');

        // 3. Eksekusi Database (ATOMIC UPDATE)
        log.info({ commodity_id, quantity }, 'Melakukan pembaruan stok secara ATOMIC');
        await db.prepare(`
            UPDATE Barang 
            SET 
                target_stock = MAX(target_stock, current_stock + ?),
                current_stock = current_stock + ?, 
                updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `).bind(parseFloat(quantity), parseFloat(quantity), commodity_id).run();

        // 4. Simpan Catatan Mutasi (Termasuk Harga Beli)
        const mutasiId = `MUT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        log.info({ mutasiId }, 'Mencatat riwayat mutasi stok ke database');
        await db.prepare(`
            INSERT INTO MutasiStok (
                id, commodity_id, movement_type, quantity, price_per_unit,
                reason, origin_source_name, origin_source_location, 
                origin_proof_url, origin_proof_hash, created_at
            ) VALUES (?, ?, 'INBOUND', ?, ?, 'INBOUND_RESTOCK', ?, ?, ?, ?, ?)
        `).bind(
            mutasiId, 
            commodity_id, 
            quantity, 
            price_per_unit || 0,
            origin_source_name || 'Pemasok Lokal', 
            origin_source_location || 'Indonesia', 
            origin_proof_url,
            proofHash, 
            timestamp
        ).run();

        log.info({ proofHash }, '[BLOCKCHAIN] Bukti transaksi berhasil di-hash dan diamankan');

        res.status(201).json({
            status: 'success',
            message: `Stok ${item.name} berhasil ditambah (+${quantity})`,
            data: {
                id: mutasiId,
                new_stock: (item.current_stock || 0) + parseFloat(quantity),
                blockchain_hash: proofHash
            }
        });

    } catch (error) {
        log.error({ err: error.message }, 'Kesalahan fatal saat memproses Inbound');
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};

/**
 * Controller untuk mengambil riwayat inbound vendor
 */
const getInboundHistory = async (req, res) => {
    const log = req.log;
    try {
        const { vendor_id } = req.params;
        const { start_date, end_date } = req.query; // Ambil rentang tanggal
        const db = req.db;

        // Query dasar
        let sql = `
            SELECT m.*, b.name as commodity_name, b.unit
            FROM MutasiStok m
            JOIN Barang b ON m.commodity_id = b.id
            WHERE b.vendor_id = ? AND m.movement_type = 'INBOUND'
        `;
        const params = [vendor_id];

        // Tambahkan filter rentang tanggal jika ada
        if (start_date && end_date) {
            sql += ` AND date(m.created_at) BETWEEN ? AND ? `;
            params.push(start_date);
            params.push(end_date);
        }

        sql += ` ORDER BY m.created_at DESC`;

        const history = await db.prepare(sql).bind(...params).all();
        const data = history.results || (Array.isArray(history) ? history : []);

        log.info({ vendor_id, count: data.length }, 'Berhasil mengambil riwayat inbound');

        res.json({
            status: 'success',
            data: data
        });

    } catch (error) {
        log.error({ err: error.message, vendor_id }, 'Gagal mengambil riwayat inbound');
        res.status(500).json({ status: 'error', message: 'Gagal mengambil riwayat inbound' });
    }
};

module.exports = {
    recordInbound,
    getInboundHistory
};
