const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const rawData = [
  // KABUPATEN BANDUNG (AREA SELATAN & BOJONGSOANG)
  ['SCH-001', 'SPPG-JABAR-001', '20220001', 'SDN 1 Bojongsoang', 'SD', 'Jl. Terusan Buah Batu No. 10', 'Kabupaten Bandung', 'Bojongsoang', -6.973007, 107.630730, 450, 'Asep Suryana, S.Pd', '197001012000011001', '022-750001', 'VERIFIED'],
  ['SCH-002', 'SPPG-JABAR-001', '20220002', 'SMPN 1 Bojongsoang', 'SMP', 'Jl. Siliwangi No. 45', 'Kabupaten Bandung', 'Bojongsoang', -6.975102, 107.631500, 850, 'Budi Gunawan, M.Pd', '197203122005011002', '022-750002', 'VERIFIED'],
  ['SCH-003', 'SPPG-JABAR-001', '20220003', 'SMAN 1 Bojongsoang', 'SMA', 'Jl. Cikoneng', 'Kabupaten Bandung', 'Bojongsoang', -6.980201, 107.628900, 1100, 'Dra. Neni Marlina', '196807151995122001', '022-750003', 'VERIFIED'],
  ['SCH-004', 'SPPG-JABAR-001', '20220004', 'SDN 1 Dayeuhkolot', 'SD', 'Jl. Raya Dayeuhkolot', 'Kabupaten Bandung', 'Dayeuhkolot', -6.985550, 107.625500, 520, 'Kurniawan, S.Pd', '197501012010011005', '022-750004', 'VERIFIED'],
  ['SCH-005', 'SPPG-JABAR-001', '20220005', 'SMPN 1 Dayeuhkolot', 'SMP', 'Jl. Sukabirus', 'Kabupaten Bandung', 'Dayeuhkolot', -6.982300, 107.626800, 900, 'Hj. Siti Aisyah, M.Pd', '197108172002122003', '022-750005', 'VERIFIED'],
  ['SCH-006', 'SPPG-JABAR-001', '20220006', 'SDN 1 Baleendah', 'SD', 'Jl. Adipati Ukur', 'Kabupaten Bandung', 'Baleendah', -6.995400, 107.629100, 600, 'Tatang Surahman, S.Pd', '196502201988031002', '022-750006', 'VERIFIED'],
  ['SCH-007', 'SPPG-JABAR-001', '20220007', 'SMAN 1 Baleendah', 'SMA', 'Jl. R.A.A Wiranatakusumah', 'Kabupaten Bandung', 'Baleendah', -6.998100, 107.627500, 1300, 'Drs. Dedi Supriadi', '196909091996011001', '022-750007', 'VERIFIED'],
  ['SCH-008', 'SPPG-JABAR-001', '20220008', 'SDN 1 Ciparay', 'SD', 'Jl. Laswi Ciparay', 'Kabupaten Bandung', 'Ciparay', -7.035100, 107.701200, 480, 'Rini Astuti, S.Pd', '198005152008012003', '022-750008', 'VERIFIED'],
  ['SCH-009', 'SPPG-JABAR-001', '20220009', 'SMPN 1 Ciparay', 'SMP', 'Jl. Raya Pacet', 'Kabupaten Bandung', 'Ciparay', -7.038200, 107.705500, 1050, 'Agus Setiawan, M.Pd', '197703212003121004', '022-750009', 'VERIFIED'],
  ['SCH-010', 'SPPG-JABAR-001', '20220010', 'SMKN 1 Majalaya', 'SMK', 'Jl. Majalaya-Cicalengka', 'Kabupaten Bandung', 'Majalaya', -7.045500, 107.755000, 1500, 'Drs. Ridwan Kamil', '196811221994031002', '022-750010', 'VERIFIED'],

  // KOTA BANDUNG (PUSAT & UTARA)
  ['SCH-011', 'SPPG-JABAR-001', '20220011', 'SDN 001 Merdeka', 'SD', 'Jl. Merdeka No. 9', 'Kota Bandung', 'Sumur Bandung', -6.911200, 107.609500, 550, 'Dewi Lestari, S.Pd', '198201012006042001', '022-420011', 'VERIFIED'],
  ['SCH-012', 'SPPG-JABAR-001', '20220012', 'SMPN 2 Bandung', 'SMP', 'Jl. Sumatera No. 42', 'Kota Bandung', 'Sumur Bandung', -6.913500, 107.611200, 950, 'Drs. Yana Mulyana', '197012121998021001', '022-420012', 'VERIFIED'],
  ['SCH-013', 'SPPG-JABAR-001', '20220013', 'SMPN 5 Bandung', 'SMP', 'Jl. Sumatera No. 40', 'Kota Bandung', 'Sumur Bandung', -6.913800, 107.611500, 1000, 'Hj. Rina Marlina, M.Pd', '197304141999032002', '022-420013', 'VERIFIED'],
  ['SCH-014', 'SPPG-JABAR-001', '20220014', 'SMAN 3 Bandung', 'SMA', 'Jl. Belitung No. 8', 'Kota Bandung', 'Sumur Bandung', -6.909800, 107.614100, 1200, 'Drs. Iwan Setiawan', '196708171992031005', '022-420014', 'VERIFIED'],
  ['SCH-015', 'SPPG-JABAR-001', '20220015', 'SMAN 5 Bandung', 'SMA', 'Jl. Belitung No. 8', 'Kota Bandung', 'Sumur Bandung', -6.909900, 107.614200, 1250, 'Dra. Ani Suryani', '196605051991012001', '022-420015', 'VERIFIED'],
  ['SCH-016', 'SPPG-JABAR-001', '20220016', 'SMKN 1 Bandung', 'SMK', 'Jl. Wastukencana No. 3', 'Kota Bandung', 'Cicendo', -6.907500, 107.608100, 1600, 'Drs. Bambang Purwanto', '196502281990031003', '022-420016', 'VERIFIED'],
  ['SCH-017', 'SPPG-JABAR-001', '20220017', 'SLBN Cicendo', 'SLB', 'Jl. Cicendo No. 2', 'Kota Bandung', 'Cicendo', -6.910100, 107.604200, 250, 'Sri Mulyani, S.Pd', '197809152005012001', '022-420017', 'VERIFIED'],
  ['SCH-018', 'SPPG-JABAR-001', '20220018', 'SDN Ciumbuleuit 1', 'SD', 'Jl. Ciumbuleuit', 'Kota Bandung', 'Cidadap', -6.875100, 107.602500, 420, 'Yudi Hamzah, S.Pd', '198503122010011002', '022-200018', 'VERIFIED'],
  ['SCH-019', 'SPPG-JABAR-001', '20220019', 'SMPN 14 Bandung', 'SMP', 'Jl. Supratman', 'Kota Bandung', 'Cibeunying Kaler', -6.902500, 107.625500, 880, 'Drs. Hendra Gunawan', '197111221997021004', '022-720019', 'VERIFIED'],
  ['SCH-020', 'SPPG-JABAR-001', '20220020', 'SMAN 2 Bandung', 'SMA', 'Jl. Cihampelas No. 173', 'Kota Bandung', 'Coblong', -6.895100, 107.604500, 1150, 'Dra. Lilis Kusmiati', '196810101995122002', '022-200020', 'VERIFIED'],

  // KOTA BANDUNG (TIMUR & BARAT)
  ['SCH-021', 'SPPG-JABAR-001', '20220021', 'SDN Antapani 1', 'SD', 'Jl. Purwakarta', 'Kota Bandung', 'Antapani', -6.915500, 107.655100, 680, 'Ratna Sari, S.Pd', '198104212006042003', '022-720021', 'VERIFIED'],
  ['SCH-022', 'SPPG-JABAR-001', '20220022', 'SMPN 45 Bandung', 'SMP', 'Jl. Antapani', 'Kota Bandung', 'Antapani', -6.918100, 107.658200, 920, 'Drs. Ade Rohana', '197005151996011005', '022-720022', 'VERIFIED'],
  ['SCH-023', 'SPPG-JABAR-001', '20220023', 'SMAN 16 Bandung', 'SMA', 'Jl. Cikutra', 'Kota Bandung', 'Cibeunying Kidul', -6.901500, 107.635500, 1080, 'Drs. Wawan Ridwan', '196901011994031004', '022-720023', 'VERIFIED'],
  ['SCH-024', 'SPPG-JABAR-001', '20220024', 'SDN 035 Soka', 'SD', 'Jl. Soka No. 34', 'Kota Bandung', 'Sumur Bandung', -6.912500, 107.625100, 500, 'Maya Rosmayanti, S.Pd', '198402142010012001', '022-720024', 'VERIFIED'],
  ['SCH-025', 'SPPG-JABAR-001', '20220025', 'SMKN 4 Bandung', 'SMK', 'Jl. Kliningan No. 6', 'Kota Bandung', 'Lengkong', -6.935100, 107.622500, 1400, 'Drs. Herman Budi', '196508171991031006', '022-730025', 'VERIFIED'],
  ['SCH-026', 'SPPG-JABAR-001', '20220026', 'SMAN 22 Bandung', 'SMA', 'Jl. Rajamantri', 'Kota Bandung', 'Lengkong', -6.938500, 107.625500, 1120, 'Dra. Sri Hastuti', '196711101993022001', '022-730026', 'VERIFIED'],
  ['SCH-027', 'SPPG-JABAR-001', '20220027', 'SDN 1 Cibiru', 'SD', 'Jl. Raya Cibiru', 'Kota Bandung', 'Cibiru', -6.931500, 107.721500, 460, 'Dadan Ramdan, S.Pd', '198007222005011003', '022-780027', 'VERIFIED'],
  ['SCH-028', 'SPPG-JABAR-001', '20220028', 'SMPN 8 Bandung', 'SMP', 'Jl. Alun-Alun Utara', 'Kota Bandung', 'Regol', -6.921500, 107.605100, 890, 'Drs. Surya Saputra', '197204181999031002', '022-520028', 'VERIFIED'],
  ['SCH-029', 'SPPG-JABAR-001', '20220029', 'SMAN 8 Bandung', 'SMA', 'Jl. Solontongan', 'Kota Bandung', 'Lengkong', -6.937100, 107.618500, 1350, 'Dra. Erna Mulyana', '196803251994122003', '022-730029', 'VERIFIED'],
  ['SCH-030', 'SPPG-JABAR-001', '20220030', 'SMKN 6 Bandung', 'SMK', 'Jl. Soekarno Hatta', 'Kota Bandung', 'Gedebage', -6.945100, 107.685500, 1280, 'Drs. Iwan Kartiwan', '196601011992031005', '022-750030', 'VERIFIED'],

  // ZONA KABUPATEN BANDUNG (SOREANG, CIWIDEY, MARGAHAYU, PANGALENGAN)
  ['SCH-031', 'SPPG-JABAR-001', '20220031', 'SDN 1 Soreang', 'SD', 'Jl. Alun-Alun Soreang', 'Kabupaten Bandung', 'Soreang', -7.031500, 107.525100, 520, 'Drs. Asep Komara', '197501122001121004', '022-589031', 'VERIFIED'],
  ['SCH-032', 'SPPG-JABAR-001', '20220032', 'SMPN 1 Soreang', 'SMP', 'Jl. Raya Soreang-Banjaran', 'Kabupaten Bandung', 'Soreang', -7.035100, 107.530200, 1100, 'Hj. Neni Sumarni, M.Pd', '197103141996022001', '022-589032', 'VERIFIED'],
  ['SCH-033', 'SPPG-JABAR-001', '20220033', 'SMAN 1 Soreang', 'SMA', 'Jl. Raya Ciwidey', 'Kabupaten Bandung', 'Soreang', -7.038500, 107.521500, 1250, 'Drs. Yudi Permana', '196811201994031005', '022-589033', 'VERIFIED'],
  ['SCH-034', 'SPPG-JABAR-001', '20220034', 'SDN 1 Ciwidey', 'SD', 'Jl. Babakan Jampang', 'Kabupaten Bandung', 'Ciwidey', -7.100100, 107.460200, 480, 'Rina Marliana, S.Pd', '198005162008012002', '022-592034', 'VERIFIED'],
  ['SCH-035', 'SPPG-JABAR-001', '20220035', 'SMPN 1 Ciwidey', 'SMP', 'Jl. Kawah Putih', 'Kabupaten Bandung', 'Ciwidey', -7.105200, 107.458100, 950, 'Drs. Jajang Nurjaman', '197308171999031006', '022-592035', 'VERIFIED'],
  ['SCH-036', 'SPPG-JABAR-001', '20220036', 'SDN Angkasa', 'SD', 'Komplek Lanud Sulaiman', 'Kabupaten Bandung', 'Margahayu', -6.975500, 107.568200, 650, 'Letkol Wahyu Subiakto', '197602282000121002', '022-540036', 'VERIFIED'],
  ['SCH-037', 'SPPG-JABAR-001', '20220037', 'SMPN 1 Margahayu', 'SMP', 'Jl. Kopo Sayati', 'Kabupaten Bandung', 'Margahayu', -6.968100, 107.575500, 1050, 'H. Maman Abdurrahman', '196504211989011001', '022-540037', 'VERIFIED'],
  ['SCH-038', 'SPPG-JABAR-001', '20220038', 'SMAN 1 Margahayu', 'SMA', 'Jl. Kopo No. 399', 'Kabupaten Bandung', 'Margahayu', -6.965200, 107.576800, 1400, 'Dra. Sri Mulyati', '196809091993032004', '022-540038', 'VERIFIED'],
  ['SCH-039', 'SPPG-JABAR-001', '20220039', 'SDN 1 Pangalengan', 'SD', 'Jl. Raya Pangalengan', 'Kabupaten Bandung', 'Pangalengan', -7.195100, 107.560200, 420, 'Kusnadi, S.Pd', '198210102009011005', '022-597039', 'VERIFIED'],
  ['SCH-040', 'SPPG-JABAR-001', '20220040', 'SMPN 1 Pangalengan', 'SMP', 'Jl. Situ Cileunca', 'Kabupaten Bandung', 'Pangalengan', -7.198500, 107.558100, 880, 'Drs. Iwan Setiawan', '197412122002121003', '022-597040', 'VERIFIED'],
  ['SCH-041', 'SPPG-JABAR-001', '20220041', 'SDN 1 Margaasih', 'SD', 'Jl. Margaasih Tengah', 'Kabupaten Bandung', 'Margaasih', -6.945100, 107.555200, 580, 'Siti Aminah, S.Pd', '198501012010042006', '022-542041', 'VERIFIED'],
  ['SCH-042', 'SPPG-JABAR-001', '20220042', 'SMPN 1 Banjaran', 'SMP', 'Jl. Alun-Alun Banjaran', 'Kabupaten Bandung', 'Banjaran', -7.045200, 107.585100, 1150, 'Drs. Dadan Ramdani', '196907151995121002', '022-594042', 'VERIFIED'],
  ['SCH-043', 'SPPG-JABAR-001', '20220043', 'SMAN 1 Banjaran', 'SMA', 'Jl. Ciapus Banjaran', 'Kabupaten Bandung', 'Banjaran', -7.048500, 107.588200, 1300, 'Dra. Yeti Nurhayati', '196705051992032001', '022-594043', 'VERIFIED'],
  ['SCH-044', 'SPPG-JABAR-001', '20220044', 'SDN 1 Majalaya', 'SD', 'Jl. Alun-Alun Majalaya', 'Kabupaten Bandung', 'Majalaya', -7.045100, 107.755200, 600, 'Yusuf Maulana, S.Pd', '197902202005011003', '022-595044', 'VERIFIED'],
  ['SCH-045', 'SPPG-JABAR-001', '20220045', 'SMPN 1 Majalaya', 'SMP', 'Jl. Anyar Majalaya', 'Kabupaten Bandung', 'Majalaya', -7.048100, 107.758500, 1200, 'H. Ujang Suparman', '196608171989031005', '022-595045', 'VERIFIED'],

  // ZONA KOTA BANDUNG UTARA & BARAT (SUKAJADI, COBLONG, ASTANA ANYAR)
  ['SCH-046', 'SPPG-JABAR-001', '20220046', 'SDN Sukagalih', 'SD', 'Jl. Sukagalih', 'Kota Bandung', 'Sukajadi', -6.885100, 107.588200, 550, 'Euis Komalasari, S.Pd', '198304212008012004', '022-203046', 'VERIFIED'],
  ['SCH-047', 'SPPG-JABAR-001', '20220047', 'SMPN 15 Bandung', 'SMP', 'Jl. Setiabudi', 'Kota Bandung', 'Sukasari', -6.875200, 107.595100, 980, 'Drs. Rahmat Hidayat', '197211101998021002', '022-203047', 'VERIFIED'],
  ['SCH-048', 'SPPG-JABAR-001', '20220048', 'SMAN 15 Bandung', 'SMA', 'Jl. Sarimanis', 'Kota Bandung', 'Sukasari', -6.878500, 107.585200, 1100, 'Dra. Ai Nurlaila', '196901011995122003', '022-203048', 'VERIFIED'],
  ['SCH-049', 'SPPG-JABAR-001', '20220049', 'SDN Karanganyar', 'SD', 'Jl. Karanganyar', 'Kota Bandung', 'Astanaanyar', -6.925100, 107.598500, 480, 'Agus Rustandi, S.Pd', '198108172006041005', '022-423049', 'VERIFIED'],
  ['SCH-050', 'SPPG-JABAR-001', '20220050', 'SMPN 11 Bandung', 'SMP', 'Jl. Karanganyar', 'Kota Bandung', 'Astanaanyar', -6.928200, 107.595100, 850, 'H. Tb. Hasanuddin', '196502281988031004', '022-423050', 'VERIFIED'],
  ['SCH-051', 'SPPG-JABAR-001', '20220051', 'SMAN 6 Bandung', 'SMA', 'Jl. Pasirkaliki', 'Kota Bandung', 'Cicendo', -6.905100, 107.595200, 1350, 'Drs. Ade Rohana', '196810101994031001', '022-423051', 'VERIFIED'],
  ['SCH-052', 'SPPG-JABAR-001', '20220052', 'SDN Pajajaran', 'SD', 'Jl. Pajajaran', 'Kota Bandung', 'Cicendo', -6.908500, 107.588100, 620, 'Tuti Herawati, S.Pd', '198405152010012002', '022-423052', 'VERIFIED'],
  ['SCH-053', 'SPPG-JABAR-001', '20220053', 'SMPN 9 Bandung', 'SMP', 'Jl. Semar', 'Kota Bandung', 'Cicendo', -6.908200, 107.592100, 920, 'Drs. Dedi Supriadi', '197004211996011003', '022-423053', 'VERIFIED'],
  ['SCH-054', 'SPPG-JABAR-001', '20220054', 'SMKN 2 Bandung', 'SMK', 'Jl. Ciliwung', 'Kota Bandung', 'Bandung Wetan', -6.905200, 107.625100, 1500, 'Ir. Gunawan, M.T', '196708171992031005', '022-723054', 'VERIFIED'],
  ['SCH-055', 'SPPG-JABAR-001', '20220055', 'SDN Sabang', 'SD', 'Jl. Sabang', 'Kota Bandung', 'Bandung Wetan', -6.908100, 107.618500, 450, 'Leni Marlina, S.Pd', '198601012011012001', '022-723055', 'VERIFIED'],

  // ZONA KOTA BANDUNG TIMUR & SELATAN (UJUNGBERUNG, ARCAMANIK, BUAHBATU, KIARACONDONG)
  ['SCH-056', 'SPPG-JABAR-001', '20220056', 'SDN 1 Ujungberung', 'SD', 'Jl. Alun-Alun Ujungberung', 'Kota Bandung', 'Ujungberung', -6.915100, 107.705200, 580, 'Rahmat Hidayat, S.Pd', '197803122005011006', '022-780056', 'VERIFIED'],
  ['SCH-057', 'SPPG-JABAR-001', '20220057', 'SMPN 8 Ujungberung', 'SMP', 'Jl. A.H. Nasution', 'Kota Bandung', 'Ujungberung', -6.918500, 107.708100, 1050, 'Drs. Maman Suherman', '197109091998021003', '022-780057', 'VERIFIED'],
  ['SCH-058', 'SPPG-JABAR-001', '20220058', 'SMAN 24 Bandung', 'SMA', 'Jl. A.H. Nasution', 'Kota Bandung', 'Ujungberung', -6.921200, 107.715100, 1200, 'Dra. Hj. Yeni Suryani', '196905051995122004', '022-780058', 'VERIFIED'],
  ['SCH-059', 'SPPG-JABAR-001', '20220059', 'SDN Arcamanik', 'SD', 'Jl. Arcamanik Endah', 'Kota Bandung', 'Arcamanik', -6.918200, 107.668500, 610, 'Yanti Susanti, S.Pd', '198207152007012005', '022-720059', 'VERIFIED'],
  ['SCH-060', 'SPPG-JABAR-001', '20220060', 'SMPN 17 Bandung', 'SMP', 'Jl. Sindanglaya', 'Kota Bandung', 'Arcamanik', -6.912500, 107.675200, 940, 'Drs. Tatang Surahman', '197011221996031002', '022-720060', 'VERIFIED'],
  ['SCH-061', 'SPPG-JABAR-001', '20220061', 'SDN Kiaracondong', 'SD', 'Jl. Kiaracondong', 'Kota Bandung', 'Kiaracondong', -6.928500, 107.645100, 700, 'Agus Salim, S.Pd', '197908172004121003', '022-730061', 'VERIFIED'],
  ['SCH-062', 'SPPG-JABAR-001', '20220062', 'SMPN 37 Bandung', 'SMP', 'Jl. Babakan Sari', 'Kota Bandung', 'Kiaracondong', -6.925200, 107.648200, 1100, 'Drs. Iwan Kartiwan', '196802281993031005', '022-730062', 'VERIFIED'],
  ['SCH-063', 'SPPG-JABAR-001', '20220063', 'SMAN 12 Bandung', 'SMA', 'Jl. Sekejati', 'Kota Bandung', 'Kiaracondong', -6.931500, 107.641500, 1250, 'Dra. Sri Hartati', '196710101992032001', '022-730063', 'VERIFIED'],
  ['SCH-064', 'SPPG-JABAR-001', '20220064', 'SDN Margahayu Raya', 'SD', 'Komplek Margahayu Raya', 'Kota Bandung', 'Buahbatu', -6.945100, 107.655200, 680, 'Eko Purwanto, S.Pd', '198503122010011004', '022-756064', 'VERIFIED'],
  ['SCH-065', 'SPPG-JABAR-001', '20220065', 'SMPN 48 Bandung', 'SMP', 'Jl. Margacinta', 'Kota Bandung', 'Buahbatu', -6.948200, 107.658100, 960, 'H. Rudi Hartono, M.Pd', '197204211998021006', '022-756065', 'VERIFIED'],
  ['SCH-066', 'SPPG-JABAR-001', '20220066', 'SMAN 21 Bandung', 'SMA', 'Jl. Manjahlega', 'Kota Bandung', 'Rancasari', -6.951500, 107.665100, 1180, 'Drs. Bambang Sudarmanto', '196901011994121002', '022-756066', 'VERIFIED'],
  ['SCH-067', 'SPPG-JABAR-001', '20220067', 'SDN Gedebage', 'SD', 'Jl. Gedebage Selatan', 'Kota Bandung', 'Gedebage', -6.955200, 107.685100, 450, 'Neni Suryani, S.Pd', '198111102008012003', '022-780067', 'VERIFIED'],
  ['SCH-068', 'SPPG-JABAR-001', '20220068', 'SMPN 54 Bandung', 'SMP', 'Jl. Gedebage', 'Kota Bandung', 'Gedebage', -6.958100, 107.688200, 820, 'Drs. Asep Gunawan', '197405152000031005', '022-780068', 'VERIFIED'],
  ['SCH-069', 'SPPG-JABAR-001', '20220069', 'SMKN 7 Bandung', 'SMK', 'Jl. Soekarno Hatta No. 596', 'Kota Bandung', 'Buahbatu', -6.941500, 107.645200, 1600, 'Drs. Hendra Permana', '196608171991031002', '022-756069', 'VERIFIED'],
  ['SCH-070', 'SPPG-JABAR-001', '20220070', 'SLB C YPLB', 'SLB', 'Jl. Cipaganti', 'Kota Bandung', 'Coblong', -6.895200, 107.601500, 180, 'Dra. Yulia Rahman', '197502282002122001', '022-203070', 'VERIFIED'],

  // ZONA CAMPURAN (PANDUAN PEMETAAN)
  ['SCH-071', 'SPPG-JABAR-001', '20220071', 'SDN Pasir Luyu', 'SD', 'Jl. Pasir Luyu', 'Kota Bandung', 'Regol', -6.938200, 107.608100, 510, 'Wawan Setiawan, S.Pd', '198305052009011003', '022-520071', 'VERIFIED'],
  ['SCH-072', 'SPPG-JABAR-001', '20220072', 'SMPN 10 Bandung', 'SMP', 'Jl. Srimahi', 'Kota Bandung', 'Regol', -6.935100, 107.611500, 910, 'Drs. Dadan Ramdan', '197010101997021004', '022-520072', 'VERIFIED'],
  ['SCH-073', 'SPPG-JABAR-001', '20220073', 'SMAN 11 Bandung', 'SMA', 'Jl. Kembar Baru', 'Kota Bandung', 'Regol', -6.941500, 107.615200, 1220, 'Dra. Hj. Euis Komala', '196803121993032002', '022-520073', 'VERIFIED'],
  ['SCH-074', 'SPPG-JABAR-001', '20220074', 'SDN Cibaduyut', 'SD', 'Jl. Cibaduyut Raya', 'Kota Bandung', 'Bojongloa Kidul', -6.948500, 107.595100, 750, 'Agus Salim, S.Pd', '198008172005011005', '022-540074', 'VERIFIED'],
  ['SCH-075', 'SPPG-JABAR-001', '20220075', 'SMPN 38 Bandung', 'SMP', 'Jl. Cibaduyut Lama', 'Kota Bandung', 'Bojongloa Kidul', -6.945200, 107.591500, 1080, 'Drs. Yudi Hamzah', '197301011999031006', '022-540075', 'VERIFIED'],
  ['SCH-076', 'SPPG-JABAR-001', '20220076', 'SMAN 17 Bandung', 'SMA', 'Jl. Caringin', 'Kota Bandung', 'Babakan Ciparay', -6.931500, 107.581500, 1310, 'Dra. Rini Astuti', '196711201994122001', '022-601076', 'VERIFIED'],
  ['SCH-077', 'SPPG-JABAR-001', '20220077', 'SDN Caringin', 'SD', 'Jl. Caringin Gang Lumbung', 'Kota Bandung', 'Babakan Ciparay', -6.935100, 107.585200, 620, 'Siti Nurhaliza, S.Pd', '198504212011012003', '022-601077', 'VERIFIED'],
  ['SCH-078', 'SPPG-JABAR-001', '20220078', 'SMPN 31 Bandung', 'SMP', 'Jl. Binong Jati', 'Kota Bandung', 'Batununggal', -6.925100, 107.635200, 890, 'Drs. Ujang Surahman', '197105151998021004', '022-730078', 'VERIFIED'],
  ['SCH-079', 'SPPG-JABAR-001', '20220079', 'SMKN 11 Bandung', 'SMK', 'Jl. Budi', 'Kota Bandung', 'Cicendo', -6.895100, 107.565100, 1450, 'Ir. Budi Gunawan', '196602281992031002', '022-601079', 'VERIFIED'],
  ['SCH-080', 'SPPG-JABAR-001', '20220080', 'SDN Pasir Kaliki', 'SD', 'Jl. Pasir Kaliki', 'Kota Bandung', 'Cicendo', -6.901500, 107.598200, 540, 'Rina Marlina, S.Pd', '198212122007012006', '022-423080', 'VERIFIED']
];

// Generate SQL INSERT statements
let sqlStatements = "DELETE FROM Sekolah;\n"; // Clear existing just in case

let counterKota = 1;
let counterKabupaten = 1;

rawData.forEach((row) => {
  const [
    _oldId, sppgRegionId, npsn, nama, tingkat, alamat, kota, kecamatan,
    lat, lng, jumlahSiswa, namaKepsek, nipKepsek, telepon, status
  ] = row;

  let newId = "";
  if (kota === "Kota Bandung") {
    newId = `ACC-SKL-3273${String(counterKota).padStart(4, '0')}`;
    counterKota++;
  } else if (kota === "Kabupaten Bandung") {
    newId = `ACC-SKL-3204${String(counterKabupaten).padStart(4, '0')}`;
    counterKabupaten++;
  } else {
    newId = `ACC-SKL-3299${String(Date.now()).slice(-4)}`; // Fallback
  }

  const safeNama = nama.replace(/'/g, "''");
  const safeAlamat = alamat.replace(/'/g, "''");
  const safeKepsek = namaKepsek.replace(/'/g, "''");

  sqlStatements += `INSERT INTO Sekolah (id, sppg_region_id, npsn, nama, tingkat, alamat, kota, kecamatan, latitude, longitude, jumlah_siswa, nama_kepsek, nip_kepsek, telepon, status) VALUES ('${newId}', '${sppgRegionId}', '${npsn}', '${safeNama}', '${tingkat}', '${safeAlamat}', '${kota}', '${kecamatan}', ${lat}, ${lng}, ${jumlahSiswa}, '${safeKepsek}', '${nipKepsek}', '${telepon}', '${status}');\n`;
});

const sqlFilePath = path.join(__dirname, "insert_sekolah.sql");
fs.writeFileSync(sqlFilePath, sqlStatements);

console.log("SQL file generated at:", sqlFilePath);

// Execute Wrangler Command
try {
  console.log("Executing Wrangler command to seed database (REMOTE)...");
  const stdout = execSync("npx wrangler d1 execute boga_db_production --remote --file=src/scripts/insert_sekolah.sql", {
    cwd: path.join(__dirname, "../.."), // Should be the apps/api directory
    encoding: "utf-8",
  });
  console.log("Seeding Success:\n", stdout);
} catch (error) {
  console.error("Seeding Failed:\n", error.stdout || error.message);
}
