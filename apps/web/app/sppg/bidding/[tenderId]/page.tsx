"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Settings2,
  Star,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  getBidVendor,
  getTenderSppg,
  rankBidsForTender,
  type TenderWeights,
} from "@/lib/bidding";
import {
  awardTender,
  setBidEvaluation,
  setTenderStatus,
  updateTenderWeights,
  useBiddingSnapshot,
} from "@/lib/bidding-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/ui/dashboard-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function currency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalizeWeights(weights: TenderWeights): TenderWeights {
  const p = Math.max(0, weights.price);
  const q = Math.max(0, weights.quality);
  const d = Math.max(0, weights.distance);
  const sum = p + q + d || 1;
  return { price: p / sum, quality: q / sum, distance: d / sum };
}

type BidExtras = {
  certifications?: string[];
  capacityPerDay?: number;
  leadTimeDays?: number;
};

export default function SppgTenderDetailPage({
  params,
}: {
  params: { tenderId: string };
}) {
  const snapshot = useBiddingSnapshot();

  const tender = useMemo(
    () => snapshot.tenders.find((t) => t.id === params.tenderId) ?? null,
    [params.tenderId, snapshot.tenders]
  );
  const sppg = useMemo(() => (tender ? getTenderSppg(tender) : null), [tender]);

  const bidsForTender = useMemo(() => {
    return snapshot.bids.filter((b) => b.tenderId === params.tenderId);
  }, [params.tenderId, snapshot.bids]);

  const ranked = useMemo(() => {
    if (!tender) return [];
    return rankBidsForTender(tender, bidsForTender, snapshot.evals);
  }, [bidsForTender, snapshot.evals, tender]);

  const [selectedBidId, setSelectedBidId] = useState<string | null>(null);

  const selected = useMemo(() => {
    if (!selectedBidId) return null;
    return bidsForTender.find((b) => b.id === selectedBidId) ?? null;
  }, [bidsForTender, selectedBidId]);

  const selectedVendor = useMemo(
    () => (selected ? getBidVendor(selected) : null),
    [selected]
  );
  const selectedWithExtras = (selected as (typeof selected & BidExtras) | null) ?? null;
  const awardedBidId = tender?.awardedBidId ?? null;
  const winner = useMemo(() => {
    if (!awardedBidId) return null;
    return bidsForTender.find((b) => b.id === awardedBidId) ?? null;
  }, [awardedBidId, bidsForTender]);

  if (!tender) {
    return (
      <DashboardShell
        title="Tender tidak ditemukan"
        actions={
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/sppg/bidding">
              <ArrowLeft data-icon="inline-start" />
              Kembali
            </Link>
          </Button>
        }
      >
        <div className="rounded-3xl border border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
          ID tender: <span className="font-mono">{params.tenderId}</span>
        </div>
      </DashboardShell>
    );
  }

  const weightsPercent = {
    price: Math.round(tender.weights.price * 100),
    quality: Math.round(tender.weights.quality * 100),
    distance: Math.round(tender.weights.distance * 100),
  };

  return (
    <DashboardShell
      badge={<Badge variant="outline">SPPG</Badge>}
      title={tender.title}
      description={
        <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <MapPin className="size-4" />{" "}
            {sppg
              ? `${sppg.nama} • ${sppg.kecamatan}, ${sppg.kota}`
              : `SPPG #${tender.sppgId}`}
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">
            Bobot: harga {weightsPercent.price}% • kualitas {weightsPercent.quality}
            % • jarak {weightsPercent.distance}%
          </span>
        </span>
      }
      actions={
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/sppg/bidding">
            <ArrowLeft data-icon="inline-start" />
            Kembali
          </Link>
        </Button>
      }
    >
      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-border/70 bg-background/70">
          <div className="flex flex-col gap-2 border-b border-border/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-full">
                {tender.id}
              </Badge>
              <Badge
                className="rounded-full"
                variant={tender.status === "OPEN" ? "default" : "secondary"}
              >
                {tender.status}
              </Badge>
              <span className="text-sm text-muted-foreground tabular-nums">
                • {bidsForTender.length} bid
              </span>
            </div>
            <div className="text-sm text-muted-foreground tabular-nums">
              Kuantitas:{" "}
              <span className="font-semibold text-foreground">
                {tender.quantity.toLocaleString("id-ID")} {tender.unit}
              </span>
            </div>
          </div>

          <div className="p-5">
            {ranked.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
                Belum ada bid untuk tender ini.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-border/70">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[72px]">Rank</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead className="text-right">Harga</TableHead>
                      <TableHead className="text-right">Jarak</TableHead>
                      <TableHead className="text-right">Kualitas</TableHead>
                      <TableHead className="text-right">QC</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ranked.map((row, idx) => {
                      const isWinner = awardedBidId === row.bid.id;
                      const isSelected = selectedBidId === row.bid.id;
                      return (
                        <TableRow
                          key={row.bid.id}
                          className={[
                            isWinner ? "bg-emerald-50/40" : "",
                            isSelected ? "bg-muted/25" : "",
                          ].join(" ")}
                          onClick={() => setSelectedBidId(row.bid.id)}
                          role="button"
                        >
                          <TableCell className="font-semibold tabular-nums">
                            {idx + 1}
                          </TableCell>
                          <TableCell>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">
                                {row.vendorName}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {isWinner ? "Pemenang" : "Klik untuk evaluasi"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold tabular-nums">
                            {currency(row.bid.pricePerUnit)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {row.distanceKm == null
                              ? "—"
                              : `${row.distanceKm.toFixed(1)} km`}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            <span className="inline-flex items-center justify-end gap-1 font-semibold">
                              <Star className="size-4 text-amber-500 fill-amber-500" />
                              {row.vendorRating.toFixed(1)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {typeof row.qcScore === "number" ? row.qcScore : "—"}
                          </TableCell>
                          <TableCell className="text-right font-mono tabular-nums">
                            {row.score.toFixed(4)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>

        <aside className="rounded-3xl border border-border/70 bg-background/70 p-5">
          <p className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <Settings2 className="size-4 text-muted-foreground" /> Workspace
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Atur bobot, evaluasi bid, lalu tetapkan pemenang.
          </p>

          <Separator className="my-4" />

          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground">
              Bobot penilaian
            </p>
            {(
              [
                ["price", "Harga"],
                ["quality", "Kualitas"],
                ["distance", "Jarak"],
              ] as const
            ).map(([key, label]) => {
              const percent = Math.round(tender.weights[key] * 100);
              return (
                <div
                  key={key}
                  className="rounded-2xl border border-border/70 bg-muted/20 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold">{label}</p>
                    <p className="text-xs font-semibold tabular-nums">
                      {percent}%
                    </p>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={percent}
                    onChange={(e) => {
                      const nextPercent = clamp(Number(e.target.value), 0, 100);
                      const raw: TenderWeights = {
                        ...tender.weights,
                        [key]: nextPercent / 100,
                      } as TenderWeights;
                      updateTenderWeights(tender.id, normalizeWeights(raw));
                    }}
                    className="mt-2 w-full"
                  />
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground">
              Score dihitung otomatis dari bobot + harga + jarak + kualitas
              (reputasi + QC).
            </p>
          </div>

          <Separator className="my-4" />

          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground">Bid terpilih</p>
            {!selected ? (
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                Klik salah satu baris untuk melihat detail.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-2xl border border-border/70 bg-background p-4">
                  <p className="text-sm font-semibold">
                    {selectedVendor?.nama ?? `Vendor ${selected.vendorId}`}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Harga:{" "}
                    <span className="font-semibold text-foreground">
                      {currency(selected.pricePerUnit)}
                    </span>
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                      <p className="text-xs font-semibold text-muted-foreground">
                        Kapasitas/hari
                      </p>
                      <p className="mt-1 text-sm font-semibold tabular-nums">
                        {typeof selectedWithExtras?.capacityPerDay === "number"
                          ? selectedWithExtras.capacityPerDay.toLocaleString("id-ID")
                          : "—"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                      <p className="text-xs font-semibold text-muted-foreground">
                        Lead time
                      </p>
                      <p className="mt-1 text-sm font-semibold tabular-nums">
                        {typeof selectedWithExtras?.leadTimeDays === "number"
                          ? `${selectedWithExtras.leadTimeDays} hari`
                          : "—"}
                      </p>
                    </div>
                  </div>
                  {Array.isArray(selectedWithExtras?.certifications) &&
                  selectedWithExtras.certifications.length > 0 ? (
                    <div className="mt-3 rounded-xl border border-border/70 bg-muted/20 p-3">
                      <p className="text-xs font-semibold text-muted-foreground">
                        Sertifikasi
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {selectedWithExtras.certifications.join(", ")}
                      </p>
                    </div>
                  ) : null}
                  {selected.notes ? (
                    <p className="mt-3 text-sm text-muted-foreground">
                      {selected.notes}
                    </p>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <Label htmlFor="qc" className="text-xs text-muted-foreground">
                    QC score (0–100, manual)
                  </Label>
                  <div className="mt-2 flex items-center gap-2">
                    <Input
                      id="qc"
                      type="number"
                      min={0}
                      max={100}
                      value={snapshot.evals[selected.id]?.qcScore ?? ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const next = raw === "" ? null : clamp(Number(raw), 0, 100);
                        setBidEvaluation(selected.id, { qcScore: next });
                      }}
                      className="h-10 w-28 rounded-2xl tabular-nums"
                      placeholder="—"
                    />
                    <p className="text-xs text-muted-foreground">
                      Untuk “kualitas dan lain‑lain” (SLA, compliance, sample).
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full rounded-full"
                  disabled={Boolean(awardedBidId) || tender.status !== "OPEN"}
                  onClick={() => {
                    awardTender(tender.id, selected.id);
                    toast.success("Pemenang tender ditetapkan (demo).", {
                      description: selectedVendor?.nama ?? `Bid ${selected.id}`,
                    });
                  }}
                >
                  <CheckCircle2 data-icon="inline-start" />
                  Tetapkan pemenang
                </Button>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            {winner ? (
              <div className="rounded-2xl border border-border/70 bg-emerald-50/40 p-4">
                <p className="text-xs font-semibold text-emerald-700">Pemenang</p>
                <p className="mt-1 text-sm font-semibold">
                  {getBidVendor(winner)?.nama ?? `Vendor ${winner.vendorId}`}
                </p>
                <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                  {currency(winner.pricePerUnit)}
                </p>
              </div>
            ) : null}

            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                variant="outline"
                className="rounded-full"
                disabled={tender.status === "CLOSED"}
                onClick={() => {
                  setTenderStatus(tender.id, "CLOSED");
                  toast("Tender ditutup (demo).");
                }}
              >
                <XCircle data-icon="inline-start" />
                Tutup tender
              </Button>
              <Button
                variant="outline"
                className="rounded-full"
                disabled={tender.status === "OPEN"}
                onClick={() => {
                  setTenderStatus(tender.id, "OPEN");
                  toast("Tender dibuka kembali (demo).");
                }}
              >
                <CheckCircle2 data-icon="inline-start" />
                Buka
              </Button>
            </div>
          </div>
        </aside>
      </section>
    </DashboardShell>
  );
}
