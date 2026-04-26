"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  Gavel,
  Plus,
  Search,
  Settings2,
} from "lucide-react";

import { getTenderSppg, type TenderWeights } from "@/lib/bidding";
import { createTender, useBiddingSnapshot } from "@/lib/bidding-store";
import { sppgList } from "@/lib/mbgdummydata";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/ui/dashboard-shell";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

function formatDate(dateIso: string) {
  return new Date(dateIso).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function SppgBiddingPage() {
  const snapshot = useBiddingSnapshot();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "OPEN" | "AWARDED" | "CLOSED"
  >("ALL");
  const [selectedSppgId, setSelectedSppgId] = useState<number>(
    sppgList[0]?.id ?? 1
  );
  const [createOpen, setCreateOpen] = useState(false);

  const [draftTitle, setDraftTitle] = useState("Tender Vendor MBG");
  const [draftCategory, setDraftCategory] = useState("Katering");
  const [draftQuantity, setDraftQuantity] = useState("12000");
  const [draftUnit, setDraftUnit] = useState("porsi");
  const [draftDeadline, setDraftDeadline] = useState("2026-05-05");
  const [draftWeights, setDraftWeights] = useState<{
    price: number;
    quality: number;
    distance: number;
  }>({
    price: 50,
    quality: 35,
    distance: 15,
  });

  const tenders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return snapshot.tenders
      .filter((t) => t.sppgId === selectedSppgId)
      .filter((t) => (statusFilter === "ALL" ? true : t.status === statusFilter))
      .filter((t) => {
        if (!q) return true;
        return (
          t.id.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
        );
      });
  }, [query, selectedSppgId, snapshot.tenders, statusFilter]);

  function normalizeWeights(weights: {
    price: number;
    quality: number;
    distance: number;
  }): TenderWeights {
    const p = Math.max(0, weights.price);
    const q = Math.max(0, weights.quality);
    const d = Math.max(0, weights.distance);
    const sum = p + q + d || 1;
    return { price: p / sum, quality: q / sum, distance: d / sum };
  }

  return (
    <DashboardShell
      badge={<Badge variant="outline">SPPG</Badge>}
      title="Bidding Vendor"
      description="Pilih vendor berdasarkan harga, kualitas, jarak, dan bobot penilaian."
      actions={
        <>
          <Button variant="outline" asChild className="rounded-full">
            <Link href="/sppg/dashboard">
              Kembali <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
          <Button className="rounded-full" onClick={() => setCreateOpen(true)}>
            <Plus data-icon="inline-start" />
            Buat Tender
          </Button>
        </>
      }
    >
      <section className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="rounded-3xl border border-border/70 bg-background/70">
          <div className="flex flex-col gap-3 border-b border-border/60 p-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-tight">Daftar tender</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Buat tender, terima bid, lalu tetapkan pemenang.
              </p>
            </div>

            <div className="grid w-full gap-2 sm:max-w-xl sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sppg" className="text-xs text-muted-foreground">
                  SPPG aktif (demo)
                </Label>
                <select
                  id="sppg"
                  value={String(selectedSppgId)}
                  onChange={(e) => setSelectedSppgId(Number(e.target.value))}
                  className="h-10 w-full rounded-2xl border border-input bg-background px-3 text-sm"
                >
                  {sppgList.map((s) => (
                    <option key={s.id} value={String(s.id)}>
                      {s.nama}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="search" className="text-xs text-muted-foreground">
                  Cari
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="ID, judul, kategori..."
                    className="h-10 rounded-2xl pl-9"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="divide-y divide-border/60">
            {tenders.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">
                Belum ada tender untuk SPPG ini.
              </div>
            ) : (
              tenders.map((tender) => {
                const sppg = getTenderSppg(tender);
                const bidCount = snapshot.bids.filter(
                  (b) => b.tenderId === tender.id
                ).length;
                return (
                  <Link
                    key={tender.id}
                    href={`/sppg/bidding/${tender.id}`}
                    className="group block p-5 transition hover:bg-muted/15"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-muted-foreground">
                          {tender.id}
                        </p>
                        <p className="mt-1 truncate text-base font-semibold tracking-tight">
                          {tender.title}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {sppg
                            ? `${sppg.nama} • ${sppg.kecamatan}, ${sppg.kota}`
                            : `SPPG #${tender.sppgId}`}
                        </p>
                      </div>
                      <Badge
                        className="rounded-full"
                        variant={tender.status === "OPEN" ? "default" : "secondary"}
                      >
                        {tender.status}
                      </Badge>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock className="size-3" /> {formatDate(tender.deadline)}
                        </span>
                        <span>•</span>
                        <span className="tabular-nums">
                          {tender.quantity.toLocaleString("id-ID")} {tender.unit}
                        </span>
                        <span>•</span>
                        <span>{tender.category}</span>
                        <span>•</span>
                        <span className="tabular-nums">{bidCount} bid</span>
                      </div>

                      <div className="inline-flex items-center gap-2 text-sm font-semibold">
                        Buka workspace <Gavel className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        <aside className="rounded-3xl border border-border/70 bg-background/70 p-5">
          <p className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <Settings2 className="size-4 text-muted-foreground" /> Filter
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Fokuskan list ke status tertentu.
          </p>

          <Separator className="my-4" />

          <div className="space-y-2">
            <Label htmlFor="status" className="text-xs text-muted-foreground">
              Status
            </Label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="h-10 w-full rounded-2xl border border-input bg-background px-3 text-sm"
            >
              <option value="ALL">Semua</option>
              <option value="OPEN">OPEN</option>
              <option value="AWARDED">AWARDED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
        </aside>
      </section>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Buat tender baru</DialogTitle>
            <DialogDescription>
              Tender ini akan muncul di portal vendor untuk menerima penawaran.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title" className="text-xs text-muted-foreground">
                Judul
              </Label>
              <Input
                id="title"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                className="h-10 rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-xs text-muted-foreground">
                Kategori
              </Label>
              <Input
                id="category"
                value={draftCategory}
                onChange={(e) => setDraftCategory(e.target.value)}
                className="h-10 rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline" className="text-xs text-muted-foreground">
                Deadline
              </Label>
              <Input
                id="deadline"
                type="date"
                value={draftDeadline}
                onChange={(e) => setDraftDeadline(e.target.value)}
                className="h-10 rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qty" className="text-xs text-muted-foreground">
                Kuantitas
              </Label>
              <Input
                id="qty"
                inputMode="numeric"
                value={draftQuantity}
                onChange={(e) => setDraftQuantity(e.target.value)}
                className="h-10 rounded-2xl tabular-nums"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit" className="text-xs text-muted-foreground">
                Unit
              </Label>
              <Input
                id="unit"
                value={draftUnit}
                onChange={(e) => setDraftUnit(e.target.value)}
                className="h-10 rounded-2xl"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs text-muted-foreground">
                Bobot penilaian (%, demo)
              </Label>
              <div className="grid gap-3 sm:grid-cols-3">
                {(
                  [
                    ["price", "Harga"],
                    ["quality", "Kualitas"],
                    ["distance", "Jarak"],
                  ] as const
                ).map(([key, label]) => (
                  <div
                    key={key}
                    className="rounded-2xl border border-border/70 bg-muted/20 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold">{label}</p>
                      <p className="text-xs font-semibold tabular-nums">
                        {draftWeights[key]}%
                      </p>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={draftWeights[key]}
                      onChange={(e) =>
                        setDraftWeights((prev) => ({
                          ...prev,
                          [key]: Number(e.target.value),
                        }))
                      }
                      className="mt-2 w-full"
                    />
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Sistem akan menormalisasi bobot (tidak harus pas 100%).
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setCreateOpen(false)}
            >
              Batal
            </Button>
            <Button
              className="rounded-full"
              onClick={() => {
                const weights = normalizeWeights(draftWeights);
                const tender = createTender({
                  sppgId: selectedSppgId,
                  title: draftTitle.trim() || "Tender Vendor MBG",
                  category: draftCategory.trim() || "Katering",
                  quantity: Number(draftQuantity) || 0,
                  unit: draftUnit.trim() || "porsi",
                  deadline: draftDeadline || new Date().toISOString().slice(0, 10),
                  weights,
                });
                setCreateOpen(false);
                window.location.href = `/sppg/bidding/${tender.id}`;
              }}
            >
              Buat & buka
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}

