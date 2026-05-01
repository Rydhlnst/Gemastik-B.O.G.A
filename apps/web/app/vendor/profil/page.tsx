"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  User, Building2, Phone, CreditCard, FileText,
  ShieldCheck, Camera, CheckCircle2, AlertTriangle,
  Loader2, Hash, Edit3, Save, Info, ArrowRight, RefreshCcw, ExternalLink
} from "lucide-react";
import { Input } from "@/components/ui/input";

/* ─── Constants ─── */
const G = "#065F46";
const G_LIGHT = "#D1FAE5";

/* ─── Types ─── */
interface VendorProfile {
  id: string;
  business_name: string;
  business_email: string;
  business_phone: string;
  business_address: string;
  latitude: string;
  longitude: string;
  npwp_number: string;
  nib_number: string;
  logo_url: string;
  
  // Documents
  akta_document_url: string;
  akta_document_hash: string;
  sk_kemenkumham_url: string;
  sk_kemenkumham_hash: string;
  npwp_document_url: string;
  npwp_document_hash: string;
  nib_document_url: string;
  nib_document_hash: string;
  sppg_readiness_document_url: string;
  sppg_readiness_document_hash: string;

  // Banking
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;

  // Metadata
  status: "pending" | "approved" | "rejected";
  sbt_token_id?: string;
  reputasi_score: number;
}

const INITIAL_PROFILE: VendorProfile = {
  id: "",
  business_name: "Memuat...",
  business_email: "",
  business_phone: "",
  business_address: "",
  latitude: "0",
  longitude: "0",
  npwp_number: "",
  nib_number: "",
  logo_url: "",
  akta_document_url: "", akta_document_hash: "",
  sk_kemenkumham_url: "", sk_kemenkumham_hash: "",
  npwp_document_url: "", npwp_document_hash: "",
  nib_document_url: "", nib_document_hash: "",
  sppg_readiness_document_url: "", sppg_readiness_document_hash: "",
  bank_name: "BCA",
  bank_account_number: "",
  bank_account_name: "",
  status: "pending",
  reputasi_score: 0
};

const BANK_OPTIONS = ["BCA", "BRI", "BNI", "Mandiri", "BSI", "CIMB Niaga", "Permata"];

/* ─── Section wrapper ─── */
function Section({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-50">
        <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: G_LIGHT }}>
          <Icon size={13} style={{ color: G }} />
        </div>
        <p className="text-xs font-extrabold text-slate-700">{title}</p>
      </div>
      <div className="px-4 py-4 space-y-3">{children}</div>
    </div>
  );
}

/* ─── Field row ─── */
function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      {children}
    </div>
  );
}

function ReadOnlyField({ value, mono }: { value: string; mono?: boolean }) {
  return (
    <div className="h-9 px-3 flex items-center rounded-xl bg-slate-50 border border-slate-100">
      <p className={`text-xs text-slate-600 truncate ${mono ? "font-mono" : "font-medium"}`}>{value || "-"}</p>
    </div>
  );
}

/* ─── Main Page ─── */
export default function VendorProfilPage() {
  const [profile, setProfile] = useState<VendorProfile>(INITIAL_PROFILE);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<VendorProfile>(INITIAL_PROFILE);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const vendorId = document.cookie.split("; ").find(row => row.startsWith("boga_vendor_id="))?.split("=")[1];
        if (!vendorId) {
          toast.error("Sesi tidak ditemukan. Silakan login kembali.");
          return;
        }

        const res = await fetch(`http://localhost:3001/api/vendors/${vendorId}`);
        const json = await res.json();

        if (json.status === "success") {
          const d = json.data;
          let mappedStatus: "pending" | "approved" | "rejected" = "pending";
          if (d.status === "APPROVED") mappedStatus = "approved";
          else if (d.status === "REJECTED") mappedStatus = "rejected";

          const loadedProfile: VendorProfile = {
            id: d.id,
            business_name: d.business_name || "-",
            business_email: d.business_email || "-",
            business_phone: d.business_phone || "-",
            business_address: d.business_address || "-",
            latitude: d.latitude || "0",
            longitude: d.longitude || "0",
            npwp_number: d.npwp_number || "-",
            nib_number: d.nib_number || "-",
            logo_url: d.logo_url || "",
            
            akta_document_url: d.akta_document_url || "",
            akta_document_hash: d.akta_document_hash || "",
            sk_kemenkumham_url: d.sk_kemenkumham_url || "",
            sk_kemenkumham_hash: d.sk_kemenkumham_hash || "",
            npwp_document_url: d.npwp_document_url || "",
            npwp_document_hash: d.npwp_document_hash || "",
            nib_document_url: d.nib_document_url || "",
            nib_document_hash: d.nib_document_hash || "",
            sppg_readiness_document_url: d.sppg_readiness_document_url || "",
            sppg_readiness_document_hash: d.sppg_readiness_document_hash || "",

            bank_name: d.bank_name || "-",
            bank_account_number: d.bank_account_number || "-",
            bank_account_name: d.bank_account_name || "-",
            
            sbt_token_id: d.sbt_token_id,
            reputasi_score: d.reputasi_score || 92,
            status: mappedStatus
          };

          setProfile(loadedProfile);
          setDraft(loadedProfile);
          document.cookie = `boga_vendor_status=${mappedStatus}; path=/`;
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Gagal mengambil data dari server.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const startEdit = () => { setDraft({ ...profile }); setEditing(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:3001/api/vendors/${draft.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: draft.business_name,
          business_email: draft.business_email,
          business_phone: draft.business_phone,
          business_address: draft.business_address,
          latitude: draft.latitude,
          longitude: draft.longitude,
          npwp_number: draft.npwp_number,
          nib_number: draft.nib_number,
          logo_url: draft.logo_url,
          akta_document_url: draft.akta_document_url,
          akta_document_hash: draft.akta_document_hash,
          sk_kemenkumham_url: draft.sk_kemenkumham_url,
          sk_kemenkumham_hash: draft.sk_kemenkumham_hash,
          npwp_document_url: draft.npwp_document_url,
          npwp_document_hash: draft.npwp_document_hash,
          nib_document_url: draft.nib_document_url,
          nib_document_hash: draft.nib_document_hash,
          sppg_readiness_document_url: draft.sppg_readiness_document_url,
          sppg_readiness_document_hash: draft.sppg_readiness_document_hash,
          bank_name: draft.bank_name,
          bank_account_number: draft.bank_account_number,
          bank_account_name: draft.bank_account_name
        })
      });

      const json = await res.json();
      if (json.status === "success") {
        setProfile({ ...draft });
        setEditing(false);
        toast.success("Profil berhasil diperbarui secara On-Chain!");
      } else {
        toast.error(json.message || "Gagal memperbarui profil.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan pada server.");
    } finally {
      setSaving(false);
    }
  };

  const p = editing ? draft : profile;
  const set = (key: keyof VendorProfile) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDraft(prev => ({ ...prev, [key]: e.target.value }));

  const isPending = profile.status === "pending";

  if (loading) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center bg-slate-50">
        <Loader2 size={32} className="animate-spin text-[#065F46] mb-4" />
        <p className="text-sm font-bold text-slate-500">Memuat profil vendor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-slate-50 pb-20" data-role="vendor">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-extrabold text-slate-800 leading-none">Profil Vendor</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Kelola data toko & rekening Anda</p>
          </div>
          <div className="flex gap-2">
            {!editing ? (
              <button onClick={startEdit}
                className="flex items-center gap-1.5 h-9 px-4 rounded-2xl text-xs font-bold text-white shadow shadow-emerald-200"
                style={{ background: G }}>
                <Edit3 size={13} /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)}
                  className="h-9 px-3 rounded-2xl text-xs font-bold text-slate-500 bg-slate-100">
                  Batal
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 h-9 px-4 rounded-2xl text-xs font-bold text-white shadow shadow-emerald-200 disabled:opacity-60"
                  style={{ background: G }}>
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">

        {/* ── Pending Status Banner ── */}
        <AnimatePresence>
          {isPending && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
                <div className="shrink-0 w-8 h-8 rounded-2xl bg-amber-200 flex items-center justify-center text-amber-700">
                  <Info size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-extrabold text-amber-900">Verifikasi Sedang Berjalan</p>
                  <p className="text-[11px] text-amber-700 leading-relaxed mt-0.5">
                    Akun Anda saat ini sedang dalam status <strong>Pending</strong>. Tim B.O.G.A sedang meninjau dokumen legalitas Anda. 
                    Selama proses ini, fitur katalog dan pesanan ditutup sementara.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Avatar & Status ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow"
              style={{ background: isPending ? "#94A3B8" : G }}>
              {(profile?.business_name || "?").slice(0, 1)}
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-white shadow flex items-center justify-center"
              style={{ background: isPending ? "#64748B" : G }}>
              <Camera size={10} className="text-white" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-extrabold text-slate-800 truncate">{profile?.business_name}</p>
            <p className="text-xs text-slate-400 truncate">{profile?.business_email}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black ${isPending ? "bg-slate-100 text-slate-500" : "bg-emerald-100 text-emerald-700"}`}>
                {isPending ? <Loader2 size={9} className="animate-spin" /> : <ShieldCheck size={9} />}
                {isPending ? "Menunggu Verifikasi" : "Terverifikasi"}
              </div>
              {!isPending && (
                <div className="text-[9px] font-bold text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
                  Reputasi {profile?.reputasi_score}/100
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── SBT On-Chain ── */}
        <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 border ${isPending ? "bg-slate-50 border-slate-200" : "bg-[#F0FDF4] border-[#BBF7D0]"}`}>
          <Hash size={14} className="shrink-0" style={{ color: isPending ? "#64748B" : G }} />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold" style={{ color: isPending ? "#475569" : G }}>Soulbound Token (SBT) On-Chain</p>
            <p className="text-[9px] font-mono text-slate-500 truncate">{isPending ? "GENERATING_TOKEN_ON_CHAIN..." : (profile?.sbt_token_id || "NOT_MINTED")}</p>
          </div>
          {isPending ? <Loader2 size={16} className="animate-spin text-slate-400" /> : <CheckCircle2 size={16} style={{ color: G }} className="shrink-0" />}
        </div>

        {/* ── Data Toko ── */}
        <Section title="Informasi Toko & Lokasi" icon={Building2}>
          <FieldRow label="Nama Toko / Usaha">
            {editing
              ? <Input value={p.business_name} onChange={set("business_name")} className="h-9 text-xs rounded-xl" />
              : <ReadOnlyField value={p.business_name} />}
          </FieldRow>
          <FieldRow label="Alamat Lengkap">
            {editing
              ? <Input value={p.business_address} onChange={set("business_address")} className="h-9 text-xs rounded-xl" />
              : <ReadOnlyField value={p.business_address} />}
          </FieldRow>
          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="Latitude">
              {editing
                ? <Input value={p.latitude} onChange={set("latitude")} className="h-9 text-xs rounded-xl font-mono" />
                : <ReadOnlyField value={p.latitude} mono />}
            </FieldRow>
            <FieldRow label="Longitude">
              {editing
                ? <Input value={p.longitude} onChange={set("longitude")} className="h-9 text-xs rounded-xl font-mono" />
                : <ReadOnlyField value={p.longitude} mono />}
            </FieldRow>
          </div>
        </Section>

        {/* ── Kontak ── */}
        <Section title="Informasi Kontak" icon={Phone}>
          <FieldRow label="Email Terdaftar">
            <ReadOnlyField value={p.business_email} />
          </FieldRow>
          <FieldRow label="Nomor WhatsApp Usaha">
            {editing
              ? <Input value={p.business_phone} onChange={set("business_phone")} className="h-9 text-xs rounded-xl" type="tel" />
              : <ReadOnlyField value={p.business_phone} />}
          </FieldRow>
        </Section>

        {/* ── Rekening Bank ── */}
        <Section title="Rekening Pencairan" icon={CreditCard}>
          <FieldRow label="Bank">
            {editing ? (
              <select value={p.bank_name}
                onChange={e => setDraft(prev => ({ ...prev, bank_name: e.target.value }))}
                className="w-full h-9 px-3 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700">
                {BANK_OPTIONS.map(b => <option key={b}>{b}</option>)}
              </select>
            ) : <ReadOnlyField value={p.bank_name} />}
          </FieldRow>
          <FieldRow label="Nomor Rekening">
            {editing
              ? <Input value={p.bank_account_number} onChange={set("bank_account_number")} className="h-9 text-xs rounded-xl font-mono" />
              : <ReadOnlyField value={p.bank_account_number} mono />}
          </FieldRow>
          <FieldRow label="Atas Nama">
            {editing
              ? <Input value={p.bank_account_name} onChange={set("bank_account_name")} className="h-9 text-xs rounded-xl" />
              : <ReadOnlyField value={p.bank_account_name} />}
          </FieldRow>
        </Section>

        {/* ── Zero-Trust Legalitas ── */}
        <Section title="Zero-Trust Documents" icon={ShieldCheck}>
          <div className="grid grid-cols-1 gap-3">
            <FieldRow label="NPWP Number">
              {editing
                ? <Input value={p.npwp_number} onChange={set("npwp_number")} className="h-9 text-xs rounded-xl font-mono" />
                : <ReadOnlyField value={p.npwp_number} mono />}
            </FieldRow>
            <FieldRow label="NIB Number">
              {editing
                ? <Input value={p.nib_number} onChange={set("nib_number")} className="h-9 text-xs rounded-xl font-mono" />
                : <ReadOnlyField value={p.nib_number} mono />}
            </FieldRow>
            
            {/* Document List with Links & Hashes */}
            <div className="space-y-2.5 mt-2">
              {[
                { label: "Akta Pendirian", url: p.akta_document_url, hash: p.akta_document_hash },
                { label: "SK Kemenkumham", url: p.sk_kemenkumham_url, hash: p.sk_kemenkumham_hash },
                { label: "NPWP Toko", url: p.npwp_document_url, hash: p.npwp_document_hash },
                { label: "NIB Toko", url: p.nib_document_url, hash: p.nib_document_hash },
                { label: "SPPG Readiness", url: p.sppg_readiness_document_url, hash: p.sppg_readiness_document_hash },
              ].map(d => (
                <div key={d.label} className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{d.label}</p>
                    {d.url && d.url !== "" && (
                      <a href={d.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[9px] font-bold text-blue-600 hover:underline">
                        <ExternalLink size={10} /> Lihat Dokumen
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 bg-white rounded-lg px-2 py-1 border border-slate-100">
                    <Hash size={9} className="text-slate-300" />
                    <p className="text-[8px] font-mono text-slate-400 truncate">{d.hash || "BELUM_ADA_HASH"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Danger Zone ── */}
        <div className="rounded-3xl border border-red-100 bg-white p-4 space-y-3">
          <p className="text-xs font-extrabold text-red-500">Zona Berbahaya</p>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Menonaktifkan akun akan membuat seluruh produk Anda menghilang dari E-Katalog dan semua PO aktif akan dibatalkan.
          </p>
          <button className="h-9 px-4 rounded-2xl text-xs font-bold text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors">
            Nonaktifkan Akun Vendor
          </button>
        </div>
      </div>
    </div>
  );
}
