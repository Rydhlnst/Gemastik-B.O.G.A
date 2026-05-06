"use client";

import { useState } from "react";
import { MessageSquare, Star } from "lucide-react";

import { type Sekolah, getVendorsBySekolah } from "@/lib/mbgdummydata";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SchoolDetailPanel } from "@/components/ui/SchoolDetailPanel";

import { TopHeader } from "./TopHeader";

import { HeroGreeting } from "./HeroGreeting";
import { InteractiveMapCard } from "./InteractiveMapCard";
import { StatsAndLeaderboard } from "./StatsAndLeaderboard";
import { TodayMenuCard } from "./TodayMenuCard";
import { FloatingBottomNav } from "./FloatingBottomNav";
import { FoodRatingModal } from "./FoodRatingModal";

export const MobileSiswaLayout = () => {
  const [selectedSchool, setSelectedSchool] = useState<Sekolah | null>(null);
  const [isFoodRatingOpen, setIsFoodRatingOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"home" | "map" | "rate" | "messages" | "menu">(
    "home"
  );

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <>

            <HeroGreeting onViewMap={() => setActiveTab("map")} />
            <TodayMenuCard />
            <StatsAndLeaderboard />
          </>
        );
      case "map":
        return (
          <>
            <InteractiveMapCard selectedSchool={selectedSchool} onSchoolSelect={setSelectedSchool} />
            {selectedSchool ? (
              <div className="px-6 py-4">
                <SchoolDetailPanel
                  school={selectedSchool}
                  vendors={getVendorsBySekolah(selectedSchool.id)}
                  onClose={() => setSelectedSchool(null)}
                />
              </div>
            ) : null}
          </>
        );
      case "rate":
        return (
          <div className="px-6 py-8">
            <Card className="rounded-3xl shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="size-4 text-primary" />
                  Rating makanan
                </CardTitle>
                <CardDescription>
                  Beri penilaian agar kualitas menu harian bisa ditingkatkan.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={() => setIsFoodRatingOpen(true)}>
                  Mulai penilaian
                </Button>
                <p className="text-xs text-muted-foreground">
                  Form penilaian tetap memakai modal existing.
                </p>
              </CardContent>
            </Card>
          </div>
        );
      case "messages":
        return (
          <div className="px-6 py-8 flex flex-col gap-4">
            <div>
              <h3 className="text-xl font-semibold tracking-tight">Pesan</h3>
              <p className="text-xs text-muted-foreground">Notifikasi dan bantuan langsung.</p>
            </div>

            <Card className="rounded-3xl border-border/70 shadow-none">
              <CardHeader>
                <CardTitle className="text-base">Belum ada pesan</CardTitle>
                <CardDescription>Kotak masuk kamu kosong untuk saat ini.</CardDescription>
              </CardHeader>
            </Card>

            <Button className="w-full" variant="outline" type="button">
              <MessageSquare className="mr-2 size-4" />
              Hubungi customer service
            </Button>
          </div>
        );
      case "menu":
        return (
          <div className="px-6 py-8">
            <Card className="rounded-3xl shadow-none">
              <CardHeader>
                <CardTitle>Menu lainnya</CardTitle>
                <CardDescription>Pengaturan akun dalam tahap pengembangan.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen bg-[linear-gradient(to_bottom,#eff6ff,transparent_55%)] text-foreground font-sans pb-24 max-w-md mx-auto overflow-x-hidden shadow-2xl border-x border-border/50">
      <TopHeader />
      <div>{renderContent()}</div>
      <FloatingBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <FoodRatingModal
        isOpen={isFoodRatingOpen}
        onClose={() => {
          setIsFoodRatingOpen(false);
          setActiveTab("home");
        }}
      />
    </div>
  );
};
