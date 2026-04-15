"use client";

import { AnimatedScene } from "@/components/ui/animatedbg";
import { Phone, MessageSquare, Mail, AlertTriangle } from "lucide-react";

export default function LogistikContact() {
  return (
    <div className="w-full min-h-screen bg-[#f8fafc] font-sans">
      {/* Hero Section */}
      <div className="w-full h-[320px] relative overflow-hidden bg-white border-b" style={{borderColor: 'rgba(44,110,73,0.12)'}}>
        <div className="absolute inset-0 opacity-40"><AnimatedScene /></div>
        <div className="absolute inset-0 logistik-hero-gradient" />
        
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-32 pb-12 flex flex-col justify-end h-full text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full animate-pulse bg-white/80" />
            <span className="text-xs font-bold tracking-widest uppercase text-white/90">
              Pusat Kendali Respon Cepat
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Pusat Bantuan Logistik
          </h1>
          <p className="text-sm text-white/70 mt-4 max-w-2xl mx-auto">
            Hadapi kendala rute, penjadwalan, atau teknis armada? Laporkan masalah Anda secara _real-time_ kepada operator pusat kami untuk mendapatkan penyelesaian tercepat.
          </p>
        </div>
      </div>

      {/* Konten Utama */}
      <div className="w-full max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Card Info */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800">Hubungi Dispatcher</h3>
            <p className="text-sm text-gray-600">
              Tim Dispatcher (Pengendali Jaringan) siap menerima laporan kritis 24/7. Hubungi kami secepatnya jika kondisi berisiko tinggi.
            </p>
            
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[#eaf4ee] rounded-xl flex items-center justify-center">
                  <Phone className="w-5 h-5" style={{color: '#2c6e49'}} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hotline Darurat Armada</p>
                  <p className="text-lg font-bold text-gray-800">1-500-LOG-BOGA</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">WhatsApp Tim Rute</p>
                  <p className="text-lg font-bold text-gray-800">+62 811 2345 6789</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">HUBUNGAN GMAIL</p>
                  <p className="text-lg font-bold text-gray-800">LOGISITIK@gmail.com</p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
              <h4 className="text-sm font-bold text-orange-800 mb-1 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> SOP Keadaan Darurat
              </h4>
              <p className="text-xs text-orange-700 leading-relaxed">
                Apabila terjadi ban bocor, kecelakaan, atau makanan tumpah, <strong>tekan tombol merah Darurat SOS di tablet armada</strong> terlebih dahulu sebelum menelepon hotline. Server akan otomatis mengunci lokasi armada Anda.
              </p>
            </div>
          </div>

          {/* Form Laporan */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Formulir Laporan / Tiket Kendala</h3>
            
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Subjek / ID Rute</label>
                <input 
                  type="text" 
                  placeholder="Misal: RUTE-AG-04 Mogok" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#2c6e49] focus:ring-1 focus:ring-[#2c6e49]/50 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Kategori</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#2c6e49] focus:ring-1 focus:ring-[#2c6e49]/50 text-sm text-gray-600 bg-white">
                    <option>Kendaraan Bermasalah</option>
                    <option>Masalah Makanan/Porsi</option>
                    <option>Keterlambatan Ekstrim</option>
                    <option>Sistem GPS Mati</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Level Prioritas</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#2c6e49] focus:ring-1 focus:ring-[#2c6e49]/50 text-sm text-gray-600 bg-white">
                    <option>Sedang - Kuning</option>
                    <option>Tinggi - Oranye</option>
                    <option>Kritis - Merah</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Detail Laporan</label>
                <textarea 
                  rows={4}
                  placeholder="Jelaskan situasinya secara ringkas..." 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#2c6e49] focus:ring-1 focus:ring-[#2c6e49]/50 text-sm"
                ></textarea>
              </div>

              <button className="w-full py-3.5 rounded-xl text-white font-bold text-sm logistik-gradient hover:opacity-90 transition-all shadow-md mt-4">
                Buat Tiket Laporan
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
