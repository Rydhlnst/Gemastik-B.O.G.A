"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface PrimaryButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  icon?: boolean;
}

export function PrimaryButton({
  children,
  className = "",
  onClick,
  href,
  icon = true,
}: PrimaryButtonProps) {
  const cls = [
    "inline-flex items-center justify-center gap-2 px-7 py-3.5",
    "bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-white font-semibold text-[0.9375rem]",
    "rounded-xl transition-all duration-[250ms] ease-out",
    "hover:scale-[1.03] hover:shadow-[0_8px_30px_rgba(67,56,202,0.3)] hover:brightness-110",
    "active:scale-[0.98]",
    className,
  ].join(" ");

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
        {icon && <ArrowRight className="w-4 h-4" />}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={cls}>
      {children}
      {icon && <ArrowRight className="w-4 h-4" />}
    </button>
  );
}

interface SecondaryButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  dark?: boolean;
}

export function SecondaryButton({
  children,
  className = "",
  onClick,
  href,
  dark = false,
}: SecondaryButtonProps) {
  const cls = [
    "inline-flex items-center justify-center gap-2 px-7 py-3.5",
    "font-semibold text-[0.9375rem] rounded-xl",
    "border-[1.5px] transition-all duration-[250ms] ease-out",
    dark
      ? "border-white/60 text-white hover:bg-white/10 hover:border-white"
      : "border-slate-300 text-slate-700 hover:bg-indigo-50 hover:border-indigo-600 hover:text-indigo-700",
    className,
  ].join(" ");

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={cls}>
      {children}
    </button>
  );
}
