"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { AnimatedScene } from "@/components/ui/animatedbg";
import BlurText from "@/components/ui/BlurText";
import CountUp from "@/components/ui/CountUp";
import { MapPin, Zap, Link2, BarChart3 } from "lucide-react";

const SchoolMap = dynamic(() => import("@/components/ui/SchoolMap"), { ssr: false });

// ── ANIMATED STAT ──
function AnimatedStat({ value, label }: { value: string; label: string }) {
  const hasSeparator = value.includes(".");
  const hasSuffix = value.includes("%");
  const numeric = parseInt(value.replace(/\./g, "").replace("%", ""), 10);
  const suffix = hasSuffix ? "%" : "";

  return (
    <div className="text-center">
      <p className="font-serif text-base md:text-lg font-extrabold text-gray-800 m-0 tabular-nums">
        <CountUp
          to={numeric}
          from={0}
          direction="up"
          duration={2}
          delay={0.2}
          separator={hasSeparator ? "." : ""}
        />
        {suffix}
      </p>
      <p className="text-[10px] md:text-[11px] text-gray-500 mt-1 m-0">{label}</p>
    </div>
  );
}

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = ["/mbg1.png", "/mbg2.png", "/mbg3.png", "/mbg4.png"];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="w-full min-h-screen bg-gray-50">

      {/* ── HERO ── */}
      <section className="w-full bg-white border-b border-indigo-500/10 -mt-10">
        <div className="w-full px-6 py-8 md:px-16 md:pt-16 md:pb-0 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-10 box-border">

          {/* Left: text */}
          <div className="w-full md:w-[440px] md:flex-none pb-4 md:pb-16 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-5">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
              <span className="text-[11px] font-bold tracking-widest uppercase text-indigo-500">
                Supply Chain MBG 
              </span>
            </div>
            <h1 className="font-sans text-3xl md:text-[2.8rem] font-extrabold leading-tight text-[#0a0e1a] mb-2">
              End-to-End Supply{" "}
            </h1>
            <h1 className="font-sans text-3xl md:text-[2.5rem] font-extrabold leading-tight text-[#0a0e1a] mb-6 md:mb-5">
              <em className="not-italic md:italic font-extrabold text-gradient-boga">Chain Solutions</em>, Built for Scale
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed max-w-md mx-auto md:mx-0 mb-6">
              Dari sourcing hingga pengiriman final, kami membantu sekolah mendapatkan
              kontrol real-time, efisiensi, dan transparansi penuh rantai distribusi MBG.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-5 mb-6">
              {[["25%", "penghematan biaya"], ["99%", "on-time delivery"]].map(([val, lbl]) => (
                <div key={lbl} className="text-center md:text-left">
                  <span
                    className="inline-block text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-[0_4px_12px_rgba(99,102,241,0.2)]"
                    style={{ background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)" }}
                  >
                    {val}
                  </span>
                  <p className="text-xs text-gray-400 mt-1 mb-0">{lbl}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: BlurText B.O.G.A — hidden on mobile */}
          <div className="hidden md:flex w-full flex-1 mt-0 justify-end self-center pr-4">
            <div className="w-full max-w-[580px] h-[410px] flex items-center justify-center relative overflow-hidden -mt-16">
              <div className="relative z-10 text-[clamp(80px,13vw,140px)] -ml-4 -mt-6">
                <BlurText
                  text="B.O.G.A"
                  delay={150}
                  animateBy="letters"
                  direction="top"
                  stepDuration={0.4}
                  className="boga-blur-text font-extrabold tracking-tight"
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0.8; transform: scale(1.02); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
        .boga-blur-text span {
          background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* ── MAP ── */}
      <section className="w-full px-6 pt-12 pb-2 md:px-16 md:pt-12 md:pb-2 box-border">
        <div className="mb-5 text-center md:text-left">
          <p className="text-[10px] font-bold tracking-widest uppercase text-indigo-500 mb-1">Peta Distribusi</p>
          <h2 className="font-serif text-2xl md:text-[1.5rem] font-bold text-[#0a0e1a] m-0 mb-1">
            Lokasi Sekolah Penerima MBG
          </h2>
          <p className="text-[13px] text-gray-400 m-0">Klik icon sekolah untuk melihat detail dan komentar</p>
        </div>
        <div className="rounded-2xl border border-indigo-500/15 shadow-[0_4px_24px_rgba(99,102,241,0.08)] overflow-hidden bg-white min-h-[300px] md:min-h-[400px]">
          <SchoolMap />
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="w-full px-6 pt-12 md:px-16 md:pt-12 box-border">
        <div className="relative w-full rounded-2xl overflow-hidden p-6 md:p-[28px_48px] flex flex-col md:flex-row justify-around items-center gap-6 md:gap-0" style={{ minHeight: 120 }}>
          <div className="absolute inset-0 z-0"><AnimatedScene /></div>
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-indigo-900/60 to-cyan-900/40" />
          {[["6","Sekolah MBG"],["2.693","Porsi/Hari"],["99%","On-Time Delivery"],["100%","Terverifikasi"]].map(([v, l]) => {
            const hasSeparator = v.includes(".");
            const hasSuffix = v.includes("%");
            const numeric = parseInt(v.replace(/\./g, "").replace("%", ""), 10);
            const suffix = hasSuffix ? "%" : "";
            return (
              <div key={l} className="relative z-20 text-center text-white">
                <div className="font-serif text-3xl md:text-[1.8rem] font-extrabold tabular-nums">
                  <CountUp
                    to={numeric}
                    from={0}
                    direction="up"
                    duration={2}
                    delay={0.2}
                    separator={hasSeparator ? "." : ""}
                  />
                  {suffix}
                </div>
                <div className="text-xs opacity-75 mt-1">{l}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FEATURES + IMAGE ── */}
      <section className="w-full px-6 pt-12 pb-12 md:px-16 md:pt-12 md:pb-15 box-border">
        <div className="text-center md:text-left">
          <p className="text-[10px] font-bold tracking-widest uppercase text-indigo-500 mb-1">Kenapa B.O.G.A</p>
          <h2 className="font-serif text-2xl md:text-[1.5rem] font-bold text-[#0a0e1a] max-w-[480px] leading-snug mx-auto md:mx-0 mb-6">
            Dibangun untuk kompleksitas distribusi MBG modern
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">

          {/* Feature cards */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
{[
              { Icon: MapPin, title: "Visibilitas Real-Time", desc: "Pantau setiap pengiriman ke sekolah — jadwal, rute, dan status penerimaan dalam satu dashboard." },
              { Icon: Zap, title: "ETA Berbasis AI", desc: "Engine kami memprediksi keterlambatan hingga 72 jam sebelumnya agar tidak ada sekolah yang terlewat." },
              { Icon: Link2, title: "Kontrol End-to-End", desc: "Dari dapur pusat hingga penerimaan di sekolah, satu platform menghubungkan seluruh rantai distribusi." },
              { Icon: BarChart3, title: "Laporan Transparan", desc: "Setiap data pengiriman tercatat otomatis dan dapat diakses kapan saja oleh semua pemangku kepentingan." },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="bg-white border border-indigo-500/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: "linear-gradient(135deg,#ede9fe,#cffafe)" }}>
                  <Icon className="w-5 h-5 text-indigo-500" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">{title}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed m-0">{desc}</p>
              </div>
            ))}
          </div>

          {/* Image carousel */}
          <div className="w-full md:w-[420px] md:flex-none">
            <div className="w-full h-[200px] md:h-[365px] rounded-2xl relative shadow-xl border border-indigo-500/10">

              {/* Image — overflow hidden hanya di sini */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <img
                  key={currentIndex}
                  src={images[currentIndex]}
                  alt={`Tampilan Dashboard ${currentIndex + 1}`}
                  className="w-full h-full object-cover absolute top-0 left-0 animate-fade-in"
                />
              </div>

              <div className="absolute top-4 right-4 text-[10px] md:text-xs text-gray-800 font-semibold tracking-wider bg-white/85 px-3 py-1 rounded-full shadow-sm z-10">
                0{currentIndex + 1}&nbsp;&nbsp;/&nbsp;&nbsp;0{images.length}
              </div>
              {/* Stats overlay dengan CountUp */}
              <div className="absolute bottom-3 left-4 right-4 bg-white/85 border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-xl backdrop-blur-md p-3 md:p-[14px_20px] z-10">
                <div className="flex justify-around items-center">
                  {[["6","Sekolah MBG"],["2.693","Porsi/Hari"],["99%","On-Time"]].map(([v, l]) => (
                    <AnimatedStat key={l} value={v} label={l} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}