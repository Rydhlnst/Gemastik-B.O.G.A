"use client";

import {
  Shield,
  CheckCircle,
  BarChart3,
  Lock,
  Zap,
  ScanLine,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const badges = [
  {
    icon: Shield,
    label: "Transparansi",
    description:
      "Semua data transaksi dapat diakses secara terbuka oleh pihak berwenang untuk audit kapan saja.",
  },
  {
    icon: CheckCircle,
    label: "Audit trail dari PO sampai delivery",
    description:
      "Rekam jejak digital lengkap dari tahap pemesanan hingga barang diterima di tangan sekolah.",
  },
  {
    icon: BarChart3,
    label: "Ketertiban Proses",
    description:
      "Memastikan setiap langkah operasional berjalan sesuai dengan SOP dan standar yang ditetapkan.",
  },
  {
    icon: Lock,
    label: "Gate + role-based verification",
    description:
      "Akses data dan verifikasi yang ketat berdasarkan peran pengguna untuk keamanan maksimal.",
  },
  {
    icon: Zap,
    label: "Keputusan Cepat",
    description:
      "Dashboard analitik real-time membantu pengambilan keputusan operasional yang instan dan akurat.",
  },
  {
    icon: ScanLine,
    label: "Signal operasional yang ringkas",
    description:
      "Indikator status yang mudah dipahami untuk memantau kesehatan operasional secara harian.",
  },
];

function BadgeItem({
  icon: Icon,
  label,
  description,
}: {
  icon: any;
  label: string;
  description: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex items-center gap-2.5 bg-white border border-[#E2E8F0] rounded-full px-5 py-2.5 shrink-0 cursor-pointer hover:bg-slate-50 transition-colors">
          <Icon className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
            {label}
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4 shadow-xl border-[#E2E8F0]">
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-bold text-slate-900">{label}</p>
          <p className="text-xs text-slate-600 leading-relaxed">
            {description}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function MarqueeRow({ reverse = false }: { reverse?: boolean }) {
  const items = [...badges, ...badges, ...badges, ...badges];
  return (
    <div
      className={`landing-marquee-container overflow-hidden ${reverse ? "mt-3" : ""}`}
    >
      <div
        className={`landing-marquee-track flex gap-4 ${reverse ? "animate-[marqueeReverse_40s_linear_infinite]" : "animate-[marquee_40s_linear_infinite]"}`}
        style={{ width: "max-content" }}
      >
        {items.map((badge, i) => (
          <BadgeItem
            key={`${badge.label}-${i}`}
            icon={badge.icon}
            label={badge.label}
            description={badge.description}
          />
        ))}
      </div>
    </div>
  );
}

export function TrustMarquee() {
  return (
    <section className="pt-12 md:pt-16 pb-8 md:pb-10 bg-[#FAFAF7] border-y border-[#E2E8F0]">
      <MarqueeRow />
      <MarqueeRow reverse />
    </section>
  );
}
