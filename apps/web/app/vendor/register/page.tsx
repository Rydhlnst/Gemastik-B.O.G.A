"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import {
    User, Building2, FileText, CreditCard, CheckCircle2,
    ChevronRight, ChevronLeft, Upload, Loader2, Eye, EyeOff, MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const LocationPickerMapLibre = dynamic(
    () => import("@/components/ui/LocationPickerMapLibre"),
    { ssr: false, loading: () => <div className="h-[220px] w-full animate-pulse rounded-2xl bg-slate-100" /> }
);

/* ─── Constants ─── */
const G = "#065F46"; // Vendor green
const G_LIGHT = "#D1FAE5";
const G_MID = "#059669";

/* ─── Types ─── */
interface FormData {
    nik: string; name: string; email: string; phone_number: string;
    password: string; wallet_address: string;
    business_name: string; business_email: string; business_phone: string;
    business_address: string; latitude: number; longitude: number;
    npwp_number: string; nib_number: string; logo_url: string;
    akta_document_url: string; sk_kemenkumham_url: string;
    npwp_document_url: string; nib_document_url: string;
    sppg_readiness_document_url: string;
    bank_name: string; bank_account_number: string; bank_account_name: string;
}

const INITIAL: FormData = {
    nik: "", name: "", email: "", phone_number: "", password: "", wallet_address: "",
    business_name: "", business_email: "", business_phone: "", business_address: "",
    latitude: -6.9175, longitude: 107.6191,
    npwp_number: "", nib_number: "", logo_url: "",
    akta_document_url: "", sk_kemenkumham_url: "", npwp_document_url: "",
    nib_document_url: "", sppg_readiness_document_url: "",
    bank_name: "", bank_account_number: "", bank_account_name: "",
};

const STEPS = [
    { id: 1, label: "Identitas", icon: User },
    { id: 2, label: "Bisnis", icon: Building2 },
    { id: 3, label: "Dokumen", icon: FileText },
    { id: 4, label: "Rekening", icon: CreditCard },
    { id: 5, label: "Konfirmasi", icon: CheckCircle2 },
];

/* ─── Shared input style ─── */
const inputCls =
    "h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-800 placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 transition-all shadow-sm shadow-black/[0.03]";

function FLabel({ children }: { children: React.ReactNode }) {
    return (
        <span className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-0.5">
            {children}
        </span>
    );
}

function FGroup({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
    return (
        <div>
            <Label htmlFor={id}><FLabel>{label}</FLabel></Label>
            {children}
        </div>
    );
}

/* ─── Step 1: Identitas ─── */
function Step1({ data, set }: { data: FormData; set: (k: keyof FormData, v: string | number) => void }) {
    const [show, setShow] = useState(false);
    return (
        <div className="space-y-4">
            <FGroup label="NIK (16 Digit)" id="nik">
                <Input id="nik" className={inputCls} value={data.nik}
                    onChange={(e) => set("nik", e.target.value)} placeholder="3273 0120 1090 0001" />
            </FGroup>
            <FGroup label="Nama Lengkap" id="name">
                <Input id="name" className={inputCls} value={data.name}
                    onChange={(e) => set("name", e.target.value)} placeholder="Haji Dadang Supriatna" />
            </FGroup>
            <FGroup label="Email" id="email">
                <Input id="email" type="email" className={inputCls} value={data.email}
                    onChange={(e) => set("email", e.target.value)} placeholder="direktur@perusahaan.id" />
            </FGroup>
            <FGroup label="No. HP / WhatsApp" id="phone_number">
                <Input id="phone_number" className={inputCls} value={data.phone_number}
                    onChange={(e) => set("phone_number", e.target.value)} placeholder="+62 811 xxxx xxxx" />
            </FGroup>
            <FGroup label="Kata Sandi" id="password">
                <div className="relative">
                    <Input id="password" type={show ? "text" : "password"} className={`${inputCls} pr-12`}
                        value={data.password} onChange={(e) => set("password", e.target.value)} placeholder="Min. 8 karakter" />
                    <button type="button" onClick={() => setShow(!show)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors">
                        {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
            </FGroup>
        </div>
    );
}

/* ─── Step 2: Bisnis ─── */
function Step2({ data, set }: { data: FormData; set: (k: keyof FormData, v: string | number) => void }) {
    return (
        <div className="space-y-4">
            <FGroup label="Nama Perusahaan / Usaha" id="business_name">
                <Input id="business_name" className={inputCls} value={data.business_name}
                    onChange={(e) => set("business_name", e.target.value)} placeholder="PT. Pangan Nusantara" />
            </FGroup>
            <div className="grid grid-cols-2 gap-3">
                <FGroup label="No. NIB" id="nib_number">
                    <Input id="nib_number" className={inputCls} value={data.nib_number}
                        onChange={(e) => set("nib_number", e.target.value)} placeholder="912010..." />
                </FGroup>
                <FGroup label="No. NPWP" id="npwp_number">
                    <Input id="npwp_number" className={inputCls} value={data.npwp_number}
                        onChange={(e) => set("npwp_number", e.target.value)} placeholder="01.234..." />
                </FGroup>
            </div>
            <FGroup label="Alamat Lengkap Usaha" id="business_address">
                <Input id="business_address" className={inputCls} value={data.business_address}
                    onChange={(e) => set("business_address", e.target.value)} placeholder="Jl. Soekarno Hatta No. 123, Bandung" />
            </FGroup>
            <div>
                <FLabel><span className="flex items-center gap-1.5"><MapPin size={11} />Titik Lokasi Usaha</span></FLabel>
                <div className="h-[220px] overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                    <LocationPickerMapLibre
                        initialLat={data.latitude} initialLng={data.longitude}
                        onLocationChange={(lat, lng) => { set("latitude", lat); set("longitude", lng); }}
                    />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 ml-1 font-mono">
                    {data.latitude.toFixed(5)}, {data.longitude.toFixed(5)}
                </p>
            </div>
        </div>
    );
}

/* ─── Step 3: Dokumen ─── */
function DocInput({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
    return (
        <FGroup label={label} id={id}>
            <div className="flex gap-2">
                <Input id={id} value={value} onChange={(e) => onChange(e.target.value)}
                    placeholder="https://r2.boga.id/docs/..."
                    className={`${inputCls} flex-1`} />
                <div className="h-12 w-12 shrink-0 rounded-2xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-300 hover:border-emerald-400 hover:text-emerald-500 transition-all cursor-pointer">
                    <Upload size={15} />
                </div>
            </div>
            {value && (
                <p className="text-[10px] text-emerald-600 mt-1 ml-1 flex items-center gap-1">
                    <CheckCircle2 size={10} /> Hash SHA-256 akan dikunci ke Blockchain saat submit
                </p>
            )}
        </FGroup>
    );
}

function Step3({ data, set }: { data: FormData; set: (k: keyof FormData, v: string | number) => void }) {
    return (
        <div className="space-y-4">
            <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 flex gap-3">
                <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-amber-700">
                    <FileText size={11} />
                </div>
                <p className="text-xs text-amber-700 leading-relaxed">
                    Dokumen di-<strong>hash SHA-256</strong> & dicatat ke <strong>Blockchain B.O.G.A</strong>.
                    Paste URL dari Cloudflare R2 atau isi nanti via dashboard.
                </p>
            </div>
            <DocInput id="akta" label="Akta Pendirian Perusahaan" value={data.akta_document_url} onChange={(v) => set("akta_document_url", v)} />
            <DocInput id="sk" label="SK Pengesahan Kemenkumham" value={data.sk_kemenkumham_url} onChange={(v) => set("sk_kemenkumham_url", v)} />
            <DocInput id="npwp_doc" label="Dokumen NPWP Perusahaan" value={data.npwp_document_url} onChange={(v) => set("npwp_document_url", v)} />
            <DocInput id="nib_doc" label="Dokumen NIB" value={data.nib_document_url} onChange={(v) => set("nib_document_url", v)} />
            <DocInput id="sppg_ready" label="Surat Kesiapan Bermitra SPPG" value={data.sppg_readiness_document_url} onChange={(v) => set("sppg_readiness_document_url", v)} />
        </div>
    );
}

/* ─── Step 4: Rekening ─── */
const BANKS = ["Bank BJB", "Bank BRI", "Bank Mandiri", "Bank BNI", "Bank BCA", "Bank CIMB Niaga", "Bank Syariah Indonesia"];

function Step4({ data, set }: { data: FormData; set: (k: keyof FormData, v: string | number) => void }) {
    return (
        <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 flex gap-3">
                <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: G_LIGHT, color: G }}>
                    <CreditCard size={11} />
                </div>
                <p className="text-xs leading-relaxed" style={{ color: G }}>
                    Rekening ini menjadi tujuan <strong>pencairan Escrow DOKU</strong> setelah QC SPPG memvalidasi penerimaan barang.
                </p>
            </div>
            <FGroup label="Nama Bank" id="bank_name">
                <select id="bank_name" value={data.bank_name} onChange={(e) => set("bank_name", e.target.value)}
                    className={`w-full ${inputCls} appearance-none`}>
                    <option value="">— Pilih Bank —</option>
                    {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
            </FGroup>
            <FGroup label="Nomor Rekening" id="bank_account_number">
                <Input id="bank_account_number" className={inputCls} value={data.bank_account_number}
                    onChange={(e) => set("bank_account_number", e.target.value)} placeholder="1234567890" />
            </FGroup>
            <FGroup label="Nama Pemilik Rekening" id="bank_account_name">
                <Input id="bank_account_name" className={inputCls} value={data.bank_account_name}
                    onChange={(e) => set("bank_account_name", e.target.value)} placeholder="PT. Pangan Nusantara" />
            </FGroup>
        </div>
    );
}

/* ─── Step 5: Konfirmasi ─── */
function ReviewRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between py-3 border-b border-slate-100 last:border-0 gap-4">
            <span className="text-xs text-slate-400 font-semibold shrink-0 w-32">{label}</span>
            <span className="text-xs text-slate-700 font-medium text-right break-all">
                {value || <span className="text-slate-300 italic">—</span>}
            </span>
        </div>
    );
}

function Step5({ data }: { data: FormData }) {
    const docs = [
        { label: "Akta Pendirian", value: data.akta_document_url },
        { label: "SK Kemenkumham", value: data.sk_kemenkumham_url },
        { label: "NPWP", value: data.npwp_document_url },
        { label: "NIB", value: data.nib_document_url },
        { label: "Kesiapan SPPG", value: data.sppg_readiness_document_url },
    ];
    return (
        <div className="space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-100" style={{ background: G_LIGHT }}>
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: G }}>Data Perwakilan & Bisnis</p>
                </div>
                <div className="px-4">
                    <ReviewRow label="NIK" value={data.nik} />
                    <ReviewRow label="Nama" value={data.name} />
                    <ReviewRow label="Email" value={data.email} />
                    <ReviewRow label="No. HP" value={data.phone_number} />
                    <ReviewRow label="Perusahaan" value={data.business_name} />
                    <ReviewRow label="Alamat" value={data.business_address} />
                    <ReviewRow label="NIB" value={data.nib_number} />
                    <ReviewRow label="NPWP" value={data.npwp_number} />
                    <ReviewRow label="Bank" value={data.bank_name} />
                    <ReviewRow label="No. Rekening" value={data.bank_account_number} />
                </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-100" style={{ background: G_LIGHT }}>
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: G }}>Status Dokumen Legalitas</p>
                </div>
                <div className="px-4 py-2 space-y-2">
                    {docs.map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                            <span className="text-xs text-slate-500 font-medium">{label}</span>
                            {value
                                ? <Badge className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: G_LIGHT, color: G }}>✓ Terlampir</Badge>
                                : <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 rounded-full text-amber-500 border-amber-200 bg-amber-50">⚠ Kosong</Badge>
                            }
                        </div>
                    ))}
                </div>
            </div>
            <p className="text-[11px] text-slate-400 text-center leading-relaxed px-4">
                Dengan menekan <strong>Kirim Pendaftaran</strong>, Anda menyetujui bahwa data dan dokumen yang diisi adalah benar dan sah sesuai ketentuan program MBG.
            </p>
        </div>
    );
}

/* ─── Main Page ─── */
export default function VendorRegisterPage() {
    const [step, setStep] = useState(1);
    const [data, setData] = useState<FormData>(INITIAL);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);

    const set = (k: keyof FormData, v: string | number) => setData((p) => ({ ...p, [k]: v }));

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const t = toast.loading("Mendaftarkan vendor ke B.O.G.A...");
        try {
            const res = await fetch("http://localhost:3001/api/vendors/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, latitude: Number(data.latitude), longitude: Number(data.longitude) }),
            });
            const json = await res.json();
            toast.dismiss(t);
            if (json.status === "success") { 
                setSuccess(json.data.vendor_id); 
                // Set pending status for new registrations
                document.cookie = `boga_vendor_status=pending; path=/; max-age=31536000`;
                toast.success("Pendaftaran berhasil!"); 
            }
            else toast.error(json.message || "Pendaftaran gagal.");
        } catch { toast.dismiss(t); toast.error("Tidak dapat terhubung ke server B.O.G.A."); }
        finally { setIsSubmitting(false); }
    };

    /* ─── Success ─── */
    if (success) {
        return (
            <div className="min-h-svh flex items-center justify-center p-6 bg-gradient-to-b from-emerald-50 to-white">
                <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-sm text-center">
                    <div className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center shadow-xl shadow-emerald-200"
                        style={{ background: G }}>
                        <CheckCircle2 size={36} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-800">Berhasil!</h1>
                    <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                        Pendaftaran Anda diterima. AI Vision sedang memvalidasi dokumen legalitas Anda.
                    </p>
                    <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">Vendor ID</p>
                        <p className="text-base font-mono font-extrabold text-emerald-800">{success}</p>
                    </div>
                    <p className="text-xs text-slate-400 mt-4 leading-relaxed">Dokumen akan direview dalam 1×24 jam. Pantau status di Dashboard Vendor.</p>
                    <a href="/auth/login"
                        className="mt-5 flex items-center justify-center gap-2 w-full h-12 rounded-2xl text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-opacity hover:opacity-90"
                        style={{ background: G }}>
                        Masuk ke Dashboard
                    </a>
                </motion.div>
            </div>
        );
    }

    const COMPS = [null, Step1, Step2, Step3, Step4, Step5];
    const Comp = COMPS[step] as React.ComponentType<{ data: FormData; set: typeof set }> | null;

    const stepInfo = STEPS[step - 1];
    const Icon = stepInfo.icon;

    return (
        <div className="min-h-svh bg-slate-50 flex flex-col" data-role="vendor">
            {/* ── Progress bar ── */}
            <div className="h-1 bg-slate-100 fixed top-0 inset-x-0 z-50">
                <motion.div className="h-full rounded-full" style={{ background: G }}
                    animate={{ width: `${(step / 5) * 100}%` }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} />
            </div>

            {/* ── Step Tabs ── */}
            <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-100 pt-1">
                <div className="flex overflow-x-auto no-scrollbar">
                    {STEPS.map((s) => {
                        const SIcon = s.icon;
                        const isActive = step === s.id;
                        const isDone = step > s.id;
                        return (
                            <button key={s.id} onClick={() => isDone && setStep(s.id)}
                                className={`flex-1 min-w-[64px] flex flex-col items-center gap-1 py-3 px-2 transition-all ${isDone ? "cursor-pointer" : "cursor-default"}`}>
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300"
                                    style={{
                                        background: isActive ? G : isDone ? G_LIGHT : "#F1F5F9",
                                        color: isActive ? "#fff" : isDone ? G : "#CBD5E1",
                                    }}>
                                    {isDone ? <CheckCircle2 size={14} /> : <SIcon size={14} />}
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-wider transition-colors ${isActive ? "text-emerald-700" : isDone ? "text-emerald-500" : "text-slate-300"}`}>
                                    {s.label}
                                </span>
                                {isActive && (
                                    <motion.div className="h-0.5 w-8 rounded-full" style={{ background: G }}
                                        layoutId="tab-indicator" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Content ── */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-lg mx-auto px-4 py-6 pb-36">
                    {/* Step heading */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{ background: G_LIGHT, color: G }}>
                            <Icon size={18} />
                        </div>
                        <div>
                            <h2 className="text-base font-extrabold text-slate-800 leading-none">{stepInfo.label}</h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {["Data perwakilan & akun login", "Profil perusahaan & lokasi usaha", "Upload dokumen legalitas", "Data rekening untuk pencairan dana", "Periksa kembali sebelum mengirim"][step - 1]}
                            </p>
                        </div>
                    </div>

                    {/* Animated form */}
                    <AnimatePresence mode="wait">
                        <motion.div key={step}
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}>
                            {Comp && <Comp data={data} set={set} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* ── Fixed Bottom Nav ── */}
            <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-100 px-4 py-3 safe-b">
                <div className="max-w-lg mx-auto flex gap-3">
                    {step > 1 && (
                        <button onClick={() => setStep((s) => s - 1)} disabled={isSubmitting}
                            className="flex-1 h-12 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-600 flex items-center justify-center gap-2 active:scale-[0.97] transition-all">
                            <ChevronLeft size={16} /> Kembali
                        </button>
                    )}
                    {step < 5 ? (
                        <button onClick={() => setStep((s) => s + 1)}
                            className="flex-1 h-12 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 active:scale-[0.97] transition-all shadow-lg shadow-emerald-200"
                            style={{ background: G }}>
                            Lanjut <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button onClick={handleSubmit} disabled={isSubmitting}
                            className="flex-1 h-12 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 active:scale-[0.97] transition-all shadow-lg shadow-emerald-200 disabled:opacity-60"
                            style={{ background: G }}>
                            {isSubmitting
                                ? <><Loader2 size={16} className="animate-spin" /> Mendaftarkan...</>
                                : <><CheckCircle2 size={16} /> Kirim Pendaftaran</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}