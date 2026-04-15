// apps/api/src/services/blockchain.service.js
require('dotenv').config();
const { ethers } = require('ethers');

// Import "Buku Panduan" (ABI) yang baru saja kamu copy
const BogaIdentityArtifact = require('../config/BogaIdentity.json');

// 1. Hubungkan ke jaringan Blockchain Lokal (Hardhat Node)
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// 2. Hubungkan dompet Admin menggunakan Private Key
const adminWallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);

// 3. Buat instance Smart Contract agar bisa dipanggil fungsi-fungsinya
const bogaIdentityContract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  BogaIdentityArtifact.abi, // Kita cuma butuh bagian .abi dari file JSON-nya
  adminWallet // Eksekutornya adalah Admin
);

module.exports = {
  provider,
  adminWallet,
  bogaIdentityContract
};