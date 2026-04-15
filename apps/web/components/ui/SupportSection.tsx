"use client";

import { Phone, MessageSquare, Mail, AlertTriangle, Send } from "lucide-react";

export function SupportSection() {
  return (
    <div className="module-reveal pt-4 space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Pusat Bantuan & Kendala
        </h2>
        <p className="text-xs text-slate-500 font-medium italic tracking-[0.05em]">Laporan cepat untuk kegagalan rute atau teknis armada</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Info */}
        <div className="space-y-6">
          <div className="bg-white/45 backdrop-blur-[40px] rounded-[32px] p-8 border border-white/60 border-t-white/80 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.25)]">
            <h3 className="text-lg font-black text-slate-900 mb-8 tracking-tight">Hubungi Dispatcher</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-5 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 hover:border-white/40 transition-all group cursor-pointer shadow-sm">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/10 group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Hotline Darurat</p>
                  <p className="text-base font-black text-slate-900">1-500-LOG-BOGA</p>
                </div>
              </div>

              <div className="flex items-center gap-5 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 hover:border-white/40 transition-all group cursor-pointer shadow-sm">
                <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center border border-sky-500/10 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6 text-sky-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">WhatsApp Ops</p>
                  <p className="text-base font-black text-slate-900">+62 811 2345 6789</p>
                </div>
              </div>

              <div className="flex items-center gap-5 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 hover:border-white/40 transition-all group cursor-pointer shadow-sm">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/10 group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Email Support</p>
                  <p className="text-base font-black text-slate-900">logistik@boga.id</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-500/10 backdrop-blur-[40px] border border-white/60 border-t-white/80 rounded-[32px] p-8 relative overflow-hidden group shadow-[0_40px_80px_-20px_rgba(0,0,0,0.25)]">
             <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-transform">
                <AlertTriangle className="w-16 h-16 text-orange-600" />
             </div>
             <h4 className="text-[10px] font-black text-orange-600 mb-3 flex items-center gap-2 uppercase tracking-[0.2em]">
               <AlertTriangle className="w-4 h-4" /> SOP Kondisi Kritis
             </h4>
             <p className="text-xs text-slate-600 leading-relaxed font-bold">
                Untuk kendala <span className="text-orange-600/80">kecelakaan (accident)</span> atau <span className="text-orange-600/80">kebocoran muatan</span>, gunakan tombol SOS pada tablet armada terlebih dahulu. Koordinat GPS Anda akan langsung terkunci ke layar pusat bantuan (Dispatcher).
             </p>
          </div>
        </div>

        {/* Report Form */}
        <div className="bg-white/45 backdrop-blur-[40px] p-10 rounded-[32px] border border-white/60 border-t-white/80 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.25)]">
          <h3 className="text-lg font-black text-slate-900 mb-8 tracking-tight">Buat Tiket Laporan</h3>
          
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Judul Kendala / ID Rute</label>
              <input 
                type="text" 
                placeholder="Contoh: RUTE-AG-04 Terkendala Macet" 
                className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500/30 transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300 shadow-inner"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Kategori</label>
                <select className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500/30 transition-all text-sm font-bold text-slate-900 appearance-none cursor-pointer shadow-inner">
                  <option className="bg-white">Kendaraan Bermasalah</option>
                  <option className="bg-white">Masalah Makanan/Porsi</option>
                  <option className="bg-white">Keterlambatan Ekstrim</option>
                  <option className="bg-white">Sistem GPS Mati</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Prioritas</label>
                <select className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500/30 transition-all text-sm font-bold text-slate-900 appearance-none cursor-pointer shadow-inner">
                  <option className="bg-white">Normal - Biru</option>
                  <option className="bg-white">Tinggi - Kuning</option>
                  <option className="bg-white">Kritis - Merah</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Detail Laporan</label>
              <textarea 
                rows={4}
                placeholder="Berikan keterangan singkat namun padat..." 
                className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500/30 transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300 shadow-inner"
              ></textarea>
            </div>

            <button className="w-full py-5 rounded-2xl text-white font-black text-xs uppercase tracking-[0.2em] bg-emerald-500/80 hover:bg-emerald-500 transition-all shadow-xl shadow-black/40 flex items-center justify-center gap-3 mt-4 group">
              Kirim Tiket Laporan <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
