/**
 * SCRIPT: Seed Interconnected Inventory Data
 * Menunjukkan hubungan antara Pesanan, Barang, dan MutasiStok (Outbound).
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

async function seedConnected() {
  const vendorId = "ACC-VEN-5E1FD92B";
  const buyerId = "ACC-GOV-ROOT";
  const barangId = "BRG-A-01"; // Beras Pandan Wangi (Stok Awal di seed awal: 5000)

  console.log("🛰️ Membangun jaring data yang saling terhubung...");

  // 1. Buat Kasus: Pesanan yang Mengalami Masalah (REVISION)
  const poId = "PO-LINK-888";
  console.log(`📦 Membuat Pesanan ${poId} dengan status REVISION...`);
  
  await queryD1(`
    INSERT INTO Pesanan (id, pembeli_id, vendor_id, total_harga, status, escrow_status, revision_note) 
    VALUES (?, ?, ?, ?, 'VALIDATING', 'REVISION', 'QC: Ditemukan 5kg beras yang basah terkena air hujan saat pengiriman.')
  `, [poId, buyerId, vendorId, 1500000]);

  // 2. Buat Kasus: Pengeluaran Barang Pengganti (Terhubung ke PO di atas)
  const mutasiId = "MUT-LINK-001";
  console.log(`🚚 Mencatat Outbound pengganti (REVISION_REPLACEMENT) untuk ${poId}...`);

  await queryD1(`
    INSERT INTO MutasiStok (id, commodity_id, movement_type, quantity, reason, reference_id, origin_source_name)
    VALUES (?, ?, 'OUTBOUND', ?, 'REVISION_REPLACEMENT', ?, ?)
  `, [mutasiId, barangId, 5, poId, "Kirim ulang 5kg beras super kering sebagai pengganti yang basah"]);

  // 3. Update Stok Barang secara manual (karena ini seeding, kita simulasikan efek InventoryService)
  console.log(`📉 Mengurangi stok barang ${barangId}...`);
  await queryD1(`UPDATE Barang SET current_stock = current_stock - 5 WHERE id = ?`, [barangId]);

  // 4. Buat Kasus: Pengeluaran Barang Rusak (SPOILAGE) Tanpa Hubungan PO
  const spoilageId = "MUT-LINK-002";
  console.log(`🚮 Mencatat Spoilage (Barang Busuk) di gudang...`);

  await queryD1(`
    INSERT INTO MutasiStok (id, commodity_id, movement_type, quantity, reason, origin_source_name)
    VALUES (?, ?, 'OUTBOUND', ?, 'SPOILAGE', ?)
  `, [spoilageId, barangId, 2, "Dibuang karena dimakan tikus di pojok gudang"]);
  
  await queryD1(`UPDATE Barang SET current_stock = current_stock - 2 WHERE id = ?`, [barangId]);

  console.log("🌟 SEEDING JARING DATA SELESAI! Relasi antar tabel kini sangat kuat.");
}

seedConnected();
