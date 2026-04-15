/**
 * Fixed background blobs that create the glass-morphism ambient glow effect.
 * Place as the first child of the page container (position: fixed, z-0).
 */
export function AmbientBlobs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {/* Top-left green blob */}
      <div
        className="absolute rounded-full"
        style={{
          width: "min(600px, 80vw)",
          height: "min(600px, 80vw)",
          background: "#00c87a",
          filter: "blur(clamp(60px, 12vw, 120px))",
          opacity: 0.18,
          top: "-10vw",
          left: "-10vw",
        }}
      />
      {/* Bottom-right blue blob */}
      <div
        className="absolute rounded-full"
        style={{
          width: "min(500px, 70vw)",
          height: "min(500px, 70vw)",
          background: "#0080ff",
          filter: "blur(clamp(60px, 12vw, 120px))",
          opacity: 0.15,
          bottom: "-10vw",
          right: "-10vw",
        }}
      />
      {/* Center purple blob */}
      <div
        className="absolute rounded-full"
        style={{
          width: "min(350px, 50vw)",
          height: "min(350px, 50vw)",
          background: "#7040e0",
          filter: "blur(clamp(50px, 10vw, 100px))",
          opacity: 0.12,
          top: "45%",
          left: "40%",
        }}
      />
    </div>
  );
}
