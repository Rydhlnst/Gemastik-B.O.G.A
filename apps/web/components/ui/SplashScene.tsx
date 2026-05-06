"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashSceneProps {
  onLift: () => void;
}

export const SplashScene: React.FC<SplashSceneProps> = ({ onLift }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"burst" | "on" | "split" | "hint">("burst");
  const [isLifted, setIsLifted] = useState(false);

  // Animation Refs
  const requestRef = useRef<number>();
  const geoShapesRef = useRef<any[]>([]);

  const handleLift = () => {
    setIsLifted(true);
    setTimeout(onLift, 1200);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const SHAPE_TYPES = ["triangle", "square", "diamond", "hexagon", "pentagon"];
    const SPLASH_COLS = [
      "rgba(255,255,255,",
      "rgba(165,243,252,",
      "rgba(199,210,254,",
      "rgba(147,197,253,",
      "rgba(216,180,254,",
    ];

    const drawShapePath = (cx: number, cy: number, rot: number, sz: number, type: string, c: CanvasRenderingContext2D) => {
      c.save();
      c.translate(cx, cy);
      c.rotate(rot);
      c.beginPath();
      if (type === "triangle") {
        c.moveTo(0, -sz);
        c.lineTo(sz * 0.866, sz * 0.5);
        c.lineTo(-sz * 0.866, sz * 0.5);
        c.closePath();
      } else if (type === "square") {
        c.rect(-sz / 2, -sz / 2, sz, sz);
      } else if (type === "diamond") {
        c.moveTo(0, -sz);
        c.lineTo(sz * 0.6, 0);
        c.lineTo(0, sz);
        c.lineTo(-sz * 0.6, 0);
        c.closePath();
      } else if (type === "hexagon") {
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 180) * (60 * i - 30);
          i === 0 ? c.moveTo(Math.cos(a) * sz, Math.sin(a) * sz) : c.lineTo(Math.cos(a) * sz, Math.sin(a) * sz);
        }
        c.closePath();
      } else if (type === "pentagon") {
        for (let j = 0; j < 5; j++) {
          const a2 = (Math.PI / 180) * (72 * j - 90);
          j === 0 ? c.moveTo(Math.cos(a2) * sz, Math.sin(a2) * sz) : c.lineTo(Math.cos(a2) * sz, Math.sin(a2) * sz);
        }
        c.closePath();
      }
      c.restore();
    };

    const initGeoShapes = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      geoShapesRef.current = [
        {
          x: W * 0.22,
          y: H * 0.28,
          sz: Math.min(W, H) * 0.28,
          type: "hexagon",
          vx: 0.18,
          vy: 0.12,
          rot: 0,
          rotV: 0.0028,
          col: "rgba(255,255,255,",
          pulse: 0,
          alpha: 0.13,
          innerAlpha: 0.04,
          innerScale: 0.62,
        },
        {
          x: W * 0.3,
          y: H * 0.68,
          sz: Math.min(W, H) * 0.21,
          type: "diamond",
          vx: -0.14,
          vy: -0.09,
          rot: Math.PI / 6,
          rotV: -0.0018,
          col: "rgba(165,243,252,",
          pulse: 1.6,
          alpha: 0.11,
          innerAlpha: 0.035,
          innerScale: 0.55,
        },
      ];
    };

    const drawMirroredShape = (p: any, c: CanvasRenderingContext2D) => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const a = p.alpha + Math.sin(p.pulse) * 0.035;
      const positions = [
        { x: p.x, y: p.y, r: p.rot, af: 1 },
        { x: W - p.x, y: p.y, r: -p.rot, af: 0.68 },
        { x: p.x, y: H - p.y, r: p.rot, af: 0.68 },
        { x: W - p.x, y: H - p.y, r: -p.rot, af: 0.42 },
      ];
      positions.forEach((pos) => {
        const fa = (a * pos.af).toFixed(3);
        drawShapePath(pos.x, pos.y, pos.r, p.sz, p.type, c);
        c.strokeStyle = p.col + fa + ")";
        c.lineWidth = 1.5;
        c.stroke();
        const fi = (p.innerAlpha * pos.af).toFixed(3);
        drawShapePath(pos.x, pos.y, pos.r + (Math.PI / p.sz) * 8, p.sz * p.innerScale, p.type, c);
        c.strokeStyle = p.col + fi + ")";
        c.lineWidth = 0.8;
        c.stroke();
      });
    };

    const runBurst = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const burst: any[] = [];
      const COUNT = 24;
      for (let i = 0; i < COUNT; i++) {
        const ang = (Math.PI * 2 / COUNT) * i;
        const spd = Math.random() * 3.5 + 1.5;
        const b = {
          x: W / 2, y: H / 2,
          vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
          rot: Math.random() * Math.PI * 2, rotV: (Math.random() - 0.5) * 0.08,
          sz: Math.random() * 18 + 8,
          type: SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)],
          col: SPLASH_COLS[Math.floor(Math.random() * SPLASH_COLS.length)],
          life: 1, filled: Math.random() > 0.4
        };
        burst.push(b);
        burst.push({ ...b, vx: -b.vx, rotV: -b.rotV, sz: b.sz * 0.8 });
      }

      const frame = () => {
        ctx.clearRect(0, 0, W, H);
        let alive = false;
        burst.forEach((b) => {
          b.x += b.vx; b.y += b.vy; b.vx *= 0.96; b.vy *= 0.96;
          b.rot += b.rotV; b.life -= 0.022;
          if (b.life < 0) return;
          alive = true;
          const a = b.life.toFixed(3);
          drawShapePath(b.x, b.y, b.rot, b.sz, b.type, ctx);
          b.filled ? (ctx.fillStyle = b.col + a + ")", ctx.fill()) : (ctx.strokeStyle = b.col + a + ")", ctx.lineWidth = 1.5, ctx.stroke());
          drawShapePath(W - b.x, b.y, -b.rot, b.sz, b.type, ctx);
          const a2 = (b.life * 0.6).toFixed(3);
          b.filled ? (ctx.fillStyle = b.col + a2 + ")", ctx.fill()) : (ctx.strokeStyle = b.col + a2 + ")", ctx.lineWidth = 1, ctx.stroke());
        });

        if (alive) requestRef.current = requestAnimationFrame(frame);
        else {
          ctx.clearRect(0, 0, W, H);
          initGeoShapes();
          loop();
          setPhase("on");
          setTimeout(() => setPhase("split"), 1300);
          setTimeout(() => setPhase("hint"), 2800);
        }
      };
      requestRef.current = requestAnimationFrame(frame);
    };

    const loop = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      ctx.clearRect(0, 0, W, H);
      geoShapesRef.current.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.rot += p.rotV; p.pulse += 0.006;
        if (p.x < p.sz * 0.5) { p.x = p.sz * 0.5; p.vx *= -1; }
        if (p.x > W / 2 - p.sz * 0.3) { p.x = W / 2 - p.sz * 0.3; p.vx *= -1; }
        if (p.y < p.sz * 0.5) { p.y = p.sz * 0.5; p.vy *= -1; }
        if (p.y > H - p.sz * 0.5) { p.y = H - p.sz * 0.5; p.vy *= -1; }
        drawMirroredShape(p, ctx);
      });
      requestRef.current = requestAnimationFrame(loop);
    };

    runBurst();

    return () => {
      window.removeEventListener("resize", resize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden transition-transform duration-[1200ms] cubic-bezier(0.76, 0, 0.18, 1) ${
        isLifted ? "-translate-y-full" : "translate-y-0"
      }`}
      style={{
        background: "linear-gradient(135deg, #4338ca 0%, #2563eb 45%, #0891b2 80%, #06b6d4 100%)",
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 z-[1] pointer-events-none" />
      
      {/* Texture Layers */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] z-[2]" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "180px" }} 
      />
      <div className="absolute inset-0 pointer-events-none z-[3]" 
        style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.025) 3px, rgba(0,0,0,0.025) 4px)" }} 
      />

      {/* Orbs */}
      <div className="absolute left-1/2 top-1/2 w-[700px] h-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.08),transparent_65%)] animate-pulse pointer-events-none z-[2]" />
      <div className="absolute -right-24 -bottom-24 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.18),transparent_65%)] animate-pulse pointer-events-none z-[2]" />

      {/* BOGA Title Row */}
      <div className="relative z-[5] flex items-center justify-center overflow-visible">
        {/* B.O. — flies left off-screen when split */}
        <motion.div
          animate={
            phase === "burst"
              ? { opacity: 0, y: 50, scale: 0.88, x: 0 }
              : phase === "split"
                ? { opacity: 0, x: "-50vw", scale: 1 }
                : { opacity: 1, y: 0, scale: 1, x: 0 }
          }
          transition={{ duration: 0.9, type: "spring", stiffness: 80, damping: 18 }}
          className="text-white font-sans text-[72px] md:text-[140px] font-black tracking-[-3px] md:tracking-[-4px] leading-none drop-shadow-2xl"
          style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
        >
          B.O.
        </motion.div>

        {/* G.A — flies right off-screen when split */}
        <motion.div
          animate={
            phase === "burst"
              ? { opacity: 0, y: 50, scale: 0.88, x: 0 }
              : phase === "split"
                ? { opacity: 0, x: "50vw", scale: 1 }
                : { opacity: 1, y: 0, scale: 1, x: 0 }
          }
          transition={{ duration: 0.9, type: "spring", stiffness: 80, damping: 18 }}
          className="text-white font-sans text-[72px] md:text-[140px] font-black tracking-[-3px] md:tracking-[-4px] leading-none drop-shadow-2xl"
          style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
        >
          G.A
        </motion.div>

        {/* Center reveal text — appears big when B.O.G.A splits */}
        <motion.div
          animate={
            phase === "split"
              ? { opacity: 1, scale: 1, y: 0 }
              : { opacity: 0, scale: 0.7, y: 20 }
          }
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: phase === "split" ? 0.15 : 0 }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        >
          <div className="flex items-center gap-4 md:gap-8">
            <div className="w-[2px] h-12 md:h-24 bg-white/40" />
            <div 
              className="text-white font-sans text-[18px] md:text-[42px] font-black text-center uppercase whitespace-nowrap drop-shadow-lg"
              style={{ fontFamily: "var(--font-jakarta), sans-serif", letterSpacing: "0.06em" }}
            >
              Blockchain Operasional<br className="md:hidden" /> Gizi Akuntabel
            </div>
            <div className="w-[2px] h-12 md:h-24 bg-white/40" />
          </div>
        </motion.div>
      </div>

      {/* Entry Hint */}
      <motion.div
        onClick={handleLift}
        animate={{ opacity: phase === "hint" ? 1 : 0 }}
        className="absolute bottom-10 flex flex-col items-center gap-2 cursor-pointer z-[5] group"
      >
        <span className="text-[10px] font-bold tracking-[2.5px] text-white/45 uppercase group-hover:text-white transition-colors duration-300 animate-pulse">
          Klik Untuk Masuk
        </span>
        <div className="w-5 h-5 border-r-2 border-b-2 border-white/30 rotate-45 animate-bounce group-hover:border-white transition-colors duration-300" />
      </motion.div>

    </div>
  );
};
