const jwt = require('jsonwebtoken');

/**
 * CONTROLLER: Autentikasi Vendor
 */
const daftarVendor = async (req, res) => {
    const { email, nama_perusahaan } = req.body;
    const log = req.log;
    const authService = req.authService; // Ambil dari req

    log.info({ email, nama_perusahaan }, 'Menerima pendaftaran vendor baru');

    try {
        const vendorBaru = await authService.daftarVendor(req.db, req.body);
        log.info({ vendorId: vendorBaru.id }, 'Registrasi vendor berhasil disimpan ke database');

        res.status(201).json({
            status: 'success',
            message: 'Registrasi Vendor Berhasil! Profil Anda sedang divalidasi oleh AI.',
            data: vendorBaru
        });
    } catch (error) {
        log.error({ err: error.message, email }, 'Gagal melakukan pendaftaran vendor');
        
        if (error.message && error.message.includes('UNIQUE')) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'NIK atau Email sudah terdaftar di sistem B.O.G.A!' 
            });
        }

        res.status(500).json({ status: 'error', message: 'Gagal melakukan pendaftaran.' });
    }
};

const login = async (req, res) => {
    const { email } = req.body;
    const log = req.log;
    const authService = req.authService; // Ambil dari req

    log.info({ email }, 'Mencoba melakukan login');

    try {
        const user = await authService.login(req.db, email, req.body.password);
        log.info({ userId: user.id, peran: user.peran }, 'Login berhasil, meng-generate JWT');

        const token = jwt.sign(
            { id: user.id, email: user.email, peran: user.peran }, 
            process.env.JWT_SECRET || 'BOGA-SECRET-KEY-2024',
            { expiresIn: '7d' }
        );

        res.json({
            status: 'success',
            message: 'Login berhasil!',
            data: {
                token,
                user: {
                    id: user.id,
                    nama: user.nama,
                    email: user.email,
                    peran: user.peran,
                    profil: user.profilVendor
                }
            }
        });
    } catch (error) {
        log.warn({ email, err: error.message }, 'Upaya login gagal');
        res.status(401).json({ 
            status: 'error', 
            message: error.message || 'Login gagal.' 
        });
    }
};

module.exports = {
    daftarVendor,
    login
};
