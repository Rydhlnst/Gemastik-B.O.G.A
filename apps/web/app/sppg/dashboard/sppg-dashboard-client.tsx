"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  ClipboardList,
  PackagePlus,
  QrCode,
  Wallet,
  Gavel,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

import { tenderMaterials } from "@/lib/mbgdummydata";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function currency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

type CartItem = {
  id: number;
  name: string;
  type: string;
  price: number;
  quantity: number;
};

export default function SppgDashboardClient() {
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [qrOpen, setQrOpen] = useState(false);
  const [escrowLocked, setEscrowLocked] = useState(false);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tenderMaterials;
    return tenderMaterials.filter((m) => {
      return (
        m.name.toLowerCase().includes(q) ||
        m.type.toLowerCase().includes(q) ||
        String(m.id) === q
      );
    });
  }, [query]);

  const total = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const poPayload = useMemo(() => {
    if (cart.length === 0) return "";
    return JSON.stringify(
      {
        po_id: "PO-DEMO-0001",
        sppg_id: "SPPG-DEMO-01",
        items: cart.map((c) => ({
          id: c.id,
          name: c.name,
          qty: c.quantity,
          unit_price: c.price,
        })),
        total_amount_idr: total,
        issued_at: new Date().toISOString(),
      },
      null,
      0
    );
  }, [cart, total]);

  const qrImageUrl = useMemo(() => {
    if (!poPayload) return "";
    return `https://quickchart.io/qr?size=280&text=${encodeURIComponent(poPayload)}`;
  }, [poPayload]);

  const addToCart = (id: number) => {
    const material = tenderMaterials.find((m) => m.id === id);
    if (!material) return;

    setCart((prev) => {
      const existing = prev.find((p) => p.id === id);
      if (existing) {
        return prev.map((p) => (p.id === id ? { ...p, quantity: p.quantity + 1 } : p));
      }
      return [...prev, { id, name: material.name, type: material.type, price: material.price, quantity: 1 }];
    });
  };

  const updateQty = (id: number, quantity: number) => {
    setCart((prev) => {
      const nextQty = Math.max(0, Math.min(999, quantity));
      if (nextQty === 0) return prev.filter((p) => p.id !== id);
      return prev.map((p) => (p.id === id ? { ...p, quantity: nextQty } : p));
    });
  };

  return (
    <>
      <DashboardShell
        badge={<Badge variant="outline">SPPG</Badge>}
        title="E‑Katalog & PO Builder"
        description="Bangun PO dari katalog bahan. UI demo: fokus pada orientasi, status, dan aksi."
        actions={
          <>
            <Button variant="outline" asChild className="rounded-full">
              <Link href="/sppg/bidding">
                Bidding Vendor
                <Gavel data-icon="inline-end" />
              </Link>
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              disabled={escrowLocked}
              onClick={() => {
                setEscrowLocked(true);
                toast.success("Dana dikunci (demo).", {
                  description: "Escrow lock aktif untuk PO ini (simulasi).",
                });
              }}
            >
              <Lock data-icon="inline-start" />
              Lock Escrow
            </Button>
            <Button variant="outline" asChild className="rounded-full">
              <Link href="/logistik/dashboard">
                Buka Logistik
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button
              className="rounded-full"
              disabled={cart.length === 0}
              onClick={() => setQrOpen(true)}
            >
              <QrCode data-icon="inline-start" />
              QR PO
            </Button>
          </>
        }
      >
        <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5" aria-label="Ringkasan SPPG">
          {[
            { label: "Sisa anggaran (demo)", value: currency(35_000_000), icon: Wallet },
            { label: "Guard HET (demo)", value: "Aktif", icon: BadgePercent },
            { label: "Draft PO", value: String(cart.length), icon: ClipboardList },
            { label: "Item katalog", value: String(tenderMaterials.length), icon: PackagePlus },
            { label: "Escrow lock (demo)", value: escrowLocked ? "Locked" : "Draft", icon: Lock },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-3xl border border-border/70 bg-background/70 p-5 shadow-none backdrop-blur supports-[backdrop-filter]:bg-background/60"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium text-muted-foreground">{m.label}</p>
                <m.icon className="size-4 text-muted-foreground" aria-hidden />
              </div>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                {m.value}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-3xl border border-border/70 bg-background/70 shadow-none">
            <div className="flex flex-col gap-3 px-5 pt-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold tracking-tight">Katalog bahan</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Cari item, lalu masukkan ke keranjang PO.
                </p>
              </div>
              <div className="w-full sm:max-w-xs">
                <Label htmlFor="search" className="text-xs text-muted-foreground">
                  Cari
                </Label>
                <Input
                  id="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Misal: beras, protein, ..."
                  className="mt-2 h-10 rounded-2xl"
                />
              </div>
            </div>

            <div className="p-5 pt-4">
              <div className="overflow-hidden rounded-2xl border border-border/70">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead className="text-right">Harga</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium tabular-nums">{m.id}</TableCell>
                        <TableCell className="font-semibold">{m.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="rounded-full">
                            {m.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{currency(m.price)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            className="h-9 rounded-full"
                            onClick={() => addToCart(m.id)}
                          >
                            Tambah
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border border-border/70 bg-background/70 shadow-none">
            <div className="px-5 pt-5">
              <p className="text-sm font-semibold tracking-tight">Keranjang PO</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Quantity dan total dihitung otomatis.
              </p>
            </div>

            <div className="px-5 pb-5 pt-4 space-y-4">
              {cart.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                  Belum ada item. Tambahkan dari katalog.
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-2xl border border-border/70 bg-background p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{c.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{c.type}</p>
                        </div>
                        <Badge variant="secondary" className="shrink-0 tabular-nums">
                          {currency(c.price)}
                        </Badge>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <Label htmlFor={`qty-${c.id}`} className="text-xs text-muted-foreground">
                          Qty
                        </Label>
                        <Input
                          id={`qty-${c.id}`}
                          type="number"
                          value={c.quantity}
                          onChange={(e) => updateQty(c.id, Number(e.target.value))}
                          className="h-9 w-24 rounded-2xl text-right tabular-nums"
                          min={0}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Separator />

              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold">Total</p>
                <p className="text-sm font-semibold tabular-nums">{currency(total)}</p>
              </div>

              <Button
                className="w-full rounded-full"
                disabled={cart.length === 0}
                onClick={() => setQrOpen(true)}
              >
                <QrCode data-icon="inline-start" />
                Generate QR PO (Demo)
              </Button>

              <p className="text-xs text-muted-foreground">
                QR menggunakan generator demo (QuickChart) untuk kebutuhan presentasi UI.
              </p>
            </div>
          </aside>
        </section>
      </DashboardShell>

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>QR Purchase Order (Demo)</DialogTitle>
            <DialogDescription>
              Payload ringkas untuk dokumen fisik + proses serah-terima. (UI-only.)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">PO</p>
              <p className="text-sm font-semibold">PO-DEMO-0001</p>
              <p className="mt-1 text-xs text-muted-foreground tabular-nums">{currency(total)}</p>
            </div>

            <div className="mx-auto w-fit rounded-2xl border border-border bg-card p-2">
              {qrImageUrl ? (
                <img src={qrImageUrl} alt="QR PO" className="h-64 w-64 rounded-xl" />
              ) : (
                <div className="flex h-64 w-64 items-center justify-center text-sm text-muted-foreground">
                  QR belum tersedia
                </div>
              )}
            </div>

            <Input value={poPayload} readOnly className="text-xs" />

            <Button
              variant="outline"
              className="w-full rounded-full"
              onClick={async () => {
                if (!poPayload) return;
                await navigator.clipboard.writeText(poPayload);
              }}
            >
              <QrCode data-icon="inline-start" />
              Salin Payload QR
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
