"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Factory,
  Gavel,
  MapPinned,
  QrCode,
  School,
  Truck,
} from "lucide-react";

import {
  deliveryList,
  tenderMaterials,
  vendorList,
  vendorSekolahList,
  sekolahList,
} from "@/lib/mbgdummydata";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardShell } from "@/components/ui/dashboard-shell";
import { KpiCard } from "@/components/ui/kpi-card";

const LocationPickerMapLibre = dynamic(
  () => import("@/components/ui/LocationPickerMapLibre"),
  {
    ssr: false,
    loading: () => <div className="h-[280px] w-full animate-pulse rounded-xl bg-muted" />,
  }
);

const VendorServiceMapLibre = dynamic(
  () => import("@/components/ui/VendorServiceMapLibre"),
  {
    ssr: false,
    loading: () => <div className="h-[340px] w-full animate-pulse rounded-xl bg-muted" />,
  }
);

type Stage = "vendor" | "sppg" | "school";

function getCurrentStage(status: string): Stage {
  if (status === "pending") return "vendor";
  if (status === "on_transit") return "sppg";
  return "school";
}

function currency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function VendorDashboardPage() {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>("1");

  const currentVendor = useMemo(() => vendorList.find((vendor) => vendor.id === 1)!, []);

  const serviceRelations = useMemo(
    () => vendorSekolahList.filter((relation) => relation.vendor_id === currentVendor.id),
    [currentVendor.id]
  );

  const linkedSchools = useMemo(
    () =>
      serviceRelations
        .map((relation) => sekolahList.find((school) => school.id === relation.sekolah_id))
        .filter((school): school is NonNullable<typeof school> => Boolean(school)),
    [serviceRelations]
  );

  const activeDeliveries = useMemo(() => {
    const relationIds = new Set(serviceRelations.map((relation) => relation.id));
    return deliveryList.filter((delivery) => relationIds.has(delivery.vendor_sekolah_id));
  }, [serviceRelations]);

  const selectedDelivery = useMemo(
    () => activeDeliveries.find((delivery) => String(delivery.id) === selectedDeliveryId) ?? activeDeliveries[0],
    [activeDeliveries, selectedDeliveryId]
  );

  const selectedSchool = useMemo(() => {
    if (!selectedDelivery) return null;
    const relation = vendorSekolahList.find(
      (item) => item.id === selectedDelivery.vendor_sekolah_id
    );
    return sekolahList.find((school) => school.id === relation?.sekolah_id) ?? null;
  }, [selectedDelivery]);

  const sppgName = useMemo(
    () => `SPPG ${currentVendor.nama.replace(/^CV\s|^PT\s/, "").split(" ")[0]} Dapur`,
    [currentVendor.nama]
  );

  const qrPayload = useMemo(() => {
    if (!selectedDelivery || !selectedSchool) return "";

    return JSON.stringify(
      {
        manifestId: `MBG-${selectedDelivery.id.toString().padStart(5, "0")}`,
        vendor: currentVendor.nama,
        sppg: sppgName,
        school: selectedSchool.nama,
        route: ["VENDOR", "SPPG", "SEKOLAH"],
        targetArrival: selectedDelivery.jam_target,
      },
      null,
      0
    );
  }, [currentVendor.nama, selectedDelivery, selectedSchool, sppgName]);

  const qrImageUrl = useMemo(() => {
    if (!qrPayload) return "";
    return `https://quickchart.io/qr?size=240&text=${encodeURIComponent(qrPayload)}`;
  }, [qrPayload]);

  const totalOnTime = useMemo(() => {
    if (activeDeliveries.length === 0) return 0;
    const completed = activeDeliveries.filter((delivery) => delivery.status === "delivered").length;
    return Math.round((completed / activeDeliveries.length) * 100);
  }, [activeDeliveries]);

  const shortlistTender = useMemo(
    () => [...tenderMaterials].sort((a, b) => b.rating - a.rating).slice(0, 4),
    []
  );

  const summaryCards = [
    {
      title: "Sekolah Dilayani",
      value: linkedSchools.length,
      suffix: "sekolah",
      icon: School,
    },
    {
      title: "SPPG Aktif",
      value: 1,
      suffix: "dapur",
      icon: Factory,
    },
    {
      title: "Manifest Berjalan",
      value: activeDeliveries.filter((delivery) => delivery.status !== "delivered").length,
      suffix: "pengiriman",
      icon: Truck,
    },
    {
      title: "On-Time Delivery",
      value: totalOnTime,
      suffix: "%",
      icon: ClipboardList,
    },
  ];

  return (
    <>
      <DashboardShell
        badge={<Badge variant="outline">Portal Vendor</Badge>}
        title="Operations Desk: Vendor → SPPG → Sekolah"
        description={
          <>
            Ringkas dan operasional. Fokus pada manifest berjalan, distribusi bertahap, dan payload
            QR untuk proses serah-terima.
          </>
        }
        actions={
          <>
            <Button asChild className="rounded-full">
              <Link href="/vendor/bidding">
                Tender SPPG
                <Gavel data-icon="inline-end" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/vendor/tender">
                Bidding Bahan
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button variant="outline" className="rounded-full" onClick={() => setIsMapOpen(true)}>
              <MapPinned data-icon="inline-start" />
              Full Map
            </Button>
          </>
        }
      >

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ringkasan operasional vendor">
          {summaryCards.map((card) => (
            <KpiCard
              key={card.title}
              title={card.title}
              value={card.value}
              unit={card.suffix}
              icon={<card.icon className="size-4" aria-hidden />}
            />
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 rounded-3xl shadow-none">
            <CardHeader>
              <CardTitle>Flow Distribusi per Manifest</CardTitle>
              <CardDescription>
                {"Posisi operasional dibaca per tahap Vendor -> SPPG -> Sekolah."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-hidden rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Manifest</TableHead>
                      <TableHead>Sekolah</TableHead>
                      <TableHead>Tahap Aktif</TableHead>
                      <TableHead className="text-right">Target</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeDeliveries.slice(0, 6).map((delivery) => {
                      const relation = vendorSekolahList.find(
                        (item) => item.id === delivery.vendor_sekolah_id
                      );
                      const school = sekolahList.find((item) => item.id === relation?.sekolah_id);
                      const stage = getCurrentStage(delivery.status);

                      return (
                        <TableRow key={delivery.id}>
                          <TableCell className="font-medium">
                            MBG-{delivery.id.toString().padStart(5, "0")}
                          </TableCell>
                          <TableCell>{school?.nama ?? "-"}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <Badge variant={stage === "vendor" ? "default" : "outline"}>Vendor</Badge>
                              <ArrowRight className="size-3 text-muted-foreground" />
                              <Badge variant={stage === "sppg" ? "default" : "outline"}>SPPG</Badge>
                              <ArrowRight className="size-3 text-muted-foreground" />
                              <Badge variant={stage === "school" ? "default" : "outline"}>Sekolah</Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {delivery.jam_target}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <Alert className="border-border bg-muted/20">
                <ClipboardList className="size-4" />
                <AlertTitle>Catatan Operasional</AlertTitle>
                <AlertDescription>
                  Manifest vendor akan menjadi payload QR untuk proses scan oleh tim logistik di titik
                  SPPG dan sekolah.
                </AlertDescription>
              </Alert>

              <Separator />

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Map Cakupan Layanan</h3>
                  <p className="text-xs text-muted-foreground">
                    Tetap menggunakan komponen map existing (`VendorServiceMapLibre`) tanpa API map
                    baru.
                  </p>
                </div>
                <div className="h-[260px] overflow-hidden rounded-xl border border-border">
                  <VendorServiceMapLibre type="minimap" onExpand={() => setIsMapOpen(true)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-none">
            <CardHeader>
              <CardTitle>QR Manifest Vendor</CardTitle>
              <CardDescription>
                QR generator untuk serah-terima, dipakai oleh scanner logistik existing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label className="text-xs">Pilih Manifest</Label>
              <RadioGroup
                value={selectedDeliveryId}
                onValueChange={setSelectedDeliveryId}
                className="max-h-44 gap-2 overflow-auto rounded-lg border border-border p-3"
              >
                {activeDeliveries.map((delivery) => (
                  <div key={delivery.id} className="flex items-center gap-2">
                    <RadioGroupItem value={String(delivery.id)} id={`manifest-${delivery.id}`} />
                    <Label htmlFor={`manifest-${delivery.id}`} className="text-sm font-normal">
                      MBG-{delivery.id.toString().padStart(5, "0")} - {delivery.tanggal}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="rounded-xl border border-border bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">Rute aktif</p>
                <p className="text-sm font-medium">
                  {currentVendor.nama} - {sppgName} - {selectedSchool?.nama ?? "Sekolah"}
                </p>
              </div>

              <div className="mx-auto w-fit rounded-2xl border border-border bg-card p-2">
                {qrImageUrl ? (
                  <img src={qrImageUrl} alt="QR Manifest Vendor" className="h-56 w-56 rounded-xl" />
                ) : (
                  <div className="flex h-52 w-52 items-center justify-center text-sm text-muted-foreground">
                    QR belum tersedia
                  </div>
                )}
              </div>

              <Input value={qrPayload} readOnly className="text-xs" />
            </CardContent>
            <CardFooter className="gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={async () => {
                  if (!qrPayload) return;
                  await navigator.clipboard.writeText(qrPayload);
                }}
              >
                <QrCode data-icon="inline-start" />
                Salin Payload QR
              </Button>
            </CardFooter>
          </Card>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card className="rounded-3xl shadow-none">
            <CardHeader>
              <CardTitle>Tender SPPG (Bidding Vendor)</CardTitle>
              <CardDescription>
                Lihat tender dari SPPG dan kirim penawaran (harga + catatan SLA). Skoring ditentukan
                oleh SPPG berdasarkan bobot harga, kualitas, dan jarak.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {shortlistTender.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{material.name}</p>
                    <p className="text-xs text-muted-foreground">Rating {material.rating}</p>
                  </div>
                  <Badge variant="secondary">{currency(material.price)}</Badge>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/vendor/bidding">
                  Buka Tender SPPG
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="rounded-3xl shadow-none">
            <CardHeader>
              <CardTitle>Lokasi Dapur SPPG</CardTitle>
              <CardDescription>
                Titik dapur SPPG dikelola vendor agar sinkron dengan logistik dan sekolah tujuan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-border">
                <LocationPickerMapLibre />
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-3 text-sm">
                <p className="font-medium">{sppgName}</p>
                <p className="text-xs text-muted-foreground">
                  Tersambung ke {linkedSchools.length} sekolah aktif untuk distribusi harian.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </DashboardShell>

      <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
        <DialogContent className="h-[90vh] max-w-6xl p-0">
          <DialogHeader className="border-b border-border p-4">
            <DialogTitle>Peta Operasional Vendor</DialogTitle>
            <DialogDescription>
              Cakupan layanan vendor menuju sekolah aktif, tetap memakai komponen map existing.
            </DialogDescription>
          </DialogHeader>
          <div className="h-[calc(90vh-88px)] w-full">
            <VendorServiceMapLibre type="fullmap" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
