"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  ShieldCheck,
  Lock,
  MapPinned,
  BadgeCheck,
  ArrowRight,
} from "lucide-react";

const PHASES = [
  { title: "Phase 0", label: "Onboarding & Verifikasi", detail: "OCR + forensik dokumen, final approval pemerintah." },
  { title: "Phase 1", label: "Pengadaan & Escrow Lock", detail: "PO tervalidasi HET, dana terkunci, hash tercatat." },
  { title: "Phase 2", label: "Logistik & Multi‑Sig", detail: "3/3 tanda tangan, QC gate, anomali terdeteksi." },
  { title: "Phase 3", label: "Penerimaan Sekolah", detail: "Geofencing 50m + anti replay scan untuk konfirmasi." },
  { title: "Phase 4", label: "Evaluasi & Reputasi", detail: "Skor siswa → Keran 2 + SBT sebagai reputasi permanen." },
];

const FLOW_PHASES = [
  {
    title: "Phase 0",
    label: "Onboarding & Verifikasi",
    detail: "Pilih role, login, lalu proses verifikasi & approval (demo).",
    href: "/auth/login",
  },
  {
    title: "Phase 1",
    label: "Pengadaan & Escrow Lock",
    detail: "SPPG buat PO + bidding vendor, lalu lock escrow (simulasi).",
    href: "/sppg/dashboard",
  },
  {
    title: "Phase 2",
    label: "Logistik & Validasi",
    detail: "Pantau rute + scan QR manifest di proses pickup/delivery (demo).",
    href: "/logistik/dashboard",
  },
  {
    title: "Phase 3",
    label: "Penerimaan Sekolah",
    detail: "Sekolah scan manifest untuk konfirmasi penerimaan (demo).",
    href: "/sekolah/admin",
  },
  {
    title: "Phase 4",
    label: "Evaluasi & Reputasi",
    detail: "Ranking, performa, dan feedback siswa untuk reputasi vendor/SPPG.",
    href: "/sekolah/siswa",
  },
] as const;

const TRUST = [
  { icon: Lock, title: "Escrow", desc: "Dana ditahan sampai kondisi terpenuhi, bukan asumsi." },
  { icon: ShieldCheck, title: "Multi‑Sig", desc: "Keputusan penting butuh 3 peran, bukan satu klik." },
  { icon: MapPinned, title: "Geofencing", desc: "Scan hanya valid pada radius lokasi yang benar." },
  { icon: BadgeCheck, title: "SBT", desc: "Reputasi terikat identitas—persisten, audit‑friendly." },
];

const ROLE_GATEWAYS = [
  { label: "Pemerintah", href: "/goverment/dashboard", accent: "from-[#B45309] to-[#78350F]" },
  { label: "Vendor", href: "/vendor/dashboard", accent: "from-[#064E3B] to-[#065F46]" },
  { label: "SPPG", href: "/sppg/dashboard", accent: "from-[#9A3412] to-[#7C2D12]" },
  { label: "Logistik", href: "/logistik/dashboard", accent: "from-[#0E7490] to-[#155E75]" },
  { label: "Sekolah", href: "/sekolah/admin", accent: "from-[#1E3A8A] to-[#1D4ED8]" },
];

export default function Home() {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.02, 1]);

  return (
    <div className="bg-black text-white">
      <section id="home" ref={heroRef} className="relative min-h-svh overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{ y: imageY, scale: imageScale }}
          aria-hidden
        >
          <Image
            src="/mbg3.png"
            alt="Distribusi MBG"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </motion.div>

        <div className="absolute inset-0 bg-[radial-gradient(1200px_620px_at_20%_10%,rgba(255,255,255,0.18),transparent_55%),linear-gradient(to_bottom,rgba(0,0,0,0.55),rgba(0,0,0,0.78))]" />
        <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:18px_18px]" />

        <div className="relative mx-auto flex min-h-svh max-w-6xl flex-col justify-end px-4 pb-12 pt-20 md:px-6 md:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.2, 0, 0.2, 1] }}
            className="max-w-3xl"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              B.O.G.A • MBG Operations Ledger
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
              Distribusi MBG yang rapi, terukur, dan siap diaudit.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
              Satu alur operasional lintas peran: pengadaan, escrow, logistik, penerimaan sekolah,
              hingga evaluasi—semua dengan guardrail yang jelas.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Masuk
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="#how"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Lihat alur
              </a>
            </div>
          </motion.div>

          <div className="mt-10 grid gap-2 border-t border-white/15 pt-6 md:grid-cols-3">
            {[
              ["Transparansi", "Audit trail dari PO sampai delivery."],
              ["Ketertiban Proses", "Gate + role-based verification."],
              ["Keputusan Cepat", "Signal operasional yang ringkas."],
            ].map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-4">
                <p className="text-sm font-semibold">{k}</p>
                <p className="text-sm text-white/65">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="bg-white text-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
          <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                How it works
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                Phase-based, bukan “dashboard penuh kartu”.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
                Setiap phase punya satu tujuan, satu bukti, dan satu status yang mudah dibaca.
              </p>
            </div>

            <ol className="divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white">
              {FLOW_PHASES.map((p) => (
                <li key={p.title} className="px-5 py-5 md:px-6">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {p.title}
                    </p>
                    <p className="text-sm font-semibold text-slate-900">{p.label}</p>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.detail}</p>
                  <div className="mt-4">
                    <Link
                      href={p.href}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition hover:translate-x-0.5"
                    >
                      Buka modul <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section id="primitives" className="bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
          <div className="flex items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                Trust primitives
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                Guardrail yang terasa di operasi harian.
              </h2>
            </div>
            <p className="hidden max-w-sm text-sm text-white/60 md:block">
              Dibuat untuk operator: status jelas, aksi jelas, log jelas.
            </p>
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-4">
            {TRUST.map((t) => (
              <div
                key={t.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur"
              >
                <t.icon className="size-5 text-white/80" />
                <p className="mt-3 text-sm font-semibold">{t.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="roles" className="bg-white text-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Role gateways
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                Masuk sesuai peran, kerja sesuai SOP.
              </h2>
            </div>
            <p className="max-w-md text-sm text-slate-600">
              Tiap portal punya tone dan aksen sendiri, tapi pola layout sama: orientasi → status → aksi.
            </p>
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-5">
            {ROLE_GATEWAYS.map((r) => (
              <motion.a
                key={r.label}
                href={r.href}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.18 }}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-4"
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${r.accent}`}
                  aria-hidden
                />
                <p className="text-sm font-semibold">{r.label}</p>
                <p className="mt-2 text-sm text-slate-600">
                  Buka dashboard
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                  Mulai
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </motion.a>
            ))}
          </div>

          <div className="mt-12 rounded-3xl border border-slate-200 bg-slate-50 p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold">Perlu akses demo cepat?</p>
                <p className="mt-1 text-sm text-slate-600">
                  Login sebagai role yang tersedia, lalu eksplor dashboard berdasarkan alur phase.
                </p>
              </div>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Masuk sekarang
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
