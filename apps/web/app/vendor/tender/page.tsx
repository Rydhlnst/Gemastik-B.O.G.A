"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Search, Sparkles, Star } from "lucide-react";

import { tenderMaterials } from "@/lib/mbgdummydata";

const MATERIAL_TYPES = [...new Set(tenderMaterials.map((m) => m.type))];

function currency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function TenderPage() {
  const [budget, setBudget] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);

  const filteredResults = useMemo(() => {
    let filtered = [...tenderMaterials];
    if (selectedMaterial) filtered = filtered.filter((m) => m.type === selectedMaterial);
    if (budget) filtered = filtered.filter((m) => m.price <= Number(budget));

    return filtered.sort((a, b) =>
      a.price !== b.price ? a.price - b.price : b.rating - a.rating
    );
  }, [budget, selectedMaterial]);

  useMemo(() => {
    setVisibleCount(6);
  }, [budget, selectedMaterial]);

  return (
    <div className="min-h-svh bg-background text-foreground selection:bg-primary/20">
      <section className="p-4 pt-8 md:p-10 md:pt-16">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Vendor • Bidding bahan
            </p>
            <h1 className="text-3xl font-semibold leading-[1.02] tracking-tight sm:text-4xl md:text-6xl">
              Pangan lebih <span className="text-primary">presisi</span>, biaya lebih{" "}
              <span className="text-primary">terkendali</span>.
            </h1>
            <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground md:text-lg">
              Filter cepat untuk memilih bahan baku berdasarkan anggaran dan kategori, lalu
              bandingkan opsi terbaik berdasarkan harga dan rating.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-surface p-6 shadow-card md:rounded-[2.5rem] md:p-10">
            <div className="absolute inset-x-0 top-0 h-1.5 role-accent-bar" aria-hidden />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Anggaran (IDR)
                </label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="contoh: 50.000.000"
                  className="h-12 w-full rounded-2xl border border-border bg-surface-raised px-5 text-base font-medium text-foreground outline-none transition focus:ring-2 focus:ring-ring/35 md:h-14 md:text-lg"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Kategori pangan
                </label>
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="h-12 w-full appearance-none rounded-2xl border border-border bg-surface-raised px-5 text-base font-medium text-foreground outline-none transition focus:ring-2 focus:ring-ring/35 md:h-14 md:text-lg"
                >
                  <option value="">Semua kategori</option>
                  {MATERIAL_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border bg-surface-raised p-4 text-xs font-medium text-foreground md:mt-8 md:gap-4 md:text-sm">
              <Sparkles className="size-4 shrink-0 text-primary md:size-5" />
              <span>
                AI menyarankan: <strong>Daging Sapi & Beras Premium</strong> paling banyak dicari
                penyedia sekolah.
              </span>
            </div>

            <button className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-role-primary text-base font-semibold tracking-tight text-primary-foreground transition hover:bg-role-primary-hover md:mt-8 md:h-16 md:text-lg">
              <Search className="size-5" /> Cari bahan pangan
            </button>
          </div>

          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h3 className="text-xl font-semibold md:text-2xl">
                  {filteredResults.length} material ditemukan
                </h3>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/80 md:hidden">
                  Geser untuk melihat lainnya →
                </p>
              </div>
              <p className="hidden text-xs font-semibold uppercase tracking-widest text-muted-foreground/80 md:block">
                Sort: harga (ASC) & rating (DESC)
              </p>
            </div>

            <div className="md:hidden">
              <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 no-scrollbar">
                {filteredResults.map((m, i) => (
                  <div
                    key={m.id}
                    className="min-w-[85vw] snap-center overflow-hidden rounded-3xl border border-border bg-surface shadow-card"
                  >
                    <div className="relative p-6">
                      <div className="absolute right-4 top-4 flex size-7 items-center justify-center rounded-full bg-role-primary font-mono text-xs font-semibold text-primary-foreground">
                        {i + 1}
                      </div>
                      <p className="inline-flex rounded-full border border-border bg-surface-raised px-2.5 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Recommended
                      </p>
                      <div className="mt-4">
                        <p className="truncate text-lg font-semibold leading-tight">{m.name}</p>
                        <p className="mt-1 text-xs font-medium text-muted-foreground">
                          {m.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-border bg-surface-raised px-6 py-4">
                      <div>
                        <p className="text-xl font-semibold text-primary">{currency(m.price)}</p>
                        <p className="text-xs font-semibold uppercase text-muted-foreground">
                          {m.reviews} ulasan
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{m.rating}</p>
                        <div className="flex justify-end gap-0.5 text-amber-500">
                          {[...Array(5)].map((_, j) => (
                            <Star
                              key={j}
                              className={`size-3 ${
                                j < Math.floor(m.rating)
                                  ? "fill-current"
                                  : "text-amber-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden md:block space-y-8">
              <div className="grid gap-6 md:grid-cols-3">
                {filteredResults.slice(0, visibleCount).map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="group relative overflow-hidden rounded-3xl border border-border bg-surface shadow-card transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-role-primary font-mono text-xs font-semibold text-primary-foreground">
                      {i + 1}
                    </div>
                    <div className="p-8 pb-5">
                      <p className="inline-flex rounded-full border border-border bg-surface-raised px-2.5 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Best value
                      </p>
                      <div className="mt-4">
                        <p className="text-xl font-semibold leading-tight transition-colors group-hover:text-primary">
                          {m.name}
                        </p>
                        <p className="mt-1 text-xs font-medium text-muted-foreground">
                          {m.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-border bg-surface-raised px-8 py-6 transition-colors group-hover:bg-muted/20">
                      <div>
                        <p className="text-2xl font-semibold text-primary">{currency(m.price)}</p>
                        <p className="text-xs font-semibold uppercase text-muted-foreground">
                          {m.reviews} ulasan
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-semibold">{m.rating}</p>
                        <div className="flex justify-end gap-0.5 text-amber-500">
                          {[...Array(5)].map((_, j) => (
                            <Star
                              key={j}
                              className={`size-3 ${
                                j < Math.floor(m.rating)
                                  ? "fill-current"
                                  : "text-amber-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredResults.length > visibleCount && (
                <div className="flex items-center justify-center gap-4">
                  <div className="h-px w-24 bg-border" />
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 6)}
                    className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-8 py-3 text-sm font-semibold shadow-sm transition hover:bg-muted/20 active:scale-95"
                  >
                    Lihat hasil berikutnya <ArrowRight className="size-4" />
                  </button>
                  <div className="h-px w-24 bg-border" />
                </div>
              )}
            </div>

            {filteredResults.length === 0 && (
              <div className="rounded-[2.5rem] border border-dashed border-border py-20 text-center text-sm font-medium text-muted-foreground">
                Maaf, tidak ada material yang sesuai dengan anggaran dan kategori Anda.
              </div>
            )}
          </div>
        </div>
      </section>

      <Link
        href="/vendor/dashboard"
        className="fixed bottom-6 right-6 z-[1000] flex items-center gap-2 overflow-hidden rounded-2xl border border-border bg-surface p-3 shadow-lg transition-all hover:pr-8 md:bottom-10 md:right-10 md:gap-3 md:p-4"
      >
        <div className="rounded-xl bg-role-primary p-2 transition-all group-hover:rotate-[-10deg]">
          <ArrowRight className="size-5 rotate-180 text-white" />
        </div>
        <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-widest text-foreground">
          Dashboard
        </span>
      </Link>
    </div>
  );
}
