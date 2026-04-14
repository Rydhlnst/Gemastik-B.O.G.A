"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings, User, Bell, Shield, Sliders,
  Eye, EyeOff, Save, CheckCircle2, Monitor,
  Mail, Smartphone, LogIn, Clock, AlertTriangle
} from "lucide-react";

// ─── Threshold Slider ────────────────────────────────────────────────────────

function ThresholdSlider({
  label, value, min, max, unit, description, onChange, color = "indigo",
}: {
  label: string; value: number; min: number; max: number;
  unit: string; description: string; onChange: (v: number) => void; color?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const trackColor = color === "red" ? "#ef4444" : color === "amber" ? "#f59e0b" : "#6366f1";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black text-gray-800">{label}</p>
          <p className="text-[9px] text-gray-400 font-medium mt-0.5">{description}</p>
        </div>
        <div className="text-right">
          <span className="text-lg font-black tabular-nums" style={{ color: trackColor }}>{value}</span>
          <span className="text-[9px] font-bold text-gray-400 ml-1">{unit}</span>
        </div>
      </div>
      <div className="relative h-2 bg-gray-100 rounded-full">
        <div
          className="absolute h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: trackColor }}
        />
        <input
          type="range" min={min} max={max} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 shadow-md transition-all"
          style={{ left: `calc(${pct}% - 8px)`, borderColor: trackColor }}
        />
      </div>
      <div className="flex justify-between text-[7px] font-black text-gray-300 uppercase tracking-wider">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-all ${checked ? "bg-indigo-500" : "bg-gray-200"}`}
    >
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${checked ? "left-5" : "left-0.5"}`} />
    </button>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({ title, description, icon, children }: {
  title: string; description: string; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-sm">
          {icon}
        </div>
        <div>
          <h2 className="text-sm font-black text-gray-900">{title}</h2>
          <p className="text-[9px] font-medium text-gray-400">{description}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Login Log Mock ──────────────────────────────────────────────────────────

const LOGIN_LOG = [
  { waktu: "13 Apr 2025, 07:22 WIB", device: "Chrome · Windows · Bandung", current: true },
  { waktu: "12 Apr 2025, 08:05 WIB", device: "Safari · macOS · Jakarta", current: false },
  { waktu: "11 Apr 2025, 07:50 WIB", device: "Chrome · Windows · Bandung", current: false },
];

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [saved, setSaved] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  // Profil
  const [nama, setNama] = useState("Renaldy Fauzan");
  const [jabatan, setJabatan] = useState("Kepala Bagian Pengadaan");
  const [instansi, setInstansi] = useState("BGN Jawa Barat");

  // Notifikasi toggles
  const [notifPref, setNotifPref] = useState({
    pengajuan: true, sengketa: true, keuangan: true, logistik: false, sistem: false,
  });
  const [channel, setChannel] = useState<"app" | "email" | "keduanya">("app");

  // Thresholds
  const [onTimeThreshold, setOnTimeThreshold] = useState(95);
  const [hetMarkupThreshold, setHetMarkupThreshold] = useState(15);
  const [driverIdleThreshold, setDriverIdleThreshold] = useState(30);

  const handleSave = (section: string) => {
    setSaved(section);
    setTimeout(() => setSaved(null), 2500);
  };

  const SaveButton = ({ section }: { section: string }) => (
    <motion.button
      onClick={() => handleSave(section)}
      whileTap={{ scale: 0.97 }}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
        saved === section
          ? "bg-emerald-500 text-white"
          : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
      }`}
    >
      {saved === section ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
      {saved === section ? "Tersimpan!" : "Simpan"}
    </motion.button>
  );

  return (
    <div className="p-6 space-y-5 min-h-full bg-slate-50/50 max-w-3xl">

      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-slate-600 to-slate-800">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Pengaturan</h1>
          <p className="text-xs text-gray-400">Konfigurasi profil, notifikasi, threshold, dan keamanan akun</p>
        </div>
      </div>

      {/* ── Seksi 1: Profil & Akun ── */}
      <SectionCard title="Profil & Akun" description="Informasi identitas dan kredensial" icon={<User className="w-4 h-4" />}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Nama Lengkap", value: nama, onChange: setNama },
              { label: "Jabatan", value: jabatan, onChange: setJabatan },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{f.label}</label>
                <input
                  value={f.value}
                  onChange={e => f.onChange(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Instansi / Lembaga</label>
            <input
              value={instansi}
              onChange={e => setInstansi(e.target.value)}
              className="w-full px-4 py-2.5 text-xs font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none"
            />
          </div>
          <div>
            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Ganti Password</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Masukkan password baru..."
                className="w-full px-4 py-2.5 pr-10 text-xs font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none"
              />
              <button
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <SaveButton section="profil" />
          </div>
        </div>
      </SectionCard>

      {/* ── Seksi 2: Preferensi Notifikasi ── */}
      <SectionCard title="Preferensi Notifikasi" description="Pilih kategori dan channel notifikasi yang ingin diterima" icon={<Bell className="w-4 h-4" />}>
        <div className="space-y-5">
          {/* Category Toggles */}
          <div className="space-y-3">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Kategori Aktif</p>
            {([
              { key: "pengajuan", label: "Pengajuan SBT", desc: "Status persetujuan dan penolakan vendor" },
              { key: "sengketa", label: "Sengketa & Arbitrase", desc: "Kasus baru dan batas waktu BGN" },
              { key: "keuangan", label: "Keuangan", desc: "Refund, pencairan, dan transaksi" },
              { key: "logistik", label: "Logistik", desc: "Keterlambatan pengiriman dan anomali armada" },
              { key: "sistem", label: "Sistem", desc: "Pembaruan HET dan laporan otomatis" },
            ] as const).map(item => (
              <div key={item.key} className="flex items-center justify-between py-2.5 px-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="text-xs font-black text-gray-800">{item.label}</p>
                  <p className="text-[8px] text-gray-400 font-medium">{item.desc}</p>
                </div>
                <Toggle
                  checked={notifPref[item.key]}
                  onChange={v => setNotifPref(prev => ({ ...prev, [item.key]: v }))}
                />
              </div>
            ))}
          </div>

          {/* Channel */}
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Channel Pengiriman</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { key: "app", label: "In-App", icon: <Monitor className="w-4 h-4" /> },
                { key: "email", label: "Email", icon: <Mail className="w-4 h-4" /> },
                { key: "keduanya", label: "Keduanya", icon: <Smartphone className="w-4 h-4" /> },
              ] as const).map(c => (
                <button
                  key={c.key}
                  onClick={() => setChannel(c.key)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all ${
                    channel === c.key ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-100 text-gray-400 hover:border-gray-200"
                  }`}
                >
                  {c.icon}
                  <span className="text-[9px] font-black uppercase">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <SaveButton section="notifikasi" />
          </div>
        </div>
      </SectionCard>

      {/* ── Seksi 3: Threshold ── */}
      <SectionCard title="Ambang Batas Sistem" description="Nilai threshold yang mengontrol perilaku alert dan gateway di seluruh dashboard" icon={<Sliders className="w-4 h-4" />}>
        <div className="space-y-6">
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
            <p className="text-[9px] font-bold text-indigo-700">
              Perubahan nilai ini langsung mempengaruhi kapan alert muncul, kapan gateway kondisional aktif, dan kapan anomali terflag di peta.
            </p>
          </div>

          <ThresholdSlider
            label="Batas On-Time Rate"
            description="Alert muncul & tombol gateway ke Verifikasi aktif jika On-Time Rate turun di bawah nilai ini"
            value={onTimeThreshold}
            min={80}
            max={100}
            unit="%"
            onChange={setOnTimeThreshold}
            color="indigo"
          />

          <div className="border-t border-gray-100" />

          <ThresholdSlider
            label="Batas Mark-up HET"
            description="Vendor otomatis diblokir jika harga yang ditawarkan melebihi HET sebesar nilai ini"
            value={hetMarkupThreshold}
            min={5}
            max={50}
            unit="%"
            onChange={setHetMarkupThreshold}
            color="amber"
          />

          <div className="border-t border-gray-100" />

          <ThresholdSlider
            label="Durasi Diam Supir"
            description="Supir yang tidak bergerak melebihi durasi ini akan otomatis diflag sebagai anomali di peta pengawasan"
            value={driverIdleThreshold}
            min={10}
            max={120}
            unit=" mnt"
            onChange={setDriverIdleThreshold}
            color="red"
          />

          <div className="flex justify-end pt-2">
            <SaveButton section="threshold" />
          </div>
        </div>
      </SectionCard>

      {/* ── Seksi 4: Keamanan ── */}
      <SectionCard title="Keamanan & Sesi" description="Log aktivitas login dan sesi aktif" icon={<Shield className="w-4 h-4" />}>
        <div className="space-y-4">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Log Aktivitas Login</p>
          <div className="divide-y divide-gray-50">
            {LOGIN_LOG.map((log, i) => (
              <div key={i} className={`flex items-center justify-between py-3 ${i === 0 ? "pb-3" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${log.current ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-400"}`}>
                    <LogIn className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-700">{log.device}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5 text-gray-300" />
                      <span className="text-[8px] text-gray-400 font-medium">{log.waktu}</span>
                    </div>
                  </div>
                </div>
                {log.current && (
                  <span className="text-[8px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                    Sesi Ini
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
