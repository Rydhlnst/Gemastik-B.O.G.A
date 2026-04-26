"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Gavel, Search, Send } from "lucide-react";
import { toast } from "sonner";

import { getTenderSppg } from "@/lib/bidding";
import { upsertBid, useBiddingSnapshot } from "@/lib/bidding-store";
import { vendorList } from "@/lib/mbgdummydata";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/ui/dashboard-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

function currency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function parseCsv(value: string) {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export default function VendorBiddingPage() {
  const snapshot = useBiddingSnapshot();
  const [query, setQuery] = useState("");
  const [vendorId, setVendorId] = useState<number>(vendorList[0]?.id ?? 1);

  const myBids = useMemo(() => {
    return snapshot.bids.filter((b) => b.vendorId === vendorId);
  }, [snapshot.bids, vendorId]);

  const [draftByTender, setDraftByTender] = useState<
    Record<
      string,
      {
        price: string;
        notes: string;
        certifications: string;
        capacityPerDay: string;
        leadTimeDays: string;
      }
    >
  >({});

  const tenders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return snapshot.tenders
      .filter((t) => (t.status === "OPEN" ? true : t.status === "AWARDED" || t.status === "CLOSED"))
      .filter((t) => {
        if (!q) return true;
        return (
          t.id.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
        );
      });
  }, [query, snapshot.tenders]);

  const currentVendorName = vendorList.find((v) => v.id === vendorId)?.nama ?? `Vendor ${vendorId}`;

  return (
    <DashboardShell
      badge={<Badge variant="outline">Vendor</Badge>}
      title="Tender SPPG"
      description="Cari tender dari SPPG, kirim penawaran, dan pantau status."
      actions={
        <Button variant="outline" asChild className="rounded-full">
          <Link href="/vendor/dashboard">
            Kembali <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      }
    >
      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-border/70 bg-background/70">
          <div className="flex flex-col gap-3 border-b border-border/60 p-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-tight">Tender tersedia</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Vendor mengirim bid (harga + SLA + kapasitas). SPPG akan pilih pemenang.
              </p>
            </div>

            <div className="grid w-full gap-2 sm:max-w-xl sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="vendor" className="text-xs text-muted-foreground">
                  Vendor aktif (demo)
                </Label>
                <select
                  id="vendor"
                  value={String(vendorId)}
                  onChange={(e) => setVendorId(Number(e.target.value))}
                  className="h-10 w-full rounded-2xl border border-input bg-background px-3 text-sm"
                >
                  {vendorList.map((v) => (
                    <option key={v.id} value={String(v.id)}>
                      {v.nama}
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
                Belum ada tender yang bisa ditampilkan.
              </div>
            ) : (
              tenders.map((tender) => {
                const sppg = getTenderSppg(tender);
                const existing = myBids.find((b) => b.tenderId === tender.id) ?? null;
                const awarded = tender.awardedBidId ? snapshot.bids.find((b) => b.id === tender.awardedBidId) ?? null : null;
                const isWinner = awarded?.vendorId === vendorId && tender.status === "AWARDED";

                const draft = draftByTender[tender.id] ?? {
                  price: existing ? String(existing.pricePerUnit) : "",
                  notes: existing?.notes ?? "",
                  certifications: existing?.certifications?.join(", ") ?? "",
                  capacityPerDay: existing?.capacityPerDay ? String(existing.capacityPerDay) : "",
                  leadTimeDays: existing?.leadTimeDays ? String(existing.leadTimeDays) : "",
                };

                const parsedPrice = Number(draft.price);
                const canSubmit = Number.isFinite(parsedPrice) && parsedPrice > 0 && tender.status === "OPEN";

                return (
                  <div key={tender.id} className="p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-muted-foreground">{tender.id}</p>
                        <p className="mt-1 truncate text-base font-semibold tracking-tight">{tender.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {sppg ? `${sppg.nama} • ${sppg.kecamatan}, ${sppg.kota}` : `SPPG #${tender.sppgId}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="rounded-full" variant={tender.status === "OPEN" ? "default" : "secondary"}>
                          {tender.status}
                        </Badge>
                        {existing ? (
                          <Badge variant="secondary" className="rounded-full">
                            Bid terkirim
                          </Badge>
                        ) : null}
                        {isWinner ? (
                          <Badge className="rounded-full" variant="default">
                            Menang
                          </Badge>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-border/70 bg-muted/20 p-3">
                        <p className="text-xs font-semibold text-muted-foreground">Kuantitas</p>
                        <p className="mt-1 text-sm font-semibold tabular-nums">
                          {tender.quantity.toLocaleString("id-ID")} {tender.unit}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-muted/20 p-3">
                        <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                          <Gavel className="size-3" /> Bobot penilaian
                        </p>
                        <p className="mt-1 text-sm font-semibold">
                          H {Math.round(tender.weights.price * 100)}% • K {Math.round(tender.weights.quality * 100)}% • J{" "}
                          {Math.round(tender.weights.distance * 100)}%
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-muted/20 p-3">
                        <p className="text-xs font-semibold text-muted-foreground">Status keputusan</p>
                        <p className="mt-1 text-sm font-semibold">
                          {tender.status === "AWARDED"
                            ? `Pemenang: ${awarded ? (vendorList.find((v) => v.id === awarded.vendorId)?.nama ?? `Vendor ${awarded.vendorId}`) : "—"}`
                            : tender.status === "CLOSED"
                              ? "Ditutup"
                              : "Menunggu"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`price-${tender.id}`} className="text-xs text-muted-foreground">
                          Harga per {tender.unit}
                        </Label>
                        <Input
                          id={`price-${tender.id}`}
                          inputMode="numeric"
                          placeholder="contoh: 14500"
                          value={draft.price}
                          disabled={tender.status !== "OPEN"}
                          onChange={(e) =>
                            setDraftByTender((prev) => ({
                              ...prev,
                              [tender.id]: { ...draft, price: e.target.value },
                            }))
                          }
                          className="h-10 rounded-2xl tabular-nums"
                        />
                        <p className="text-xs text-muted-foreground">
                          Preview:{" "}
                          <span className="font-semibold text-foreground">
                            {Number.isFinite(parsedPrice) && parsedPrice > 0 ? currency(parsedPrice) : "—"}
                          </span>
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`capacity-${tender.id}`} className="text-xs text-muted-foreground">
                            Kapasitas/hari
                          </Label>
                          <Input
                            id={`capacity-${tender.id}`}
                            type="number"
                            inputMode="numeric"
                            placeholder="misal: 2000"
                            value={draft.capacityPerDay}
                            disabled={tender.status !== "OPEN"}
                            onChange={(e) =>
                              setDraftByTender((prev) => ({
                                ...prev,
                                [tender.id]: { ...draft, capacityPerDay: e.target.value },
                              }))
                            }
                            className="h-10 rounded-2xl tabular-nums"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`lead-${tender.id}`} className="text-xs text-muted-foreground">
                            Lead time (hari)
                          </Label>
                          <Input
                            id={`lead-${tender.id}`}
                            type="number"
                            inputMode="numeric"
                            placeholder="misal: 2"
                            value={draft.leadTimeDays}
                            disabled={tender.status !== "OPEN"}
                            onChange={(e) =>
                              setDraftByTender((prev) => ({
                                ...prev,
                                [tender.id]: { ...draft, leadTimeDays: e.target.value },
                              }))
                            }
                            className="h-10 rounded-2xl tabular-nums"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`cert-${tender.id}`} className="text-xs text-muted-foreground">
                          Sertifikasi (pisahkan dengan koma)
                        </Label>
                        <Input
                          id={`cert-${tender.id}`}
                          placeholder="Halal MUI, BPOM, ISO 22000"
                          value={draft.certifications}
                          disabled={tender.status !== "OPEN"}
                          onChange={(e) =>
                            setDraftByTender((prev) => ({
                              ...prev,
                              [tender.id]: { ...draft, certifications: e.target.value },
                            }))
                          }
                          className="h-10 rounded-2xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`notes-${tender.id}`} className="text-xs text-muted-foreground">
                          Catatan SLA / kualitas (opsional)
                        </Label>
                        <Textarea
                          id={`notes-${tender.id}`}
                          value={draft.notes}
                          disabled={tender.status !== "OPEN"}
                          onChange={(e) =>
                            setDraftByTender((prev) => ({
                              ...prev,
                              [tender.id]: { ...draft, notes: e.target.value },
                            }))
                          }
                          placeholder="misal: jadwal produksi, rencana QC, cut-off order, dll."
                          className="min-h-24 rounded-2xl"
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-muted-foreground">
                        Vendor aktif: <span className="font-semibold text-foreground">{currentVendorName}</span>
                      </p>
                      <Button
                        className="rounded-full sm:w-auto"
                        disabled={!canSubmit}
                        onClick={() => {
                          const created = upsertBid(tender.id, vendorId, {
                            pricePerUnit: parsedPrice,
                            notes: draft.notes.trim() || undefined,
                            certifications: parseCsv(draft.certifications),
                            capacityPerDay: draft.capacityPerDay ? Number(draft.capacityPerDay) : undefined,
                            leadTimeDays: draft.leadTimeDays ? Number(draft.leadTimeDays) : undefined,
                          });
                          toast.success(existing ? "Bid diperbarui (demo)." : "Bid terkirim (demo).", {
                            description: `${tender.id} • ${currency(created.pricePerUnit)}`,
                          });
                        }}
                      >
                        <Send data-icon="inline-start" />
                        {existing ? "Update penawaran" : "Kirim penawaran"}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <aside className="rounded-3xl border border-border/70 bg-background/70 p-5">
          <p className="text-sm font-semibold tracking-tight">Ringkasan</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Status bid untuk vendor yang sedang aktif.
          </p>

          <Separator className="my-4" />

          <div className="space-y-3">
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <p className="text-xs font-semibold text-muted-foreground">Vendor</p>
              <p className="mt-1 text-sm font-semibold">{currentVendorName}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <p className="text-xs font-semibold text-muted-foreground">Bid terkirim</p>
              <p className="mt-1 text-sm font-semibold tabular-nums">{myBids.length}</p>
            </div>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Tips: tender akan memakai bobot (harga/kualitas/jarak). Kualitas bisa dipengaruhi reputasi + QC score dari SPPG.
          </p>
        </aside>
      </section>
    </DashboardShell>
  );
}
