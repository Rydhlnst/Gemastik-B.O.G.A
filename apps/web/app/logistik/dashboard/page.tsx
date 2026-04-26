"use client";

import { useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  Factory,
  Navigation,
  PackageCheck,
  Route,
  School,
  ScanLine,
  Truck,
} from "lucide-react";

import {
  deliveryList,
  vendorList,
  vendorSekolahList,
  sekolahList,
} from "@/lib/mbgdummydata";
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

const MapLibreLogistik = dynamic(() => import("@/components/ui/MapLibreLogistik"), {
  ssr: false,
  loading: () => <div className="h-[540px] w-full animate-pulse rounded-xl bg-muted" />,
});

type StageStatus = "vendor" | "sppg" | "school";

function getStageStatus(status: string): StageStatus {
  if (status === "pending") return "vendor";
  if (status === "on_transit") return "sppg";
  return "school";
}

function stageLabel(status: string) {
  if (status === "pending") return "Vendor → SPPG (menunggu pickup)";
  if (status === "on_transit") return "SPPG → Sekolah (dalam perjalanan)";
  if (status === "delivered") return "Selesai di Sekolah";
  return "Insiden Pengiriman";
}

export default function LogistikDashboardPage() {
  const rows = useMemo(() => {
    return deliveryList.slice(0, 10).map((delivery) => {
      const relation = vendorSekolahList.find((item) => item.id === delivery.vendor_sekolah_id);
      const vendor = vendorList.find((item) => item.id === relation?.vendor_id);
      const school = sekolahList.find((item) => item.id === relation?.sekolah_id);
      const sppgName = `SPPG ${vendor?.nama?.replace(/^CV\s|^PT\s/, "").split(" ")[0] ?? "Utama"}`;

      return {
        id: delivery.id,
        vendor: vendor?.nama ?? "Vendor",
        sppg: sppgName,
        school: school?.nama ?? "Sekolah",
        status: delivery.status,
        stage: getStageStatus(delivery.status),
        target: delivery.jam_target,
      };
    });
  }, []);

  const summary = useMemo(() => {
    const delivered = rows.filter((row) => row.status === "delivered").length;
    const inTransit = rows.filter((row) => row.status === "on_transit").length;
    const pending = rows.filter((row) => row.status === "pending").length;

    return {
      delivered,
      inTransit,
      pending,
      routes: rows.length,
    };
  }, [rows]);

  return (
    <DashboardShell
      badge={<Badge variant="outline">Logistik</Badge>}
      title="Dashboard Logistik: Vendor → SPPG → Sekolah"
      description={
        <>
          Ringkas untuk operasi harian. Scanner QR tetap tersedia di panel peta logistik (komponen
          existing).
        </>
      }
      actions={
        <>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/sppg/bidding">
              Lihat Tender SPPG
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
          <Button asChild className="rounded-full">
            <Link href="/logistik/pantau">
              Pantau Detail Rute
              <Navigation data-icon="inline-end" />
            </Link>
          </Button>
        </>
      }
    >

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Manifest selesai" value={summary.delivered} icon={<PackageCheck className="size-4" />} />
        <KpiCard title="Dalam pengiriman" value={summary.inTransit} icon={<Truck className="size-4" />} />
        <KpiCard title="Menunggu pickup" value={summary.pending} icon={<Factory className="size-4" />} />
        <KpiCard title="Rute dipantau" value={summary.routes} icon={<Route className="size-4" />} />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <Card className="gap-4 py-5 shadow-none lg:col-span-2 rounded-3xl">
            <CardHeader>
              <CardTitle>Alur Distribusi per Manifest</CardTitle>
              <CardDescription>
                Setiap baris menegaskan posisi operasional saat ini berdasarkan urutan{" "}
                {"Vendor → SPPG → Sekolah"}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Manifest</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>SPPG</TableHead>
                      <TableHead>Sekolah</TableHead>
                      <TableHead>Tahap Aktif</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">
                          MBG-{row.id.toString().padStart(5, "0")}
                        </TableCell>
                        <TableCell>{row.vendor}</TableCell>
                        <TableCell>{row.sppg}</TableCell>
                        <TableCell>{row.school}</TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <Badge variant={row.stage === "vendor" ? "default" : "outline"}>
                                Vendor
                              </Badge>
                              <ArrowRight className="size-3 text-muted-foreground" />
                              <Badge variant={row.stage === "sppg" ? "default" : "outline"}>
                                SPPG
                              </Badge>
                              <ArrowRight className="size-3 text-muted-foreground" />
                              <Badge variant={row.stage === "school" ? "default" : "outline"}>
                                Sekolah
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{stageLabel(row.status)}</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="gap-4 py-5 shadow-none rounded-3xl">
            <CardHeader>
              <CardTitle>Scanner & Validasi</CardTitle>
              <CardDescription>
                Scanner QR tidak diganti. Tombol scan tetap tersedia di panel map logistik.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border bg-muted/20 p-4 text-sm">
                <p className="font-medium">Standar verifikasi</p>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
                  <li>Vendor menyerahkan manifest QR.</li>
                  <li>Logistik scan QR di titik pickup SPPG.</li>
                  <li>Konfirmasi tiba di sekolah memakai manifest yang sama.</li>
                </ol>
              </div>

              <Separator />

              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <ScanLine className="size-4" />
                  Gunakan tombol <strong>Scan QR</strong> di modul peta untuk mulai pemindaian.
                </p>
                <p className="flex items-center gap-2">
                  <School className="size-4" />
                  Pastikan tujuan sekolah sesuai payload manifest vendor.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full rounded-full">
                <Link href="/logistik/pantau">
                  Buka Monitoring Map
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </section>

        <section id="map-logistik" className="mt-6">
          <Card className="gap-4 py-5 shadow-none">
            <CardHeader>
              <CardTitle>Mapping Logistik (Komponen Existing)</CardTitle>
              <CardDescription>
                Komponen `MapLibreLogistik` dipakai apa adanya untuk peta, tracking, driver mode, dan
                scanning QR.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-xl border">
                <MapLibreLogistik />
              </div>
            </CardContent>
          </Card>
        </section>
    </DashboardShell>
  );
}
