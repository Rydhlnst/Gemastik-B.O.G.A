// apps/api/src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import Route yang baru dibuat
const authRoutes = require('./routes/auth.route');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Daftarkan Route
app.use('/api/auth', authRoutes); // Semua API auth akan diawali dengan /api/auth

app.get('/ping', (req, res) => {
  res.json({ message: 'B.O.G.A Backend is Running! 🚀' });
});

app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`B.O.G.A API berjalan di port: ${PORT}`);
  console.log(`========================================`);
});