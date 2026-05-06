"use client";

import { useState, useEffect, useRef } from "react";
import { SplashScene } from "@/components/ui/SplashScene";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { TrustMarquee } from "@/components/landing/TrustMarquee";
import { PhaseTimeline } from "@/components/landing/PhaseTimeline";
import { TrustPrimitives } from "@/components/landing/TrustPrimitives";
import { RoleGateways } from "@/components/landing/RoleGateways";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function Home() {
  const [showSplash, setShowSplash] = useState(false);
  const [footerHeight, setFooterHeight] = useState(0);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem("boga_splash_seen");
    if (!hasSeenSplash) {
      setShowSplash(true);
    }
  }, []);

  useEffect(() => {
    if (!footerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      setFooterHeight(entries[0].contentRect.height);
    });
    observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSplashLift = () => {
    sessionStorage.setItem("boga_splash_seen", "true");
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <SplashScene onLift={handleSplashLift} />}
      <div className="min-h-screen bg-[#1A1A1A]">
        <div 
          className="relative z-10 bg-[#FAFAF7] rounded-b-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          style={{ marginBottom: footerHeight }}
        >
          <LandingNavbar />
          <HeroSection />
          <TrustMarquee />
          <PhaseTimeline />
          <TrustPrimitives />
          <RoleGateways />
        </div>
        
        <div 
          ref={footerRef}
          className="fixed bottom-0 left-0 right-0 z-0"
        >
          <LandingFooter />
        </div>
      </div>
    </>
  );
}
