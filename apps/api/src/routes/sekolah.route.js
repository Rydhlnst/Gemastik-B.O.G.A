const express = require('express');
const router = express.Router();

// GET /api/sekolah - Ambil daftar sekolah (bisa di-search)
router.get('/', async (req, res) => {
  try {
    const q = req.query.q || '';
    const cat = req.query.cat || '';
    
    let sql = `
      SELECT id, npsn, nama, tingkat, alamat, kota, kecamatan, latitude, longitude, jumlah_siswa, nama_kepsek, nip_kepsek, telepon, status 
      FROM Sekolah 
      WHERE status = 'VERIFIED'
    `;
    let params = [];
    
    // Fitur Search Otomatis (Like %q%)
    if (q) {
      sql += ' AND (nama LIKE ? OR npsn LIKE ? OR kota LIKE ?)';
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    // Filter Kategori (Tingkat)
    if (cat && cat !== 'Semua') {
      sql += ' AND tingkat = ?';
      params.push(cat);
    }
    
    sql += ' ORDER BY kota, tingkat, nama LIMIT 50';

    const records = await req.db.prepare(sql).bind(...params).all();
    res.json({ success: true, data: records });
  } catch (err) {
    req.log.error({ err }, 'Gagal mengambil data sekolah');
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
