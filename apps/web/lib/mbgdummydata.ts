export type StatusVendor = "aktif" | "nonaktif" | "suspend";
export type StatusDelivery = "delivered" | "on_transit" | "pending" | "gagal";
export type KategoriVendor = "katering" | "logistik" | "supplier_bahan";
export type TipeMenu = "nasi_box" | "snack" | "minuman" | "buah";

export interface Sekolah {
  id: number;
  nama: string;
  jenjang: "SD" | "SMP" | "SMA";
  kelurahan: string;
  kecamatan: string;
  kota: string;
  lat: number;
  lng: number;
  total_siswa: number;
  mulai_mbg: string;
}

export interface Vendor {
  id: number;
  nama: string;
  kategori: KategoriVendor;
  status: StatusVendor;
  rating: number;
  kontak_pic: string;
  no_telp: string;
  email: string;
  alamat: string;
  lat: number;
  lng: number;
  sertifikasi: string[];
  bergabung_sejak: string;
  total_pengiriman: number;
  on_time_rate: number;
}

export interface VendorSekolah {
  id: number;
  vendor_id: number;
  sekolah_id: number;
  porsi_per_hari: number;
  harga_per_porsi: number;
  kontrak_mulai: string;
  kontrak_selesai: string;
  menu_default: TipeMenu[];
  is_primary: boolean;
}

export interface Delivery {
  id: number;
  vendor_sekolah_id: number;
  tanggal: string;
  status: StatusDelivery;
  porsi_dikirim: number;
  porsi_diterima: number;
  jam_tiba: string;
  jam_target: string;
  catatan: string | null;
  bukti_url: string | null;
}

export interface Material {
  id: number;
  name: string;
  type: string;
  price: number;
  rating: number;
  reviews: number;
}

export const sekolahList: Sekolah[] = [
  { id: 1, nama: "SMAN 3 Bandung",        jenjang: "SMA", kelurahan: "Merdeka",      kecamatan: "Sumur Bandung", kota: "Bandung", lat: -6.9135, lng: 107.6186, total_siswa: 920, mulai_mbg: "2025-02-01" },
  { id: 2, nama: "SMPN 2 Bandung",        jenjang: "SMP", kelurahan: "Citarum",      kecamatan: "Bandung Wetan", kota: "Bandung", lat: -6.9104, lng: 107.6141, total_siswa: 750, mulai_mbg: "2025-01-15" },
  { id: 3, nama: "SDN 061 Cirengel",      jenjang: "SD",  kelurahan: "Cipaganti",    kecamatan: "Coblong",       kota: "Bandung", lat: -6.9015, lng: 107.6112, total_siswa: 410, mulai_mbg: "2025-02-10" },
  { id: 4, nama: "SMPN 5 Bandung",        jenjang: "SMP", kelurahan: "Merdeka",      kecamatan: "Sumur Bandung", kota: "Bandung", lat: -6.9112, lng: 107.6125, total_siswa: 810, mulai_mbg: "2025-03-01" },
  { id: 5, nama: "SDN 164 Karang Pawulang",jenjang: "SD",  kelurahan: "Turangga",     kecamatan: "Lengkong",      kota: "Bandung", lat: -6.9247, lng: 107.6321, total_siswa: 460, mulai_mbg: "2025-01-20" },
  { id: 6, nama: "SMAN 20 Bandung",       jenjang: "SMA", kelurahan: "Citarum",      kecamatan: "Bandung Wetan", kota: "Bandung", lat: -6.9078, lng: 107.6212, total_siswa: 880, mulai_mbg: "2025-02-05" },
];

export const vendorList: Vendor[] = [
  {
    id: 1, nama: "CV Katering Bandung Juara", kategori: "katering", status: "aktif",
    rating: 4.9, kontak_pic: "Dadang Hermawan", no_telp: "0812-2233-4455",
    email: "ops@bdgjuara.id", alamat: "Jl. Dago No. 102, Bandung",
    lat: -6.8850, lng: 107.6130,
    sertifikasi: ["Halal MUI", "BPOM", "ISO 22000"],
    bergabung_sejak: "2024-11-01", total_pengiriman: 442, on_time_rate: 98.2,
  },
  {
    id: 2, nama: "PT Gizi Priangan Utama", kategori: "katering", status: "aktif",
    rating: 4.6, kontak_pic: "Euis Rosita", no_telp: "0813-1122-3344",
    email: "admin@gizipriangan.com", alamat: "Jl. Soekarno Hatta No. 456, Bandung",
    lat: -6.9450, lng: 107.6320,
    sertifikasi: ["Halal MUI", "BPOM"],
    bergabung_sejak: "2024-12-15", total_pengiriman: 215, on_time_rate: 96.1,
  },
  {
    id: 3, nama: "Logistik Parahyangan Express", kategori: "logistik", status: "aktif",
    rating: 4.7, kontak_pic: "Asep Sunandar", no_telp: "0821-4455-6677",
    email: "fleet@paraexpress.co.id", alamat: "Jl. Pasteur No. 12, Bandung",
    lat: -6.8980, lng: 107.5950,
    sertifikasi: ["ISO 9001"],
    bergabung_sejak: "2025-01-05", total_pengiriman: 312, on_time_rate: 98.8,
  },
  {
    id: 4, nama: "Agro Lembang Segar", kategori: "supplier_bahan", status: "aktif",
    rating: 4.5, kontak_pic: "Cecep Mulyana", no_telp: "0819-7788-9900",
    email: "supply@agrolembang.id", alamat: "Jl. Raya Lembang No. 54, Lembang",
    lat: -6.8150, lng: 107.6180,
    sertifikasi: ["Halal MUI", "Organic Certified"],
    bergabung_sejak: "2025-01-20", total_pengiriman: 167, on_time_rate: 93.4,
  },
  {
    id: 5, nama: "Katering Pasundan Berkah", kategori: "katering", status: "aktif",
    rating: 4.8, kontak_pic: "Yanti Marlina", no_telp: "0856-2233-4455",
    email: "order@pasundanberkah.id", alamat: "Jl. Buah Batu No. 201, Bandung",
    lat: -6.9380, lng: 107.6250,
    sertifikasi: ["Halal MUI", "BPOM", "ISO 22000"],
    bergabung_sejak: "2024-10-10", total_pengiriman: 512, on_time_rate: 97.4,
  },
  {
    id: 6, nama: "CV Food Hub Jabar", kategori: "katering", status: "suspend",
    rating: 3.1, kontak_pic: "Iwan Setiawan", no_telp: "0878-5566-7788",
    email: "info@fhubjabar.com", alamat: "Jl. Kopo No. 341, Bandung",
    lat: -6.9550, lng: 107.5850,
    sertifikasi: ["Halal MUI"],
    bergabung_sejak: "2025-02-01", total_pengiriman: 45, on_time_rate: 72.3,
  },
];

export const vendorSekolahList: VendorSekolah[] = [
  { id: 1,  vendor_id: 1, sekolah_id: 1, porsi_per_hari: 680, harga_per_porsi: 15000, kontrak_mulai: "2025-02-01", kontrak_selesai: "2025-07-31", menu_default: ["nasi_box","minuman"], is_primary: true  },
  { id: 2,  vendor_id: 3, sekolah_id: 1, porsi_per_hari: 680, harga_per_porsi: 0,     kontrak_mulai: "2025-02-01", kontrak_selesai: "2025-07-31", menu_default: [],                    is_primary: false },
  { id: 3,  vendor_id: 5, sekolah_id: 2, porsi_per_hari: 320, harga_per_porsi: 15000, kontrak_mulai: "2025-01-15", kontrak_selesai: "2025-07-31", menu_default: ["nasi_box","buah"],   is_primary: true  },
  { id: 4,  vendor_id: 2, sekolah_id: 2, porsi_per_hari: 320, harga_per_porsi: 14500, kontrak_mulai: "2025-01-15", kontrak_selesai: "2025-07-31", menu_default: ["nasi_box"],          is_primary: false },
  { id: 5,  vendor_id: 1, sekolah_id: 3, porsi_per_hari: 410, harga_per_porsi: 15000, kontrak_mulai: "2025-02-10", kontrak_selesai: "2025-07-31", menu_default: ["nasi_box","minuman"],is_primary: true  },
  { id: 6,  vendor_id: 4, sekolah_id: 3, porsi_per_hari: 410, harga_per_porsi: 0,     kontrak_mulai: "2025-02-10", kontrak_selesai: "2025-07-31", menu_default: [],                    is_primary: false },
  { id: 7,  vendor_id: 2, sekolah_id: 4, porsi_per_hari: 290, harga_per_porsi: 14500, kontrak_mulai: "2025-03-01", kontrak_selesai: "2025-07-31", menu_default: ["nasi_box"],          is_primary: true  },
  { id: 8,  vendor_id: 5, sekolah_id: 5, porsi_per_hari: 360, harga_per_porsi: 15000, kontrak_mulai: "2025-01-20", kontrak_selesai: "2025-07-31", menu_default: ["nasi_box","buah"],   is_primary: true  },
  { id: 9,  vendor_id: 3, sekolah_id: 5, porsi_per_hari: 360, harga_per_porsi: 0,     kontrak_mulai: "2025-01-20", kontrak_selesai: "2025-07-31", menu_default: [],                    is_primary: false },
  { id: 10, vendor_id: 1, sekolah_id: 6, porsi_per_hari: 820, harga_per_porsi: 15000, kontrak_mulai: "2025-02-05", kontrak_selesai: "2025-07-31", menu_default: ["nasi_box","minuman","buah"], is_primary: true },
  { id: 11, vendor_id: 2, sekolah_id: 6, porsi_per_hari: 820, harga_per_porsi: 14500, kontrak_mulai: "2025-02-05", kontrak_selesai: "2025-07-31", menu_default: ["nasi_box"],          is_primary: false },
];

export const deliveryList: Delivery[] = [
  { id: 1,  vendor_sekolah_id: 1,  tanggal: "2025-04-01", status: "delivered",  porsi_dikirim: 680, porsi_diterima: 680, jam_tiba: "06:45", jam_target: "07:00", catatan: null, bukti_url: null },
  { id: 2,  vendor_sekolah_id: 1,  tanggal: "2025-04-02", status: "delivered",  porsi_dikirim: 680, porsi_diterima: 675, jam_tiba: "07:10", jam_target: "07:00", catatan: "5 porsi rusak kemasan", bukti_url: null },
  { id: 3,  vendor_sekolah_id: 1,  tanggal: "2025-04-03", status: "on_transit", porsi_dikirim: 680, porsi_diterima: 0,   jam_tiba: "--",    jam_target: "07:00", catatan: null, bukti_url: null },
  { id: 4,  vendor_sekolah_id: 3,  tanggal: "2025-04-01", status: "delivered",  porsi_dikirim: 320, porsi_diterima: 320, jam_tiba: "06:55", jam_target: "07:00", catatan: null, bukti_url: null },
  { id: 5,  vendor_sekolah_id: 3,  tanggal: "2025-04-02", status: "delivered",  porsi_dikirim: 320, porsi_diterima: 320, jam_tiba: "06:50", jam_target: "07:00", catatan: null, bukti_url: null },
  { id: 6,  vendor_sekolah_id: 3,  tanggal: "2025-04-03", status: "pending",    porsi_dikirim: 0,   porsi_diterima: 0,   jam_tiba: "--",    jam_target: "07:00", catatan: "Menunggu konfirmasi", bukti_url: null },
  { id: 7,  vendor_sekolah_id: 5,  tanggal: "2025-04-01", status: "delivered",  porsi_dikirim: 410, porsi_diterima: 410, jam_tiba: "06:40", jam_target: "07:00", catatan: null, bukti_url: null },
  { id: 8,  vendor_sekolah_id: 7,  tanggal: "2025-04-01", status: "delivered",  porsi_dikirim: 290, porsi_diterima: 290, jam_tiba: "07:05", jam_target: "07:00", catatan: null, bukti_url: null },
  { id: 9,  vendor_sekolah_id: 8,  tanggal: "2025-04-01", status: "delivered",  porsi_dikirim: 360, porsi_diterima: 358, jam_tiba: "06:58", jam_target: "07:00", catatan: "2 porsi tumpah", bukti_url: null },
  { id: 10, vendor_sekolah_id: 10, tanggal: "2025-04-01", status: "delivered",  porsi_dikirim: 820, porsi_diterima: 820, jam_tiba: "06:30", jam_target: "07:00", catatan: null, bukti_url: null },
  { id: 11,  vendor_sekolah_id: 10, tanggal: "2025-04-02", status: "delivered",  porsi_dikirim: 820, porsi_diterima: 815, jam_tiba: "06:55", jam_target: "07:00", catatan: "5 porsi sayur tidak lengkap", bukti_url: null },
  { id: 12,  vendor_sekolah_id: 10, tanggal: "2025-04-03", status: "on_transit", porsi_dikirim: 820, porsi_diterima: 0,   jam_tiba: "--",    jam_target: "07:00", catatan: null, bukti_url: null },
];

export const tenderMaterials: Material[] = [
  // Karbohidrat
  { id: 1, name: 'Beras Premium SLYP (5kg)', type: 'Karbohidrat', price: 78000, rating: 4.9, reviews: 1240 },
  { id: 2, name: 'Beras Medium IR64 (5kg)', type: 'Karbohidrat', price: 65000, rating: 4.7, reviews: 856 },
  { id: 3, name: 'Kentang Dieng Grade A', type: 'Karbohidrat', price: 18000, rating: 4.8, reviews: 432 },
  // Protein Hewani
  { id: 4, name: 'Daging Sapi Lokal Segar', type: 'Protein Hewani', price: 135000, rating: 4.9, reviews: 521 },
  { id: 5, name: 'Ayam Broiler Karkas (1kg)', type: 'Protein Hewani', price: 38000, rating: 4.8, reviews: 928 },
  { id: 6, name: 'Telur Ayam Omega-3 (Box)', type: 'Protein Hewani', price: 32000, rating: 4.9, reviews: 2150 },
  { id: 7, name: 'Ikan Kembung Banjar Segar', type: 'Protein Hewani', price: 42000, rating: 4.6, reviews: 312 },
  // Protein Nabati
  { id: 8, name: 'Tahu Putih Kualitas Super', type: 'Protein Nabati', price: 12000, rating: 4.7, reviews: 654 },
  { id: 9, name: 'Tempe Kedelai Murni (Papan)', type: 'Protein Nabati', price: 8000, rating: 4.8, reviews: 890 },
  // Sayuran
  { id: 10, name: 'Wortel Berastagi Pilihan', type: 'Sayuran', price: 14000, rating: 4.7, reviews: 215 },
  { id: 11, name: 'Bayam Hidroponik Segar', type: 'Sayuran', price: 12000, rating: 4.9, reviews: 143 },
  { id: 12, name: 'Kubis Segar (Pack)', type: 'Sayuran', price: 9000, rating: 4.5, reviews: 88 },
  // Sembako
  { id: 13, name: 'Minyak Goreng Sawit (2L)', type: 'Sembako', price: 34000, rating: 4.8, reviews: 3421 },
  { id: 14, name: 'Gula Pasir Kristal Putih', type: 'Sembako', price: 17500, rating: 4.7, reviews: 1205 },
  { id: 15, name: 'Garam Beryodium (Pack)', type: 'Sembako', price: 5000, rating: 4.6, reviews: 432 },
];

export function getVendorsBySekolah(sekolahId: number) {
  return vendorSekolahList
    .filter((vs) => vs.sekolah_id === sekolahId)
    .map((vs) => ({
      ...vs,
      vendor: vendorList.find((v) => v.id === vs.vendor_id)!,
    }));
}

export function getDeliveriesByVendorSekolah(vsId: number, limit = 5): Delivery[] {
  return deliveryList
    .filter((d) => d.vendor_sekolah_id === vsId)
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
    .slice(0, limit);
}