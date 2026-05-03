// apps/api/src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import Route yang baru dibuat
const inventoryRoutes = require('./routes/inventory.route');
const spkRoutes = require('./routes/spk.route');
const deliveriesRoutes = require('./routes/deliveries.route');
const vendorRoutes = require('./routes/vendor.route');
const sppgRoutes = require('./routes/sppg.route');
const authRoutes = require('./routes/auth.routes');
const sekolahRoutes = require('./routes/sekolah.route');

const app = express();
const PORT = process.env.PORT || 3000;
const logger = require('./utils/logger.util');
const pinoHttp = require('pino-http')({ logger });

app.use(pinoHttp);
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// =========================================================================
// 🌉 JEMBATAN ZERO-TRUST: CLOUDFLARE D1 REST API BRIDGE
// Mengubah Express.js biasa menjadi Cloud-Native Backend!
// =========================================================================
const queryD1 = async (sql, params = []) => {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const dbId = process.env.CLOUDFLARE_DATABASE_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;

  try {
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sql, params }),
      // Tambahkan timeout sederhana biar gak hang selamanya
      signal: AbortSignal.timeout(10000) 
    });

    const data = await response.json();
    if (!data.success) {
      const errMsg = data.errors?.[0]?.message || 'D1 Unknown Error';
      console.error("❌ D1 API Error:", data.errors);
      throw new Error(errMsg);
    }
    
    // Safety check for results
    if (!data.result || data.result.length === 0) return { results: [] };
    return data.result[0]; 
  } catch (err) {
    console.error("🚀 D1 Bridge Critical Failure:", err.message);
    throw err;
  }
};

// Middleware Mutlak: Menyuntikkan req.db & req.services ke semua route
const AuthService = require('./services/auth.service');
const authService = new AuthService();

app.use((req, res, next) => {
  req.authService = authService;
  req.db = {
    prepare: (sql) => {
      const statement = (params = []) => ({
        run: async () => await queryD1(sql, params),
        all: async () => {
          const res = await queryD1(sql, params);
          return res.results || [];
        },
        first: async () => {
          const res = await queryD1(sql, params);
          return (res.results && res.results.length > 0) ? res.results[0] : null;
        }
      });

      return {
        ...statement(), // Dukung panggilan langsung: db.prepare(sql).all()
        bind: (...params) => statement(params) // Dukung binding: db.prepare(sql).bind(a, b).all()
      };
    }
  };
  next();
});
// =========================================================================

// Daftarkan Route
app.use('/api/inventory', inventoryRoutes);
app.use('/api/spk', spkRoutes);
app.use('/api/deliveries', deliveriesRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/sppg', sppgRoutes);
app.use('/api/sekolah', sekolahRoutes);
app.use('/api/v1/auth', authRoutes);

app.get('/ping', (req, res) => {
  res.json({ message: 'B.O.G.A Backend is Running! 🚀 Terkoneksi ke Cloudflare D1.' });
});

app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`🦅 B.O.G.A Backend berjalan di http://localhost:${PORT}`);
  console.log(`🔗 Database Cloudflare D1 Bridge: ACTIVE`);
  console.log(`========================================`);
});