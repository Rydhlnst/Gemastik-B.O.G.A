import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  /** Extra hover lift effect (default: false) */
  hoverable?: boolean;
  /** Use aspect-ratio for consistent sizing on fluid layouts */
  aspect?: string;
}

/**
 * Reusable glass-morphism card used across the Logistik dashboard.
 * Supports fluid scaling and optional hover effects.
 */
export function GlassCard({ 
  children, 
  className = "", 
  hoverable = false,
  aspect = "auto"
}: GlassCardProps) {
  return (
    <div
      className={`
        relative rounded-2xl border border-white/10 p-5 overflow-hidden
        ${hoverable ? "hover:-translate-y-1 transition-transform duration-200 cursor-default" : ""}
        ${className}
      `}
      style={{
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        aspectRatio: aspect,
      }}
    >
      {/* top-edge gloss line (implemented via class if global, but keeping inline for robustness) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent shadow-[0_1px_0_rgba(255,255,255,0.1)]" />
      {children}
    </div>
  );
}
