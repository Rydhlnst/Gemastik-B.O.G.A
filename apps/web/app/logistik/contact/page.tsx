"use client";

import { AnimatedScene } from "@/components/ui/animatedbg";
import { Phone, MessageSquare, Mail, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function LogistikContact() {
  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="w-full h-[320px] relative overflow-hidden bg-surface border-b border-border">
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
            <h3 className="text-2xl font-semibold tracking-tight">Hubungi Dispatcher</h3>
            <p className="text-sm text-muted-foreground">
              Tim Dispatcher (Pengendali Jaringan) siap menerima laporan kritis 24/7. Hubungi kami secepatnya jika kondisi berisiko tinggi.
            </p>
            
            <div className="bg-surface rounded-[var(--radius-lg)] p-6 border border-border shadow-card">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-status-success-bg rounded-xl flex items-center justify-center border border-status-success/25">
                  <Phone className="w-5 h-5 text-status-success" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Hotline Darurat Armada</p>
                  <p className="text-lg font-semibold text-foreground">1-500-LOG-BOGA</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-status-info-bg rounded-xl flex items-center justify-center border border-status-info/25">
                  <MessageSquare className="w-5 h-5 text-status-info" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">WhatsApp Tim Rute</p>
                  <p className="text-lg font-semibold text-foreground">+62 811 2345 6789</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-surface-raised rounded-xl flex items-center justify-center border border-border">
                  <Mail className="w-5 h-5 text-role-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Email</p>
                  <p className="text-lg font-semibold text-foreground">LOGISITIK@gmail.com</p>
                </div>
              </div>
            </div>
            
            <div className="bg-status-warning-bg border border-status-warning/25 rounded-[var(--radius-lg)] p-5">
              <h4 className="text-sm font-semibold text-status-warning mb-1 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> SOP Keadaan Darurat
              </h4>
              <p className="text-xs text-status-warning leading-relaxed">
                Apabila terjadi ban bocor, kecelakaan, atau makanan tumpah, <strong>tekan tombol merah Darurat SOS di tablet armada</strong> terlebih dahulu sebelum menelepon hotline. Server akan otomatis mengunci lokasi armada Anda.
              </p>
            </div>
          </div>

          {/* Form Laporan */}
          <div className="bg-surface p-8 rounded-[var(--radius-xl)] border border-border shadow-card">
            <h3 className="text-xl font-semibold tracking-tight mb-6 border-b border-border pb-4">Formulir Laporan / Tiket Kendala</h3>
            
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-widest">Subjek / ID Rute</label>
                <Input type="text" placeholder="Misal: RUTE-AG-04 Mogok" className="h-11" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-widest">Kategori</label>
                  <select className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 text-sm text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/35">
                    <option>Kendaraan Bermasalah</option>
                    <option>Masalah Makanan/Porsi</option>
                    <option>Keterlambatan Ekstrim</option>
                    <option>Sistem GPS Mati</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-widest">Level Prioritas</label>
                  <select className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 text-sm text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/35">
                    <option>Sedang - Kuning</option>
                    <option>Tinggi - Oranye</option>
                    <option>Kritis - Merah</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-widest">Detail Laporan</label>
                <Textarea rows={4} placeholder="Jelaskan situasinya secara ringkas..." />
              </div>

              <Button className="w-full h-11 mt-4">
                Buat Tiket Laporan
              </Button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
