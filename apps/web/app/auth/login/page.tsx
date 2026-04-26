"use client";

import { useState } from "react";
import { LoginForm } from "@/components/ui/login-form";
import Link from "next/link";
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Image from "next/image";

/* ─── Types ─────────────────────────────────────────────────────────────── */
export type AuthMode = "login" | "signup";

export interface Role {
  id: string;
  label: string;
  desc: string;
  accent: string;
  bg: string;
  iconPath: string;
  imageSrc: string;
  headline: string;
  points: [string, string, string];
}

type Step = "choice" | "form";

/* ─── Role definitions ──────────────────────────────────────────────────── */
const ROLES: Role[] = [
  {
    id: "goverment",
    label: "Pemerintah",
    desc: "Instansi & lembaga negara",
    accent: "#B45309",
    bg: "#F8FAFC",
    imageSrc: "/mbg1.png",
    headline: "Transparansi pengadaan, eksekusi terukur.",
    points: [
      "Pantau realisasi program secara real-time",
      "Audit trail lengkap untuk tiap keputusan",
      "Kontrol anggaran & kualitas lebih rapih",
    ],
    iconPath:
      "M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11",
  },
  {
    id: "logistik",
    label: "Logistik",
    desc: "Jasa pengiriman & distribusi",
    accent: "#155E75",
    bg: "#F8FAFC",
    imageSrc: "/mbg2.png",
    headline: "Distribusi cepat, bukti serah terima jelas.",
    points: [
      "Status pengiriman yang mudah dilacak",
      "Dokumentasi serah-terima terpusat",
      "Kinerja armada & SLA lebih rapi",
    ],
    iconPath:
      "M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm13 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
  },
  {
    id: "sekolah",
    label: "Sekolah",
    desc: "Lembaga pendidikan",
    accent: "#1E3A8A",
    bg: "#F8FAFC",
    imageSrc: "/mbg3.png",
    headline: "Administrasi sekolah yang tertib dan siap audit.",
    points: [
      "Rekap penerimaan & distribusi otomatis",
      "Laporan standar untuk kebutuhan pemda",
      "Kolaborasi cepat dengan SPPG & vendor",
    ],
    iconPath: "M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c3 3 9 3 12 0v-5",
  },
  {
    id: "sppg",
    label: "SPPG",
    desc: "Satuan Pelayanan Pangan Gizi",
    accent: "#9A3412",
    bg: "#F8FAFC",
    imageSrc: "/mbg4.png",
    headline: "Bidding vendor berbasis kualitas dan harga.",
    points: [
      "Buka tender & terima penawaran vendor",
      "Skoring harga, kualitas, jarak, dan SLA",
      "Pilih pemenang dengan data yang konsisten",
    ],
    iconPath:
      "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12",
  },
  {
    id: "vendor",
    label: "Vendor",
    desc: "Penyedia jasa & solusi",
    accent: "#065F46",
    bg: "#F8FAFC",
    imageSrc: "/mbg1.png",
    headline: "Ajukan penawaran, menang karena performa.",
    points: [
      "Kirim penawaran harga dan parameter SLA",
      "Unggah dokumen kualitas & sertifikasi",
      "Pantau status tender dan hasil skoring",
    ],
    iconPath:
      "M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM12 12m-1 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0M6 12m-1 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0M18 12m-1 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0",
  },
];


function RoleHero({ role, mode }: { role: Role; mode: AuthMode }) {
  const isSignup = mode === "signup";
  return (
    <div className="relative hidden md:flex md:w-1/2 flex-col overflow-hidden self-stretch">
      <Image
        src={role.imageSrc}
        alt=""
        fill
        priority
        sizes="(min-width: 768px) 425px, 0px"
        className="object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a]/92 via-[#0a0e1a]/55 to-[#0a0e1a]/15" />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(115deg, ${role.accent}22 0%, transparent 55%)`,
        }}
      />

      <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: role.accent }} />

      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative mt-auto p-6"
      >
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em]"
          style={{ color: role.accent, background: "#ffffff", border: `1px solid ${role.accent}25` }}
        >
          <span className="inline-flex items-center justify-center w-1.5 h-1.5 rounded-full" style={{ background: role.accent }} />
          {isSignup ? "Daftar" : "Masuk"} sebagai {role.label}
        </div>

        <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-white leading-tight">
          {role.headline}
        </h2>

        <ul className="mt-4 space-y-2.5 text-[12px] text-white/80">
          {role.points.map((p) => (
            <li key={p} className="flex items-start gap-2">
              <span className="mt-[6px] h-1.5 w-1.5 rounded-full" style={{ background: role.accent }} />
              <span className="leading-relaxed">{p}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 h-px w-full bg-white/10" />
        <p className="mt-4 text-[11px] text-white/60">
          Gunakan kredensial resmi instansi. Akses yang diberikan menyesuaikan peran yang dipilih.
        </p>
      </motion.div>
    </div>
  );
}

function Bg() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[120px] animate-pulse"
        style={{ background: "hsl(var(--primary) / 0.10)" }}
      />
      <div
        className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full blur-[120px] animate-pulse"
        style={{ background: "hsl(var(--primary) / 0.07)", animationDelay: "2s" }}
      />
      <div
        className="absolute inset-0 opacity-[0.02] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 40V39L0 39V40zm40-40V0L39 0V40H40V0z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

function RoleIcon({ d, size = 20 }: { d: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {d.split("M").filter(Boolean).map((seg, i) => (
        <path key={i} d={`M${seg}`} />
      ))}
    </svg>
  );
}

function SplitChoiceStep({
  onProceed,
}: {
  onProceed: (role: Role, mode: AuthMode) => void;
}) {
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const selectedRole = ROLES.find((r) => r.id === selectedRoleId) ?? null;
  const accent = selectedRole?.accent ?? "hsl(var(--primary))";

  const handleAction = (mode: AuthMode) => {
    if (!selectedRoleId) {
      toast.custom((t) => (
        <div className="w-full sm:w-[356px]">
          <Alert variant="destructive" className="shadow-lg bg-red-50 pointer-events-auto relative">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Perhatian!</AlertTitle>
            <AlertDescription>
              Silakan pilih kategori peran terlebih dahulu
            </AlertDescription>
            <button onClick={() => toast.dismiss(t)} className="absolute top-4 right-4 text-red-400 hover:text-red-700 transition-colors">
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </Alert>
        </div>
      ), { duration: 4000 });
      return;
    }
    onProceed(selectedRole ?? ROLES[0], mode);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 md:p-7 animate-in fade-in duration-400">
      {/* ─── KIRI: Pilih Role ─── */}
      <motion.div 
        className="flex-1"
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
      >
        <div className="mb-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 border border-black/5 mb-4 shadow-sm shadow-black/5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-700">
              Portal Akses B.O.G.A
            </span>
          </div>
          <h1 className="text-[22px] font-extrabold tracking-tight text-[#0a0e1a] leading-tight">
            Masuk sebagai apa?
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pilih peran untuk menyesuaikan akses, navigasi, dan dashboard.
          </p>
        </div>

        <RadioGroup value={selectedRoleId} onValueChange={setSelectedRoleId} className="gap-3">
          {ROLES.map((role) => (
            <FieldLabel 
              htmlFor={`role-${role.id}`} 
              key={role.id}
              onClick={() => setSelectedRoleId(role.id)}
            >
              <Field
                orientation="horizontal"
                className="rounded-2xl"
                style={
                  selectedRoleId === role.id
                    ? { borderColor: role.accent, background: `${role.accent}0B` }
                    : undefined
                }
              >
                <FieldContent className="flex-row items-center gap-3">
                  <div className="relative shrink-0 w-10 h-10 rounded-xl overflow-hidden ring-1 ring-black/5 shadow-sm shadow-black/10">
                    <Image src={role.imageSrc} alt="" fill sizes="40px" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-transparent" />
                    <div className="absolute bottom-1 left-1 w-6 h-6 rounded-lg bg-white/85 backdrop-blur flex items-center justify-center text-[#0a0e1a]">
                      <RoleIcon d={role.iconPath} size={14} />
                    </div>
                    <div className="absolute inset-x-0 top-0 h-1" style={{ background: role.accent }} />
                  </div>
                  <div className="flex flex-col">
                    <FieldTitle>{role.label}</FieldTitle>
                    <FieldDescription>{role.desc}</FieldDescription>
                  </div>
                </FieldContent>
                <RadioGroupItem value={role.id} id={`role-${role.id}`} />
              </Field>
            </FieldLabel>
          ))}
        </RadioGroup>
      </motion.div>

      {/* ─── KANAN: Pilih Aksi ─── */}
      <motion.div 
        className="flex-1 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-6 flex flex-col justify-center"
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
      >
        <motion.div
          key={selectedRole?.id ?? "empty"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6"
        >
          <div className="overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl ring-1 ring-black/5 shadow-xl shadow-black/5">
            <div className="relative h-36">
              <Image
                src={selectedRole?.imageSrc ?? "/mbg3.png"}
                alt=""
                fill
                sizes="(min-width: 768px) 400px, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a]/88 via-[#0a0e1a]/40 to-transparent" />
              <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: accent }} />

              <div className="absolute bottom-3 left-4 right-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/70">
                  {selectedRole ? "Role preview" : "Mulai dari sini"}
                </p>
                <p className="mt-1 text-base font-extrabold tracking-tight text-white">
                  {selectedRole ? selectedRole.label : "Pilih peran, lalu login"}
                </p>
              </div>
            </div>

            <div className="p-5">
              <p className="text-sm font-semibold text-slate-900">
                {selectedRole ? selectedRole.headline : "Akses disesuaikan otomatis dengan peran yang kamu pilih."}
              </p>
              <ul className="mt-3 space-y-2 text-[12px] text-slate-600">
                {(selectedRole?.points ?? [
                  "Dashboard dan navigasi berbeda per role",
                  "Aksi penting punya guardrail & status jelas",
                  "Log aktivitas siap untuk audit",
                ]).map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
                    <span className="leading-relaxed">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleAction("login")}
            className="group flex items-center gap-4 p-4 rounded-2xl border bg-white/80 hover:bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-left"
            style={{ borderColor: selectedRoleId ? `${accent}26` : "rgba(15, 23, 42, 0.10)" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
              style={{
                background: selectedRoleId ? `${accent}14` : "hsl(var(--primary) / 0.10)",
                color: selectedRoleId ? accent : "hsl(var(--primary))",
              }}
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm text-[#0a0e1a]">Masuk</p>
              <p className="text-[11px] text-gray-400">
                {selectedRoleId
                  ? `Masuk sebagai ${ROLES.find((r) => r.id === selectedRoleId)?.label ?? "peran terpilih"}`
                  : "Sudah punya akun"}
              </p>
            </div>
            <svg className="ml-auto text-gray-300 transition-colors" style={{ color: selectedRoleId ? `${accent}88` : undefined }} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          <button
            onClick={() => handleAction("signup")}
            className="group flex items-center gap-4 p-4 rounded-2xl border bg-white/80 hover:bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-left"
            style={{ borderColor: selectedRoleId ? `${accent}26` : "rgba(15, 23, 42, 0.10)" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
              style={{
                background: selectedRoleId ? `${accent}14` : "hsl(var(--primary) / 0.10)",
                color: selectedRoleId ? accent : "hsl(var(--primary))",
              }}
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M19 8v6M22 11h-6" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm text-[#0a0e1a]">Daftar</p>
              <p className="text-[11px] text-gray-400">
                {selectedRoleId
                  ? `Daftar sebagai ${ROLES.find((r) => r.id === selectedRoleId)?.label ?? "peran terpilih"}`
                  : "Buat akun baru"}
              </p>
            </div>
            <svg className="ml-auto text-gray-300 transition-colors" style={{ color: selectedRoleId ? `${accent}88` : undefined }} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        <p className="mt-8 text-center text-[11px] text-gray-400">
          Butuh bantuan?{" "}
          <Link href="/contact">
            <span className="text-primary cursor-pointer hover:underline font-semibold">
              Hubungi administrator
            </span>
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

/* ─── Page root ──────────────────────────────────────────────────────────── */
export default function LoginPage() {
  const [step, setStep] = useState<Step>("choice");
  const [role, setRole] = useState<Role | null>(null);
  const [mode, setMode] = useState<AuthMode>("login");

  const handleProceed = (r: Role, m: AuthMode) => {
    setRole(r);
    setMode(m);
    setStep("form");
  };

  return (
    // FIX: hapus -mt-12 dan pt-1, tambah bg-[#f8fafc] tetap ada
    <div className="relative flex min-h-screen items-center justify-center p-4 md:p-8 overflow-hidden bg-[#f6f8ff]">
      <Bg />

      <div className="relative z-10 w-full max-w-[850px]">
        {step === "choice" && (
          <div className="animate-in fade-in duration-300">
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden rounded-3xl shadow-2xl shadow-primary/10 ring-1 ring-black/5 bg-white/70 backdrop-blur-xl"
            >


              <SplitChoiceStep onProceed={handleProceed} />
            </motion.div>
          </div>
        )}

        {step === "form" && role && (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-400">
            <div className="flex w-full overflow-hidden rounded-3xl shadow-2xl shadow-primary/10 ring-1 ring-black/5 bg-white/70 backdrop-blur-xl min-h-[500px]">
              <RoleHero role={role} mode={mode} />

              <div className="w-full md:w-1/2">
                <LoginForm
                  mode={mode}
                  role={role}
                  onModeChange={(m) => setMode(m)}
                  onBack={() => setStep("choice")}
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
