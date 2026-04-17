export type StatusVendor = "aktif" | "nonaktif" | "suspend";
export type StatusDelivery = "delivered" | "on_transit" | "pending" | "gagal";
export type KategoriVendor = "katering" | "logistik" | "supplier_bahan";
export type TipeMenu = "nasi_box" | "snack" | "minuman" | "buah";
export type ArahPengiriman = "vendor_ke_sppg" | "sppg_ke_sekolah";


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

// SPPG = Satuan Pelayanan Pangan Gizi (dapur produksi sentral MBG)
export interface SPPG {
  id: number;
  nama: string;         // nama dapur
  kecamatan: string;
  kota: string;
  lat: number;
  lng: number;
  kapasitas_porsi: number; // max porsi/hari
  vendor_id: number;       // vendor katering yang mengelola dapur ini
}

// Relasi: SPPG melayani beberapa sekolah (SPPG → Sekolah)
export interface SPPGSekolah {
  id: number;
  sppg_id: number;
  sekolah_id: number;
  porsi_per_hari: number;
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

export const sppgList: SPPG[] = [
  { id: 1, nama: "SPPG Dago Bandung",        kecamatan: "Coblong",       kota: "Bandung", lat: -6.8920, lng: 107.6150, kapasitas_porsi: 1200, vendor_id: 1 },
  { id: 2, nama: "SPPG Soekarno Hatta",      kecamatan: "Bojongloa Kaler", kota: "Bandung", lat: -6.9430, lng: 107.6210, kapasitas_porsi: 900,  vendor_id: 2 },
  { id: 3, nama: "SPPG Buah Batu",           kecamatan: "Lengkong",      kota: "Bandung", lat: -6.9400, lng: 107.6270, kapasitas_porsi: 1100, vendor_id: 5 },
];

export const sppgSekolahList: SPPGSekolah[] = [
  // SPPG Dago melayani SMAN 3, SDN 061, SMAN 20
  { id: 1, sppg_id: 1, sekolah_id: 1, porsi_per_hari: 680 },
  { id: 2, sppg_id: 1, sekolah_id: 3, porsi_per_hari: 410 },
  { id: 3, sppg_id: 1, sekolah_id: 6, porsi_per_hari: 820 },
  // SPPG Soekarno Hatta melayani SMPN 2, SMPN 5
  { id: 4, sppg_id: 2, sekolah_id: 2, porsi_per_hari: 320 },
  { id: 5, sppg_id: 2, sekolah_id: 4, porsi_per_hari: 290 },
  // SPPG Buah Batu melayani SDN 164
  { id: 6, sppg_id: 3, sekolah_id: 5, porsi_per_hari: 360 },
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

export function getSekolahBySPPG(sppgId: number) {
  return sppgSekolahList
    .filter((ss) => ss.sppg_id === sppgId)
    .map((ss) => sekolahList.find((s) => s.id === ss.sekolah_id)!);
}

// ─── Dashboard Aggregate Functions ─────────────────────────────────────────

export type DashboardPeriode = "1H" | "7H" | "30H";
export type JenjangFilter = "SD" | "SMP" | "SMA";

/** Helper: ISO date string N days ago */
function daysAgo(n: number): string {
  const d = new Date("2025-04-03"); // anchor = latest date in data
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

/** Deliveries for a given date range */
function deliveriesInRange(from: string, to: string) {
  return deliveryList.filter((d) => d.tanggal >= from && d.tanggal <= to);
}

// ── 1. KPI Summary ───────────────────────────────────────────────────────────

export interface KPISummary {
  totalPorsi: number;
  totalPorsiPrev: number;
  totalPengeluaran: number;
  totalPengeluaranPrev: number;
  onTimeRate: number;
  onTimeRatePrev: number;
  sengketaAktif: number;
  sengketaAktifPrev: number;
  vendorPending: number;
}

export function getKPISummary(periode: DashboardPeriode): KPISummary {
  const days = periode === "1H" ? 1 : periode === "7H" ? 7 : 30;
  const toDate = daysAgo(0);
  const fromDate = daysAgo(days - 1);
  const prevTo = daysAgo(days);
  const prevFrom = daysAgo(days * 2 - 1);

  const curr = deliveriesInRange(fromDate, toDate);
  const prev = deliveriesInRange(prevFrom, prevTo);

  const calcPorsi = (list: Delivery[]) =>
    list.filter((d) => d.status === "delivered").reduce((s, d) => s + d.porsi_diterima, 0);

  const calcPengeluaran = (list: Delivery[]) =>
    list
      .filter((d) => d.status === "delivered")
      .reduce((s, d) => {
        const vs = vendorSekolahList.find((v) => v.id === d.vendor_sekolah_id);
        return s + d.porsi_diterima * (vs?.harga_per_porsi ?? 15000);
      }, 0);

  const onTimeDelivered = (list: Delivery[]) =>
    list.filter(
      (d) => d.status === "delivered" && d.jam_tiba !== "--" && d.jam_tiba <= d.jam_target
    ).length;
  const totalDelivered = (list: Delivery[]) => list.filter((d) => d.status === "delivered").length;

  const currOTCount = onTimeDelivered(curr);
  const currTotalD = totalDelivered(curr);
  const prevOTCount = onTimeDelivered(prev);
  const prevTotalD = totalDelivered(prev);

  return {
    totalPorsi: calcPorsi(curr),
    totalPorsiPrev: calcPorsi(prev),
    totalPengeluaran: calcPengeluaran(curr),
    totalPengeluaranPrev: calcPengeluaran(prev),
    onTimeRate: currTotalD > 0 ? Math.round((currOTCount / currTotalD) * 1000) / 10 : 0,
    onTimeRatePrev: prevTotalD > 0 ? Math.round((prevOTCount / prevTotalD) * 1000) / 10 : 0,
    sengketaAktif: curr.filter((d) => d.catatan && d.catatan.toLowerCase().includes("sengketa")).length,
    sengketaAktifPrev: prev.filter((d) => d.catatan && d.catatan.toLowerCase().includes("sengketa")).length,
    vendorPending: vendorList.filter((v) => v.status === "suspend").length,
  };
}

// ── 2. Delivery Trend (Porsi + Pengeluaran) ──────────────────────────────────

export interface TrendDataPoint {
  label: string;
  porsi: number;
  pengeluaran: number;
  porsiSD: number;
  porsiSMP: number;
  porsiSMA: number;
  isAvgPrev?: boolean;
}

export function getDeliveryTrend(periode: DashboardPeriode, jenjang?: JenjangFilter[]): { series: TrendDataPoint[]; avgPrev: number } {
  const days = periode === "1H" ? 1 : periode === "7H" ? 7 : 30;
  const LABELS_DAY = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  // Helper: check if a delivery matches the jenjang filter
  const matchesJenjang = (d: Delivery) => {
    if (!jenjang || jenjang.length === 0) return true;
    const vs = vendorSekolahList.find((v) => v.id === d.vendor_sekolah_id);
    const s = vs ? sekolahList.find((sc) => sc.id === vs.sekolah_id) : null;
    return s ? jenjang.includes(s.jenjang as JenjangFilter) : false;
  };

  const series: TrendDataPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = daysAgo(i);
    const all = deliveryList.filter((d) => d.tanggal === date && d.status === "delivered");
    const delivs = all.filter(matchesJenjang);

    const getJenjangPorsi = (j: string) =>
      delivs
        .filter((d) => {
          const vs = vendorSekolahList.find((v) => v.id === d.vendor_sekolah_id);
          const s = vs ? sekolahList.find((sc) => sc.id === vs.sekolah_id) : null;
          return s?.jenjang === j;
        })
        .reduce((s, d) => s + d.porsi_diterima, 0);

    const totalPorsi = delivs.reduce((s, d) => s + d.porsi_diterima, 0);
    const pengeluaran = delivs.reduce((s, d) => {
      const vs = vendorSekolahList.find((v) => v.id === d.vendor_sekolah_id);
      return s + d.porsi_diterima * (vs?.harga_per_porsi ?? 15000);
    }, 0);

    const dayLabel = days <= 7 ? LABELS_DAY[new Date(date).getDay()] : date.slice(8, 10);
    series.push({
      label: dayLabel,
      porsi: totalPorsi,
      pengeluaran,
      porsiSD: getJenjangPorsi("SD"),
      porsiSMP: getJenjangPorsi("SMP"),
      porsiSMA: getJenjangPorsi("SMA"),
    });
  }

  const prevSeries: number[] = [];
  for (let i = days * 2 - 1; i >= days; i--) {
    const date = daysAgo(i);
    const p = deliveryList
      .filter((d) => d.tanggal === date && d.status === "delivered" && matchesJenjang(d))
      .reduce((s, d) => s + d.porsi_diterima, 0);
    prevSeries.push(p);
  }
  const avgPrev = prevSeries.length > 0 ? Math.round(prevSeries.reduce((a, b) => a + b, 0) / prevSeries.length) : 0;

  return { series, avgPrev };
}

// ── 3. On-Time Rate Series ────────────────────────────────────────────────────

export interface OnTimeRatePoint {
  label: string;
  rate: number;
}

export function getOnTimeRateSeries(periode: DashboardPeriode, jenjang?: JenjangFilter[]): { series: OnTimeRatePoint[]; current: number; prev: number } {
  const days = periode === "1H" ? 1 : periode === "7H" ? 7 : 30;
  const LABELS_DAY = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const matchesJenjang = (d: Delivery) => {
    if (!jenjang || jenjang.length === 0) return true;
    const vs = vendorSekolahList.find((v) => v.id === d.vendor_sekolah_id);
    const s = vs ? sekolahList.find((sc) => sc.id === vs.sekolah_id) : null;
    return s ? jenjang.includes(s.jenjang as JenjangFilter) : false;
  };

  const series: OnTimeRatePoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = daysAgo(i);
    const delivs = deliveryList.filter((d) => d.tanggal === date && d.status === "delivered" && matchesJenjang(d));
    const onTime = delivs.filter((d) => d.jam_tiba !== "--" && d.jam_tiba <= d.jam_target).length;
    const rate = delivs.length > 0 ? Math.round((onTime / delivs.length) * 1000) / 10 : 0;
    const label = days <= 7 ? LABELS_DAY[new Date(date).getDay()] : date.slice(8, 10);
    series.push({ label, rate });
  }

  const currDelivs = deliveriesInRange(daysAgo(days - 1), daysAgo(0)).filter((d) => d.status === "delivered" && matchesJenjang(d));
  const currOT = currDelivs.filter((d) => d.jam_tiba !== "--" && d.jam_tiba <= d.jam_target).length;
  const current = currDelivs.length > 0 ? Math.round((currOT / currDelivs.length) * 1000) / 10 : 0;

  const prevDelivs = deliveriesInRange(daysAgo(days * 2 - 1), daysAgo(days)).filter((d) => d.status === "delivered" && matchesJenjang(d));
  const prevOT = prevDelivs.filter((d) => d.jam_tiba !== "--" && d.jam_tiba <= d.jam_target).length;
  const prev = prevDelivs.length > 0 ? Math.round((prevOT / prevDelivs.length) * 1000) / 10 : 0;

  return { series, current, prev };
}

// ── 4. Status per Jenjang ─────────────────────────────────────────────────────

export interface JenjangStatusData {
  jenjang: "SD" | "SMP" | "SMA";
  delivered: number;
  on_transit: number;
  pending: number;
  gagal: number;
  total: number;
  completionPct: number;
}

export function getStatusPerJenjang(periode: DashboardPeriode): JenjangStatusData[] {
  const days = periode === "1H" ? 1 : periode === "7H" ? 7 : 30;
  const from = daysAgo(days - 1);
  const to = daysAgo(0);
  const range = deliveriesInRange(from, to);

  return (["SD", "SMP", "SMA"] as const).map((jenjang) => {
    const filtered = range.filter((d) => {
      const vs = vendorSekolahList.find((v) => v.id === d.vendor_sekolah_id);
      const s = vs ? sekolahList.find((sc) => sc.id === vs.sekolah_id) : null;
      return s?.jenjang === jenjang;
    });

    const delivered = filtered.filter((d) => d.status === "delivered").length;
    const on_transit = filtered.filter((d) => d.status === "on_transit").length;
    const pending = filtered.filter((d) => d.status === "pending").length;
    const gagal = filtered.filter((d) => d.status === "gagal").length;
    const total = filtered.length;

    return {
      jenjang,
      delivered,
      on_transit,
      pending,
      gagal,
      total,
      completionPct: total > 0 ? Math.round((delivered / total) * 100) : 0,
    };
  });
}

// ── 5. Vendor Ranking ─────────────────────────────────────────────────────────

export interface VendorRankingItem {
  id: number;
  nama: string;
  onTimeRate: number;
  status: StatusVendor;
  kategori: KategoriVendor;
  totalPengiriman: number;
}

export function getVendorRanking(): VendorRankingItem[] {
  return vendorList
    .map((v) => ({
      id: v.id,
      nama: v.nama,
      onTimeRate: v.on_time_rate,
      status: v.status,
      kategori: v.kategori,
      totalPengiriman: v.total_pengiriman,
    }))
    .sort((a, b) => a.onTimeRate - b.onTimeRate); // ascending = yang paling buruk di atas
}

// ── 6. Compliance Scores ──────────────────────────────────────────────────────

export interface ComplianceCategoryScore {
  kategori: "Vendor" | "Sekolah" | "Armada";
  skor: number;
  skorPrev: number;
  trend: "up" | "down" | "stable";
  trendValue: number;
  entities: {
    nama: string;
    status: "patuh" | "perhatian" | "tidak_patuh";
    skor: number;
  }[];
}

export function getComplianceScores(): ComplianceCategoryScore[] {
  const vendorSkor = Math.round(
    (vendorList.filter((v) => v.status === "aktif").length / vendorList.length) * 100
  );
  const vendorPrev = 97;

  const deliveredRatio = deliveryList.filter((d) => d.status === "delivered").length / Math.max(deliveryList.length, 1);
  const sekolahSkor = Math.round(deliveredRatio * 100);
  const sekolahPrev = 89;

  const onTimeArmada = deliveryList.filter(
    (d) => d.status === "delivered" && d.jam_tiba !== "--" && d.jam_tiba <= d.jam_target
  ).length;
  const armadaSkor = deliveryList.length > 0 ? Math.round((onTimeArmada / deliveryList.length) * 100) : 0;
  const armadaPrev = 91;

  return [
    {
      kategori: "Vendor",
      skor: vendorSkor,
      skorPrev: vendorPrev,
      trend: vendorSkor > vendorPrev ? "up" : vendorSkor < vendorPrev ? "down" : "stable",
      trendValue: Math.abs(vendorSkor - vendorPrev),
      entities: vendorList.map((v) => ({
        nama: v.nama,
        status: v.status === "aktif" ? "patuh" : v.status === "suspend" ? "tidak_patuh" : "perhatian",
        skor: Math.round(v.on_time_rate),
      })),
    },
    {
      kategori: "Sekolah",
      skor: sekolahSkor,
      skorPrev: sekolahPrev,
      trend: sekolahSkor > sekolahPrev ? "up" : sekolahSkor < sekolahPrev ? "down" : "stable",
      trendValue: Math.abs(sekolahSkor - sekolahPrev),
      entities: sekolahList.map((s) => {
        const delivs = deliveryList.filter((d) => {
          const vs = vendorSekolahList.find((v) => v.id === d.vendor_sekolah_id);
          return vs?.sekolah_id === s.id;
        });
        const ok = delivs.filter((d) => d.status === "delivered").length;
        const pct = delivs.length > 0 ? Math.round((ok / delivs.length) * 100) : 0;
        return {
          nama: s.nama,
          status: pct >= 90 ? "patuh" : pct >= 70 ? "perhatian" : "tidak_patuh",
          skor: pct,
        };
      }),
    },
    {
      kategori: "Armada",
      skor: armadaSkor,
      skorPrev: armadaPrev,
      trend: armadaSkor > armadaPrev ? "up" : armadaSkor < armadaPrev ? "down" : "stable",
      trendValue: Math.abs(armadaSkor - armadaPrev),
      entities: [
        { nama: "Armada 1 – Bandung Utara (SPPG Dago)", status: "patuh" as const, skor: 96 },
        { nama: "Armada 2 – Bandung Selatan (SPPG Buah Batu)", status: "patuh" as const, skor: 94 },
        { nama: "Armada 3 – Bandung Tengah (SPPG Soekarno Hatta)", status: "perhatian" as const, skor: 82 },
      ],
    },
  ];
}

// ── 7. School Table Data ──────────────────────────────────────────────────────

export type SchoolDeliveryStatus = "terkirim" | "on_transit" | "gagal" | "sengketa" | "pending";

export interface SchoolTableRow {
  id: number;
  nama: string;
  jenjang: "SD" | "SMP" | "SMA";
  kecamatan: string;
  kota: string;
  lat: number;
  lng: number;
  status: SchoolDeliveryStatus;
  porsiDiterima: number;
  porsiTarget: number;
  jamTiba: string;
  jamTarget: string;
  selisihMenit: number | null; // positif = terlambat, negatif = lebih awal
  vendorNama: string;
  catatan: string | null;
}

export function getSchoolTableData(periode: DashboardPeriode, jenjangFilter?: JenjangFilter[]): SchoolTableRow[] {
  const days = periode === "1H" ? 1 : periode === "7H" ? 7 : 30;
  const from = daysAgo(days - 1);
  const to = daysAgo(0);

  const STATUS_ORDER: Record<SchoolDeliveryStatus, number> = {
    sengketa: 0, gagal: 1, on_transit: 2, pending: 3, terkirim: 4,
  };

  return sekolahList
    .filter((s) => !jenjangFilter || jenjangFilter.length === 0 || jenjangFilter.includes(s.jenjang))
    .map((s) => {
      const vsLinks = vendorSekolahList.filter((vs) => vs.sekolah_id === s.id && vs.is_primary);
      const vs = vsLinks[0];
      const vendor = vs ? vendorList.find((v) => v.id === vs.vendor_id) : null;

      // latest delivery in range
      const delivs = deliveryList
        .filter((d) => vs && d.vendor_sekolah_id === vs.id && d.tanggal >= from && d.tanggal <= to)
        .sort((a, b) => b.tanggal.localeCompare(a.tanggal));

      const latest = delivs[0];

      let status: SchoolDeliveryStatus = "pending";
      let porsiDiterima = 0;
      let jamTiba = "--";
      let selisihMenit: number | null = null;
      let catatan: string | null = null;

      if (latest) {
        porsiDiterima = latest.porsi_diterima;
        jamTiba = latest.jam_tiba;
        catatan = latest.catatan;

        if (latest.catatan?.toLowerCase().includes("sengketa")) {
          status = "sengketa";
        } else if (latest.status === "delivered") {
          status = "terkirim";
        } else if (latest.status === "on_transit") {
          status = "on_transit";
        } else if (latest.status === "gagal") {
          status = "gagal";
        } else {
          status = "pending";
        }

        // calculate selisih in minutes
        if (latest.jam_tiba !== "--" && latest.jam_target !== "--") {
          const [ha, ma] = latest.jam_tiba.split(":").map(Number);
          const [ht, mt] = latest.jam_target.split(":").map(Number);
          selisihMenit = (ha * 60 + ma) - (ht * 60 + mt);
        }
      }

      return {
        id: s.id,
        nama: s.nama,
        jenjang: s.jenjang,
        kecamatan: s.kecamatan,
        kota: s.kota,
        lat: s.lat,
        lng: s.lng,
        status,
        porsiDiterima,
        porsiTarget: vs?.porsi_per_hari ?? s.total_siswa,
        jamTiba,
        jamTarget: latest?.jam_target ?? "07:00",
        selisihMenit,
        vendorNama: vendor?.nama ?? "—",
        catatan,
      };
    })
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
}

// ── 8. Activity Log ───────────────────────────────────────────────────────────

export interface ActivityLogItem {
  id: string;
  type: "success" | "warning" | "refund" | "info";
  message: string;
  timeLabel: string; // "5 menit lalu"
  href: string;
}

export function getActivityLog(): ActivityLogItem[] {
  // Derive activity from delivery events + static system events
  const items: ActivityLogItem[] = [];

  deliveryList.forEach((d) => {
    const vs = vendorSekolahList.find((v) => v.id === d.vendor_sekolah_id);
    const sekolah = vs ? sekolahList.find((s) => s.id === vs.sekolah_id) : null;
    const vendor = vs ? vendorList.find((v) => v.id === vs.vendor_id) : null;

    if (d.status === "delivered" && d.catatan) {
      items.push({
        id: `d-catatan-${d.id}`,
        type: "warning",
        message: `${sekolah?.nama ?? "Sekolah"}: ${d.catatan}`,
        timeLabel: `${d.id * 7} menit lalu`,
        href: "/goverment/pengawasan",
      });
    }
    if (d.status === "on_transit") {
      items.push({
        id: `d-transit-${d.id}`,
        type: "info",
        message: `Pengiriman ke ${sekolah?.nama ?? "Sekolah"} sedang dalam perjalanan`,
        timeLabel: `${d.id * 4} menit lalu`,
        href: "/goverment/pengawasan",
      });
    }
    if (d.status === "pending") {
      items.push({
        id: `d-pending-${d.id}`,
        type: "warning",
        message: `Pengiriman ke ${sekolah?.nama ?? "Sekolah"} belum terkonfirmasi`,
        timeLabel: `${d.id * 5} menit lalu`,
        href: "/goverment/verifikasi",
      });
    }
  });

  // Static system events
  items.push(
    { id: "sys-1", type: "success", message: "CV Katering Bandung Juara: SBT disetujui", timeLabel: "2 jam lalu", href: "/goverment/pengajuan" },
    { id: "sys-2", type: "refund", message: "Refund Rp 4.200.000 dieksekusi ke kas negara", timeLabel: "4 jam lalu", href: "/goverment/verifikasi" },
    { id: "sys-3", type: "info", message: "Laporan distribusi Minggu ke-14 tersedia", timeLabel: "6 jam lalu", href: "/goverment/riwayat" },
    { id: "sys-4", type: "warning", message: "Stok bahan baku Agro Lembang Segar menipis", timeLabel: "8 jam lalu", href: "/goverment/pengajuan" },
  );

  return items.slice(0, 20);
}

// ── 9. Delivery Heatmap (simulated, 7 days × 24 hours) ───────────────────────

export interface HeatmapCell {
  day: number;   // 0=Minggu ... 6=Sabtu
  hour: number;  // 0–23
  volume: number;
}

// Seeded PRNG (mulberry32) — deterministic, avoids SSR/CSR hydration mismatch
function heatmapRand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 0xffffffff;
  };
}

export function getDeliveryHeatmap(): { cells: HeatmapCell[]; avgPerHour: number[] } {
  // Simulate realistic MBG delivery pattern:
  // Peak: 05:00-07:30, secondary: 11:00-12:00
  const cells: HeatmapCell[] = [];
  const hourlyTotals: number[] = Array(24).fill(0);
  let dayCountNonZero = 0;

  for (let day = 0; day < 7; day++) {
    if (day === 0) continue; // Skip Sunday
    dayCountNonZero++;
    for (let hour = 0; hour < 24; hour++) {
      const rand = heatmapRand(day * 100 + hour); // unique seed per cell
      let base = 0;
      if (hour >= 5 && hour <= 7) base = 1800 - Math.abs(hour - 6) * 400 + rand() * 200;
      else if (hour >= 11 && hour <= 12) base = 600 + rand() * 150;
      else if (hour >= 8 && hour <= 10) base = 200 + rand() * 100;
      const volume = Math.max(0, Math.round(base));
      cells.push({ day, hour, volume });
      hourlyTotals[hour] += volume;
    }
  }

  const avgPerHour = hourlyTotals.map((t) => Math.round(t / Math.max(dayCountNonZero, 1)));
  return { cells, avgPerHour };
}
