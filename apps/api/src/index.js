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

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// =========================================================================
// 🌉 JEMBATAN ZERO-TRUST: CLOUDFLARE D1 REST API BRIDGE
// Mengubah Express.js biasa menjadi Cloud-Native Backend!
// =========================================================================
const queryD1 = async (sql, params = []) => {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const dbId = process.env.CLOUDFLARE_DATABASE_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;

  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sql, params })
  });

  const data = await response.json();
  if (!data.success) {
    console.error("D1 Error:", data.errors);
    throw new Error(JSON.stringify(data.errors));
  }
  return data.result[0]; // D1 mengembalikan hasil dalam bentuk array per query
};

// Middleware Mutlak: Menyuntikkan req.db ke semua route
app.use((req, res, next) => {
  req.db = {
    prepare: (sql) => ({
      bind: (...params) => ({
        // Eksekusi untuk INSERT/UPDATE/DELETE
        run: async () => await queryD1(sql, params),
        // Eksekusi untuk SELECT banyak data
        all: async () => {
          const res = await queryD1(sql, params);
          return res.results;
        },
        // Eksekusi untuk SELECT 1 baris data
        first: async () => {
          const res = await queryD1(sql, params);
          return res.results.length > 0 ? res.results[0] : null;
        }
      })
    })
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

app.get('/ping', (req, res) => {
  res.json({ message: 'B.O.G.A Backend is Running! 🚀 Terkoneksi ke Cloudflare D1.' });
});

app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`🦅 B.O.G.A Backend berjalan di http://localhost:${PORT}`);
  console.log(`🔗 Database Cloudflare D1 Bridge: ACTIVE`);
  console.log(`========================================`);
});