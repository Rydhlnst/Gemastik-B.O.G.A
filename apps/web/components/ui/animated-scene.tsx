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
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0d0b1e",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap');

        @keyframes bogaRev {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bogaFloat4 {
          0%, 100% { transform: translateY(0) rotate(-8deg); }
          50%       { transform: translateY(-8px) rotate(-8deg); }
        }
        @keyframes bogaTwinkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50%       { opacity: 0.55; transform: scale(1); }
        }
        @keyframes bogaBIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes bogaBFloat {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50%       { transform: translate(-50%, -50%) translateY(-12px); }
        }
        @keyframes bogaTxtIn {
          from { opacity: 0; transform: translateX(-50%) translateY(16px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
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
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      />

      {/* Geo 1 — top left */}
      <div style={{
        position: "absolute",
        width: 260, height: 260,
        background: "linear-gradient(135deg, #3b1f9e, #1a0f5a)",
        borderRadius: 24,
        top: -70, left: -70,
        transform: "rotate(-12deg)",
        opacity: 0,
        animation: "bogaRev 1.2s cubic-bezier(0.16,1,0.3,1) 0.1s forwards",
        zIndex: 2,
      }} />

      {/* Geo 2 — bottom left */}
      <div style={{
        position: "absolute",
        width: 260, height: 260,
        background: "linear-gradient(135deg, #5b3fd4, #2d1b80)",
        borderRadius: 28,
        bottom: -80, left: -50,
        transform: "rotate(8deg)",
        opacity: 0,
        animation: "bogaRev 1.2s cubic-bezier(0.16,1,0.3,1) 0.25s forwards",
        zIndex: 2,
      }} />

      {/* Geo 4 — small floating accent */}
      <div style={{
        position: "absolute",
        width: 66, height: 66,
        background: "rgba(95,211,243,0.07)",
        border: "1px solid rgba(95,211,243,0.22)",
        borderRadius: 10,
        top: "14%", right: "18%",
        opacity: 0,
        animation: "bogaRev 1.2s cubic-bezier(0.16,1,0.3,1) 0.4s forwards, bogaFloat4 4s ease-in-out 1.8s infinite",
        zIndex: 2,
      }} />

      {/* Particles */}
      <div
        ref={particlesRef}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {/* Backdrop behind B */}
      <div
        style={{
          position: "absolute",
          top: "44%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "clamp(150px, 38vw, 230px)",
          height: "clamp(150px, 38vw, 230px)",
          background: "rgba(45, 27, 128, 0.5)",
          borderRadius: 20,
          zIndex: 9,
          opacity: 0,
          animation: "bogaRev 1.2s cubic-bezier(0.16,1,0.3,1) 0.5s forwards",
        }}
      />

      {/* Big B — outer: posisi & animasi | inner: scaleY */}
      <div
        style={{
          position: "absolute",
          top: "65%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 8,
          opacity: 0,
          animation: "bogaBIn 1.2s cubic-bezier(0.16,1,0.3,1) 0.6s forwards, bogaBFloat 5s ease-in-out 1.8s infinite",
        }}
      >
        <div
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(100px, 28vw, 175px)",
            lineHeight: 1,
            background: "linear-gradient(160deg, #e2d9ff 0%, #b39dff 30%, #7c5cfc 60%, #5fd3f3 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            userSelect: "none",
            whiteSpace: "nowrap",
            display: "inline-block",
            transform: "scaleY(2)",        // ← ubah nilai ini untuk atur tinggi
            transformOrigin: "center bottom", // ← tumbuh ke atas
          }}
        >
          B
        </div>
      </div>

      {/* Bottom text */}
      <div style={{
        position: "absolute",
        bottom: 32,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 5,
        opacity: 0,
        animation: "bogaTxtIn 1.2s cubic-bezier(0.16,1,0.3,1) 0.9s forwards",
        whiteSpace: "nowrap",
      }}>
        <span style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 600,
          fontSize: 13,
          letterSpacing: "0.35em",
          color: "rgba(196,181,253,0.75)",
          textTransform: "uppercase",
        }}>
          B.O.G.A
        </span>
        <span style={{
          fontSize: 8,
          color: "rgba(196,181,253,0.38)",
          letterSpacing: "0.15em",
          fontFamily: "'Syne', sans-serif",
        }}>
          Blockchain Operasional Gizi Akuntabel
        </span>
      </div>
    </div>
  );
}