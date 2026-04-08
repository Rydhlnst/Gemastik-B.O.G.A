"use client";

import { useState } from "react";
import { LoginForm } from "@/components/ui/login-form";
import { AnimatedScene } from "@/components/ui/animated-scene";
import Link from "next/link";
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────────────────── */
export type AuthMode = "login" | "signup";

export interface Role {
  id: string;
  label: string;
  desc: string;
  accent: string;
  bg: string;
  iconPath: string;
}

type Step = "choice" | "form";

/* ─── Role definitions ──────────────────────────────────────────────────── */
const ROLES: Role[] = [
  {
    id: "goverment",
    label: "Pemerintah",
    desc: "Instansi & lembaga negara",
    accent: "#4f46e5",
    bg: "#eef2ff",
    iconPath:
      "M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11",
  },
  {
    id: "logistik",
    label: "Logistik",
    desc: "Jasa pengiriman & distribusi",
    accent: "#16a34a",
    bg: "#f0fdf4",
    iconPath:
      "M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm13 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
  },
  {
    id: "sekolah",
    label: "Sekolah",
    desc: "Lembaga pendidikan",
    accent: "#ea580c",
    bg: "#fff7ed",
    iconPath: "M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c3 3 9 3 12 0v-5",
  },
  {
    id: "supplier",
    label: "Supplier",
    desc: "Pemasok bahan & barang",
    accent: "#9333ea",
    bg: "#faf5ff",
    iconPath:
      "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12",
  },
  {
    id: "vendor",
    label: "Vendor",
    desc: "Penyedia jasa & solusi",
    accent: "#e11d48",
    bg: "#fff1f2",
    iconPath:
      "M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM12 12m-1 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0M6 12m-1 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0M18 12m-1 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0",
  },
];


function Bg() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse" />
      <div
        className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 blur-[120px] animate-pulse"
        style={{ animationDelay: "2s" }}
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
    const selectedRole = ROLES.find(r => r.id === selectedRoleId) || ROLES[0];
    onProceed(selectedRole, mode);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 animate-in fade-in duration-400">
      {/* ─── KIRI: Pilih Role ─── */}
      <motion.div 
        className="flex-1"
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
      >
        <div className="mb-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-500">
              Portal Akses B.O.G.A
            </span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-[#0a0e1a]">
            Masuk sebagai apa?
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Pilih kategori peran kamu
          </p>
        </div>

        <RadioGroup value={selectedRoleId} onValueChange={setSelectedRoleId} className="gap-3">
          {ROLES.map((role) => (
            <FieldLabel 
              htmlFor={`role-${role.id}`} 
              key={role.id}
              onClick={() => setSelectedRoleId(role.id)}
            >
              <Field orientation="horizontal" className={selectedRoleId === role.id ? "border-indigo-500 bg-indigo-50/50" : ""}>
                <FieldContent className="flex-row items-center gap-3">
                  <div
                    className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200"
                    style={{ background: role.bg, color: role.accent }}
                  >
                    <RoleIcon d={role.iconPath} size={18} />
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
        <div className="mb-8 text-center md:text-left">
          <h2 className="text-xl font-extrabold tracking-tight text-[#0a0e1a]">
            Apa yang ingin kamu lakukan?
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Masuk ke akun atau buat yang baru
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleAction("login")}
            className="group flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white/80 hover:bg-white hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all duration-200 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-100 transition-colors">
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm text-[#0a0e1a]">Masuk</p>
              <p className="text-[11px] text-gray-400">Sudah punya akun</p>
            </div>
            <svg className="ml-auto text-gray-300 group-hover:text-indigo-400 transition-colors" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          <button
            onClick={() => handleAction("signup")}
            className="group flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white/80 hover:bg-white hover:border-cyan-200 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-0.5 transition-all duration-200 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-500 group-hover:bg-cyan-100 transition-colors">
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M19 8v6M22 11h-6" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm text-[#0a0e1a]">Daftar</p>
              <p className="text-[11px] text-gray-400">Buat akun baru</p>
            </div>
            <svg className="ml-auto text-gray-300 group-hover:text-cyan-400 transition-colors" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        <p className="mt-8 text-center text-[11px] text-gray-400">
          Butuh bantuan?{" "}
          <Link href="/sekolah/contact">
            <span className="text-indigo-500 cursor-pointer hover:underline font-semibold">
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
    <div className="relative flex min-h-screen items-center justify-center p-4 md:p-8 font-sans overflow-hidden bg-[#f8fafc]">
      <Bg />

      <div className="relative z-10 w-full max-w-[850px]">
        {step === "choice" && (
          <div className="animate-in fade-in duration-300">
            <motion.div 
              initial={{ clipPath: "inset(0 49.8% 0 49.8%)", opacity: 0 }}
              animate={{ 
                clipPath: ["inset(0 49.8% 0 49.8%)", "inset(0 49.8% 0 49.8%)", "inset(0 0% 0 0%)"], 
                opacity: [0, 1, 1] 
              }}
              transition={{ duration: 1.2, times: [0, 0.3, 1], ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden rounded-2xl shadow-2xl shadow-indigo-500/10 border border-white/60 bg-white/80 backdrop-blur-sm"
            >


              <SplitChoiceStep onProceed={handleProceed} />
            </motion.div>
          </div>
        )}

        {step === "form" && role && (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-400">
            <div className="flex w-full overflow-hidden rounded-2xl shadow-2xl shadow-indigo-500/10 border border-white/60 bg-white/80 backdrop-blur-sm min-h-[500px]">
              <div className="relative hidden md:flex md:w-1/2 flex-col overflow-hidden self-stretch">
                <AnimatedScene />
              </div>

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