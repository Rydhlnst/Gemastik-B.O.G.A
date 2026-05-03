const { PrismaClient } = require('@prisma/client');

/**
 * PINTU UTAMA DATABASE B.O.G.A
 * Menggunakan Prisma untuk kemudahan koding tim.
 */
const db = new PrismaClient({
    log: ['error', 'warn'], // Hanya tampilkan log yang penting
});

/**
 * Fungsi untuk cek apakah koneksi database sehat
 */
const cekKoneksi = async () => {
    try {
        await db.$connect();
        console.log('✅ Database Berhasil Terhubung (Prisma Engine Active)');
    } catch (error) {
        console.error('❌ Gagal Terhubung ke Database:', error.message);
        process.exit(1);
    }
};

module.exports = {
    db,
    cekKoneksi
};
