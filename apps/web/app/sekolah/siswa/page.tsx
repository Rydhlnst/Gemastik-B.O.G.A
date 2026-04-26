"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, School as SchoolIcon } from "lucide-react";

import CountUp from "@/components/ui/CountUp";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/ui/dashboard-shell";
import VendorRanking from "@/components/ui/vendorranking";
import { MobileSiswaLayout } from "@/components/mobile-siswa/MobileSiswaLayout";
import { SchoolDetailPanel } from "@/components/ui/SchoolDetailPanel";
import { type Sekolah, getVendorsBySekolah, sekolahList } from "@/lib/mbgdummydata";
import { KpiCard } from "@/components/ui/kpi-card";

const MapLibreMap = dynamic(() => import("@/components/ui/MapLibreMap"), { ssr: false });

function DesktopViewSiswa() {
  const [selectedSchool, setSelectedSchool] = useState<Sekolah | null>(null);
  const [showRanking, setShowRanking] = useState(false);

  const loggedInSchool = useMemo(() => sekolahList.find((s) => s.id === 1) ?? null, []);

  return (
    <DashboardShell
      badge={<Badge variant="outline">Sekolah • Siswa</Badge>}
      title="Portal Siswa"
      description="Pantau status distribusi dan informasi sekolah yang dipilih."
      actions={
        <Button variant="outline" onClick={() => setShowRanking((v) => !v)}>
          {showRanking ? "Tutup ranking" : "Buka ranking"}
        </Button>
      }
    >
      <section className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitle>Peta distribusi</CardTitle>
            <CardDescription>Klik sekolah untuk melihat ringkasan dan detail vendor.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-xl border border-border bg-muted/10">
              <MapLibreMap
                selectedSchool={selectedSchool}
                onSchoolSelect={setSelectedSchool}
                userSchoolId={loggedInSchool?.id ?? 1}
              />
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-4 space-y-4">
          {selectedSchool ? (
            <SchoolDetailPanel
              school={selectedSchool}
              vendors={getVendorsBySekolah(selectedSchool.id)}
              onClose={() => setSelectedSchool(null)}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Petunjuk cepat</CardTitle>
                <CardDescription>Gunakan peta untuk memilih sekolah dan membaca status.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-primary" />
                  <p>Klik marker sekolah untuk membuka detail.</p>
                </div>
                <div className="flex items-center gap-2">
                  <SchoolIcon className="size-4 text-primary" />
                  <p>Detail menampilkan vendor terkait dan konteks layanan.</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Ranking vendor</CardTitle>
              <CardDescription>Ringkasan vendor teratas untuk referensi.</CardDescription>
            </CardHeader>
            <CardContent>
              {showRanking ? <VendorRanking type="vendor" /> : <p className="text-sm text-muted-foreground">Ranking disembunyikan.</p>}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ringkasan siswa">
        {[
          { label: "Sekolah aktif", value: sekolahList.length, unit: "unit", icon: SchoolIcon },
          { label: "Penerima makan", value: 2693, unit: "/hari", icon: SchoolIcon },
          { label: "Status hari ini", value: 1, unit: "ringkasan", icon: MapPin },
          { label: "Notifikasi", value: 0, unit: "pesan", icon: MapPin },
        ].map((stat) => (
          <KpiCard
            key={stat.label}
            title={stat.label}
            value={<CountUp to={stat.value} />}
            unit={stat.unit}
            icon={<stat.icon className="size-4" aria-hidden />}
          />
        ))}
      </section>
    </DashboardShell>
  );
}

export default function SiswaPage() {
  return (
    <main>
      <div className="hidden md:block">
        <DesktopViewSiswa />
      </div>
      <div className="block md:hidden">
        <MobileSiswaLayout />
      </div>
    </main>
  );
}
