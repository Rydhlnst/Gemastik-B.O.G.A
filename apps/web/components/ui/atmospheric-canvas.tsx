"use client";

import React, { useEffect, useRef } from "react";

interface AtmosphericCanvasProps {
  className?: string;
}

export const AtmosphericCanvas: React.FC<AtmosphericCanvasProps> = ({
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };
    resize();
    window.addEventListener("resize", resize);

    // ── Two large floating shapes mirrored 4-ways ──
    const shapes = [
      {
        x: 0, y: 0,
        ox: 0.18, oy: 0.28,          // fractional position
        sz: 0, baseSz: 0.24,
        rot: 0, rotV: 0.0008,
        vx: 0.035, vy: 0.022,
        type: "hexagon" as const,
        col: "rgba(99,102,241,",
        alpha: 0.18, innerAlpha: 0.07, innerScale: 0.62, pulse: 0,
      },
      {
        x: 0, y: 0,
        ox: 0.38, oy: 0.72,
        sz: 0, baseSz: 0.19,
        rot: Math.PI / 5, rotV: -0.0006,
        vx: -0.028, vy: -0.018,
        type: "diamond" as const,
        col: "rgba(6,182,212,",
        alpha: 0.16, innerAlpha: 0.06, innerScale: 0.55, pulse: 1.8,
      },
    ];

    // Init positions from fractional values once we know canvas size
    const init = () => {
      shapes.forEach((s) => {
        const W = canvas.width;
        const H = canvas.height;
        s.sz = Math.max(W, H) * s.baseSz;
        s.x = W * s.ox;
        s.y = H * s.oy;
      });
    };
    init();

    const drawPath = (
      cx: number, cy: number,
      rot: number, sz: number,
      type: "hexagon" | "diamond",
      c: CanvasRenderingContext2D,
    ) => {
      c.save();
      c.translate(cx, cy);
      c.rotate(rot);
      c.beginPath();
      if (type === "hexagon") {
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i - Math.PI / 6;
          i === 0
            ? c.moveTo(Math.cos(a) * sz, Math.sin(a) * sz)
            : c.lineTo(Math.cos(a) * sz, Math.sin(a) * sz);
        }
        c.closePath();
      } else {
        c.moveTo(0, -sz);
        c.lineTo(sz * 0.6, 0);
        c.lineTo(0, sz);
        c.lineTo(-sz * 0.6, 0);
        c.closePath();
      }
      c.restore();
    };

    const drawMirror = (s: typeof shapes[0], c: CanvasRenderingContext2D) => {
      const W = canvas.width;
      const H = canvas.height;
      const alpha = s.alpha + Math.sin(s.pulse) * 0.04;
      // Four mirror positions
      const positions = [
        { x: s.x,       y: s.y,       r: s.rot,  af: 1 },
        { x: W - s.x,   y: s.y,       r: -s.rot, af: 0.65 },
        { x: s.x,       y: H - s.y,   r: s.rot,  af: 0.65 },
        { x: W - s.x,   y: H - s.y,   r: -s.rot, af: 0.40 },
      ];

      positions.forEach(({ x, y, r, af }) => {
        // Outer shell
        drawPath(x, y, r, s.sz, s.type, c);
        c.strokeStyle = s.col + (alpha * af).toFixed(3) + ")";
        c.lineWidth = 1.5;
        c.stroke();
        // Inner shell (slightly rotated + smaller)
        drawPath(x, y, r + 0.35, s.sz * s.innerScale, s.type, c);
        c.strokeStyle = s.col + (s.innerAlpha * af).toFixed(3) + ")";
        c.lineWidth = 0.7;
        c.stroke();
      });
    };

    const loop = () => {
      // Sync size to animated parent on every frame
      const cont = canvas.parentElement;
      if (cont && (canvas.width !== cont.clientWidth || canvas.height !== cont.clientHeight)) {
        canvas.width = cont.clientWidth;
        canvas.height = cont.clientHeight;
        init();
      }

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.shadowBlur = 0;

      shapes.forEach((s) => {
        s.sz = Math.max(W, H) * s.baseSz;   // scale with container
        s.x += s.vx;
        s.y += s.vy;
        s.rot += s.rotV;
        s.pulse += 0.005;

        // Bounce only in the left-half so mirror stays in right-half
        if (s.x < -80)         { s.x = -80;         s.vx *= -1; }
        if (s.x > W / 2 + 80)  { s.x = W / 2 + 80;  s.vx *= -1; }
        if (s.y < -80)         { s.y = -80;         s.vy *= -1; }
        if (s.y > H + 80)      { s.y = H + 80;      s.vy *= -1; }

        ctx.shadowBlur = 12;
        ctx.shadowColor = "rgba(200,210,255,0.3)";
        drawMirror(s, ctx);
      });

      ctx.shadowBlur = 0;
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none w-full h-full ${className}`}
      style={{ zIndex: 0, opacity: 0.85 }}
    />
  );
};
