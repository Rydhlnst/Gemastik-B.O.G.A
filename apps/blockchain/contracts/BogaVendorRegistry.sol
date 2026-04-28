// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BogaVendorRegistry {
    // Menyimpan alamat dompet Badan Gizi Nasional / Pemerintah
    address public admin_bgn;

    struct Vendor {
        string nibNumber;
        string combinedDocumentHash; // SHA-256 gabungan dari Akta, SK, NPWP, NIB
        uint256 aiConfidenceScore; // Contoh: 98 (untuk 98%)
        bool isApproved;
        bool isRegistered;
    }

    // Mapping: Alamat Dompet Vendor -> Data Vendor
    mapping(address => Vendor) public vendors;

    // Jejak Audit (Event Log) yang akan dibaca oleh Juri/Pemerintah
    event VendorRegistered(
        address indexed vendorWallet,
        string nibNumber,
        string documentHash
    );
    event VendorVerified(
        address indexed vendorWallet,
        uint256 aiScore,
        bool status
    );

    // Kunci Zero-Trust: Hanya pemerintah yang bisa memverifikasi
    modifier onlyAdmin() {
        require(
            msg.sender == admin_bgn,
            "B.O.G.A: Akses Ditolak! Hanya Pemerintah."
        );
        _;
    }

    constructor() {
        admin_bgn = msg.sender; // Akun yang mendeploy otomatis jadi Admin
    }

    // 1. Fungsi Pendaftaran (Dipanggil oleh Backend saat Vendor Submit)
    function registerVendor(
        address _vendorWallet,
        string memory _nibNumber,
        string memory _docHash
    ) public {
        require(
            !vendors[_vendorWallet].isRegistered,
            "B.O.G.A: Vendor sudah terdaftar di jaringan!"
        );

        vendors[_vendorWallet] = Vendor({
            nibNumber: _nibNumber,
            combinedDocumentHash: _docHash,
            aiConfidenceScore: 0,
            isApproved: false,
            isRegistered: true
        });

        emit VendorRegistered(_vendorWallet, _nibNumber, _docHash);
    }

    // 2. Fungsi Verifikasi AI & Pemerintah (Dipanggil setelah AI selesai mengecek)
    function verifyVendor(
        address _vendorWallet,
        uint256 _aiScore,
        bool _isApproved
    ) public onlyAdmin {
        require(
            vendors[_vendorWallet].isRegistered,
            "B.O.G.A: Vendor belum terdaftar!"
        );

        vendors[_vendorWallet].aiConfidenceScore = _aiScore;
        vendors[_vendorWallet].isApproved = _isApproved;

        emit VendorVerified(_vendorWallet, _aiScore, _isApproved);
    }

    // 3. Fungsi Keamanan: Validasi Integritas Dokumen
    function checkDocumentIntegrity(
        address _vendorWallet,
        string memory _hashToVerify
    ) public view returns (bool) {
        require(
            vendors[_vendorWallet].isRegistered,
            "B.O.G.A: Vendor tidak ditemukan!"
        );

        // Membandingkan Hash yang ditanyakan dengan Hash yang terkunci di Blockchain
        return (keccak256(
            abi.encodePacked(vendors[_vendorWallet].combinedDocumentHash)
        ) == keccak256(abi.encodePacked(_hashToVerify)));
    }
}
