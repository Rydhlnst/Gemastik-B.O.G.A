"use client";

interface SectionHeaderProps {
  label: string;
  headline: string;
  subheadline?: string;
  dark?: boolean;
  centered?: boolean;
  className?: string;
}

export function SectionHeader({
  label,
  headline,
  subheadline,
  dark = false,
  centered = false,
  className = "",
}: SectionHeaderProps) {
  return (
    <div
      className={[
        "max-w-[700px]",
        centered && "mx-auto text-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p
        className={[
          "text-xs font-medium tracking-[0.12em] uppercase mb-5",
          dark ? "text-cyan-400" : "text-indigo-600",
        ].join(" ")}
      >
        {label}
      </p>
      <h2
        className={[
          "text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[1.1] tracking-[-0.02em]",
          dark ? "text-white" : "text-slate-800",
        ].join(" ")}
      >
        {headline}
      </h2>
      {subheadline && (
        <p
          className={[
            "mt-5 text-lg leading-relaxed",
            dark ? "text-slate-400" : "text-slate-500",
          ].join(" ")}
        >
          {subheadline}
        </p>
      )}
    </div>
  );
}
