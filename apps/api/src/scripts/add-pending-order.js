/**
 * SCRIPT: Add New Pending Order
 * Menambah 1 pesanan baru dengan status ESCROW_HOLD (Menunggu Konfirmasi)
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

async function addOrder() {
  const poId = `PO-NEW-${Math.floor(Math.random() * 1000)}`;
  const vendorId = "ACC-VEN-5E1FD92B";
  const pembeliId = "ACC-GOV-ROOT";

  console.log(`🛰️ Mengirim pesanan baru ${poId} ke database...`);

  const queries = [
    [`INSERT INTO Pesanan (id, pembeli_id, vendor_id, total_harga, status, escrow_status) VALUES (?, ?, ?, ?, 'PENDING', 'ESCROW_HOLD')`, 
     [poId, pembeliId, vendorId, 5500000]],
    [`INSERT INTO PesananSignatures (pesanan_id) VALUES (?)`, [poId]],
    [`INSERT INTO ItemPesanan (id, pesanan_id, barang_id, kuantitas, harga_saat_itu) VALUES (?, ?, 'BRG-A-05', 50, 32000)`, 
     [`ITM-NEW-${poId}`]]
  ];

  for (const [sql, params] of queries) {
    await queryD1(sql, params);
  }

  console.log(`✅ BERHASIL! Pesanan ${poId} sekarang muncul di tab "Menunggu Konfirmasi".`);
}

addOrder();
