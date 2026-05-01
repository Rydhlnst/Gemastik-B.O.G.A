"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  User, Building2, Phone, CreditCard, FileText,
  ShieldCheck, Camera, CheckCircle2, AlertTriangle,
  Loader2, Hash, Edit3, Save, Info, ArrowRight, RefreshCcw
} from "lucide-react";
import { Input } from "@/components/ui/input";

/* ─── Constants ─── */
const G = "#065F46";
const G_LIGHT = "#D1FAE5";

/* ─── Types ─── */
interface VendorProfile {
  namaToko: string;
  namaLengkap: string;
  email: string;
  phone: string;
  alamat: string;
  kota: string;
  provinsi: string;
  nib: string;
  namaBank: string;
  noRekening: string;
  atasNama: string;
  sbtTokenId: string;
  verifiedAt: string;
  reputasiScore: number;
  status: "pending" | "approved" | "rejected";
}

const INITIAL_PROFILE: VendorProfile = {
  namaToko: "UD. Sumber Pangan Sejahtera",
  namaLengkap: "Budi Santoso",
  email: "budi.sps@gmail.com",
  phone: "0812-3456-7890",
  alamat: "Jl. Pasar Induk Gedebage No. 12",
  kota: "Bandung",
  provinsi: "Jawa Barat",
  nib: "1234567890123456",
  namaBank: "BCA",
  noRekening: "1234567890",
  atasNama: "Budi Santoso",
  sbtTokenId: "SBT-VDR-5E1FD92B",
  verifiedAt: "2026-03-15",
  reputasiScore: 94,
  status: "approved"
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
      <p className={`text-xs text-slate-600 ${mono ? "font-mono" : "font-medium"}`}>{value}</p>
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
          // Map backend status to frontend status
          let mappedStatus: "pending" | "approved" | "rejected" = "pending";
          if (d.status === "APPROVED") mappedStatus = "approved";
          else if (d.status === "REJECTED") mappedStatus = "rejected";

          const loadedProfile: VendorProfile = {
            namaToko: d.business_name || "-",
            namaLengkap: d.owner_name || "-",
            email: d.business_email || d.owner_email || "-",
            phone: d.business_phone || d.owner_phone || "-",
            alamat: d.business_address || "-",
            kota: d.kota || "Kota Bandung", 
            provinsi: d.provinsi || "Jawa Barat",
            nib: d.nib_number || "-",
            namaBank: d.bank_name || "-",
            noRekening: d.bank_account_number || "-",
            atasNama: d.bank_account_name || "-",
            sbtTokenId: d.sbt_token_id || "SBT-VDR-" + d.id.split("-")[2],
            verifiedAt: d.created_at?.split("T")[0] || "-",
            reputasiScore: 92,
            status: mappedStatus
          };

          setProfile(loadedProfile);
          setDraft(loadedProfile);
          
          // Update status cookie to keep sidebar in sync
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
    await new Promise(r => setTimeout(r, 1200)); // mock save for now
    setProfile({ ...draft });
    setEditing(false);
    setSaving(false);
    toast.success("Profil berhasil disimpan!");
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
              {profile.namaToko.slice(0, 1)}
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-white shadow flex items-center justify-center"
              style={{ background: isPending ? "#64748B" : G }}>
              <Camera size={10} className="text-white" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-extrabold text-slate-800 truncate">{profile.namaToko}</p>
            <p className="text-xs text-slate-400 truncate">{profile.email}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black ${isPending ? "bg-slate-100 text-slate-500" : "bg-emerald-100 text-emerald-700"}`}>
                {isPending ? <Loader2 size={9} className="animate-spin" /> : <ShieldCheck size={9} />}
                {isPending ? "Menunggu Verifikasi" : "Terverifikasi"}
              </div>
              {!isPending && (
                <div className="text-[9px] font-bold text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
                  Reputasi {profile.reputasiScore}/100
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
            <p className="text-[9px] font-mono text-slate-500 truncate">{isPending ? "GENERATING_TOKEN_ON_CHAIN..." : profile.sbtTokenId}</p>
          </div>
          {isPending ? <Loader2 size={16} className="animate-spin text-slate-400" /> : <CheckCircle2 size={16} style={{ color: G }} className="shrink-0" />}
        </div>

        {/* ── Data Toko ── */}
        <Section title="Informasi Toko" icon={Building2}>
          <FieldRow label="Nama Toko / Usaha">
            {editing
              ? <Input value={p.namaToko} onChange={set("namaToko")} className="h-9 text-xs rounded-xl" />
              : <ReadOnlyField value={p.namaToko} />}
          </FieldRow>
          <FieldRow label="Nama Pemilik">
            {editing
              ? <Input value={p.namaLengkap} onChange={set("namaLengkap")} className="h-9 text-xs rounded-xl" />
              : <ReadOnlyField value={p.namaLengkap} />}
          </FieldRow>
          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="Kota">
              {editing
                ? <Input value={p.kota} onChange={set("kota")} className="h-9 text-xs rounded-xl" />
                : <ReadOnlyField value={p.kota} />}
            </FieldRow>
            <FieldRow label="Provinsi">
              {editing
                ? <Input value={p.provinsi} onChange={set("provinsi")} className="h-9 text-xs rounded-xl" />
                : <ReadOnlyField value={p.provinsi} />}
            </FieldRow>
          </div>
          <FieldRow label="Alamat Lengkap">
            {editing
              ? <Input value={p.alamat} onChange={set("alamat")} className="h-9 text-xs rounded-xl" />
              : <ReadOnlyField value={p.alamat} />}
          </FieldRow>
        </Section>

        {/* ── Kontak ── */}
        <Section title="Informasi Kontak" icon={Phone}>
          <FieldRow label="Email">
            <ReadOnlyField value={p.email} />
            <p className="text-[9px] text-slate-400 mt-1">Email terdaftar tidak dapat diubah</p>
          </FieldRow>
          <FieldRow label="Nomor HP / WhatsApp">
            {editing
              ? <Input value={p.phone} onChange={set("phone")} className="h-9 text-xs rounded-xl" type="tel" />
              : <ReadOnlyField value={p.phone} />}
          </FieldRow>
        </Section>

        {/* ── Rekening Bank ── */}
        <Section title="Rekening Pencairan Dana Escrow" icon={CreditCard}>
          <div className="rounded-2xl bg-amber-50 border border-amber-100 px-3 py-2.5 flex items-start gap-2">
            <AlertTriangle size={11} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[10px] text-amber-700 leading-relaxed">
              Dana escrow DOKU akan langsung dicairkan ke rekening ini setelah Multi-Sig 3/3 selesai. Pastikan data benar.
            </p>
          </div>
          <FieldRow label="Bank">
            {editing ? (
              <select value={p.namaBank}
                onChange={e => setDraft(prev => ({ ...prev, namaBank: e.target.value }))}
                className="w-full h-9 px-3 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {BANK_OPTIONS.map(b => <option key={b}>{b}</option>)}
              </select>
            ) : <ReadOnlyField value={p.namaBank} />}
          </FieldRow>
          <FieldRow label="Nomor Rekening">
            {editing
              ? <Input value={p.noRekening} onChange={set("noRekening")} className="h-9 text-xs rounded-xl font-mono" />
              : <ReadOnlyField value={p.noRekening} mono />}
          </FieldRow>
          <FieldRow label="Atas Nama">
            {editing
              ? <Input value={p.atasNama} onChange={set("atasNama")} className="h-9 text-xs rounded-xl" />
              : <ReadOnlyField value={p.atasNama} />}
          </FieldRow>
        </Section>

        {/* ── Legalitas ── */}
        <Section title="Dokumen Legalitas" icon={FileText}>
          <FieldRow label="Nomor Induk Berusaha (NIB)">
            <ReadOnlyField value={p.nib} mono />
            <p className="text-[9px] text-slate-400 mt-1">Untuk mengubah NIB, hubungi administrator B.O.G.A</p>
          </FieldRow>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {[
              { label: "NIB", status: isPending ? "Sedang Direview" : "Terverifikasi" },
              { label: "SIUP", status: isPending ? "Sedang Direview" : "Terverifikasi" },
              { label: "Sertifikat Halal", status: "Tidak Ditemukan" },
              { label: "PIRT", status: isPending ? "Menunggu Antrean" : "Proses Review" },
            ].map(d => {
              const ok = d.status === "Terverifikasi";
              const process = d.status === "Proses Review" || d.status === "Sedang Direview" || d.status === "Menunggu Antrean";
              return (
                <div key={d.label} className={`flex items-center gap-2 rounded-2xl px-3 py-2 border text-[10px] font-semibold
                  ${ok ? "bg-emerald-50 border-emerald-100 text-emerald-700" : process ? "bg-amber-50 border-amber-100 text-amber-700" : "bg-slate-50 border-slate-100 text-slate-400"}`}>
                  {ok ? <CheckCircle2 size={11} /> : process ? <Loader2 size={11} className="animate-spin" /> : <AlertTriangle size={11} />}
                  <span className="flex-1">{d.label}</span>
                  <span className="text-[8px] font-bold opacity-70">{d.status}</span>
                </div>
              );
            })}
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
