"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const APP_SURFACE_ROUTES = ["/goverment", "/sppg", "/supplier", "/vendor", "/logistik", "/sekolah"];

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

export default function BootOverlay() {
  const pathname = usePathname();
  const didRun = useRef(false);
  const [phase, setPhase] = useState<"hidden" | "enter" | "leave">("hidden");

  const shouldShow = useMemo(() => {
    if (!pathname) return false;
    const isAppSurface = APP_SURFACE_ROUTES.some((r) => pathname.startsWith(r));
    return !isAppSurface;
  }, [pathname]);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    if (!shouldShow) return;

    const reduceMotion = prefersReducedMotion();
    setPhase("enter");

    const enterMs = reduceMotion ? 10 : 820;
    const leaveMs = reduceMotion ? 10 : 260;

    const leaveTimer = window.setTimeout(() => setPhase("leave"), enterMs);
    const doneTimer = window.setTimeout(() => setPhase("hidden"), enterMs + leaveMs);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(doneTimer);
    };
  }, [shouldShow]);

  if (phase === "hidden") return null;

  return (
    <div
      className={[
        "fixed inset-0 z-[2000] grid place-items-center bg-black text-white",
        "transition-opacity duration-300",
        phase === "leave" ? "opacity-0" : "opacity-100",
      ].join(" ")}
      onClick={() => setPhase("leave")}
      aria-label="Loading overlay"
      role="status"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_20%_15%,rgba(29,78,216,0.38),transparent_60%),radial-gradient(880px_560px_at_80%_55%,rgba(30,64,175,0.22),transparent_60%)]" />
        <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:18px_18px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div
        className={[
          "relative w-full max-w-md px-6 text-center",
          "transition-all duration-300",
          phase === "leave" ? "translate-y-2 scale-[0.99]" : "translate-y-0 scale-100",
        ].join(" ")}
      >
        <div className="mx-auto inline-flex size-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur">
          <span className="text-sm font-semibold tracking-tight">B</span>
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
          B.O.G.A - MBG Operations
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">
          Menyiapkan workspace
        </h2>
        <p className="mt-2 text-sm text-white/65">
          Guardrail, status, dan navigasi dimuat dulu.
        </p>

        <div className="mt-6 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/10">
          <div className="h-1.5 w-full origin-left animate-[bootbar_900ms_cubic-bezier(0.2,0,0.2,1)_forwards] bg-gradient-to-r from-[#1D4ED8] via-[#1E40AF] to-white/80" />
        </div>
      </div>

      <style>{`
        @keyframes bootbar {
          from { transform: scaleX(0.06); opacity: 0.8; }
          to { transform: scaleX(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
