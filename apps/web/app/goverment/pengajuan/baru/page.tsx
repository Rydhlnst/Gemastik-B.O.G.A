"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, ChevronRight, Building2, User, FileText,
  Eye, Upload, X, ArrowLeft, Loader2, BadgeCheck, MapPin
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────

type EntitasType = "vendor" | "sppg" | null;

interface FormData {
  tipe: EntitasType;
  nama: string;
  npwp: string;
  nik: string;
  alamat: string;
  wilayah: string;
  kota: string;
  kontak: string;
  email: string;
  telepon: string;
  dokumen: { nama: string; tipe: string; size: string }[];
}

const EMPTY_FORM: FormData = {
  tipe: null,
  nama: "", npwp: "", nik: "",
  alamat: "", wilayah: "", kota: "",
  kontak: "", email: "", telepon: "",
  dokumen: [],
};

const DRAFT_KEY = "boga_pengajuan_draft";

const STEPS = [
  { label: "Tipe Entitas", icon: Building2 },
  { label: "Data Identitas", icon: User },
  { label: "Dokumen", icon: FileText },
  { label: "Review & Konfirmasi", icon: Eye },
];

const WILAYAH_OPTIONS = [
  "Bandung Utara", "Bandung Selatan", "Bandung Barat", "Bandung Timur",
  "Bandung Tengah", "Cimahi", "Lembang", "Padalarang", "Soreang",
];

// ─── Input Component ─────────────────────────────────────────────────────────

function FormInput({
  label, value, onChange, placeholder, required, type = "text", error,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; type?: string; error?: string;
}) {
  return (
    <div>
      <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 text-xs font-medium text-gray-800 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all ${
          error ? "border-red-300 bg-red-50" : value ? "border-emerald-300 bg-emerald-50/30" : "border-gray-200"
        }`}
      />
      {error && <p className="text-[9px] text-red-500 font-bold mt-1">{error}</p>}
    </div>
  );
}

// ─── Step Progress Bar ────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const Icon = step.icon;
        return (
          <div key={i} className="flex items-center">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
              done ? "text-emerald-600" : active ? "text-indigo-600 bg-indigo-50" : "text-gray-300"
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white flex-shrink-0 ${
                done ? "bg-emerald-500" : active ? "bg-indigo-500" : "bg-gray-200"
              }`}>
                {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3 h-3" />}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-wider hidden sm:block ${done ? "text-emerald-600" : active ? "text-indigo-600" : "text-gray-300"}`}>
                {step.label}
              </span>
            </div>
            {i < total - 1 && (
              <div className={`w-6 h-0.5 mx-1 rounded-full ${i < current ? "bg-emerald-400" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Mock doc upload ─────────────────────────────────────────────────────────

const REQUIRED_DOCS = [
  { key: "npwp_doc", label: "Dokumen NPWP", required: true },
  { key: "akta", label: "Akta Pendirian Perusahaan", required: true },
  { key: "halal", label: "Sertifikat Halal MUI", required: false },
  { key: "bpom", label: "Sertifikat BPOM", required: false },
  { key: "iso", label: "Sertifikat ISO (opsional)", required: false },
];

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function PengajuanBaruPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // Auto-save draft
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try { setForm(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
  }, [form]);

  const update = useCallback((key: keyof FormData, val: any) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => { const e = { ...prev }; delete e[key as string]; return e; });
  }, []);

  const validateStep1 = () => form.tipe !== null;

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.nama.trim()) e.nama = "Nama wajib diisi";
    if (!form.npwp.trim()) e.npwp = "NPWP wajib diisi";
    if (!form.alamat.trim()) e.alamat = "Alamat wajib diisi";
    if (!form.wilayah) e.wilayah = "Pilih wilayah cakupan";
    if (!form.kontak.trim()) e.kontak = "Nama kontak PIC wajib diisi";
    if (!form.email.trim()) e.email = "Email wajib diisi";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const requiredDocs = REQUIRED_DOCS.filter(d => d.required);
    return requiredDocs.every(d => uploadedDocs[d.key]);
  };

  const handleNext = () => {
    if (step === 0 && !validateStep1()) return;
    if (step === 1 && !validateStep2()) return;
    if (step === 2 && !validateStep3()) return;
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 2200));
    setSubmitting(false);
    setDone(true);
    localStorage.removeItem(DRAFT_KEY);
    setTimeout(() => router.push("/goverment/pengajuan"), 2500);
  };

  const allStep2Filled = form.nama && form.npwp && form.alamat && form.wilayah && form.kontak && form.email;
  const allRequiredDocs = REQUIRED_DOCS.filter(d => d.required).every(d => uploadedDocs[d.key]);

  const canNext = [
    form.tipe !== null,
    !!allStep2Filled,
    allRequiredDocs,
    true, // review step, no validation needed
  ][step];

  // ── Success Screen ──
  if (done) {
    return (
      <div className="p-6 min-h-full bg-slate-50/50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 max-w-sm"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <BadgeCheck className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-xl font-black text-gray-900">Pengajuan Berhasil Dikirim!</h2>
          <p className="text-sm text-gray-500">
            {form.tipe === "vendor" ? "Vendor" : "SPPG"} <strong>{form.nama}</strong> telah masuk ke antrian verifikasi.
          </p>
          <p className="text-[10px] text-gray-400">Mengarahkan ke daftar pengajuan...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 min-h-full bg-slate-50/50">

      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
        <button
          onClick={() => step > 0 ? setStep(s => s - 1) : router.back()}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Pengajuan Baru</h1>
          <p className="text-xs text-gray-400">Daftarkan Vendor atau SPPG secara manual</p>
        </div>
        {form.nama && (
          <span className="ml-auto text-[8px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
            Draft tersimpan otomatis
          </span>
        )}
      </div>

      {/* Progress */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 overflow-x-auto">
        <StepIndicator current={step} total={STEPS.length} />
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >

          {/* ── Step 0: Tipe Entitas ── */}
          {step === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <h2 className="text-base font-black text-gray-900 mb-2">Pilih Tipe Entitas</h2>
              <p className="text-xs text-gray-400 mb-6">Tentukan jenis entitas yang akan didaftarkan ke sistem B.O.G.A</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                {([
                  {
                    key: "vendor", label: "Vendor",
                    desc: "Penyedia layanan katering, logistik, atau supplier bahan makanan",
                    icon: <Building2 className="w-8 h-8" />,
                    color: "indigo",
                  },
                  {
                    key: "sppg", label: "SPPG",
                    desc: "Satuan Pelayanan Pangan dan Gizi — unit distribusi pemerintah",
                    icon: <MapPin className="w-8 h-8" />,
                    color: "cyan",
                  },
                ] as const).map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => update("tipe", opt.key)}
                    className={`flex flex-col items-start gap-3 p-5 rounded-2xl border-2 transition-all text-left ${
                      form.tipe === opt.key
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-100 hover:border-gray-200 bg-gray-50/50"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${form.tipe === opt.key ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-400"}`}>
                      {opt.icon}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900">{opt.label}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{opt.desc}</p>
                    </div>
                    {form.tipe === opt.key && (
                      <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center self-end mt-auto">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 1: Data Identitas ── */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <div>
                <h2 className="text-base font-black text-gray-900 mb-1">Data Identitas</h2>
                <p className="text-xs text-gray-400">Isi informasi identitas {form.tipe === "vendor" ? "Vendor" : "SPPG"} yang akan didaftarkan</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput label="Nama Perusahaan / Unit" value={form.nama} onChange={v => update("nama", v)} placeholder="CV Contoh Jaya" required error={errors.nama} />
                <FormInput label="NPWP" value={form.npwp} onChange={v => update("npwp", v)} placeholder="00.000.000.0-000.000" required error={errors.npwp} />
                <FormInput label="NIK Direktur / PIC" value={form.nik} onChange={v => update("nik", v)} placeholder="3273xxxxxxxxxxxx" />
                <div>
                  <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
                    Wilayah Cakupan <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.wilayah}
                    onChange={e => update("wilayah", e.target.value)}
                    className={`w-full px-4 py-2.5 text-xs font-medium text-gray-800 bg-gray-50 border rounded-xl outline-none transition-all ${errors.wilayah ? "border-red-300 bg-red-50" : form.wilayah ? "border-emerald-300 bg-emerald-50/30" : "border-gray-200"}`}
                  >
                    <option value="">Pilih wilayah...</option>
                    {WILAYAH_OPTIONS.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                  {errors.wilayah && <p className="text-[9px] text-red-500 font-bold mt-1">{errors.wilayah}</p>}
                </div>
              </div>

              <FormInput label="Alamat Lengkap" value={form.alamat} onChange={v => update("alamat", v)} placeholder="Jl. Contoh No. 1, Bandung" required error={errors.alamat} />

              <div className="border-t border-gray-100 pt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormInput label="Nama Kontak PIC" value={form.kontak} onChange={v => update("kontak", v)} placeholder="Budi Santoso" required error={errors.kontak} />
                <FormInput label="Email" value={form.email} onChange={v => update("email", v)} type="email" placeholder="pic@vendor.co.id" required error={errors.email} />
                <FormInput label="Nomor Telepon" value={form.telepon} onChange={v => update("telepon", v)} placeholder="08xx-xxxx-xxxx" />
              </div>
            </div>
          )}

          {/* ── Step 2: Dokumen ── */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div>
                <h2 className="text-base font-black text-gray-900 mb-1">Upload Dokumen</h2>
                <p className="text-xs text-gray-400">Unggah dokumen legalitas yang diperlukan. Dokumen wajib harus diisi sebelum melanjutkan.</p>
              </div>

              <div className="space-y-3">
                {REQUIRED_DOCS.map(doc => (
                  <div
                    key={doc.key}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                      uploadedDocs[doc.key]
                        ? "border-emerald-200 bg-emerald-50/50"
                        : doc.required
                        ? "border-dashed border-indigo-200 bg-indigo-50/30"
                        : "border-dashed border-gray-200 bg-gray-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${uploadedDocs[doc.key] ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
                        {uploadedDocs[doc.key] ? <CheckCircle2 className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-black text-gray-800">{doc.label}</p>
                        <p className="text-[8px] font-bold text-gray-400">
                          {doc.required ? "Wajib" : "Opsional"} · PDF, JPG, PNG · maks. 5 MB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {uploadedDocs[doc.key] ? (
                        <>
                          <span className="text-[8px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-lg">Upload ✓</span>
                          <button
                            onClick={() => setUploadedDocs(prev => { const n = { ...prev }; delete n[doc.key]; return n; })}
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setUploadedDocs(prev => ({ ...prev, [doc.key]: true }))}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-black rounded-xl transition-all"
                        >
                          <Upload className="w-3 h-3" />
                          Upload
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {!allRequiredDocs && (
                <p className="text-[9px] text-amber-600 font-bold bg-amber-50 px-3 py-2 rounded-xl border border-amber-100">
                  Dokumen wajib (NPWP & Akta Pendirian) harus diupload sebelum melanjutkan.
                </p>
              )}
            </div>
          )}

          {/* ── Step 3: Review ── */}
          {step === 3 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <div>
                <h2 className="text-base font-black text-gray-900 mb-1">Review & Konfirmasi</h2>
                <p className="text-xs text-gray-400">Periksa kembali semua data sebelum mengirim pengajuan.</p>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Tipe Entitas", value: form.tipe === "vendor" ? "Vendor" : "SPPG" },
                  { label: "Nama", value: form.nama },
                  { label: "NPWP", value: form.npwp },
                  { label: "Alamat", value: form.alamat },
                  { label: "Wilayah Cakupan", value: form.wilayah },
                  { label: "Kontak PIC", value: form.kontak },
                  { label: "Email", value: form.email },
                  { label: "Dokumen Diupload", value: `${Object.keys(uploadedDocs).length} dari ${REQUIRED_DOCS.length} dokumen` },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-2.5 px-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                    <p className="text-xs font-black text-gray-900">{item.value || <span className="text-gray-300">—</span>}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                <p className="text-[10px] font-bold text-indigo-700">
                  Setelah dikirim, pengajuan ini akan masuk ke antrian verifikasi SBT di halaman Pengajuan. Tim BGN akan memprosesnya dalam 1×24 jam.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => step > 0 ? setStep(s => s - 1) : router.back()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-[10px] font-black uppercase tracking-wider hover:bg-gray-50 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {step === 0 ? "Batal" : "Kembali"}
        </button>

        {step < 3 ? (
          <button
            onClick={handleNext}
            disabled={!canNext}
            className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-[10px] font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-500/20 disabled:shadow-none"
          >
            Lanjut
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white text-[10px] font-black uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</>
            ) : (
              <><BadgeCheck className="w-4 h-4" /> Kirim Pengajuan</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
