"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import type { AuthMode, Role } from "@/app/auth/login/page";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface LoginFormProps {
  className?: string;
  mode?: AuthMode;
  role?: Role;
  onModeChange?: (mode: AuthMode) => void;
  onBack?: () => void;
}

export function LoginForm({
  className,
  mode = "login",
  role,
  onModeChange,
  onBack,
}: LoginFormProps) {
  const isSignup = mode === "signup";
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role) {
      // Simulate API call delay with toast
      const loadingToast = toast.loading(isSignup ? "Membuat akun..." : "Sedang mengautentikasi...");
      
      setTimeout(() => {
        toast.dismiss(loadingToast);
        toast.success(isSignup ? "Akun berhasil dibuat!" : "Login berhasil!");
        
        // Simpan status autentikasi ke local storage
        localStorage.setItem("boga_is_auth", "true");
        localStorage.setItem("boga_user_role", role.id);

        if (role.id === "sekolah") {
          router.push("/");
        } else {
          router.push("/" + role.id);
        }
      }, 800);
    } else {
      toast.error("Terjadi kesalahan: Peran tidak ditemukan!");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex flex-col justify-center h-full p-5 md:p-7 space-y-3 bg-white w-full",
        className
      )}
    >
      {/* Back button */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="self-start inline-flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-gray-600 transition-colors -mt-1 mb-1"
        >
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Kembali
        </button>
      )}

      {/* Logo + Header */}
      <div className="flex flex-col items-center gap-1 text-center mb-1">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold mb-1 shadow-lg"
          style={{ background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)" }}
        >
          B
        </div>

        {/* Role badge */}
        {role && (
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold mb-1"
            style={{ background: role.bg, color: role.accent, border: `1px solid ${role.accent}25` }}
          >
            {role.label}
          </div>
        )}

        <h1 className="text-xl font-extrabold tracking-tight text-[#0a0e1a]">
          {isSignup ? "Buat Akun Baru" : "Selamat Datang"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isSignup ? "Daftar ke " : "Masuk ke dashboard "}
          <span className="font-bold text-indigo-600">B.O.G.A</span>
        </p>
      </div>

      {/* ── LOGIN fields ── */}
      {!isSignup && (
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="email" className="font-bold text-[10px] uppercase tracking-[0.15em] text-gray-400 ml-1">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@boga.id"
              required
              className="h-10 rounded-xl border-gray-100 bg-gray-50/50 focus-visible:ring-indigo-500 focus-visible:bg-white transition-all"
            />
          </div>

          <div className="grid gap-1.5">
            <div className="flex items-center">
              <Label htmlFor="password" className="font-bold text-[10px] uppercase tracking-[0.15em] text-gray-400 ml-1">
                Password
              </Label>
              <Link href="#" onClick={(e) => e.preventDefault()} className="ml-auto text-xs font-bold text-indigo-600 hover:text-cyan-500 transition-colors">
                Lupa password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              required
              className="h-10 rounded-xl border-gray-100 bg-gray-50/50 focus-visible:ring-indigo-500 focus-visible:bg-white transition-all"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-10 rounded-xl font-bold text-white shadow-[0_8px_16px_rgba(99,102,241,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mt-1"
            style={{ background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)" }}
          >
            Masuk Sekarang
          </Button>
        </div>
      )}

      {/* ── SIGNUP fields ── */}
      {isSignup && (
        <div className="grid gap-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="grid gap-1.5">
              <Label htmlFor="firstName" className="font-bold text-[10px] uppercase tracking-[0.15em] text-gray-400 ml-1">
                Nama Depan
              </Label>
              <Input
                id="firstName"
                placeholder="Budi"
                required
                className="h-10 rounded-xl border-gray-100 bg-gray-50/50 focus-visible:ring-indigo-500 focus-visible:bg-white transition-all"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="lastName" className="font-bold text-[10px] uppercase tracking-[0.15em] text-gray-400 ml-1">
                Nama Belakang
              </Label>
              <Input
                id="lastName"
                placeholder="Santoso"
                required
                className="h-10 rounded-xl border-gray-100 bg-gray-50/50 focus-visible:ring-indigo-500 focus-visible:bg-white transition-all"
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="emailSignup" className="font-bold text-[10px] uppercase tracking-[0.15em] text-gray-400 ml-1">
              Email Instansi
            </Label>
            <Input
              id="emailSignup"
              type="email"
              placeholder="nama@instansi.id"
              required
              className="h-10 rounded-xl border-gray-100 bg-gray-50/50 focus-visible:ring-indigo-500 focus-visible:bg-white transition-all"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="phone" className="font-bold text-[10px] uppercase tracking-[0.15em] text-gray-400 ml-1">
              No. Telepon
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+62 8xx xxxx xxxx"
              className="h-10 rounded-xl border-gray-100 bg-gray-50/50 focus-visible:ring-indigo-500 focus-visible:bg-white transition-all"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="passwordSignup" className="font-bold text-[10px] uppercase tracking-[0.15em] text-gray-400 ml-1">
              Kata Sandi
            </Label>
            <Input
              id="passwordSignup"
              type="password"
              placeholder="Min. 8 karakter"
              required
              className="h-10 rounded-xl border-gray-100 bg-gray-50/50 focus-visible:ring-indigo-500 focus-visible:bg-white transition-all"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="confirmPassword" className="font-bold text-[10px] uppercase tracking-[0.15em] text-gray-400 ml-1">
              Konfirmasi Sandi
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Ulangi kata sandi"
              required
              className="h-10 rounded-xl border-gray-100 bg-gray-50/50 focus-visible:ring-indigo-500 focus-visible:bg-white transition-all"
            />
          </div>

          {/* T&C */}
          <label className="flex items-start gap-2 cursor-pointer mt-0.5">
            <input
              type="checkbox"
              required
              className="mt-0.5 rounded accent-indigo-500 cursor-pointer shrink-0"
            />
            <span className="text-[11px] text-gray-500 leading-relaxed">
              Saya menyetujui{" "}
              <Link href="#" onClick={(e) => e.preventDefault()} className="font-bold text-indigo-600 hover:underline">
                Syarat & Ketentuan
              </Link>{" "}
              serta{" "}
              <Link href="#" onClick={(e) => e.preventDefault()} className="font-bold text-indigo-600 hover:underline">
                Kebijakan Privasi
              </Link>
            </span>
          </label>

          <Button
            type="submit"
            className="w-full h-10 rounded-xl font-bold text-white shadow-[0_8px_16px_rgba(99,102,241,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mt-1"
            style={{ background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)" }}
          >
            Buat Akun
          </Button>
        </div>
      )}

      {/* Divider */}
      {!isSignup && (
        <>
          <div className="relative my-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-gray-400">
              <span className="bg-white px-3">Atau lanjut dengan</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" type="button" className="rounded-xl h-9 border-gray-100 hover:bg-gray-50 font-semibold text-xs">
              Google
            </Button>
            <Button variant="outline" type="button" className="rounded-xl h-9 border-gray-100 hover:bg-gray-50 font-semibold text-xs">
              Apple
            </Button>
          </div>
        </>
      )}

      {/* Toggle mode */}
      <p className="text-center text-xs text-muted-foreground pt-1">
        {isSignup ? "Sudah punya akun? " : "Belum punya akun? "}
        <button
          type="button"
          onClick={() => onModeChange?.(isSignup ? "login" : "signup")}
          className="font-bold text-indigo-600 hover:underline"
        >
          {isSignup ? "Masuk di sini" : "Daftar sekarang"}
        </button>
      </p>
    </form>
  );
}