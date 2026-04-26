"use client";

import React, { useEffect, useRef } from "react";

export function AnimatedScene() {
  const particlesRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (particlesRef.current) {
      const container = particlesRef.current;
      container.innerHTML = "";
      for (let i = 0; i < 55; i++) {
        const p = document.createElement("div");
        p.className = "boga-particle";
        const big = Math.random() > 0.7;
        p.style.cssText = `
          left: ${Math.random() * 100}%;
          top: ${Math.random() * 100}%;
          --d: ${3 + Math.random() * 4}s;
          --delay: ${Math.random() * 5}s;
          width: ${big ? 3 : 2}px;
          height: ${big ? 3 : 2}px;
        `;
        container.appendChild(p);
      }
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.008;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const opacity = 0.06 + Math.sin(t) * 0.02;
      ctx.strokeStyle = `rgba(124,92,252,${opacity})`;
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 48) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 48) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "#0d0b1e",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bogaRev {
          from { opacity: 0; transform: translateY(10px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bogaFloat4 {
          0%, 100% { transform: translateY(0) rotate(-8deg); }
          50%       { transform: translateY(-6px) rotate(-8deg); }
        }
        @keyframes bogaTwinkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50%       { opacity: 0.55; transform: scale(1); }
        }
        .boga-particle {
          position: absolute;
          background: #c4b5fd;
          border-radius: 50%;
          opacity: 0;
          animation: bogaTwinkle var(--d, 4s) var(--delay, 0s) ease-in-out infinite;
        }
      `}} />

      {/* Canvas grid */}
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />

      {/* Geo 1 — top left */}
      <div style={{
        position: "absolute",
        width: "15%",
        aspectRatio: "1",
        background: "linear-gradient(135deg, #3b1f9e, #1a0f5a)",
        borderRadius: 20,
        top: "-80%",
        left: "-8%",
        transform: "rotate(-9deg)",
        opacity: 50,
        animation: "bogaRev 1.2s cubic-bezier(0.16,1,0.3,1) 0.1s forwards",
        zIndex: 2,
      }} />

      {/* Geo 2 — bottom left
      <div style={{
        position: "absolute",
        width: "5%",
        aspectRatio: "1",
        background: "linear-gradient(135deg, #5b3fd4, #2d1b80)",
        borderRadius: 20,
        bottom: "-30%",
        left: "35%",
        transform: "rotate(8deg)",
        opacity: 0,
        animation: "bogaRev 1.2s cubic-bezier(0.16,1,0.3,1) 0.25s forwards",
        zIndex: 2,
      }} /> */}

      {/* Geo 3 — small floating accent */}
      <div style={{
        position: "absolute",
        width: 44,
        height: 44,
        background: "rgba(95,211,243,0.07)",
        border: "1px solid rgba(95,211,243,0.22)",
        borderRadius: 8,
        top: "18%",
        right: "12%",
        opacity: 0,
        animation: "bogaRev 1.2s cubic-bezier(0.16,1,0.3,1) 0.4s forwards, bogaFloat4 4s ease-in-out 1.8s infinite",
        zIndex: 2,
      }} />

      {/* Particles */}
      <div
        ref={particlesRef}
        style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2 }}
      />
    </div>
  );
}