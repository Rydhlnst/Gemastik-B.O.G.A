"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { School, Truck, ChefHat, ShieldCheck } from "lucide-react";
import ReactDOM from "react-dom/client";

export interface EcosystemConstellationProps {
  accentColor?: string;
  className?: string;
  onSelectSatellite?: (index: number) => void;
}

const SATELLITES = [
  { icon: School,      bg: "#6366f1", label: "Schools"    },
  { icon: Truck,       bg: "#06b6d4", label: "Logistics"  },
  { icon: ChefHat,     bg: "#10b981", label: "SPPG"       },
  { icon: ShieldCheck, bg: "#f59e0b", label: "Governance" },
];

const COUNT = 4;
// Angular speed per satellite (faster rotation)
const SPEEDS = [0.010, 0.008, 0.007, 0.006];
// Which satellite is at which base angle (evenly distributed)
const BASE_ANGLES = SATELLITES.map((_, i) => (i / COUNT) * Math.PI * 2);

export const EcosystemConstellation: React.FC<EcosystemConstellationProps> = ({
  accentColor = "#6366f1",
  className = "",
  onSelectSatellite,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef      = useRef<SVGSVGElement>(null);
  const rafRef      = useRef<number>(0);
  const startTime   = useRef<number>(performance.now());

  // Satellite DOM refs (one per satellite)
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);

  // Launch progress: 0→1 per satellite with stagger
  const getProgress = useCallback((elapsed: number, i: number) => {
    const STAGGER_MS = 200;   // longer gap between each satellite appearing
    const LAUNCH_MS  = 1400;  // slower, more dramatic launch
    const t = Math.max(0, elapsed - i * STAGGER_MS) / LAUNCH_MS;
    // Ease-out cubic
    const clamped = Math.min(t, 1);
    return 1 - Math.pow(1 - clamped, 3);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const svg       = svgRef.current;
    if (!container || !svg) return;

    const loop = () => {
      const elapsed = performance.now() - startTime.current;
      const W = container.clientWidth;
      const H = container.clientHeight;
      const cx = W / 2;
      const cy = H / 2;

      // Orbit radii are proportional to container — 38% width, 30% height
      const rx = W * 0.38;
      const ry = H * 0.38;  // same for a circle feel; use H*0.28 for ellipse

      // Update SVG viewport
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

      SATELLITES.forEach((_, i) => {
        const progress = getProgress(elapsed, i);
        const t = elapsed / 1000; // seconds
        const angle = BASE_ANGLES[i] + t * SPEEDS[i] * Math.PI * 2;

        // Satellite position (lerp from center to orbit)
        const targetX = cx + Math.cos(angle) * rx;
        const targetY = cy + Math.sin(angle) * ry;
        const x = cx + (targetX - cx) * progress;
        const y = cy + (targetY - cy) * progress;

        // Update satellite node
        const node = nodeRefs.current[i];
        if (node) {
          node.style.left    = `${x}px`;
          node.style.top     = `${y}px`;
          node.style.opacity = String(progress);
        }

        // Update SVG line
        const line = lineRefs.current[i];
        if (line) {
          line.setAttribute("x1", String(cx));
          line.setAttribute("y1", String(cy));
          line.setAttribute("x2", String(x));
          line.setAttribute("y2", String(y));
          // Pulse opacity on active satellite
          const pulsePeriod = 3; // seconds per cycle
          const phaseOffset = (i / COUNT) * pulsePeriod;
          const rawPulse = (Math.sin(((t + phaseOffset) / pulsePeriod) * Math.PI * 2) + 1) / 2;
          line.setAttribute("opacity", String(0.08 + rawPulse * 0.22 * progress));
        }
      });

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [getProgress]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${className}`}
      style={{ overflow: "hidden" }}
    >
      {/* SVG for connecting lines */}
      <svg
        ref={svgRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      >
        <defs>
          <filter id="orbit-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {SATELLITES.map((_, i) => (
          <line
            key={`line-${i}`}
            ref={(el) => { lineRefs.current[i] = el; }}
            stroke={accentColor}
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0"
          />
        ))}
      </svg>

      {/* Satellite nodes */}
      {SATELLITES.map((sat, i) => (
        <div
          key={sat.label}
          ref={(el) => { nodeRefs.current[i] = el; }}
          onClick={() => onSelectSatellite?.(i)}
          style={{
            position:     "absolute",
            width:        68,
            height:       68,
            marginLeft:   -34,
            marginTop:    -34,
            borderRadius: 18,
            background:   `linear-gradient(135deg, ${sat.bg} 0%, ${sat.bg}cc 100%)`,
            display:      "flex",
            alignItems:   "center",
            justifyContent: "center",
            boxShadow:    `0 8px 28px ${sat.bg}44, inset 0 1px 0 rgba(255,255,255,0.22)`,
            border:       "1px solid rgba(255,255,255,0.18)",
            cursor:       "pointer",
            opacity:      0,
            zIndex:       30,
            // Hardware-accelerated transform handled by JS for smoothness
            willChange:   "left, top, opacity",
          }}
        >
          <sat.icon style={{ width: 32, height: 32, color: "#fff" }} />
        </div>
      ))}
    </div>
  );
};
