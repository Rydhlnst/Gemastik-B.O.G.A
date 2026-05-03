/**
 * SCRIPT: Seed Complex Order Scenarios
 * Menanam skenario Multi-Sig: 1 Released, 3 Validating (Progress bervariasi)
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

async function seedComplex() {
  const vendorId = "ACC-VEN-5E1FD92B";
  const pembeliId = "ACC-GOV-ROOT";

  console.log("🛰️ Menanam skenario Multi-Sig kompleks...");

  const scenarios = [
    // 1. Skema RELEASED (Selesai 3/3)
    {
      id: "PO-DONE-777",
      status: "COMPLETED",
      escrow: "RELEASED",
      sigs: { qc: "SIGNED", admin: "SIGNED", log: "SIGNED" }
    },
    // 2. Skema VALIDATING (Hanya Logistik)
    {
      id: "PO-VAL-LOG",
      status: "VALIDATING",
      escrow: "VALIDATING",
      sigs: { qc: "PENDING", admin: "PENDING", log: "SIGNED" }
    },
    // 3. Skema VALIDATING (Logistik + QC)
    {
      id: "PO-VAL-QC-LOG",
      status: "VALIDATING",
      escrow: "VALIDATING",
      sigs: { qc: "SIGNED", admin: "PENDING", log: "SIGNED" }
    },
    // 4. Skema VALIDATING (Hanya QC)
    {
      id: "PO-VAL-QC",
      status: "VALIDATING",
      escrow: "VALIDATING",
      sigs: { qc: "SIGNED", admin: "PENDING", log: "PENDING" }
    }
  ];

  for (const s of scenarios) {
    console.log(`📝 Memasukkan ${s.id}...`);
    
    // Insert Header
    await queryD1(`INSERT INTO Pesanan (id, pembeli_id, vendor_id, total_harga, status, escrow_status) VALUES (?, ?, ?, ?, ?, ?)`, 
      [s.id, pembeliId, vendorId, 4500000, s.status, s.escrow]);

    // Insert Signatures
    await queryD1(`INSERT INTO PesananSignatures (pesanan_id, qc_status, admin_status, logistik_status) VALUES (?, ?, ?, ?)`, 
      [s.id, s.sigs.qc, s.sigs.admin, s.sigs.log]);

    // Insert Dummy Item
    await queryD1(`INSERT INTO ItemPesanan (id, pesanan_id, barang_id, kuantitas, harga_saat_itu) VALUES (?, ?, 'BRG-A-01', 100, 15000)`, 
      [`ITM-${s.id}`]);
  }

  console.log("🌟 SEEDING SELESAI! Dashboard Anda sekarang penuh dengan progress Multi-Sig.");
}

seedComplex();
