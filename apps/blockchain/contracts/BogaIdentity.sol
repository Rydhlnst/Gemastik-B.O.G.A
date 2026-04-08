// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BogaIdentity is ERC721, Ownable {
    uint256 private _nextTokenId;

    // ==========================================
    // 1. STRUKTUR DATA: ROLE & MASTER IDENTITY
    // ==========================================
    enum Role { None, Penyedia, SPPG, Pengantar , SCHOOL }

    struct Identity {
        uint256 tokenId;
        Role roleId;
        string documentHash; // Bukti data Web2 (Hash NIB/SLHS/NIP di Cloudflare D1)
        bool isActive;       // Bisa dibekukan jika ada pelanggaran
    }

    // Pemetaan Dompet Master -> Identitas Resmi
    mapping(address => Identity) public userIdentities;

    // ==========================================
    // 2. STRUKTUR DATA: CHILD IDENTITY (PEGAWAI SPPG)
    // ==========================================
    struct ChildAccount {
        bool isActive;
        string role; // Contoh: "MANAGER", "QC", "LOGISTIC"
        string name;
    }

    // Pemetaan: Dompet SPPG -> (Dompet Pegawai -> Data Pegawai)
    mapping(address => mapping(address => ChildAccount)) public sppgEmployees;

    // ==========================================
    // 3. EVENTS & ERRORS (Untuk Logs & Notifikasi Webhook)
    // ==========================================
    event IdentityMinted(address indexed wallet, uint256 tokenId, Role role, string docHash);
    event IdentityRevoked(address indexed wallet);
    event EmployeeAdded(address indexed sppgMaster, address indexed employee, string role);
    event EmployeeRevoked(address indexed sppgMaster, address indexed employee);

    error AlreadyHasIdentity();
    error SoulboundNoTransfer();
    error NotAuthorizedSPPG();
    error IdentityFrozen();

    // ==========================================
    // 4. CONSTRUCTOR & MODIFIERS
    // ==========================================
    constructor() ERC721("BOGA Verified Identity", "BVID") Ownable(msg.sender) {}

    // Pengecekan khusus: Hanya dompet SPPG (KITCHEN) yang aktif yang bisa jalankan fungsi ini
    modifier onlyActiveKitchen() {
        if (userIdentities[msg.sender].roleId != Role.SPPG) revert NotAuthorizedSPPG();
        if (!userIdentities[msg.sender].isActive) revert IdentityFrozen();
        _;
    }

    // ==========================================
    // 5. FUNGSI UTAMA: MINTING IDENTITAS (Hanya Backend Node.js)
    // ==========================================
    function mintIdentity(address to, Role _role, string calldata _docHash) external onlyOwner returns (uint256) {
        if (userIdentities[to].isActive || userIdentities[to].roleId != Role.None) {
            revert AlreadyHasIdentity();
        }
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        
        userIdentities[to] = Identity({
            tokenId: tokenId,
            roleId: _role,
            documentHash: _docHash,
            isActive: true
        });
        
        emit IdentityMinted(to, tokenId, _role, _docHash);
        return tokenId;
    }

    // Admin (Pemerintah/Backend) bisa membekukan identitas (misal sertifikat halal Vendor mati)
    function revokeMasterIdentity(address wallet) external onlyOwner {
        userIdentities[wallet].isActive = false;
        emit IdentityRevoked(wallet);
    }

    // ==========================================
    // 6. FUNGSI CHILD IDENTITY (Dikelola Mandiri oleh SPPG)
    // ==========================================
    // Manajer SPPG mendaftarkan dompet anak buahnya
    function addEmployee(address employeeWallet, string calldata empRole, string calldata empName) external onlyActiveKitchen {
        sppgEmployees[msg.sender][employeeWallet] = ChildAccount({
            isActive: true,
            role: empRole,
            name: empName
        });
        emit EmployeeAdded(msg.sender, employeeWallet, empRole);
    }

    // Manajer SPPG mencabut akses jika pegawai resign atau HP hilang
    function revokeEmployee(address employeeWallet) external onlyActiveKitchen {
        sppgEmployees[msg.sender][employeeWallet].isActive = false;
        emit EmployeeRevoked(msg.sender, employeeWallet);
    }

    // Fungsi "Baca" untuk Backend Node.js mengecek apakah pegawai berhak menekan tombol di aplikasi
    function verifyEmployeeAccess(address sppgMaster, address employeeWallet) external view returns (bool isActive, string memory role) {
        ChildAccount memory emp = sppgEmployees[sppgMaster][employeeWallet];
        return (emp.isActive, emp.role);
    }

    // ==========================================
    // 7. KEAMANAN SOULBOUND (Anti Diperjualbelikan)
    // ==========================================
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        // Transaksi hanya diizinkan jika 'from' adalah 0x0 (Minting) atau 'to' adalah 0x0 (Burning)
        if (from != address(0) && to != address(0)) {
            revert SoulboundNoTransfer();
        }
        return super._update(to, tokenId, auth);
    }
}