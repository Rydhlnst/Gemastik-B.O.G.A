const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BogaIdentity V2 (Role-Based & Child Identity)", function () {
  let bogaIdentity;
  let owner;        // Admin / Backend Node.js
  let sppgMaster;   // Dompet Utama Dapur Umum
  let vendorMaster; // Dompet Utama Penyedia/Vendor
  let koki1;        // Dompet Pegawai Dapur
  let koki2;        // Dompet Pegawai Dapur

  // Mapping Enum dari Solidity ke JavaScript (berupa angka index)
  const ROLE_NONE = 0;
  const ROLE_PENYEDIA = 1;
  const ROLE_SPPG = 2;
  const ROLE_PENGANTAR = 3;
  const ROLE_SCHOOL = 4;

  beforeEach(async function () {
    // Siapkan akun-akun test
    [owner, sppgMaster, vendorMaster, koki1, koki2] = await ethers.getSigners();
    
    // Deploy contract yang fresh
    const BogaIdentity = await ethers.getContractFactory("BogaIdentity");
    bogaIdentity = await BogaIdentity.deploy();
  });

  describe("Fase 1: Minting Identitas Sesuai Role", function () {
    it("Admin bisa mencetak lencana SPPG dengan hash dokumen", async function () {
      // Minting lencana SPPG ke dompet sppgMaster
      await bogaIdentity.mintIdentity(sppgMaster.address, ROLE_SPPG, "hash_NIB_123");

      // Verifikasi data yang tersimpan
      const identity = await bogaIdentity.userIdentities(sppgMaster.address);
      expect(identity.roleId).to.equal(ROLE_SPPG);
      expect(identity.documentHash).to.equal("hash_NIB_123");
      expect(identity.isActive).to.be.true;
    });
  });

  describe("Fase 2: Keamanan Akses Child Identity (Delegasi Pegawai)", function () {
    beforeEach(async function () {
      // Setup: Berikan lencana ke SPPG dan Penyedia sebelum test dimulai
      await bogaIdentity.mintIdentity(sppgMaster.address, ROLE_SPPG, "hash_sppg");
      await bogaIdentity.mintIdentity(vendorMaster.address, ROLE_PENYEDIA, "hash_vendor");
    });

    it("Dompet berstatus SPPG BISA mendaftarkan pegawainya", async function () {
      // SPPG mendaftarkan Koki1 sebagai QC
      await bogaIdentity.connect(sppgMaster).addEmployee(koki1.address, "QC", "Budi");

      // Cek apakah pegawai benar-benar terdaftar aktif
      const [isActive, role] = await bogaIdentity.verifyEmployeeAccess(sppgMaster.address, koki1.address);
      expect(isActive).to.be.true;
      expect(role).to.equal("QC");
    });

    it("Dompet berstatus PENYEDIA (Vendor) TIDAK BISA mendaftarkan pegawai (Revert)", async function () {
      // Vendor iseng mencoba mendaftarkan pegawai ke sistem Dapur
      await expect(
        bogaIdentity.connect(vendorMaster).addEmployee(koki1.address, "QC", "Budi")
      ).to.be.revertedWithCustomError(bogaIdentity, "NotAuthorizedSPPG");
    });

    it("SPPG BISA mematikan akses pegawai yang dipecat/hilang HP", async function () {
      // 1. Daftarkan Koki1
      await bogaIdentity.connect(sppgMaster).addEmployee(koki1.address, "QC", "Budi");
      
      // 2. Cabut/Revoke akses Koki1
      await bogaIdentity.connect(sppgMaster).revokeEmployee(koki1.address);

      // 3. Pastikan statusnya menjadi tidak aktif (false)
      const [isActive] = await bogaIdentity.verifyEmployeeAccess(sppgMaster.address, koki1.address);
      expect(isActive).to.be.false;
    });
  });

  describe("Fase 3: Sifat Soulbound", function () {
    it("Token tetap tidak bisa dikirim/dijual ke orang lain", async function () {
      await bogaIdentity.mintIdentity(sppgMaster.address, ROLE_SPPG, "hash_sppg");

      await expect(
        bogaIdentity.connect(sppgMaster).transferFrom(sppgMaster.address, vendorMaster.address, 0)
      ).to.be.revertedWithCustomError(bogaIdentity, "SoulboundNoTransfer");
    });
  });
});