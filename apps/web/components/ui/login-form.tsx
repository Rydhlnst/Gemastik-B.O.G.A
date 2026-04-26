"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import type { AuthMode, Role } from "@/app/auth/login/page";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-browser-client";

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
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDev = process.env.NODE_ENV === "development";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailSignup, setEmailSignup] = useState("");
  const [phone, setPhone] = useState("");
  const [passwordSignup, setPasswordSignup] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const redirectByRole: Record<string, string> = {
    sekolah: "/sekolah/admin",
    goverment: "/goverment/dashboard",
    sppg: "/sppg/dashboard",
    vendor: "/vendor/dashboard",
    logistik: "/logistik/dashboard",
  };

  type AppRole = "admin" | "sppg" | "logistik" | "sekolah" | "vendor";

  const safeNext = useMemo(() => {
    const next = searchParams.get("next");
    if (!next) return null;
    if (!next.startsWith("/")) return null;
    if (next.startsWith("//")) return null;
    if (next.includes("://")) return null;
    return next;
  }, [searchParams]);

  const requiredRoleForPath = (pathname: string): AppRole | null => {
    if (pathname.startsWith("/goverment")) return "admin";
    if (pathname.startsWith("/vendor")) return "vendor";
    if (pathname.startsWith("/supplier")) return "sppg";
    if (pathname.startsWith("/logistik")) return "logistik";
    if (pathname.startsWith("/sekolah")) return "sekolah";
    return null;
  };

  const dashboardHrefByRole = (appRole: string): string => {
    if (appRole === "admin") return "/goverment/dashboard";
    if (appRole === "sppg") return "/sppg/dashboard";
    if (appRole === "logistik") return "/logistik/dashboard";
    if (appRole === "sekolah") return "/sekolah/admin";
    if (appRole === "vendor") return "/vendor/dashboard";
    return "/";
  };

  const appRoleFromUiRoleId = (uiRoleId: string): AppRole | null => {
    if (uiRoleId === "goverment") return "admin";
    if (uiRoleId === "vendor") return "vendor";
    if (uiRoleId === "sppg") return "sppg";
    if (uiRoleId === "logistik") return "logistik";
    if (uiRoleId === "sekolah") return "sekolah";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      toast.error("Terjadi kesalahan: Peran tidak ditemukan!");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    const loadingToast = toast.loading(
      isSignup ? "Membuat akun..." : "Sedang mengautentikasi..."
    );

    try {
      if (isSignup) {
        toast.dismiss(loadingToast);
        toast.error("Registrasi belum dihubungkan ke service auth.");
        return;
      }

      const emailTrimmed = email.trim();
      const uiRoleAsAppRole = appRoleFromUiRoleId(role.id) ?? "";

      let signedInRole = "";
      let isDemoMode = false;

      if (isDev) {
        signedInRole = uiRoleAsAppRole;
        isDemoMode = true;
      } else {
        if (!emailTrimmed || !password) {
          throw new Error("Email dan password wajib diisi.");
        }
      }

      try {
        if (!isDev) {
          const result = await authClient.signIn.email({
            email: emailTrimmed,
            password,
            rememberMe: true,
          });

          if (result.error) {
            throw new Error(result.error.message || "Login gagal.");
          }

          signedInRole =
            (result.data?.user as { appRole?: string } | undefined)?.appRole ?? "";
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        const canFallbackToDemo =
          message.toLowerCase().includes("failed to fetch") ||
          message.toLowerCase().includes("fetch") ||
          message.toLowerCase().includes("network") ||
          message.toLowerCase().includes("not found") ||
          message.toLowerCase().includes("no such table") ||
          message.toLowerCase().includes("response server") ||
          message.toLowerCase().includes("tidak dapat") ||
          message.toLowerCase().includes("gagal memanggil");

        if (!canFallbackToDemo) {
          throw error instanceof Error ? error : new Error("Login gagal.");
        }

        isDemoMode = true;
        signedInRole = uiRoleAsAppRole;
      }

      localStorage.setItem("boga_is_auth", "true");
      localStorage.setItem("boga_user_role", signedInRole || role.id);
      document.cookie = `boga_is_auth=true; path=/`;
      document.cookie = `boga_user_role=${encodeURIComponent(signedInRole || role.id)}; path=/`;

      toast.dismiss(loadingToast);
      toast.success("Login berhasil!");
      if (isDemoMode) {
        toast.message("Auth service belum siap, masuk demo mode.");
      }

      const nextRequiredRole = safeNext ? requiredRoleForPath(safeNext) : null;
      const canUseNext = safeNext && (!nextRequiredRole || nextRequiredRole === signedInRole);

      const target =
        (canUseNext ? safeNext : null) ??
        (signedInRole ? dashboardHrefByRole(signedInRole) : null) ??
        redirectByRole[role.id] ??
        `/${role.id}/dashboard`;

      window.location.href = target;
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat login.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex flex-col justify-center h-full p-5 md:p-7 space-y-3 bg-background w-full",
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
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary text-primary-foreground text-lg font-bold mb-1 shadow-lg shadow-black/10">
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

        <h1 className="text-xl font-extrabold tracking-tight text-foreground">
          {isSignup ? "Buat Akun Baru" : "Masuk"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {role ? (
            <>
              {isSignup ? "Daftar sebagai " : "Masuk sebagai "}
              <span className="font-bold" style={{ color: role.accent }}>
                {role.label}
              </span>
            </>
          ) : (
            <>
              {isSignup ? "Daftar ke " : "Masuk ke "}
              <span className="font-bold text-primary">B.O.G.A</span>
            </>
          )}
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
              className="h-10 rounded-xl border-border/70 bg-muted/20 focus-visible:ring-ring focus-visible:bg-background transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-1.5">
            <div className="flex items-center">
              <Label htmlFor="password" className="font-bold text-[10px] uppercase tracking-[0.15em] text-gray-400 ml-1">
                Password
              </Label>
              <Link href="#" onClick={(e) => e.preventDefault()} className="ml-auto text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                Lupa password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              className="h-10 rounded-xl border-border/70 bg-muted/20 focus-visible:ring-ring focus-visible:bg-background transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={isSubmitting}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-10 rounded-xl font-bold text-primary-foreground bg-primary shadow-lg shadow-black/10 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mt-1"
            disabled={isSubmitting}
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
                className="h-10 rounded-xl border-border/70 bg-muted/20 focus-visible:ring-ring focus-visible:bg-background transition-all"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="lastName" className="font-bold text-[10px] uppercase tracking-[0.15em] text-gray-400 ml-1">
                Nama Belakang
              </Label>
              <Input
                id="lastName"
                placeholder="Santoso"
                className="h-10 rounded-xl border-border/70 bg-muted/20 focus-visible:ring-ring focus-visible:bg-background transition-all"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                disabled={isSubmitting}
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
              className="h-10 rounded-xl border-border/70 bg-muted/20 focus-visible:ring-ring focus-visible:bg-background transition-all"
              value={emailSignup}
              onChange={(e) => setEmailSignup(e.target.value)}
              autoComplete="email"
              disabled={isSubmitting}
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
              className="h-10 rounded-xl border-border/70 bg-muted/20 focus-visible:ring-ring focus-visible:bg-background transition-all"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              disabled={isSubmitting}
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
              className="h-10 rounded-xl border-border/70 bg-muted/20 focus-visible:ring-ring focus-visible:bg-background transition-all"
              value={passwordSignup}
              onChange={(e) => setPasswordSignup(e.target.value)}
              autoComplete="new-password"
              disabled={isSubmitting}
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
              className="h-10 rounded-xl border-border/70 bg-muted/20 focus-visible:ring-ring focus-visible:bg-background transition-all"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              disabled={isSubmitting}
            />
          </div>

          {/* T&C */}
          <label className="flex items-start gap-2 cursor-pointer mt-0.5">
            <input
              type="checkbox"
              className="mt-0.5 rounded accent-[hsl(var(--primary))] cursor-pointer shrink-0"
            />
            <span className="text-[11px] text-gray-500 leading-relaxed">
              Saya menyetujui{" "}
              <Link href="#" onClick={(e) => e.preventDefault()} className="font-bold text-primary hover:underline">
                Syarat & Ketentuan
              </Link>{" "}
              serta{" "}
              <Link href="#" onClick={(e) => e.preventDefault()} className="font-bold text-primary hover:underline">
                Kebijakan Privasi
              </Link>
            </span>
          </label>

          <Button
            type="submit"
            className="w-full h-10 rounded-xl font-bold text-primary-foreground bg-primary shadow-lg shadow-black/10 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mt-1"
            disabled={isSubmitting}
          >
            Buat Akun
          </Button>
        </div>
      )}

      {/* Toggle mode */}
      <p className="text-center text-xs text-muted-foreground pt-1">
        {isSignup ? "Sudah punya akun? " : "Belum punya akun? "}
        <button
          type="button"
          onClick={() => onModeChange?.(isSignup ? "login" : "signup")}
          className="font-bold text-primary hover:underline"
        >
          {isSignup ? "Masuk di sini" : "Daftar sekarang"}
        </button>
      </p>
    </form>
  );
}
