// apps/api/src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import Route yang baru dibuat
const authRoutes = require('./routes/auth.route');
const inventoryRoutes = require('./routes/inventory.route'); // <-- TAMBAHKAN BARIS INI
const katalogRoutes = require('./routes/katalog.route'); // <-- TAMBAHKAN BARIS INI
const spkRoutes = require('./routes/spk.route');
const biddingRoutes = require('./routes/bidding.route');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Daftarkan Route
app.use('/api/auth', authRoutes); // Semua API auth akan diawali dengan /api/auth
// Tambahkan di deretan app.use
app.use('/api/inventory', inventoryRoutes); // <-- TAMBAHKAN BARIS INI
app.use('/api/katalog', katalogRoutes);
app.use('/api/spk', spkRoutes);
app.use('/api/bidding', biddingRoutes);



app.get('/ping', (req, res) => {
  res.json({ message: 'B.O.G.A Backend is Running! 🚀' });
});

app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`B.O.G.A API berjalan di port: ${PORT}`);
  console.log(`========================================`);
});
