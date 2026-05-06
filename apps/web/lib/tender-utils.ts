import { Store, User, Phone, MapPin, FileText, Mail, CreditCard, ShieldCheck } from "lucide-react";

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  price: string;
  unit: string;
  stock: number;
  rating: number;
  reviews: number;
  buyersCount: number;
  image: string;
  isNew?: boolean;
  isMarkup?: boolean;
  markupPercent?: number;
  hetValue: number;
  distance: number;
  description: string;
  vendor: string;
  vendorInfo: {
    owner: string;
    address: string;
    email: string;
    phone: string;
    bankName: string;
    bankAccount: string;
    bankOwner: string;
    npwp: string;
    nib: string;
    latitude: number;
    longitude: number;
  };
  gallery: string[];
}

export interface SelectedIngredient extends CatalogItem {
  amountPerPortion: number;
}

export interface CustomMenu {
  id: string;
  name: string;
  description: string;
  price: number;
  frequency: number;
  selectedDays: number[];
  bufferPercent: number;
  overheadCost: number;
  cookingTime: number;
  image: string;
}

export const STUDENTS_COUNT = 540;

export const mockCatalogItems: CatalogItem[] = [
  {
    id: "1",
    name: "Beras Premium Slyp Super",
    category: "Karbohidrat",
    price: "Rp 14.500",
    unit: "kg",
    stock: 1500,
    rating: 4.8,
    reviews: 1250,
    buyersCount: 3400,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=800&auto=format&fit=crop",
    hetValue: 15000,
    distance: 2.4,
    description: "Beras kualitas super dengan butiran panjang dan pulen. Diproses dengan teknologi modern tanpa pemutih dan pengawet. Cocok untuk kebutuhan konsumsi harian keluarga dan usaha kuliner.",
    vendor: "CV. Berkah Sembako Bogor",
    vendorInfo: {
      owner: "Haji Dadang Sudrajat",
      address: "Jl. Raya Tajur No. 45, Bogor",
      email: "dadang@pangan.com",
      phone: "021-5556677",
      bankName: "Bank Mandiri",
      bankAccount: "12345678",
      bankOwner: "Haji Dadang Sudrajat",
      npwp: "01.234.567.8",
      nib: "1234567890",
      latitude: -6.634,
      longitude: 106.824
    },
    gallery: [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=800",
      "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?q=80&w=800",
      "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?q=80&w=800",
      "https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=800"
    ]
  },
  {
    id: "2",
    name: "Daging Ayam Segar Potong",
    category: "Protein Hewani",
    price: "Rp 36.500",
    unit: "kg",
    stock: 200,
    rating: 4.5,
    reviews: 320,
    buyersCount: 850,
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?q=80&w=800&auto=format&fit=crop",
    isMarkup: true,
    markupPercent: 21,
    hetValue: 30000,
    distance: 5.1,
    description: "Ayam potong segar dari peternakan lokal bersertifikat Halal. Dipotong setiap pagi untuk menjaga kualitas dan kesegaran. Bebas suntik hormon dan antibiotik.",
    vendor: "Rumah Potong Unggas Sejahtera",
    vendorInfo: {
      owner: "Ibu Siti Aminah",
      address: "Pasar Baru Bogor Blok C No. 12",
      email: "siti@rpu-sejahtera.com",
      phone: "0812-3344-5566",
      bankName: "Bank BRI",
      bankAccount: "87654321",
      bankOwner: "Siti Aminah",
      npwp: "02.445.667.9",
      nib: "2233445566",
      latitude: -6.594,
      longitude: 106.789
    },
    gallery: [
      "https://images.unsplash.com/photo-1604503468506-a8da13d82791?q=80&w=800",
      "https://images.unsplash.com/photo-1587593817647-43991756c44e?q=80&w=800",
      "https://images.unsplash.com/photo-1606728035253-49e8a23146de?q=80&w=800",
      "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=800"
    ]
  },
  {
    id: "3",
    name: "Telur Ayam Ras Hyper Good",
    category: "Protein Hewani",
    price: "Rp 31.000",
    unit: "kg",
    stock: 100,
    rating: 0,
    reviews: 0,
    buyersCount: 0,
    isNew: true,
    image: "https://images.unsplash.com/photo-1516448438150-c98f0a9a97ad?q=80&w=800&auto=format&fit=crop",
    hetValue: 29000,
    isMarkup: true,
    markupPercent: 6,
    distance: 3.8,
    description: "Telur ayam ras pilihan dengan ukuran seragam. Mengandung Omega-3 tinggi. Cangkang bersih dan kuat, dijamin kesegarannya langsung dari kandang.",
    vendor: "Farm Fresh Eggs Mandiri",
    vendorInfo: {
      owner: "Andi Wijaya",
      address: "Kawasan Peternakan Caringin",
      email: "andi@farmfresh.com",
      phone: "0856-7788-9900",
      bankName: "Bank BNI",
      bankAccount: "55667788",
      bankOwner: "Andi Wijaya",
      npwp: "03.112.223.4",
      nib: "3344556677",
      latitude: -6.721,
      longitude: 106.845
    },
    gallery: [
      "https://images.unsplash.com/photo-1516448438150-c98f0a9a97ad?q=80&w=800",
      "https://images.unsplash.com/photo-1506976785307-8732e854ad03?q=80&w=800",
      "https://images.unsplash.com/photo-1582722653844-38dc4fddfbd2?q=80&w=800",
      "https://images.unsplash.com/photo-1598965675045-45c5e72c7d05?q=80&w=800"
    ]
  },
  {
    id: "4",
    name: "Tempe Kedelai Super",
    category: "Protein Nabati",
    price: "Rp 5.000",
    unit: "pcs",
    stock: 350,
    rating: 4.7,
    reviews: 640,
    buyersCount: 1200,
    image: "https://images.unsplash.com/photo-1627916607164-7b20241db935?q=80&w=800&auto=format&fit=crop",
    hetValue: 6000,
    distance: 1.2,
    description: "Tempe kedelai non-GMO yang dibuat secara tradisional dengan standar higienis tinggi. Padat, gurih, dan mengandung protein nabati yang sangat baik untuk kesehatan.",
    vendor: "UKM Tempe H. Somad",
    vendorInfo: {
      owner: "Haji Somad",
      address: "Kampung Tempe, Ciomas",
      email: "somad@tempe-ciomas.com",
      phone: "0813-9988-7766",
      bankName: "Bank BCA",
      bankAccount: "99001122",
      bankOwner: "Somad",
      npwp: "05.667.889.0",
      nib: "5566778899",
      latitude: -6.612,
      longitude: 106.754
    },
    gallery: [
      "https://images.unsplash.com/photo-1627916607164-7b20241db935?q=80&w=800",
      "https://images.unsplash.com/photo-1515003322812-70139e782e4e?q=80&w=800",
      "https://images.unsplash.com/photo-1627916607421-a4773815674c?q=80&w=800",
      "https://images.unsplash.com/photo-1627916607314-87be3121b6d1?q=80&w=800"
    ]
  },
  {
    id: "5",
    name: "Bawang Merah Brebes Grade A",
    category: "Bahan Dapur",
    price: "Rp 28.000",
    unit: "kg",
    stock: 800,
    rating: 4.9,
    reviews: 2100,
    buyersCount: 5200,
    image: "https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?q=80&w=800&auto=format&fit=crop",
    hetValue: 30000,
    distance: 0.8,
    description: "Bawang merah asli Brebes dengan aroma yang sangat kuat dan kadar air rendah. Cocok untuk bumbu masakan maupun bawang goreng.",
    vendor: "Grosir Bumbu Pak Kumis",
    vendorInfo: {
      owner: "Pak Kumis",
      address: "Pasar Induk Kramat Jati",
      email: "kumis@bumbuinduk.com",
      phone: "0812-0000-1111",
      bankName: "Bank Mandiri",
      bankAccount: "11223344",
      bankOwner: "Pak Kumis",
      npwp: "06.778.990.1",
      nib: "6677889900",
      latitude: -6.291,
      longitude: 106.871
    },
    gallery: [
      "https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?q=80&w=800",
      "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?q=80&w=800",
      "https://images.unsplash.com/photo-1598965402089-897ce52e8355?q=80&w=800",
      "https://images.unsplash.com/photo-1618512496448-64906a2360f0?q=80&w=800"
    ]
  },
  {
    id: "6",
    name: "Minyak Goreng Sawit 2L",
    category: "Industri",
    price: "Rp 34.000",
    unit: "pouch",
    stock: 500,
    rating: 4.6,
    reviews: 180,
    buyersCount: 450,
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=800&auto=format&fit=crop",
    hetValue: 32000,
    isMarkup: true,
    markupPercent: 6,
    distance: 4.2,
    description: "Minyak goreng kelapa sawit murni dengan dua kali penyaringan. Jernih dan tahan panas, sangat ekonomis untuk penggunaan dalam jumlah besar.",
    vendor: "Distributor Minyak Sawit Jaya",
    vendorInfo: {
      owner: "Budi Santoso",
      address: "Kawasan Industri Pulo Gadung",
      email: "budi@minyakjaya.com",
      phone: "021-998877",
      bankName: "Bank Mandiri",
      bankAccount: "22334455",
      bankOwner: "Budi Santoso",
      npwp: "07.889.001.2",
      nib: "7788990011",
      latitude: -6.201,
      longitude: 106.912
    },
    gallery: [
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=800",
      "https://images.unsplash.com/photo-1474440692490-2e83ae13ba26?q=80&w=800",
      "https://images.unsplash.com/photo-1593001874117-c99c800e3eb7?q=80&w=800",
      "https://images.unsplash.com/photo-1620706122100-6101f3796677?q=80&w=800"
    ]
  },
  {
    id: "7",
    name: "Ikan Kembung Segar Laut",
    category: "Protein Ikan",
    price: "Rp 42.000",
    unit: "kg",
    stock: 50,
    rating: 4.8,
    reviews: 95,
    buyersCount: 210,
    image: "https://images.unsplash.com/photo-1534604973900-c41ab4c287ba?q=80&w=800&auto=format&fit=crop",
    hetValue: 40000,
    isMarkup: true,
    markupPercent: 5,
    distance: 12.5,
    description: "Ikan kembung segar hasil tangkapan nelayan lokal hari ini. Tanpa formalin, dikirim dengan kemasan es untuk menjaga suhu dan kesegaran.",
    vendor: "Pelelangan Ikan Muara Baru",
    vendorInfo: {
      owner: "Capt. Ahmad",
      address: "Pelabuhan Muara Baru Blok A",
      email: "ahmad@muarabaru.com",
      phone: "0811-2233-4455",
      bankName: "Bank BRI",
      bankAccount: "33445566",
      bankOwner: "Ahmad",
      npwp: "08.990.112.3",
      nib: "8899001122",
      latitude: -6.102,
      longitude: 106.801
    },
    gallery: [
      "https://images.unsplash.com/photo-1534604973900-c41ab4c287ba?q=80&w=800",
      "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=800",
      "https://images.unsplash.com/photo-1544257121-72960a5e810a?q=80&w=800",
      "https://images.unsplash.com/photo-1559739247-c0e86311676d?q=80&w=800"
    ]
  },
  {
    id: "8",
    name: "Bayam Hijau Segar",
    category: "Sayuran",
    price: "Rp 3.500",
    unit: "ikat",
    stock: 120,
    rating: 4.9,
    reviews: 560,
    buyersCount: 1500,
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=800&auto=format&fit=crop",
    hetValue: 3000,
    isMarkup: true,
    markupPercent: 16,
    distance: 1.5,
    description: "Bayam hijau hidroponik yang bebas pestisida. Daun lebar, segar, dan mengandung banyak zat besi yang baik untuk perkembangan anak.",
    vendor: "Kebun Sayur Hidroponik Bogor",
    vendorInfo: {
      owner: "Siska Wijaya",
      address: "Sentul City, Bogor",
      email: "siska@kebunsegar.com",
      phone: "0812-4455-6677",
      bankName: "Bank BCA",
      bankAccount: "44556677",
      bankOwner: "Siska Wijaya",
      npwp: "09.001.223.4",
      nib: "9900112233",
      latitude: -6.581,
      longitude: 106.861
    },
    gallery: [
      "https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=800",
      "https://images.unsplash.com/photo-1510627489930-0c1b0ba0431f?q=80&w=800",
      "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=800",
      "https://images.unsplash.com/photo-1467019749480-4b7d7266d61d?q=80&w=800"
    ]
  },
  {
    id: "9",
    name: "Jeruk Sunkist Manis",
    category: "Buah",
    price: "Rp 45.000",
    unit: "kg",
    stock: 85,
    rating: 4.7,
    reviews: 120,
    buyersCount: 300,
    image: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=800&auto=format&fit=crop",
    hetValue: 45000,
    distance: 6.7,
    description: "Jeruk sunkist premium dengan bulir air melimpah dan rasa manis segar. Sumber Vitamin C harian terbaik untuk menjaga imun tubuh.",
    vendor: "Toko Buah Berkah Melimpah",
    vendorInfo: {
      owner: "Haji Rusli",
      address: "Pasar Jambu Dua Bogor",
      email: "rusli@buahberkah.com",
      phone: "0811-9900-1122",
      bankName: "Bank Muamalat",
      bankAccount: "1122334455",
      bankOwner: "Rusli",
      npwp: "10.112.334.5",
      nib: "11223344556",
      latitude: -6.574,
      longitude: 106.804
    },
    gallery: [
      "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=800",
      "https://images.unsplash.com/photo-1557800636-894a64c1696f?q=80&w=800",
      "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?q=80&w=800",
      "https://images.unsplash.com/photo-1603569283847-aa295f0d016a?q=80&w=800"
    ]
  },
  {
    id: "10",
    name: "Tahu Putih Sutra 10pcs",
    category: "Protein Nabati",
    price: "Rp 12.000",
    unit: "pax",
    stock: 150,
    rating: 4.8,
    reviews: 430,
    buyersCount: 920,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop",
    hetValue: 12000,
    distance: 2.1,
    description: "Tahu putih sutra dengan tekstur yang sangat lembut dan rasa yang murni. Tanpa pengawet kimia, diproduksi segar setiap hari.",
    vendor: "Pabrik Tahu Lestari",
    vendorInfo: {
      owner: "Bpk. Lestari",
      address: "Ciomas Indah No. 88",
      email: "lestari@pabriktahu.com",
      phone: "0813-2233-4455",
      bankName: "Bank BCA",
      bankAccount: "55443322",
      bankOwner: "Lestari",
      npwp: "11.223.445.6",
      nib: "22334455667",
      latitude: -6.615,
      longitude: 106.762
    },
    gallery: [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800",
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=800",
      "https://images.unsplash.com/photo-1493770348161-369560ae357d?q=80&w=800",
      "https://images.unsplash.com/photo-1473093226795-af9932fe5856?q=80&w=800"
    ]
  }
];
