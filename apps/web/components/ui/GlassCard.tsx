import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  /** Extra hover lift effect (default: false) */
  hoverable?: boolean;
  /** Use aspect-ratio for consistent sizing on fluid layouts */
  aspect?: string;
}

/**
 * Reusable premium surface container.
 * Keeps layout logic but uses design tokens (no hardcoded colors).
 */
export function GlassCard({ 
  children, 
  className = "", 
  hoverable = false,
  aspect = "auto"
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface/85 backdrop-blur-xl shadow-card",
        hoverable
          ? "cursor-default transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated"
          : "",
        className
      )}
      style={{
        aspectRatio: aspect,
      }}
    >
      {children}
    </div>
  );
}
