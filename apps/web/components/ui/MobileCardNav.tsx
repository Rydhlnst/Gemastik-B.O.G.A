"use client";

import React, { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import Link from "next/link";

export type MobileNavCard = {
  label: string;
  href: string;
  bgColor: string;
  textColor: string;
};

interface MobileNavCardsProps {
  cards: MobileNavCard[];
  isOpen: boolean;
  ease?: string;
  onLinkClick?: () => void;
}

export function MobileNavCards({
  cards,
  isOpen,
  ease = "power3.out",
  onLinkClick,
}: MobileNavCardsProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const initDone = useRef(false);

  const setCardRef = (i: number) => (el: HTMLDivElement | null) => {
    if (el) cardsRef.current[i] = el;
  };

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    gsap.set(wrapper, { height: 0, overflow: "hidden" });
    gsap.set(cardsRef.current, { y: 30, opacity: 0 });
    initDone.current = true;
  }, []);

  useEffect(() => {
    if (!initDone.current) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    tlRef.current?.kill();

    if (isOpen) {
      gsap.set(wrapper, { height: "auto", visibility: "visible" });
      const naturalHeight = wrapper.scrollHeight;
      gsap.set(wrapper, { height: 0 });

      const tl = gsap.timeline();
      tl.to(wrapper, { height: naturalHeight, duration: 0.4, ease });
      tl.to(
        cardsRef.current,
        { y: 0, opacity: 1, duration: 0.3, ease, stagger: 0.06 },
        "-=0.2"
      );
      tlRef.current = tl;
    } else {
      gsap.set(cardsRef.current, { y: 20, opacity: 0 });
      const tl = gsap.timeline({
        onComplete: () => gsap.set(wrapper, { height: 0 }),
      });
      tl.to(wrapper, { height: 0, duration: 0.3, ease: "power3.in" });
      tlRef.current = tl;
    }
  }, [isOpen, ease]);

  return (
    <div ref={wrapperRef} style={{ overflow: "hidden", height: 0 }}>
      <div className="grid grid-cols-2 gap-2 px-3 pb-3 pt-2">
        {cards.map((card, idx) => (
          <div
            key={idx}
            ref={setCardRef(idx)}
            className="rounded-xl overflow-hidden"
          >
            <Link
              href={card.href}
              onClick={onLinkClick}
              className="flex items-center justify-center text-center font-bold text-sm py-4 px-3 h-full w-full transition-all hover:opacity-90 hover:scale-[1.02] active:scale-95"
              style={{
                backgroundColor: card.bgColor,
                color: card.textColor,
                textDecoration: "none",
                display: "flex",
                boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                letterSpacing: "0.01em",
              }}
            >
              {card.label}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
