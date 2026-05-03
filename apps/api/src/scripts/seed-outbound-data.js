/**
 * SCRIPT: Seed Outbound & Spoilage Data
 * Menanam riwayat barang keluar: Normal, Revisi, dan Busuk.
 */
require('dotenv').config();

const queryD1 = async (sql, params = []) => {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const dbId = process.env.CLOUDFLARE_DATABASE_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;

  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql, params })
  });
  return await response.json();
};

async function seedOutbound() {
  const vendorId = "ACC-VEN-5E1FD92B";
  const barangId = "BRG-A-01"; // Beras Pandan Wangi

  console.log("🛰️ Menanam data riwayat Outbound...");

  const data = [
    // 1. Pengeluaran Normal (PO)
    {
      id: "MUT-OUT-001",
      qty: 1000,
      reason: "PO_FULFILLMENT",
      ref: "PO-2024-001",
      note: "Pengiriman Tahap 1 SPPG"
    },
    // 2. Pengeluaran Ganti Barang (REVISION)
    {
      id: "MUT-OUT-002",
      qty: 2,
      reason: "REVISION_REPLACEMENT",
      ref: "PO-2024-006",
      note: "Ganti 2 karung yang robek hasil QC SPPG"
    },
    // 3. Barang Busuk / Rusak (SPOILAGE)
    {
      id: "MUT-OUT-003",
      qty: 5,
      reason: "SPOILAGE",
      ref: null,
      note: "Ditemukan kutu di karung pojok gudang"
    }
  ];

  for (const d of data) {
    await queryD1(`
      INSERT INTO MutasiStok (id, commodity_id, movement_type, quantity, reason, reference_id, origin_source_name)
      VALUES (?, ?, 'OUTBOUND', ?, ?, ?, ?)
    `, [d.id, barangId, d.qty, d.reason, d.ref, d.note]);
  }

  console.log("🌟 SEEDING OUTBOUND SELESAI! Riwayat barang keluar Anda sekarang sangat detail.");
}

seedOutbound();
