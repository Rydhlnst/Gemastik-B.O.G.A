// apps/api/src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    // 1. Tangkap tiket dari header request
    const authHeader = req.headers['authorization'];
    
    // Format standar internet: "Bearer <token_panjang>"
    const token = authHeader && authHeader.split(' ')[1];

    // 2. Kalau orangnya nggak bawa tiket sama sekali
    if (!token) {
        return res.status(401).json({ error: "Akses Ditolak! Anda belum login." });
    }

    // 3. Kalau bawa tiket, cek asli atau palsu
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Tiket palsu atau sudah kadaluarsa!" });
        }
        
        // 4. Tiket asli! Catat identitasnya, lalu izinkan masuk
        req.user = user; 
        next(); // <-- Perintah "Silakan Lewat"
    });
}

module.exports = { authenticateToken };