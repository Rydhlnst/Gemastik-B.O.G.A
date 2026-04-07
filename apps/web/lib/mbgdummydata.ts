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

export const sekolahList: Sekolah[] = [
  { id: 1, nama: "SMPN 5 Jakarta Pusat",  jenjang: "SMP", kelurahan: "Kebon Sirih",  kecamatan: "Menteng",   kota: "Jakarta Pusat",   lat: -6.1854, lng: 106.8321, total_siswa: 680, mulai_mbg: "2025-02-01" },
  { id: 2, nama: "SDN Gondangdia 01",      jenjang: "SD",  kelurahan: "Gondangdia",   kecamatan: "Menteng",   kota: "Jakarta Pusat",   lat: -6.1887, lng: 106.8365, total_siswa: 320, mulai_mbg: "2025-01-15" },
  { id: 3, nama: "SDN Menteng 01",         jenjang: "SD",  kelurahan: "Menteng",      kecamatan: "Menteng",   kota: "Jakarta Pusat",   lat: -6.1943, lng: 106.8341, total_siswa: 410, mulai_mbg: "2025-02-10" },
  { id: 4, nama: "SDN Cikini 01",          jenjang: "SD",  kelurahan: "Cikini",       kecamatan: "Menteng",   kota: "Jakarta Pusat",   lat: -6.1971, lng: 106.8440, total_siswa: 290, mulai_mbg: "2025-03-01" },
  { id: 5, nama: "SDN Pegangsaan 02",      jenjang: "SD",  kelurahan: "Pegangsaan",   kecamatan: "Menteng",   kota: "Jakarta Pusat",   lat: -6.2012, lng: 106.8378, total_siswa: 360, mulai_mbg: "2025-01-20" },
  { id: 6, nama: "SMAN 68 Jakarta",        jenjang: "SMA", kelurahan: "Menteng Atas", kecamatan: "Setiabudi", kota: "Jakarta Selatan", lat: -6.2089, lng: 106.8298, total_siswa: 820, mulai_mbg: "2025-02-05" },
];

export const vendorList: Vendor[] = [
  {
    id: 1, nama: "CV Nusantara Pangan Sejahtera", kategori: "katering", status: "aktif",
    rating: 4.8, kontak_pic: "Budi Santoso", no_telp: "0812-3456-7890",
    email: "ops@nusantarapangan.co.id", alamat: "Jl. Kramat Raya No. 45, Jakarta Pusat",
    lat: -6.1780, lng: 106.8450,
    sertifikasi: ["Halal MUI", "BPOM", "ISO 22000"],
    bergabung_sejak: "2024-11-01", total_pengiriman: 312, on_time_rate: 97.4,
  },
  {
    id: 2, nama: "PT Gizi Maju Indonesia", kategori: "katering", status: "aktif",
    rating: 4.5, kontak_pic: "Siti Rahayu", no_telp: "0813-9988-7766",
    email: "halo@gizimaju.id", alamat: "Jl. Salemba Raya No. 12, Jakarta Pusat",
    lat: -6.2050, lng: 106.8520,
    sertifikasi: ["Halal MUI", "BPOM"],
    bergabung_sejak: "2024-12-15", total_pengiriman: 198, on_time_rate: 94.9,
  },
  {
    id: 3, nama: "UD Berkah Logistik", kategori: "logistik", status: "aktif",
    rating: 4.6, kontak_pic: "Agus Wijaya", no_telp: "0821-5566-4433",
    email: "fleet@berkahlogistik.com", alamat: "Jl. Cikini No. 88, Jakarta Pusat",
    lat: -6.1920, lng: 106.8280,
    sertifikasi: ["ISO 9001"],
    bergabung_sejak: "2025-01-05", total_pengiriman: 156, on_time_rate: 98.1,
  },
  {
    id: 4, nama: "PT Agro Segar Nusantara", kategori: "supplier_bahan", status: "aktif",
    rating: 4.3, kontak_pic: "Dewi Kartika", no_telp: "0819-2233-5577",
    email: "supply@agrosegar.co.id", alamat: "Jl. Pasar Rumput No. 5, Jakarta Selatan",
    lat: -6.2200, lng: 106.8390,
    sertifikasi: ["Halal MUI", "SNI"],
    bergabung_sejak: "2025-01-20", total_pengiriman: 89, on_time_rate: 91.0,
  },
  {
    id: 5, nama: "CV Menteng Katering", kategori: "katering", status: "aktif",
    rating: 4.7, kontak_pic: "Rini Astuti", no_telp: "0856-7788-9900",
    email: "order@mentengkatering.id", alamat: "Jl. Besuki No. 22, Menteng",
    lat: -6.1860, lng: 106.8310,
    sertifikasi: ["Halal MUI", "BPOM", "ISO 22000"],
    bergabung_sejak: "2024-10-10", total_pengiriman: 421, on_time_rate: 96.2,
  },
  {
    id: 6, nama: "PT Sejahtera Food Hub", kategori: "katering", status: "suspend",
    rating: 3.2, kontak_pic: "Hendra Gunawan", no_telp: "0878-1122-3344",
    email: "info@sejahterafood.com", alamat: "Jl. Matraman No. 67, Jakarta Timur",
    lat: -6.2150, lng: 106.8620,
    sertifikasi: ["Halal MUI"],
    bergabung_sejak: "2025-02-01", total_pengiriman: 34, on_time_rate: 70.6,
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
  { id: 11, vendor_sekolah_id: 10, tanggal: "2025-04-02", status: "delivered",  porsi_dikirim: 820, porsi_diterima: 815, jam_tiba: "06:55", jam_target: "07:00", catatan: "5 porsi sayur tidak lengkap", bukti_url: null },
  { id: 12, vendor_sekolah_id: 10, tanggal: "2025-04-03", status: "on_transit", porsi_dikirim: 820, porsi_diterima: 0,   jam_tiba: "--",    jam_target: "07:00", catatan: null, bukti_url: null },
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