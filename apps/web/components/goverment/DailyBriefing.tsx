"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowRight, BadgeCheck, Sun, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

interface BriefingData {
  porsiHariIni: number;
  sengketaAktif: number;
  vendorMenunggu: number;
  urgentHref: string;
}

const SESSION_KEY = "boga_daily_briefing_dismissed";

export function DailyBriefing({ data }: { data: BriefingData }) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    const isDismissed = sessionStorage.getItem(SESSION_KEY) === "true";
    if (hour < 12 && !isDismissed) setVisible(true);
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem(SESSION_KEY, "true");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -16, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -12, height: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="px-6 pt-4"
        >
          <div className="flex items-center gap-4 px-5 py-4 bg-role-surface border border-border rounded-[var(--radius-xl)]">
            <div className="flex-shrink-0 w-10 h-10 rounded-[var(--radius-xl)] bg-role-primary flex items-center justify-center text-white shadow-card">
              <Sun className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-0.5">
                Briefing Pagi
              </p>
              <p className="text-sm font-medium text-foreground leading-relaxed">
                Hari ini:{" "}
                <span className="font-semibold tabular-nums">
                  {data.porsiHariIni.toLocaleString("id-ID")} porsi
                </span>{" "}
                dijadwalkan —{" "}
                {data.sengketaAktif > 0 ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-status-danger">
                    <AlertCircle className="w-3 h-3" />
                    {data.sengketaAktif} sengketa menunggu keputusan BGN
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-semibold text-status-success">
                    <BadgeCheck className="w-3 h-3" />
                    Tidak ada sengketa aktif
                  </span>
                )}{" "}
                —{" "}
                <span className="font-semibold text-status-warning">
                  {data.vendorMenunggu} vendor baru menunggu verifikasi SBT
                </span>
              </p>
            </div>

            <Button
              onClick={() => router.push(data.urgentHref)}
              className="flex-shrink-0 h-9 px-4 gap-2 text-xs font-semibold uppercase tracking-wider"
            >
              Mulai Review
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>

            <button
              onClick={handleDismiss}
              className="flex-shrink-0 w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center text-muted hover:text-foreground hover:bg-muted-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

