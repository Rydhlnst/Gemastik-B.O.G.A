"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  Activity,
  AlertTriangle,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  School as SchoolIcon,
  QrCode,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import CountUp from "@/components/ui/CountUp";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/ui/dashboard-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import {
  type Sekolah,
  deliveryList,
  getSPPGBySekolah,
  getVendorsBySekolah,
  sekolahList,
} from "@/lib/mbgdummydata";
import { SchoolDetailPanel } from "@/components/ui/SchoolDetailPanel";
import VendorRanking from "@/components/ui/vendorranking";
import VendorPerformanceDashboard from "@/components/ui/VendorPerformanceDashboard";
import { KpiCard } from "@/components/ui/kpi-card";

const MapLibreMap = dynamic(() => import("@/components/ui/MapLibreMap"), { ssr: false });

export default function SekolahAdminPage() {
  const [viewMode, setViewMode] = useState<"school" | "aggregate">("school");
  const [activeMitraTab, setActiveMitraTab] = useState<"performa" | "ranking">("performa");
  const [selectedSchool, setSelectedSchool] = useState<Sekolah | null>(null);
  const [selectedEntityId, setSelectedEntityId] = useState<number>(1);
  const [scanOpen, setScanOpen] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);

  const loggedInSchool = useMemo(() => sekolahList.find((s) => s.id === 1) ?? null, []);
  const availableVendors = useMemo(
    () => (loggedInSchool ? getVendorsBySekolah(loggedInSchool.id) : []),
    [loggedInSchool]
  );
  const availableSPPG = useMemo(
    () => (loggedInSchool ? getSPPGBySekolah(loggedInSchool.id) : null),
    [loggedInSchool]
  );

  const primaryRelation = useMemo(
    () => availableVendors.find((v) => v.is_primary) ?? availableVendors[0] ?? null,
    [availableVendors]
  );

  const latestDelivery = useMemo(() => {
    if (!primaryRelation) return null;
    return (
      deliveryList
        .filter((d) => d.vendor_sekolah_id === primaryRelation.id)
        .sort((a, b) => b.id - a.id)[0] ?? null
    );
  }, [primaryRelation]);

  const identityPanels = useMemo(() => {
    const statusLabel =
      latestDelivery?.status === "on_transit"
        ? "Dalam perjalanan"
        : latestDelivery?.status === "delivered"
        ? "Selesai"
        : latestDelivery?.status === "pending"
        ? "Diproses"
        : "—";

    return [
      {
        title: "Status batch terakhir",
        subtitle: "Monitoring operasional",
        icon: Activity,
        content: latestDelivery ? statusLabel : "Belum ada data",
        detail: latestDelivery
          ? `Batch #${latestDelivery.id} • ${latestDelivery.tanggal} • ${latestDelivery.porsi_dikirim} box`
          : "Manifest belum tersedia.",
      },
      {
        title: "Jadwal pengiriman",
        subtitle: "Window penerimaan",
        icon: ShieldCheck,
        content: `Target: ${latestDelivery?.jam_target ?? "07:00"} WIB`,
        detail:
          latestDelivery?.jam_tiba && latestDelivery.jam_tiba !== "--"
            ? `Tiba: ${latestDelivery.jam_tiba} WIB`
            : "Armada belum tiba.",
      },
      {
        title: "Mitra vendor pelaksana",
        subtitle: "PIC vendor",
        icon: Phone,
        content: primaryRelation?.vendor.nama ?? "—",
        detail: primaryRelation?.vendor.no_telp
          ? `${primaryRelation.vendor.kontak_pic} • ${primaryRelation.vendor.no_telp}`
          : "Kontak belum tersedia.",
      },
      {
        title: "Dapur SPPG penanggung jawab",
        subtitle: "Verifikasi & pengolahan",
        icon: MapPin,
        content: availableSPPG?.nama ?? "Belum terhubung",
        detail: availableSPPG
          ? `${availableSPPG.kecamatan}, ${availableSPPG.kota} • Kapasitas ${availableSPPG.kapasitas_porsi}/hari`
          : "SPPG belum terhubung.",
      },
    ] as const;
  }, [availableSPPG, latestDelivery, primaryRelation]);

  const stats = useMemo(() => {
    if (viewMode === "school" && loggedInSchool) {
      return [
        { label: "Total siswa", value: loggedInSchool.total_siswa, unit: "jiwa", icon: Users },
        { label: "Penerima makan", value: loggedInSchool.total_siswa, unit: "porsi", icon: Activity },
        { label: "Mitra terafiliasi", value: availableVendors.length, unit: "vendor", icon: ShieldCheck },
        { label: "SPPG terhubung", value: availableSPPG ? 1 : 0, unit: "dapur", icon: MapPin },
      ] as const;
    }

    return [
      { label: "Sekolah aktif", value: sekolahList.length, unit: "unit", icon: SchoolIcon },
      { label: "Penerima makan", value: 2693, unit: "/hari", icon: Activity },
      { label: "Mitra terafiliasi", value: 5, unit: "vendor", icon: ShieldCheck },
      { label: "SPPG aktif", value: 4, unit: "dapur", icon: MapPin },
    ] as const;
  }, [availableSPPG, availableVendors.length, loggedInSchool, viewMode]);

  return (
    <>
    <DashboardShell
      badge={<Badge variant="outline">Sekolah • Admin</Badge>}
      title="Dashboard Sekolah"
      description="Pantau distribusi dan koordinasi manifest dari vendor → SPPG → sekolah."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-lg border border-border bg-muted p-1">
            <Button
              size="sm"
              variant={viewMode === "school" ? "default" : "ghost"}
              onClick={() => setViewMode("school")}
            >
              Konteks sekolah
            </Button>
            <Button
              size="sm"
              variant={viewMode === "aggregate" ? "default" : "ghost"}
              onClick={() => setViewMode("aggregate")}
            >
              Agregat sistem
            </Button>
          </div>
        </div>
      }
    >
      <section className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitle>Peta distribusi</CardTitle>
            <CardDescription>Klik sekolah untuk melihat detail, tanpa integrasi API map baru.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] overflow-hidden rounded-xl border border-border bg-muted/10">
              <MapLibreMap
                selectedSchool={selectedSchool}
                onSchoolSelect={setSelectedSchool}
                userSchoolId={loggedInSchool?.id}
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
              readOnly={selectedSchool.id !== (loggedInSchool?.id ?? 0)} 
            /> 
          ) : ( 
            <Card> 
              <CardHeader> 
                <CardTitle>Panel identitas</CardTitle> 
                <CardDescription>Ringkasan status operasional sekolah saat ini.</CardDescription> 
              </CardHeader> 
              <CardContent className="space-y-3"> 
                {identityPanels.map((panel) => ( 
                  <div key={panel.title} className="rounded-xl border border-border p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-lg bg-muted p-2 text-primary">
                        <panel.icon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{panel.title}</p>
                        <p className="text-xs text-muted-foreground">{panel.subtitle}</p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      <p className="text-sm font-medium">{panel.content}</p>
                      <p className="text-xs text-muted-foreground">{panel.detail}</p>
                    </div>
                  </div>
                ))}
              </CardContent> 
            </Card> 
          )} 

        </div> 

        <div className="lg:col-span-12">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Validasi Penerimaan Logistik (Phase 3)</CardTitle>
                <CardDescription>
                  Generate QR Code agar mitra pengirim dapat melakukan pemindaian serah terima barang di lokasi.
                </CardDescription>
              </div>
              <Button className="rounded-full shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setScanOpen(true)}>
                <QrCode className="w-4 h-4 mr-2" />
                Generate QR Terima
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between text-sm">
              <div className="rounded-xl border border-border bg-muted/20 p-4 flex-1">
                <p className="text-xs font-medium text-muted-foreground">Scan terakhir oleh Mitra</p>
                <p className="mt-1 font-mono text-xs text-foreground break-all">
                  {lastScan ?? "—"}
                </p>
              </div>
              <p className="text-xs text-muted-foreground flex-1">
                Setelah QR berhasil dipindai oleh pihak pengirim, status serah terima akan otomatis terverifikasi di dalam sistem.
              </p>
            </CardContent>
          </Card>
        </div>
      </section> 

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ringkasan sekolah">
        {stats.map((stat) => (
          <KpiCard
            key={stat.label}
            title={stat.label}
            value={<CountUp to={stat.value} />}
            unit={stat.unit}
            icon={<stat.icon className="size-4" aria-hidden />}
          />
        ))}
      </section>

      <section className="mt-6">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Mitra Operasional</CardTitle>
              <CardDescription>Pantau performa individu atau peringkat mitra teratas.</CardDescription>
            </div>
            <div className="flex bg-muted/50 p-1 rounded-lg border border-border">
              <Button 
                variant={activeMitraTab === "performa" ? "default" : "ghost"} 
                size="sm"
                className="rounded-md"
                onClick={() => setActiveMitraTab("performa")}
              >
                Audit Performa
              </Button>
              <Button 
                variant={activeMitraTab === "ranking" ? "default" : "ghost"} 
                size="sm"
                className="rounded-md"
                onClick={() => setActiveMitraTab("ranking")}
              >
                Leaderboard Ranking
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activeMitraTab === "performa" ? (
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-wrap items-center gap-2 pb-4">
                  <Label htmlFor="entityId" className="text-sm">
                    Entity ID
                  </Label>
                  <Input
                    id="entityId"
                    type="number"
                    value={selectedEntityId}
                    onChange={(e) => setSelectedEntityId(Number(e.target.value))}
                    className="h-9 w-28"
                  />
                  <Badge variant="secondary">type: sppg</Badge>
                </div>
                <VendorPerformanceDashboard type="sppg" entityId={selectedEntityId} />
              </div>
            ) : (
              <div className="space-y-6 bg-slate-50/50 p-4 sm:p-6 rounded-2xl">
                <VendorRanking type="vendor" />
                <VendorRanking type="sppg" />
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Kontak bantuan</CardTitle>
            <CardDescription>Gunakan kanal ini untuk kendala operasional atau teknis.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
              <div className="mt-0.5 rounded-lg bg-background p-2 text-primary">
                <Phone className="size-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Hotline</p>
                <p className="font-semibold">1-500-BOGA</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
              <div className="mt-0.5 rounded-lg bg-background p-2 text-primary">
                <MessageSquare className="size-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">WhatsApp</p>
                <p className="font-semibold">+62 811 2345 6789</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
              <div className="mt-0.5 rounded-lg bg-background p-2 text-primary">
                <Mail className="size-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Email</p>
                <p className="font-semibold">support@boga.id</p>
              </div>
            </div>

            <Separator />

            <Alert className="border-border bg-muted/20">
              <AlertTriangle className="size-4" />
              <AlertTitle>Kendala keamanan</AlertTitle>
              <AlertDescription>
                Jika ada indikasi manipulasi data atau celah keamanan, hubungi admin server untuk
                penanganan prioritas.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Buat tiket laporan</CardTitle>
            <CardDescription>Catat kendala agar dapat ditindaklanjuti.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <Label htmlFor="ticket-title">Judul kendala</Label>
                <Input id="ticket-title" placeholder="Contoh: Error saat generate report SPPG" />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <RadioGroup defaultValue="data" className="space-y-2">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="data" id="cat-data" />
                      <Label htmlFor="cat-data" className="font-normal">
                        Database / Data
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="access" id="cat-access" />
                      <Label htmlFor="cat-access" className="font-normal">
                        Akses / Modul
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="other" id="cat-other" />
                      <Label htmlFor="cat-other" className="font-normal">
                        Lainnya
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Prioritas</Label>
                  <RadioGroup defaultValue="normal" className="space-y-2">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="normal" id="prio-normal" />
                      <Label htmlFor="prio-normal" className="font-normal">
                        Biasa
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="high" id="prio-high" />
                      <Label htmlFor="prio-high" className="font-normal">
                        Tinggi
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ticket-detail">Detail</Label>
                <Textarea
                  id="ticket-detail"
                  rows={5}
                  placeholder="Jelaskan detail laporan secara ringkas dan teknis."
                />
              </div>

              <Button type="submit" className="w-full">
                Kirim tiket
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </DashboardShell>

    <Dialog open={scanOpen} onOpenChange={setScanOpen}>
      <DialogContent className="sm:max-w-md bg-white border-slate-100 flex flex-col items-center justify-center p-8 text-center text-slate-800">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight text-center">
            QR Serah Terima
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-xs text-center max-w-xs mx-auto mt-2">
            Minta mitra pengirim (vendor / logistik) untuk memindai kode ini dari aplikasi mereka.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm inline-flex mb-8">
          <QrCode className="w-64 h-64 text-slate-800" strokeWidth={1} />
        </div>

        <div className="flex gap-3 w-full">
          <Button variant="outline" className="flex-1 rounded-full text-xs font-bold" onClick={() => setScanOpen(false)}>
            Batal
          </Button>
          <Button 
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold" 
            onClick={() => {
              setLastScan(`QR-ACC-${Date.now()}`);
              setScanOpen(false);
              toast.success("Pemindaian Mitra Berhasil", {
                description: "Serah terima barang telah terverifikasi.",
              });
            }}
          >
            Simulasikan Pindai
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
