const { ethers } = require("ethers");
const VendorRegistryArtifact = require("../config/BogaVendorRegistry.json");

// 1. Inisialisasi Koneksi ke Jaringan Private EVM (Hardhat)
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// 2. Menyiapkan Dompet Admin Pemerintah menggunakan Private Key
const adminWallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);

// 3. Menghubungkan ke Smart Contract dengan hak akses Admin
const vendorContract = new ethers.Contract(
  process.env.VENDOR_REGISTRY_ADDRESS,
  VendorRegistryArtifact.abi,
  adminWallet
);

/**
 * Mendaftarkan Hash Dokumen Vendor ke Blockchain
 */
const registerVendorOnChain = async (vendorWalletAddress, nibNumber, documentHash) => {
  try {
    console.log(`[Blockchain] Mengukir data vendor ${nibNumber} ke Ledger...`);
    const tx = await vendorContract.registerVendor(vendorWalletAddress, nibNumber, documentHash);

    // Tunggu sampai transaksi benar-benar masuk ke dalam blok
    const receipt = await tx.wait();
    console.log(`[Blockchain] Sukses! TxHash: ${receipt.hash}`);

    return receipt.hash;
  } catch (error) {
    console.error("[Blockchain Error - Register]:", error.message);
    throw new Error("Gagal mengukir data vendor ke Blockchain");
  }
};

/**
 * Cek Integritas Dokumen (Zero-Trust Validation)
 * Memastikan file yang di R2 tidak diedit secara diam-diam
 */
const verifyDocumentIntegrity = async (vendorWalletAddress, hashToVerify) => {
  try {
    console.log(`[Blockchain] Memvalidasi silang sidik jari dokumen...`);
    const isValid = await vendorContract.checkDocumentIntegrity(vendorWalletAddress, hashToVerify);
    return isValid;
  } catch (error) {
    console.error("[Blockchain Error - Verify]:", error.message);
    return false; // Anggap palsu jika terjadi error
  }
};

module.exports = {
  registerVendorOnChain,
  verifyDocumentIntegrity
};