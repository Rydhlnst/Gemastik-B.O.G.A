/**
 * SCRIPT: Sync & Seed Orders Database (B.O.G.A)
 * Menyelaraskan skema D1 dengan fitur Zero-Trust & Multi-Sig.
 */
require('dotenv').config();

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
    return null;
  }
  return data.result[0];
};

async function syncAndSeed() {
  console.log("🚀 Memulai sinkronisasi database TOTAL B.O.G.A...");

  try {
    const vendorId = "ACC-VEN-5E1FD92B";
    const pembeliId = "ACC-GOV-ROOT";

    const queries = [
      `DROP TABLE IF EXISTS PesananSignatures;`,
      `DROP TABLE IF EXISTS ItemPesanan;`,
      `DROP TABLE IF EXISTS Pesanan;`,
      `DROP TABLE IF EXISTS MutasiStok;`,
      `DROP TABLE IF EXISTS Barang;`,

      // Create Barang
      `CREATE TABLE Barang (
          id TEXT PRIMARY KEY,
          vendor_id TEXT NOT NULL,
          name TEXT NOT NULL,
          harga REAL NOT NULL,
          unit TEXT NOT NULL,
          current_stock REAL DEFAULT 0,
          category TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,

      // Create MutasiStok
      `CREATE TABLE MutasiStok (
          id TEXT PRIMARY KEY,
          commodity_id TEXT NOT NULL,
          movement_type TEXT NOT NULL,
          quantity REAL NOT NULL,
          reason TEXT NOT NULL,
          reference_id TEXT,
          origin_source_name TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (commodity_id) REFERENCES Barang(id)
      );`,

      // Create Pesanan
      `CREATE TABLE Pesanan (
          id TEXT PRIMARY KEY,
          pembeli_id TEXT NOT NULL,
          vendor_id TEXT NOT NULL,
          total_harga REAL NOT NULL,
          status TEXT DEFAULT 'PENDING',
          escrow_status TEXT NOT NULL,
          vendor_status TEXT,
          pickup_pin TEXT,
          revision_note TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,

      // Create ItemPesanan
      `CREATE TABLE ItemPesanan (
          id TEXT PRIMARY KEY,
          pesanan_id TEXT NOT NULL,
          barang_id TEXT NOT NULL,
          kuantitas REAL NOT NULL,
          harga_saat_itu REAL NOT NULL,
          FOREIGN KEY (pesanan_id) REFERENCES Pesanan(id)
      );`,

      // Create Signatures
      `CREATE TABLE PesananSignatures (
          pesanan_id TEXT PRIMARY KEY,
          qc_status TEXT DEFAULT 'PENDING',
          admin_status TEXT DEFAULT 'PENDING',
          logistik_status TEXT DEFAULT 'PENDING',
          FOREIGN KEY (pesanan_id) REFERENCES Pesanan(id)
      );`
    ];

    for (const q of queries) { await queryD1(q); }
    console.log("✅ Skema berhasil diperbarui!");

    const seedQueries = [
      [`INSERT INTO Barang (id, vendor_id, name, harga, unit, current_stock, category) VALUES (?, ?, ?, ?, ?, ?, ?)`, ["BRG-A-01", vendorId, "Beras Pandan Wangi Super", 15000, "Kg", 5000, "Karbohidrat"]],
      [`INSERT INTO Barang (id, vendor_id, name, harga, unit, current_stock, category) VALUES (?, ?, ?, ?, ?, ?, ?)`, ["BRG-A-02", vendorId, "Telur Ayam Ras", 28000, "Kg", 1200, "Protein Hewani"]],
      [`INSERT INTO Pesanan (id, pembeli_id, vendor_id, total_harga, status, escrow_status) VALUES (?, ?, ?, ?, 'PENDING', 'ESCROW_HOLD')`, ["PO-2024-001", pembeliId, vendorId, 10200000]],
      [`INSERT INTO PesananSignatures (pesanan_id) VALUES (?)`, ["PO-2024-001"]],
      [`INSERT INTO ItemPesanan (id, pesanan_id, barang_id, kuantitas, harga_saat_itu) VALUES ('ITM-01', 'PO-2024-001', 'BRG-A-01', 250, 18000)`]
    ];

    for (const [sql, params] of seedQueries) { await queryD1(sql, params); }
    console.log("🌟 SEEDING TOTAL SELESAI!");

  } catch (error) { console.error("❌ Terjadi kesalahan fatal:", error); }
}

syncAndSeed();
