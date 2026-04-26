import * as React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

type TrendDirection = "up" | "down" | "flat";

export function KpiCard({
  title,
  value,
  unit,
  trend,
  trendDirection,
  icon,
  className,
}: {
  title: string;
  value: React.ReactNode;
  unit?: string;
  trend?: string;
  trendDirection?: TrendDirection;
  icon?: React.ReactNode;
  className?: string;
}) {
  const direction: TrendDirection = trendDirection ?? "flat";
  const TrendIcon =
    direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : null;

  const trendColor =
    direction === "up"
      ? "text-status-success"
      : direction === "down"
      ? "text-status-danger"
      : "text-muted-foreground";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)] transition-shadow duration-200 hover:shadow-[var(--shadow-elevated)]",
        className
      )}
    >
      <div className="absolute left-0 top-0 h-full w-[3px] bg-role-badge" />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">
              {value}
            </p>
            {unit ? <span className="text-sm text-muted-foreground">{unit}</span> : null}
          </div>
        </div>

        {icon ? (
          <div className="rounded-lg border border-border bg-surface-raised p-2 text-muted-foreground">
            {icon}
          </div>
        ) : null}
      </div>

      {trend ? (
        <div className={cn("mt-3 flex items-center gap-1.5 text-xs", trendColor)}>
          {TrendIcon ? <TrendIcon className="size-3.5" aria-hidden /> : null}
          <span className="font-medium">{trend}</span>
        </div>
      ) : null}
    </div>
  );
}
