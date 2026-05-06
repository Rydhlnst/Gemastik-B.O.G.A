import { LandingNavbar } from "@/components/landing/LandingNavbar";
import Link from "next/link";
import { ArrowRight, Mail, MessageSquare, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black">
      <LandingNavbar />
      <main className="min-h-svh bg-black text-white">
        <section className="relative overflow-hidden px-4 pb-16 pt-32 md:px-6 md:pb-24">
          <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_20%_15%,rgba(29,78,216,0.28),transparent_60%),radial-gradient(880px_560px_at_80%_55%,rgba(14,165,233,0.14),transparent_60%)]" />
          <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:18px_18px]" />

          <div className="relative mx-auto max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
              B.O.G.A • Support
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
              Butuh bantuan operasional?
            </h1>
            <p className="mt-4 text-base text-white/70">
              Hubungi tim untuk kendala akses, verifikasi, atau masalah proses (pengadaan, logistik,
              penerimaan sekolah).
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Phone, label: "Hotline", value: "1-500-BOGA" },
                { icon: MessageSquare, label: "WhatsApp", value: "+62 811 2345 6789" },
                { icon: Mail, label: "Email", value: "support@boga.id" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur"
                >
                  <item.icon className="size-5 text-white/80" />
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Masuk <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Kembali ke landing <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

